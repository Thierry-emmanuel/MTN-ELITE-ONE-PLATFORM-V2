import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Award, AwardStatus } from './entities/award.entity';
import { AwardNomination, NomineeType } from './entities/award-nomination.entity';
import { Vote } from './entities/vote.entity';
import { VoteDto } from './dto/vote.dto';
import * as crypto from 'crypto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AwardsService {
  constructor(
    @InjectRepository(Award) private awardRepo: Repository<Award>,
    @InjectRepository(AwardNomination) private nominationRepo: Repository<AwardNomination>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    private dataSource: DataSource,
    private wsGateway: WebsocketGateway,
  ) {}

  async findAll() {
    return this.awardRepo.find({
      relations: ['nominations', 'nominations.player', 'nominations.player.club'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive() {
    return this.awardRepo.find({
      where: { status: AwardStatus.OPEN },
      relations: ['nominations', 'nominations.player', 'nominations.player.club'],
    });
  }

  async findOne(id: number) {
    const award = await this.awardRepo.findOne({
      where: { id },
      relations: ['nominations', 'nominations.player', 'nominations.player.club'],
    });
    if (!award) throw new NotFoundException('Award not found');
    return award;
  }

  async create(dto: any): Promise<Award> {
    const award = this.awardRepo.create({
      category: dto.category,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      status: dto.status,
      seasonId: dto.seasonId,
      winnerId: dto.winnerId || null,
    });
    return this.awardRepo.save(award);
  }

  async update(id: number, dto: any): Promise<Award> {
    const award = await this.findOne(id);
    if (dto.category !== undefined) award.category = dto.category;
    if (dto.periodStart !== undefined) award.periodStart = new Date(dto.periodStart);
    if (dto.periodEnd !== undefined) award.periodEnd = new Date(dto.periodEnd);
    if (dto.status !== undefined) award.status = dto.status;
    if (dto.seasonId !== undefined) award.seasonId = dto.seasonId;
    if (dto.winnerId !== undefined) award.winnerId = dto.winnerId || null;
    return this.awardRepo.save(award);
  }

  async remove(id: number): Promise<void> {
    const award = await this.findOne(id);
    await this.awardRepo.remove(award);
  }

  /** BF-10.4 — open a voting period. Fails loudly if it's already open so the
   *  admin can't double-fire the action (mirrors SeasonsTab's activate()). */
  async openAward(id: number): Promise<Award> {
    const award = await this.findOne(id);
    if (award.status === AwardStatus.OPEN) {
      throw new BadRequestException('Ce vote est déjà ouvert');
    }
    award.status = AwardStatus.OPEN;
    const saved = await this.awardRepo.save(award);
    this.wsGateway.server.to(`award-${id}`).emit('award_status_changed', {
      awardId: id, status: saved.status,
    });
    return saved;
  }

  /** BF-10.4 — close a voting period and compute the winner from the
   *  current tally. Ties are broken by lowest nomination id (first nominated)
   *  so the result is deterministic rather than "whichever query returns first". */
  async closeAward(id: number): Promise<Award> {
    const award = await this.findOne(id);
    if (award.status !== AwardStatus.OPEN) {
      throw new BadRequestException('Seul un vote ouvert peut être clôturé');
    }

    const winner = [...award.nominations].sort(
      (a, b) => b.voteCount - a.voteCount || a.id - b.id,
    )[0];

    award.status = AwardStatus.ANNOUNCED;
    // winnerId points at whichever entity the winning nomination actually
    // represents (player, team/club, or coach) — resolved generically so
    // Team/Coach categories close correctly, not just Player ones.
    award.winnerId = winner ? (winner.playerId ?? winner.teamId ?? winner.coachId ?? null) : null;
    const saved = await this.awardRepo.save(award);

    this.wsGateway.server.to(`award-${id}`).emit('award_status_changed', {
      awardId: id, status: saved.status, winnerId: saved.winnerId,
    });
    return saved;
  }

  /** Accepts either the legacy `{ playerId }` shape or the generic
   *  `{ nomineeType, nomineeId }` shape so Team (Club) and Coach categories
   *  can be nominated the same way Player categories always could. */
  async addNomination(awardId: number, dto: { playerId?: number; nomineeType?: NomineeType; nomineeId?: number }): Promise<AwardNomination> {
    await this.findOne(awardId);

    const nomineeType = dto.nomineeType ?? NomineeType.PLAYER;
    const nomineeId = dto.nomineeId ?? dto.playerId;
    if (!nomineeId) throw new BadRequestException('nomineeId (or playerId) is required');

    const fkColumn = nomineeType === NomineeType.TEAM ? 'teamId' : nomineeType === NomineeType.COACH ? 'coachId' : 'playerId';
    const existing = await this.nominationRepo.findOne({ where: { awardId, [fkColumn]: nomineeId } as any });
    if (existing) throw new BadRequestException('This nominee is already nominated for this award');

    const nomination = this.nominationRepo.create({
      awardId,
      nomineeType,
      voteCount: 0,
      playerId: nomineeType === NomineeType.PLAYER ? nomineeId : null,
      teamId: nomineeType === NomineeType.TEAM ? nomineeId : null,
      coachId: nomineeType === NomineeType.COACH ? nomineeId : null,
    });
    return this.nominationRepo.save(nomination);
  }

  async removeNomination(awardId: number, nominationId: number): Promise<void> {
    const nomination = await this.nominationRepo.findOne({ where: { id: nominationId, awardId } });
    if (!nomination) throw new NotFoundException('Nomination not found');
    await this.nominationRepo.remove(nomination);
  }

  async vote(awardId: number, dto: VoteDto, ipAddress: string, userId?: number) {
    const award = await this.findOne(awardId);
    if (award.status !== AwardStatus.OPEN) {
      throw new BadRequestException('Voting is closed for this award');
    }

    const nomination = await this.nominationRepo.findOne({
      where: { id: dto.nominationId, awardId },
    });
    if (!nomination) throw new NotFoundException('Nomination not found for this award');

    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');

    // ── Duplicate check AND vote insert are inside ONE transaction ──────────
    // This prevents the race condition where two concurrent requests both pass
    // the check before either write completes.
    await this.dataSource.transaction(async (manager) => {
      // Re-check for duplicate INSIDE the transaction (serializable check)
      const existingVote = await manager.findOne(Vote, {
        where: [
          { ipHash, awardId },
          ...(userId ? [{ userId, awardId }] : []),
        ] as any,
        lock: { mode: 'pessimistic_write' },
      });

      if (existingVote) {
        throw new BadRequestException('You have already voted for this award');
      }

      const vote = manager.create(Vote, {
        awardId,
        nominationId: dto.nominationId,
        userId: userId || null,
        ipHash,
      });
      await manager.save(vote);
      await manager.increment(AwardNomination, { id: dto.nominationId }, 'voteCount', 1);
    });

    // Fetch updated nomination for WS (outside transaction — read-only)
    const updatedNomination = await this.nominationRepo.findOne({ where: { id: dto.nominationId } });

    this.wsGateway.server.to(`award-${awardId}`).emit('vote_updated', {
      awardId,
      nominationId: dto.nominationId,
      voteCount: updatedNomination?.voteCount,
    });

    return { message: 'Vote registered successfully' };
  }
}