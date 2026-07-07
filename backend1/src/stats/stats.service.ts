import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PlayerStats } from '../players/player-stats.entity';
import { MatchStats }  from '../matches/match-stats.entity';
import { PlayerPosition } from '../players/player.entity';

// ─── Input shapes ─────────────────────────────────────────────────────────────

export interface PlayerStatsInput {
  // position uses entity enum values (GK | DEF | MID | FWD)
  seasonId?:    string;
  teamId?:      string;
  /** Uses the entity enum values: GK | DEF | MID | FWD */
  position?:    PlayerPosition;
  minMinutes?:  number;
  nationality?: string;
  sort:         string;
  order:        'asc' | 'desc';
  page:         number;
  limit:        number;
}

export interface ClubStatsInput {
  seasonId?: string;
  sort:      string;
  order:     'asc' | 'desc';
  page:      number;
  limit:     number;
}

export interface TopPerformersInput {
  seasonId: string;
  category: string;
  limit:    number;
}

export interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

// ─── Sort key → TypeORM property path ────────────────────────────────────────
// Keys come from the frontend; values are TypeORM query-builder aliases.
// Note: entity uses `penaltyGoals`, not `penaltiesScored`.
const PLAYER_SORT_MAP: Record<string, string> = {
  goals:           'ps.goals',
  assists:         'ps.assists',
  keyPasses:       'ps.keyPasses',
  shots:           'ps.shots',
  shotsOnTarget:   'ps.shotsOnTarget',
  xG:              'ps.xG',
  yellowCards:     'ps.yellowCards',
  redCards:        'ps.redCards',
  minutesPlayed:   'ps.minutesPlayed',
  appearances:     'ps.appearances',
  penaltiesScored: 'ps.penaltyGoals',   // mapped: frontend key → entity field
  passAccuracy:    'ps.passAccuracy',
};

