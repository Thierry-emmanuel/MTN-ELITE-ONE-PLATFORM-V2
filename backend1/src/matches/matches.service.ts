import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { MatchEvent, MatchEventType } from './match-event.entity';
import { AddEventDto } from './dto/add-event.dto';
import { Match, MatchStatus } from './match.entity';
import { MatchLineup } from './match-lineup.entity';
import { CreateMatchDto }      from './dto/create-match.dto';
import { UpdateMatchDto }      from './dto/update-match.dto';
import { SetLineupsDto }       from './dto/set-lineup.dto';
import { PaginationDto }       from '../common/dto/pagination.dto';
import { StandingsService }    from '../standings/standings.service';

// ─── Filter DTOs ──────────────────────────────────────────────────────────────
export interface MatchFilters {
  status?:    MatchStatus;
  round?:     number;
  seasonId?:  number;
  clubId?:    number;
  dateFrom?:  string;   // ISO date string
  dateTo?:    string;
}

// ─── Response shape ───────────────────────────────────────────────────────────
export interface PaginatedMatches {
  data:  Match[];
  total: number;
  page:  number;
  limit: number;
  totalPages: number;
}

// ─── Grouped by date (for fixtures/results pages) ────────────────────────────
export interface MatchDay {
  date:    string;   // "YYYY-MM-DD"
  matches: Match[];
}

// ─── Match-center response shapes ──────────────────────────────────────────────
export interface TeamMatchStats {
  shotsOnTarget: number;
  yellowCards:   number;
  redCards:      number;
  passes:        number;
}

export interface MatchStatsResult {
  home: TeamMatchStats;
  away: TeamMatchStats;
}

