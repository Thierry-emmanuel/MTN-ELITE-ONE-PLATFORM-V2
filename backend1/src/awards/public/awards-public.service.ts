import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as crypto from 'crypto';
import { Award, AwardStatus } from '../entities/award.entity';
import { AwardNomination, NomineeType } from '../entities/award-nomination.entity';
import { Vote } from '../entities/vote.entity';
import { Player } from '../../players/player.entity';
import { Club } from '../../clubs/club.entity';
import { Coach } from '../../coaches/coach.entity';
import { PlayerStats } from '../../players/player-stats.entity';
import { Standing } from '../../standings/standing.entity';
import { Season } from '../../seasons/season.entity';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { buildPublicAward } from './award.mapper';
import { buildPlayerNominee, buildTeamNominee, tallyToVoteResults } from './nominee.mapper';

const NOMINATION_RELATIONS = ['nominations', 'nominations.player', 'nominations.player.club', 'nominations.team', 'nominations.coach', 'nominations.coach.club', 'season'];

@Injectable()
export class AwardsPublicService {
  constructor(
    @InjectRepository(Award) private awardRepo: Repository<Award>,
    @InjectRepository(AwardNomination) private nominationRepo: Repository<AwardNomination>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(PlayerStats) private statsRepo: Repository<PlayerStats>,
    @InjectRepository(Standing) private standingRepo: Repository<Standing>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
    private dataSource: DataSource,
    private wsGateway: WebsocketGateway,
  ) {}

  /** Preloads PlayerStats + Standing for every nominee in `award`, keyed for O(1) lookup by the mapper. */
  private async lookupsFor(award: Award) {
    const playerIds = award.nominations.filter((n) => n.nomineeType === NomineeType.PLAYER).map((n) => n.playerId!).filter(Boolean);
    const clubIds = award.nominations
      .flatMap((n) => [n.teamId, n.coach?.clubId])
      .filter((id): id is number => !!id);

    const [stats, standings] = await Promise.all([
      playerIds.length ? this.statsRepo.find({ where: { seasonId: award.seasonId, playerId: In(playerIds) } }) : [],
      clubIds.length ? this.standingRepo.find({ where: { seasonId: award.seasonId, clubId: In(clubIds) } }) : [],
    ]);
    return {
      statsByPlayer: new Map<number, PlayerStats>(stats.map((s): [number, PlayerStats] => [s.playerId, s])),
      standingByClub: new Map<number, Standing>(standings.map((s): [number, Standing] => [s.clubId, s])),
    };
  }

  async findAllPublic(seasonId?: number) {
    const where = seasonId ? { seasonId } : {};
    const awards = await this.awardRepo.find({ where, relations: NOMINATION_RELATIONS, order: { periodStart: 'DESC' } });
    return Promise.all(
      awards.map(async (a) => {
        const { statsByPlayer, standingByClub } = await this.lookupsFor(a);
        return buildPublicAward(a, statsByPlayer, standingByClub);
      }),
    );
  }

  async findPublicById(id: number) {
    const award = await this.awardRepo.findOne({ where: { id }, relations: NOMINATION_RELATIONS });
    if (!award) throw new NotFoundException('Award not found');
    const { statsByPlayer, standingByClub } = await this.lookupsFor(award);
    return buildPublicAward(award, statsByPlayer, standingByClub);
  }

  async getVoteResults(id: number) {
    const award = await this.awardRepo.findOne({ where: { id }, relations: ['nominations'] });
    if (!award) throw new NotFoundException('Award not found');
    const { totalVotes, results } = tallyToVoteResults(award.nominations.map((n) => ({ id: n.id, voteCount: n.voteCount })));
    return { awardId: String(id), totalVotes, results, lastUpdated: new Date().toISOString() };
  }

