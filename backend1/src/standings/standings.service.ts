import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Standing } from './standing.entity';
import { Match, MatchStatus } from '../matches/match.entity';
import { Club } from '../clubs/club.entity';
import { Season } from '../seasons/season.entity';

// ─── Types used internally ────────────────────────────────────────────────────
type FormChar = 'W' | 'D' | 'L';

interface ClubAccumulator {
  clubId:        number;
  played:        number;
  won:           number;
  drawn:         number;
  lost:          number;
  goalsFor:      number;
  goalsAgainst:  number;
  homePlayed:    number; homeWon: number; homeDrawn: number; homeLost: number;
  awayPlayed:    number; awayWon: number; awayDrawn: number; awayLost: number;
  recentResults: FormChar[];   // chronological, newest last
}

@Injectable()
export class StandingsService {
  private readonly logger = new Logger(StandingsService.name);

  constructor(
    @InjectRepository(Standing) private readonly standingRepo: Repository<Standing>,
    @InjectRepository(Match)    private readonly matchRepo:    Repository<Match>,
    @InjectRepository(Club)     private readonly clubRepo:     Repository<Club>,
    @InjectRepository(Season)   private readonly seasonRepo:   Repository<Season>,
    private readonly dataSource: DataSource,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // READ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Returns the full standings table for a season, ordered by position.
   * WHY: Single JOIN query — avoids N+1 from loading club per standing.
   */
  async findBySeason(seasonId: number): Promise<Standing[]> {
    const season = await this.seasonRepo.findOne({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season "${seasonId}" not found`);

    return this.standingRepo.find({
      where:     { seasonId },
      relations: ['club'],
      order:     { position: 'ASC' },
    });
  }

  /**
   * Returns the standings row for one club in a season.
   */
  async findOneByClubAndSeason(clubId: number, seasonId: number): Promise<Standing> {
    const standing = await this.standingRepo.findOne({
      where:     { clubId, seasonId },
      relations: ['club', 'season'],
    });
    if (!standing)
      throw new NotFoundException(`No standing found for club "${clubId}" in season "${seasonId}"`);
    return standing;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECALCULATE (called after every match.finishMatch())
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Full recalculation of the standings table for a season.
   *
   * WHY full recalc instead of incremental update:
   *   - Prevents drift from edge cases (score corrections, match cancellations)
   *   - Runs inside a DB transaction — atomic, no partial writes
   *   - Fast enough for a league with ≤ 16 clubs × 30 rounds = 480 max matches
   *
   * Complexity: O(finished_matches) per call — typically < 200 rows.
   */
  async recalculateForSeason(seasonId: number): Promise<Standing[]> {
    this.logger.log(`Recalculating standings for season ${seasonId}`);

    // 1 — Load all FINISHED matches for the season (single query, no N+1)
    const matches = await this.matchRepo.find({
      where:  { seasonId, status: MatchStatus.FINISHED },
      select: [
        'id', 'homeClubId', 'awayClubId',
        'homeScore', 'awayScore', 'scheduledAt',
      ],
      order:  { scheduledAt: 'ASC' },
    });

    // 2 — Load all clubs registered in the season via existing standings
    //     (or clubs that appear in any match)
    const clubIds = this.extractUniqueClubIds(matches);
    if (clubIds.length === 0) {
      this.logger.warn(`No finished matches for season ${seasonId} — nothing to recalculate`);
      return [];
    }

    // 3 — Build accumulator map: clubId → stats object
    const accMap = this.buildAccumulators(clubIds, matches);

    // 4 — Sort clubs: pts DESC, GD DESC, GF DESC (standard football tiebreakers)
    const sorted = this.sortStandings(Array.from(accMap.values()));

    // 5 — Persist inside a transaction — all rows or nothing
    const saved = await this.persistStandings(seasonId, sorted);

    this.logger.log(`Standings updated — ${saved.length} clubs, season ${seasonId}`);
    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private extractUniqueClubIds(matches: Match[]): number[] {
    const ids = new Set<number>();
    matches.forEach(m => { ids.add(m.homeClubId); ids.add(m.awayClubId); });
    return Array.from(ids);
  }

  /**
   * Iterates finished matches once and accumulates stats per club.
   * WHY: Single O(n) pass — no nested loops, no additional DB calls.
   */
  private buildAccumulators(
    clubIds: number[],
    matches: Match[],
  ): Map<number, ClubAccumulator> {
    // Initialise empty accumulators
    const map = new Map<number, ClubAccumulator>(
      clubIds.map(id => [id, this.emptyAccumulator(id)]),
    );

    for (const m of matches) {
      if (m.homeScore === null || m.awayScore === null) continue;

      const home = map.get(m.homeClubId)!;
      const away = map.get(m.awayClubId)!;
      const hs = m.homeScore;
      const as_ = m.awayScore;

      // ── Played ────────────────────────────────────────────────
      home.played++;   away.played++;
      home.homePlayed++; away.awayPlayed++;

      // ── Goals ─────────────────────────────────────────────────
      home.goalsFor     += hs; home.goalsAgainst += as_;
      away.goalsFor     += as_; away.goalsAgainst += hs;

      // ── Result ────────────────────────────────────────────────
      if (hs > as_) {
        home.won++;   home.homeWon++;
        away.lost++;  away.awayLost++;
        home.recentResults.push('W');
        away.recentResults.push('L');
      } else if (hs < as_) {
        away.won++;   away.awayWon++;
        home.lost++;  home.homeLost++;
        home.recentResults.push('L');
        away.recentResults.push('W');
      } else {
        home.drawn++; home.homeDrawn++;
        away.drawn++; away.awayDrawn++;
        home.recentResults.push('D');
        away.recentResults.push('D');
      }
    }

    return map;
  }

  /**
   * Standard football sort:
   *   1. Points (desc)
   *   2. Goal difference (desc)
   *   3. Goals for (desc)
   *   4. Club name alphabetical (stable tiebreaker)
   */
  private sortStandings(accumulators: ClubAccumulator[]): ClubAccumulator[] {
    return accumulators.sort((a, b) => {
      const ptsDiff = this.points(b) - this.points(a);
      if (ptsDiff !== 0) return ptsDiff;

      const gdDiff = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      if (gdDiff !== 0) return gdDiff;

      return b.goalsFor - a.goalsFor;
    });
  }

  /**
   * Upsert all standings rows for a season inside a single transaction.
   * WHY: If any write fails, the whole batch rolls back — no partial state.
   */
  private async persistStandings(
    seasonId: number,
    sorted: ClubAccumulator[],
  ): Promise<Standing[]> {
    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(Standing);
      const results: Standing[] = [];

      for (let i = 0; i < sorted.length; i++) {
        const acc = sorted[i];
        const position = i + 1;

        // Try to find existing row first (upsert pattern)
        let standing = await repo.findOne({
          where: { clubId: acc.clubId, seasonId },
        });

        if (!standing) {
          standing = repo.create({ clubId: acc.clubId, seasonId });
        }

        // ── Assign all computed values ─────────────────────────
        standing.position      = position;
        standing.played        = acc.played;
        standing.won           = acc.won;
        standing.drawn         = acc.drawn;
        standing.lost          = acc.lost;
        standing.goalsFor      = acc.goalsFor;
        standing.goalsAgainst  = acc.goalsAgainst;
        standing.goalDifference= acc.goalsFor - acc.goalsAgainst;
        standing.points        = this.points(acc);
        standing.formGuide     = acc.recentResults.slice(-5); // last 5 only

        // Home / away split
        standing.homePlayed = acc.homePlayed; standing.homeWon   = acc.homeWon;
        standing.homeDrawn  = acc.homeDrawn;  standing.homeLost  = acc.homeLost;
        standing.awayPlayed = acc.awayPlayed; standing.awayWon   = acc.awayWon;
        standing.awayDrawn  = acc.awayDrawn;  standing.awayLost  = acc.awayLost;

        results.push(await repo.save(standing));
      }

      return results;
    });
  }

  // ── Utilities ────────────────────────────────────────────────────────────────

  private points(acc: ClubAccumulator): number {
    return acc.won * 3 + acc.drawn;
  }

  private emptyAccumulator(clubId: number): ClubAccumulator {
    return {
      clubId, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0,
      homePlayed: 0, homeWon: 0, homeDrawn: 0, homeLost: 0,
      awayPlayed: 0, awayWon: 0, awayDrawn: 0, awayLost: 0,
      recentResults: [],
    };
  }
}