export interface HeadToHeadResult {
  summary: {
    played: number; homeWins: number; draws: number; awayWins: number;
    homeGoals: number; awayGoals: number;
  };
  meetings: Match[];
}

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,

    @InjectRepository(MatchLineup)
    private readonly lineupRepo: Repository<MatchLineup>,

    @InjectRepository(MatchEvent)
    private readonly eventRepo: Repository<MatchEvent>,

    // WHY: injected here (not inside StandingsModule) to trigger
    // recalculation automatically when a match finishes.
    // Circular dep is avoided because StandingsModule only imports
    // the Match entity — not MatchesModule.
    private readonly standingsService: StandingsService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════════════════════

  async create(dto: CreateMatchDto): Promise<Match> {
    if (dto.homeClubId === dto.awayClubId)
      throw new BadRequestException('Home and away clubs must be different');

    const match = this.matchRepo.create(dto);
    return this.matchRepo.save(match);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // READ — paginated with filters
  // ═══════════════════════════════════════════════════════════════════════════

  async findAll(
    pagination: PaginationDto,
    filters: MatchFilters = {},
  ): Promise<PaginatedMatches> {
    const qb = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeClub', 'homeClub')
      .leftJoinAndSelect('match.awayClub', 'awayClub')
      .leftJoinAndSelect('match.season',   'season')
      .orderBy('match.scheduledAt', 'ASC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (filters.status)
      qb.andWhere('match.status = :status', { status: filters.status });

    if (filters.round)
      qb.andWhere('match.round = :round', { round: filters.round });

    if (filters.seasonId)
      qb.andWhere('match.seasonId = :seasonId', { seasonId: filters.seasonId });

    if (filters.clubId)
      qb.andWhere(
        '(match.homeClubId = :clubId OR match.awayClubId = :clubId)',
        { clubId: filters.clubId },
      );

    if (filters.dateFrom)
      qb.andWhere('match.scheduledAt >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });

    if (filters.dateTo)
      qb.andWhere('match.scheduledAt <= :dateTo', { dateTo: new Date(filters.dateTo) });

    const [data, total] = await qb.getManyAndCount();
    const page  = pagination.page  ?? 1;
    const limit = pagination.limit ?? 10;

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Fixtures: upcoming + live matches grouped by date ─────────────────────
  /**
   * Returns all SCHEDULED or LIVE matches for a season, grouped by date.
   * WHY: Grouping in the service avoids the frontend doing date logic.
   */
  async findFixtures(seasonId: number, limit = 30): Promise<MatchDay[]> {
    const matches = await this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeClub', 'homeClub')
      .leftJoinAndSelect('match.awayClub', 'awayClub')
      .where('match.seasonId = :seasonId', { seasonId })
      .andWhere('match.status IN (:...statuses)', {
        statuses: [MatchStatus.SCHEDULED, MatchStatus.LIVE],
      })
      .orderBy('match.scheduledAt', 'ASC')
      .take(limit)
      .getMany();

    return this.groupByDate(matches);
  }

  // ── Results: finished matches grouped by date (most recent first) ──────────
  async findResults(
    seasonId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedMatches & { grouped: MatchDay[] }> {
    const qb = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeClub', 'homeClub')
      .leftJoinAndSelect('match.awayClub', 'awayClub')
      .where('match.seasonId = :seasonId', { seasonId })
      .andWhere('match.status = :status', { status: MatchStatus.FINISHED })
      .orderBy('match.scheduledAt', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit);

    const [data, total] = await qb.getManyAndCount();
    const page  = pagination.page  ?? 1;
    const limit = pagination.limit ?? 10;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      grouped: this.groupByDate(data),
    };
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where:     { id },
      relations: ['homeClub', 'awayClub', 'season', 'events', 'events.player', 'stats'],
    });
    if (!match) throw new NotFoundException(`Match "${id}" not found`);
    return match;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════════════

  async update(id: number, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);

    if (
      match.status === MatchStatus.FINISHED &&
      dto.status   !== MatchStatus.FINISHED
    ) throw new BadRequestException('Cannot reopen a finished match');

    if (dto.homeClubId && dto.awayClubId && dto.homeClubId === dto.awayClubId)
      throw new BadRequestException('Home and away clubs must be different');

    Object.assign(match, dto);
    return this.matchRepo.save(match);
  }

  async updateScore(
    id: number,
    homeScore: number,
    awayScore: number,
  ): Promise<Match> {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.FINISHED)
      throw new BadRequestException('Match is already finished');

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status    = MatchStatus.LIVE;
    return this.matchRepo.save(match);
  }

  /**
   * Marks a match as FINISHED and immediately triggers standings recalculation.
   *
   * WHY: standings update happens HERE, atomically with the match status change.
   * No cron job, no manual trigger needed — standings are always fresh.
   */
  async finishMatch(id: number): Promise<Match> {
    const match = await this.findOne(id);

    if (match.status === MatchStatus.FINISHED)
      throw new BadRequestException('Match is already finished');

    if (match.homeScore === null || match.awayScore === null)
      throw new BadRequestException('Cannot finish a match without a score');

    match.status = MatchStatus.FINISHED;
    const saved  = await this.matchRepo.save(match);

    // ── Trigger standings recalculation (non-blocking log on error) ──────────
    this.standingsService
      .recalculateForSeason(match.seasonId)
      .catch(err =>
        this.logger.error(`Standings recalc failed for season ${match.seasonId}`, err),
      );

    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════════════════════

  async remove(id: number): Promise<{ message: string }> {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.LIVE)
      throw new BadRequestException('Cannot delete a live match');
    await this.matchRepo.remove(match);
    return { message: 'Match deleted successfully' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MATCH CENTER — stats / lineups / head-to-head
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Aggregates per-player match_stats rows into team-level totals.
   * WHY: only the fields actually tracked at player level are returned here
   * (shots on target, cards, passes) — possession/corners/fouls aren't
   * recorded per-player, so the frontend fills those in as a visual estimate
   * when they're missing.
   */
  async getTeamStats(id: number): Promise<MatchStatsResult> {
    const match = await this.findOne(id);

    const rows: { clubId: number; onTarget: string; yellow: string; red: string; passes: string }[] =
      await this.matchRepo.manager
        .createQueryBuilder()
        .select('ms.club_id', 'clubId')
        .addSelect('COALESCE(SUM(ms.shots_on_target), 0)', 'onTarget')
        .addSelect('COALESCE(SUM(ms.yellow_cards), 0)', 'yellow')
        .addSelect('COALESCE(SUM(ms.red_cards), 0)', 'red')
        .addSelect('COALESCE(SUM(ms.passes_completed), 0)', 'passes')
        .from('match_stats', 'ms')
        .where('ms.match_id = :id', { id })
        .groupBy('ms.club_id')
        .getRawMany();

    const byClub = new Map(rows.map(r => [r.clubId, r]));
    const toTeamStats = (clubId: number): TeamMatchStats => {
      const r = byClub.get(clubId);
      return {
        shotsOnTarget: r ? Number(r.onTarget) : 0,
        yellowCards:   r ? Number(r.yellow)   : 0,
        redCards:      r ? Number(r.red)      : 0,
        passes:        r ? Number(r.passes)   : 0,
      };
    };

    return {
      home: toTeamStats(match.homeClubId),
      away: toTeamStats(match.awayClubId),
    };
  }

  /** Returns confirmed lineups for a match, split by starters/substitutes. */
  async getLineups(id: number) {
    const match = await this.findOne(id);
    const entries = await this.lineupRepo.find({
      where: { matchId: id },
      relations: ['player'],
      order: { isStarting: 'DESC', id: 'ASC' },
    });

    const bySide = (clubId: number) => entries.filter(e => e.clubId === clubId);
    const shape = (clubId: number, formation: string | null) => {
      const teamEntries = bySide(clubId);
      return {
        formation,
        startXI: teamEntries.filter(e => e.isStarting),
        substitutes: teamEntries.filter(e => !e.isStarting),
      };
    };

    return {
      confirmed: entries.length > 0,
      home: shape(match.homeClubId, match.homeFormation),
      away: shape(match.awayClubId, match.awayFormation),
    };
  }

  /** Replaces the full lineup set for a match (admin only). */
  async setLineups(id: number, dto: SetLineupsDto): Promise<{ message: string }> {
    const match = await this.findOne(id);

    if (![dto.homeClubId, dto.awayClubId].includes(match.homeClubId) ||
        ![dto.homeClubId, dto.awayClubId].includes(match.awayClubId)) {
      throw new BadRequestException('homeClubId/awayClubId must match the fixture');
    }

    await this.lineupRepo.delete({ matchId: id });

    const buildRows = (clubId: number, team: SetLineupsDto['home']) =>
      team.players.map(p => this.lineupRepo.create({
        matchId: id,
        clubId,
        playerId: p.playerId,
        position: p.position ?? null,
        shirtNumber: p.shirtNumber ?? null,
        isStarting: p.isStarting ?? true,
        isCaptain: p.isCaptain ?? false,
        posX: p.posX ?? null,
        posY: p.posY ?? null,
      }));

    const rows = [
      ...buildRows(dto.homeClubId, dto.home),
      ...buildRows(dto.awayClubId, dto.away),
    ];

    if (rows.length) await this.lineupRepo.save(rows);

    match.homeFormation = dto.home.formation ?? match.homeFormation;
    match.awayFormation = dto.away.formation ?? match.awayFormation;
    await this.matchRepo.save(match);

    return { message: 'Lineups saved' };
  }

  /**
   * Previous meetings between the same two clubs (either home/away order),
   * most recent first, excluding the current fixture.
   */
  async getHeadToHead(id: number, limit = 6): Promise<HeadToHeadResult> {
    const match = await this.findOne(id);
    const { homeClubId, awayClubId } = match;

    const meetings = await this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeClub', 'homeClub')
      .leftJoinAndSelect('match.awayClub', 'awayClub')
      .where('match.id != :id', { id })
      .andWhere('match.status = :status', { status: MatchStatus.FINISHED })
      .andWhere(
        '((match.homeClubId = :homeClubId AND match.awayClubId = :awayClubId) OR ' +
        '(match.homeClubId = :awayClubId AND match.awayClubId = :homeClubId))',
        { homeClubId, awayClubId },
      )
      .orderBy('match.scheduledAt', 'DESC')
      .take(limit)
      .getMany();

    const summary = meetings.reduce(
      (acc, m) => {
        acc.played++;
        const homeSideIsRefHome = m.homeClubId === homeClubId;
        const refHomeGoals = homeSideIsRefHome ? m.homeScore ?? 0 : m.awayScore ?? 0;
        const refAwayGoals = homeSideIsRefHome ? m.awayScore ?? 0 : m.homeScore ?? 0;
        acc.homeGoals += refHomeGoals;
        acc.awayGoals += refAwayGoals;
        if (refHomeGoals > refAwayGoals) acc.homeWins++;
        else if (refHomeGoals < refAwayGoals) acc.awayWins++;
        else acc.draws++;
        return acc;
      },
      { played: 0, homeWins: 0, draws: 0, awayWins: 0, homeGoals: 0, awayGoals: 0 },
    );

    return { summary, meetings };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Groups an array of matches by their scheduled date ("YYYY-MM-DD").
   * WHY: avoids repeating this logic in every controller/frontend.
   */
  private groupByDate(matches: Match[]): MatchDay[] {
    const map = new Map<string, Match[]>();

    for (const match of matches) {
      const dateKey = match.scheduledAt.toISOString().split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(match);
    }

    // Return sorted by date key (already sorted from query, but explicit is safer)
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, matches]) => ({ date, matches }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTS — Phase 3 (Match Builder). The service is the single business
  // authority: goals move the score, KICKOFF opens the match, FULL_TIME
  // closes it through finishMatch() (which already recalculates standings).
  // The frontend only ever declares WHAT happened; never HOW it counts.
  // ═══════════════════════════════════════════════════════════════════════════

  private static readonly PLAYER_EVENTS: MatchEventType[] = [
    MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_GOAL,
    MatchEventType.YELLOW_CARD, MatchEventType.RED_CARD, MatchEventType.SECOND_YELLOW,
    MatchEventType.SUBSTITUTION_IN, MatchEventType.SUBSTITUTION_OUT,
    MatchEventType.INJURY,
  ];

  async addEvent(id: number, dto: AddEventDto): Promise<Match> {
    const match = await this.findOne(id);

    if (match.status === MatchStatus.FINISHED)
      throw new BadRequestException('Match is finished — no further events can be recorded');
    if (match.status === MatchStatus.CANCELLED || match.status === MatchStatus.POSTPONED)
      throw new BadRequestException(`Cannot record events on a ${match.status.toLowerCase()} match`);

    const needsPlayer = MatchesService.PLAYER_EVENTS.includes(dto.type);
    if (needsPlayer && (dto.playerId == null || dto.clubId == null))
      throw new BadRequestException(`${dto.type} requires playerId and clubId`);
    if (dto.clubId != null && dto.clubId !== match.homeClubId && dto.clubId !== match.awayClubId)
      throw new BadRequestException('clubId must be the home or away club of this match');
    if (dto.type !== MatchEventType.KICKOFF && match.status !== MatchStatus.LIVE)
      throw new BadRequestException('Record KICKOFF first — events require a LIVE match');

    // ── Season match rules (Phase 5) — configuration, not hardcoding ────────
    // seasons.config.matchRules: { maxSubstitutions?, varEnabled? }
    const matchRules = ((match.season as any)?.config?.matchRules ?? {}) as {
      maxSubstitutions?: number; varEnabled?: boolean;
    };
    if (dto.type === MatchEventType.VAR && matchRules.varEnabled === false)
      throw new BadRequestException('VAR is disabled for this season (seasons.config.matchRules.varEnabled)');
    if (dto.type === MatchEventType.SUBSTITUTION_IN && Number.isFinite(Number(matchRules.maxSubstitutions))) {
      const used = await this.eventRepo.count({
        where: { matchId: id, type: MatchEventType.SUBSTITUTION_IN, clubId: dto.clubId ?? undefined },
      });
      if (used >= Number(matchRules.maxSubstitutions))
        throw new BadRequestException(
          `Substitution limit reached (${matchRules.maxSubstitutions} per club for this season)`,
        );
    }

    // ── Side effects (business rules live HERE, never in the frontend) ───────
    switch (dto.type) {
      case MatchEventType.KICKOFF:
        match.status    = MatchStatus.LIVE;
        match.homeScore = match.homeScore ?? 0;
        match.awayScore = match.awayScore ?? 0;
        break;
      case MatchEventType.GOAL:
      case MatchEventType.PENALTY_GOAL:
        if (dto.clubId === match.homeClubId) match.homeScore = (match.homeScore ?? 0) + 1;
        else                                 match.awayScore = (match.awayScore ?? 0) + 1;
        break;
      case MatchEventType.OWN_GOAL:
        // credited to the OPPOSING side of the player's club
        if (dto.clubId === match.homeClubId) match.awayScore = (match.awayScore ?? 0) + 1;
        else                                 match.homeScore = (match.homeScore ?? 0) + 1;
        break;
      default:
        break; // cards, subs, injury, VAR, half-time: recorded, no score impact
    }

    await this.eventRepo.save(this.eventRepo.create({
      matchId:   id,
      type:      dto.type,
      minute:    dto.minute,
      extraTime: dto.extraTime ?? 0,
      playerId:  dto.playerId ?? null,
      clubId:    dto.clubId ?? null,
    }));
    await this.matchRepo.save(match);

    // FULL_TIME delegates to the existing finish pipeline (status FINISHED
    // + standings recalculation) so there is exactly one way to end a match.
    if (dto.type === MatchEventType.FULL_TIME) return this.finishMatch(id);

    return this.findOne(id);
  }

  async removeEvent(id: number, eventId: number): Promise<Match> {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.FINISHED)
      throw new BadRequestException('Cannot amend events of a finished match');

    const event = await this.eventRepo.findOne({ where: { id: eventId, matchId: id } });
    if (!event) throw new NotFoundException(`Event "${eventId}" not found on match "${id}"`);

    // Reverse the score effect symmetrically to addEvent().
    switch (event.type) {
      case MatchEventType.GOAL:
      case MatchEventType.PENALTY_GOAL:
        if (event.clubId === match.homeClubId) match.homeScore = Math.max(0, (match.homeScore ?? 0) - 1);
        else                                   match.awayScore = Math.max(0, (match.awayScore ?? 0) - 1);
        break;
      case MatchEventType.OWN_GOAL:
        if (event.clubId === match.homeClubId) match.awayScore = Math.max(0, (match.awayScore ?? 0) - 1);
        else                                   match.homeScore = Math.max(0, (match.homeScore ?? 0) - 1);
        break;
      default:
        break;
    }

    await this.eventRepo.remove(event);
    await this.matchRepo.save(match);
    return this.findOne(id);
  }

}