  async getLeaderboard(id: number) {
    const award = await this.awardRepo.findOne({ where: { id }, relations: NOMINATION_RELATIONS });
    if (!award) throw new NotFoundException('Award not found');
    const { totalVotes, results } = tallyToVoteResults(award.nominations.map((n) => ({ id: n.id, voteCount: n.voteCount })));
    return results.map((r) => {
      const nom = award.nominations.find((n) => String(n.id) === r.nomineeId);
      const name = nom?.player ? `${nom.player.firstName} ${nom.player.lastName}` : nom?.team?.name ?? nom?.coach ? `${nom?.coach?.firstName} ${nom?.coach?.lastName}` : '';
      const photoUrl = nom?.player?.photoUrl ?? nom?.team?.logoUrl ?? nom?.coach?.photoUrl;
      return { nomineeId: r.nomineeId, nomineeName: name, photoUrl, votes: r.votes, percentage: r.percentage, delta: 0 };
    });
  }

  /** Casts a public vote. `nomineeId` is the stringified nomination id (as
   *  handed out by buildPublicAward), so no separate lookup DTO is needed. */
  async vote(awardId: number, nomineeId: string, ipAddress: string, userId?: number) {
    const nominationId = Number(nomineeId);
    if (!Number.isFinite(nominationId)) throw new BadRequestException('Invalid nomineeId');

    const award = await this.awardRepo.findOne({ where: { id: awardId } });
    if (!award) throw new NotFoundException('Award not found');
    if (award.status !== AwardStatus.OPEN) throw new BadRequestException('Voting is closed for this award');

    const nomination = await this.nominationRepo.findOne({ where: { id: nominationId, awardId } });
    if (!nomination) throw new NotFoundException('Nomination not found for this award');

    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');
    const existingVote = await this.voteRepo.findOne({ where: [{ ipHash, awardId }, ...(userId ? [{ userId, awardId }] : [])] });
    if (existingVote) throw new BadRequestException('You have already voted for this award');

    await this.dataSource.transaction(async (manager) => {
      await manager.save(manager.create(Vote, { awardId, nominationId, userId: userId || null, ipHash }));
      await manager.increment(AwardNomination, { id: nominationId }, 'voteCount', 1);
    });

    const results = await this.getVoteResults(awardId);
    this.wsGateway.server.to(`award-${awardId}`).emit('vote_updated', {
      awardId,
      nominationId,
      voteCount: results.results.find((r) => r.nomineeId === nomineeId)?.votes,
    });
    return { success: true, results };
  }

  async getBallonDor(year?: number) {
    const query = this.awardRepo
      .createQueryBuilder('award')
      .leftJoinAndSelect('award.season', 'season')
      .leftJoinAndSelect('award.nominations', 'nomination')
      .leftJoinAndSelect('nomination.player', 'player')
      .leftJoinAndSelect('player.club', 'club')
      .where('award.category = :cat', { cat: 'BALLON_DOR' })
      .orderBy('award.periodEnd', 'DESC');
    if (year) query.andWhere('EXTRACT(YEAR FROM award.periodEnd) = :year', { year });

    const award = await query.getOne();
    if (!award) {
      return { year: year ?? new Date().getFullYear(), winner: undefined, ranking: [], ceremonyDate: new Date().toISOString(), votingOpen: false, totalVotes: 0 };
    }

    const { statsByPlayer } = await this.lookupsFor(award);
    const sorted = [...award.nominations].sort((a, b) => b.voteCount - a.voteCount || a.id - b.id);
    const totalVotes = sorted.reduce((n, r) => n + r.voteCount, 0);

    const ranking = sorted.map((n, i) => ({
      rank: i + 1,
      nominee: { ...buildPlayerNominee(n.player!, 'BALLON_DOR', statsByPlayer.get(n.playerId!)), id: String(n.id) },
      juryPoints: 0,
      fanPoints: n.voteCount,
      totalPoints: n.voteCount,
      rankChange: 0,
      countryVotes: [] as { country: string; votes: number }[],
    }));

    return {
      year: new Date(award.periodEnd).getFullYear(),
      winner: ranking[0]?.nominee,
      ranking,
      ceremonyDate: award.periodEnd,
      votingOpen: award.status === AwardStatus.OPEN,
      votingDeadline: award.periodEnd,
      totalVotes,
    };
  }