// ─── Frontend position keys → entity enum values ──────────────────────────────
// The frontend filter sends 'DF'/'MF'/'FW'; the entity uses 'DEF'/'MID'/'FWD'.
const POSITION_MAP: Record<string, PlayerPosition> = {
  GK:  PlayerPosition.GOALKEEPER,
  DF:  PlayerPosition.DEFENDER,
  DEF: PlayerPosition.DEFENDER,
  MF:  PlayerPosition.MIDFIELDER,
  MID: PlayerPosition.MIDFIELDER,
  FW:  PlayerPosition.FORWARD,
  FWD: PlayerPosition.FORWARD,
};

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(PlayerStats)
    private readonly playerStatRepo: Repository<PlayerStats>,

    @InjectRepository(MatchStats)
    private readonly matchStatRepo: Repository<MatchStats>,

    private readonly dataSource: DataSource,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYER STATS
  // ═══════════════════════════════════════════════════════════════════════════

  async getPlayerStats(input: PlayerStatsInput): Promise<PaginatedResult<object>> {
    const sortCol = PLAYER_SORT_MAP[input.sort] ?? 'ps.goals';
    const order   = input.order.toUpperCase() as 'ASC' | 'DESC';
    const skip    = (input.page - 1) * input.limit;

    const qb = this.playerStatRepo
      .createQueryBuilder('ps')
      // player → club is on the Player entity, not on PlayerStats directly
      .innerJoin('ps.player', 'player')
      .innerJoin('player.club', 'club')
      .leftJoin('ps.season',   'season')
      .select([
        'ps.id',
        // Player fields — note: firstName + lastName, not a single `name`
        'player.id',          'player.firstName',   'player.lastName',
        'player.position',    'player.nationality', 'player.birthDate',
        'player.photoUrl',
        // Club fields
        'club.id',            'club.name',
        // Stats
        'ps.appearances',     'ps.minutesPlayed',
        'ps.goals',           'ps.assists',         'ps.keyPasses',
        'ps.shots',           'ps.shotsOnTarget',   'ps.xG',
        'ps.penaltyGoals',    'ps.penaltiesMissed',
        'ps.yellowCards',     'ps.redCards',
        'ps.passAccuracy',    'ps.cleanSheets',     'ps.avgRating',
      ])
      .orderBy(sortCol, order)
      .skip(skip)
      .take(input.limit);

    if (input.seasonId)
      qb.andWhere('season.id = :seasonId', { seasonId: input.seasonId });

    if (input.teamId)
      qb.andWhere('club.id = :teamId', { teamId: input.teamId });

    if (input.position) {
      const mapped = POSITION_MAP[input.position] ?? input.position;
      qb.andWhere('player.position = :position', { position: mapped });
    }

    if (input.minMinutes)
      qb.andWhere('ps.minutesPlayed >= :minMinutes', { minMinutes: input.minMinutes });

    if (input.nationality)
      qb.andWhere('player.nationality = :nationality', { nationality: input.nationality });

    const [raw, total] = await qb.getManyAndCount();

    const data = raw.map(ps => {
      const age = ps.player.birthDate
        ? new Date().getFullYear() - new Date(ps.player.birthDate).getFullYear()
        : null;

      return {
        playerId:        ps.player.id,
        playerName:      `${ps.player.firstName} ${ps.player.lastName}`,
        position:        ps.player.position,   // e.g. 'DEF' — frontend handles display
        nationality:     ps.player.nationality,
        photoUrl:        ps.player.photoUrl ?? null,
        age,
        clubId:          ps.player.club?.id   ?? null,
        clubName:        ps.player.club?.name ?? '—',
        clubShort:       ps.player.club?.name?.slice(0, 3).toUpperCase() ?? '—',
        appearances:     ps.appearances,
        minutesPlayed:   ps.minutesPlayed,
        goals:           ps.goals,
        assists:         ps.assists,
        keyPasses:       ps.keyPasses,
        shots:           ps.shots,
        shotsOnTarget:   ps.shotsOnTarget,
        xG:              ps.xG ?? null,
        penaltiesScored: ps.penaltyGoals,      // normalised key for frontend
        penaltiesMissed: ps.penaltiesMissed,
        yellowCards:     ps.yellowCards,
        redCards:        ps.redCards,
        passAccuracy:    ps.passAccuracy ?? null,
      };
    });

    return { data, total, page: input.page, limit: input.limit, totalPages: Math.ceil(total / input.limit) };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLUB STATS  (aggregated from finished matches)
  // ═══════════════════════════════════════════════════════════════════════════

  async getClubStats(input: ClubStatsInput): Promise<PaginatedResult<object>> {
    const order   = input.order.toUpperCase() as 'ASC' | 'DESC';
    const skip    = (input.page - 1) * input.limit;

    // Allowed sort columns (whitelist to prevent SQL injection)
    const ALLOWED_CLUB_SORT = new Set([
      'goalsFor','goalsAgainst','wins','draws','losses','cleanSheets',
      'shots','shotsOnTarget','yellowCards','redCards','points',
      'penaltiesFor','penaltiesAgainst','possession','matchesPlayed',
    ]);
    const sortKey = ALLOWED_CLUB_SORT.has(input.sort) ? input.sort : 'goalsFor';

    // Raw SQL — TypeORM ORM layer can't express window-function-free GROUP BY
    // aggregation over match results cleanly; raw gives us full control.
    const seasonClause = input.seasonId ? `AND m."season_id" = $1::int` : '';
    const paramOffset  = input.seasonId ? 1 : 0;

    // NOTE: match_stats stores per-player-per-match rows (not team-level rows).
    // We aggregate player stats per club per match using a LATERAL subquery.
    // Columns used: shots_on_target, yellow_cards, red_cards (actual entity fields).
    const sql = `
      SELECT
        c.id                                                                    AS "clubId",
        c.name                                                                  AS "clubName",
        COUNT(DISTINCT m.id)::int                                               AS "matchesPlayed",
        SUM(CASE WHEN (m."home_club_id"=c.id AND m."home_score">m."away_score")
                   OR (m."away_club_id"=c.id AND m."away_score">m."home_score")
                 THEN 1 ELSE 0 END)::int                                        AS wins,
        SUM(CASE WHEN m."home_score"=m."away_score" THEN 1 ELSE 0 END)::int    AS draws,
        SUM(CASE WHEN (m."home_club_id"=c.id AND m."home_score"<m."away_score")
                   OR (m."away_club_id"=c.id AND m."away_score"<m."home_score")
                 THEN 1 ELSE 0 END)::int                                        AS losses,
        COALESCE(SUM(CASE WHEN m."home_club_id"=c.id THEN m."home_score"
                          ELSE m."away_score" END),0)::int                      AS "goalsFor",
        COALESCE(SUM(CASE WHEN m."home_club_id"=c.id THEN m."away_score"
                          ELSE m."home_score" END),0)::int                      AS "goalsAgainst",
        COALESCE(SUM(CASE WHEN m."home_club_id"=c.id THEN m."home_score"
                          ELSE m."away_score" END),0)::int
          - COALESCE(SUM(CASE WHEN m."home_club_id"=c.id THEN m."away_score"
                              ELSE m."home_score" END),0)::int                  AS "goalDifference",
        COALESCE(SUM(ms_agg.shots_on_target_sum),0)::int                       AS "shotsOnTarget",
        COALESCE(SUM(ms_agg.yellow_cards_sum),0)::int                          AS "yellowCards",
        COALESCE(SUM(ms_agg.red_cards_sum),0)::int                             AS "redCards",
        SUM(CASE WHEN (m."home_club_id"=c.id AND m."away_score"=0)
                   OR (m."away_club_id"=c.id AND m."home_score"=0)
                 THEN 1 ELSE 0 END)::int                                        AS "cleanSheets",
        SUM(CASE WHEN (m."home_club_id"=c.id AND m."home_score">m."away_score")
                   OR (m."away_club_id"=c.id AND m."away_score">m."home_score")
                 THEN 3 WHEN m."home_score"=m."away_score" THEN 1 ELSE 0 END)::int AS points
      FROM clubs c
      INNER JOIN matches m
        ON (m."home_club_id"=c.id OR m."away_club_id"=c.id)
        AND m.status = 'FINISHED'
        ${seasonClause}
      LEFT JOIN LATERAL (
        SELECT
          COALESCE(SUM(ms."shots_on_target"),0)::int AS shots_on_target_sum,
          COALESCE(SUM(ms."yellow_cards"),0)::int    AS yellow_cards_sum,
          COALESCE(SUM(ms."red_cards"),0)::int       AS red_cards_sum
        FROM match_stats ms
        WHERE ms."match_id" = m.id
          AND ms."club_id"  = c.id
      ) ms_agg ON true
      GROUP BY c.id, c.name
      ORDER BY "${sortKey}" ${order}
      LIMIT $${paramOffset + 1} OFFSET $${paramOffset + 2}
    `;

    const params: (string | number)[] = [];
    if (input.seasonId) params.push(input.seasonId);
    params.push(input.limit, skip);

    const data = await this.dataSource.query<Record<string, unknown>[]>(sql, params);

    return {
      data,
      total:      data.length,
      page:       input.page,
      limit:      input.limit,
      totalPages: Math.ceil(data.length / input.limit),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP PERFORMERS  (cached at controller level)
  // ═══════════════════════════════════════════════════════════════════════════

  async getTopPerformers(input: TopPerformersInput): Promise<object[]> {
    const sortCol = PLAYER_SORT_MAP[input.category] ?? 'ps.goals';

    const qb = this.playerStatRepo
      .createQueryBuilder('ps')
      .innerJoin('ps.player', 'player')
      .innerJoin('player.club', 'club')
      .leftJoin('ps.season', 'season')
      .select([
        'player.id        AS "playerId"',
        `CONCAT(player."first_name", ' ', player."last_name") AS "playerName"`,
        'player."photo_url"  AS "photoUrl"',
        'club.name           AS "clubName"',
        `${sortCol}          AS value`,
      ])
      .where('season.id = :seasonId', { seasonId: input.seasonId })
      .orderBy(sortCol, 'DESC')
      .limit(input.limit);

    const raw = await qb.getRawMany<{
      playerId: string; playerName: string; photoUrl: string | null;
      clubName: string; value: string;
    }>();

    return raw.map(r => ({
      playerId:   r.playerId,
      playerName: r.playerName,
      photoUrl:   r.photoUrl ?? null,
      clubName:   r.clubName,
      value:      +r.value,
      category:   input.category,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXISTING METHODS (unchanged API surface)
  // ═══════════════════════════════════════════════════════════════════════════

  async getTopScorers(seasonId: string, limit = 10): Promise<object[]> {
    return this.getTopPerformers({ seasonId, category: 'goals', limit });
  }

  async getTopAssisters(seasonId: string, limit = 10): Promise<object[]> {
    return this.getTopPerformers({ seasonId, category: 'assists', limit });
  }

  async getTeamsStats(seasonId: string): Promise<object> {
    return this.getClubStats({ seasonId, sort: 'goalsFor', order: 'desc', page: 1, limit: 50 });
  }

  async getMatchStats(matchId: string): Promise<object> {
    const stats = await this.matchStatRepo.findOne({
      where:     { matchId } as any,
      relations: ['match', 'match.homeClub', 'match.awayClub'],
    });
    return stats ?? {};
  }

  async getSeasonSummary(seasonId: string): Promise<object> {
    const [row] = await this.dataSource.query<{
      totalGoals: string; totalYellow: string; totalRed: string; topGoals: string;
    }[]>(
      `SELECT
         COALESCE(SUM(ps.goals), 0)         AS "totalGoals",
         COALESCE(SUM(ps.yellow_cards), 0)  AS "totalYellow",
         COALESCE(SUM(ps.red_cards), 0)     AS "totalRed",
         COALESCE(MAX(ps.goals), 0)         AS "topGoals"
       FROM player_stats ps
       WHERE ps.season_id = $1`,
      [seasonId],
    );

    const [matchRow] = await this.dataSource.query<{ total: string }[]>(
      `SELECT COUNT(*) AS total FROM matches WHERE season_id = $1 AND status = 'FINISHED'`,
      [seasonId],
    );

    const totalMatches = +matchRow.total || 1;
    const totalGoals   = +row.totalGoals || 0;

    return {
      totalGoals,
      avgGoalsPerMatch: parseFloat((totalGoals / totalMatches).toFixed(2)),
      totalYellowCards: +row.totalYellow || 0,
      totalRedCards:    +row.totalRed    || 0,
      topScorerGoals:   +row.topGoals    || 0,
      cleanSheets:      0,
    };
  }
}