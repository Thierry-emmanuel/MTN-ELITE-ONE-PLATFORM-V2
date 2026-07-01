import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { CreateMatchDto }      from './dto/create-match.dto';
import { UpdateMatchDto }      from './dto/update-match.dto';
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

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,

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
}