  /** Builds a 4-3-3 XI from the season's best-rated players by position.
   *  There's no dedicated "team of the week" table — this composes it live
   *  from PlayerStats so the section stays functional even before a curator
   *  has explicitly picked one via an award. */
  async getTeamOfWeek() {
    const season = await this.seasonRepo.findOne({ where: { status: 'ONGOING' as any }, order: { id: 'DESC' } });
    if (!season) return { id: 'tow-none', period: 'Saison en cours', formation: '4-3-3', players: [], bench: [], votingStatus: 'UPCOMING', totalVotes: 0 };

    const stats = await this.statsRepo.find({ where: { seasonId: season.id }, relations: ['player', 'player.club'], order: { avgRating: 'DESC' } });
    const byPos = (pos: string) => stats.filter((s) => s.player?.position === pos);
    const SLOTS: { pos: string; label: string; x: number; y: number }[] = [
      { pos: 'GK', label: 'Gardien', x: 50, y: 92 },
      { pos: 'DEF', label: 'Défenseur', x: 15, y: 70 }, { pos: 'DEF', label: 'Défenseur', x: 38, y: 75 },
      { pos: 'DEF', label: 'Défenseur', x: 62, y: 75 }, { pos: 'DEF', label: 'Défenseur', x: 85, y: 70 },
      { pos: 'MID', label: 'Milieu', x: 25, y: 45 }, { pos: 'MID', label: 'Milieu', x: 50, y: 40 }, { pos: 'MID', label: 'Milieu', x: 75, y: 45 },
      { pos: 'FWD', label: 'Attaquant', x: 20, y: 15 }, { pos: 'FWD', label: 'Attaquant', x: 50, y: 10 }, { pos: 'FWD', label: 'Attaquant', x: 80, y: 15 },
    ];
    const used = new Set<number>();
    const players = SLOTS.map((slot, i) => {
      const pick = byPos(slot.pos).find((s) => !used.has(s.playerId));
      if (!pick) return null;
      used.add(pick.playerId);
      return {
        id: `tow-${i}`, nomineeId: String(pick.playerId), name: pick.player.nickname || `${pick.player.firstName} ${pick.player.lastName}`,
        photoUrl: pick.player.photoUrl || undefined, clubName: pick.player.club?.name ?? '', clubLogoUrl: pick.player.club?.logoUrl || undefined,
        position: slot.pos, positionLabel: slot.label, x: slot.x, y: slot.y,
        rating: pick.avgRating ? Number(pick.avgRating) : 0, highlightStat: { label: 'Note', value: pick.avgRating ? Number(pick.avgRating).toFixed(1) : '—' },
      };
    }).filter(Boolean) as any[];

    const bench = stats.filter((s) => !used.has(s.playerId)).slice(0, 4).map((pick, i) => ({
      id: `bench-${i}`, nomineeId: String(pick.playerId), name: pick.player.nickname || `${pick.player.firstName} ${pick.player.lastName}`,
      photoUrl: pick.player.photoUrl || undefined, clubName: pick.player.club?.name ?? '', clubLogoUrl: pick.player.club?.logoUrl || undefined,
      position: pick.player.position, positionLabel: pick.player.position, x: 0, y: 0,
      rating: pick.avgRating ? Number(pick.avgRating) : 0, highlightStat: { label: 'Note', value: pick.avgRating ? Number(pick.avgRating).toFixed(1) : '—' },
    }));

    return { id: `tow-${season.id}`, period: season.name, formation: '4-3-3', players, bench, votingStatus: 'CLOSED', totalVotes: 0 };
  }

  async getHistorical(category?: string) {
    const where = category ? { category, status: AwardStatus.ANNOUNCED } : { status: AwardStatus.ANNOUNCED };
    const awards = await this.awardRepo.find({ where, relations: NOMINATION_RELATIONS, order: { periodEnd: 'DESC' } });
    return Promise.all(
      awards
        .filter((a) => a.winnerId != null)
        .map(async (a) => {
          const { statsByPlayer, standingByClub } = await this.lookupsFor(a);
          const dto = buildPublicAward(a, statsByPlayer, standingByClub);
          const runnerUp = dto.nominees.filter((n) => n.id !== dto.winner?.id).sort((x, y) => (y as any).highlightStat?.value - (x as any).highlightStat?.value)[0];
          return {
            year: new Date(a.periodEnd).getFullYear(), period: dto.period, season: dto.season, category: a.category,
            winner: dto.winner, runnerUp, votes: dto.voteResults?.totalVotes ?? 0,
          };
        }),
    );
  }
}
