import {
  Controller, Get, Query, Param,
  ParseUUIDPipe, UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { StatsService } from './stats.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PlayerStatsQueryDto } from './dto/player-stats-query.dto';
import { ClubStatsQueryDto, TopPerformersQueryDto } from './dto/club-stats-query.dto';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // ── Existing endpoints (unchanged) ─────────────────────────────────────────

  @Get('top-scorers')
  @ApiOperation({ summary: 'Get top scorers for a season' })
  @ApiQuery({ name: 'seasonId', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopScorers(
    @Query('seasonId') seasonId: string,
    @Query('limit') limit?: number,
  ) {
    return this.statsService.getTopScorers(seasonId, limit ? +limit : undefined);
  }

  @Get('top-assisters')
  @ApiOperation({ summary: 'Get top assisters for a season' })
  @ApiQuery({ name: 'seasonId', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopAssisters(
    @Query('seasonId') seasonId: string,
    @Query('limit') limit?: number,
  ) {
    return this.statsService.getTopAssisters(seasonId, limit ? +limit : undefined);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get team stats for a season' })
  @ApiQuery({ name: 'seasonId', required: true })
  getTeamsStats(@Query('seasonId') seasonId: string) {
    return this.statsService.getTeamsStats(seasonId);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Get aggregated match stats for both teams' })
  @ApiParam({ name: 'matchId', required: true })
  getMatchStats(@Param('matchId', ParseUUIDPipe) matchId: string) {
    return this.statsService.getMatchStats(matchId);
  }

  @Get('season/:seasonId/summary')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120)
  @ApiOperation({ summary: 'Get global summary stats for a season' })
  @ApiParam({ name: 'seasonId', required: true })
  getSeasonSummary(@Param('seasonId') seasonId: string) {
    return this.statsService.getSeasonSummary(seasonId);
  }

  // ── NEW: Player stats with filtering, sorting & pagination ─────────────────

  /**
   * GET /stats/players
   * Query: season, teamId, position, minMinutes, nationality, sort, order, page, limit
   *
   * Returns paginated PlayerStatDto list with total count for frontend pagination.
   *
   * Example:
   *   GET /stats/players?season=season-2025-26&position=FW&minMinutes=900&sort=goals&order=desc&page=1&limit=25
   */
  @Get('players')
  @ApiOperation({ summary: 'Get player stats with filtering, sorting and pagination' })
  getPlayerStats(@Query() query: PlayerStatsQueryDto) {
    return this.statsService.getPlayerStats({
      seasonId:   query.season,
      teamId:     query.teamId,
      position:   query.position,
      minMinutes: query.minMinutes,
      nationality: query.nationality,
      sort:       query.sort   ?? 'goals',
      order:      query.order  ?? 'desc',
      page:       query.page   ?? 1,
      limit:      query.limit  ?? 25,
    });
  }

  // ── NEW: Club stats with sorting & pagination ──────────────────────────────

  /**
   * GET /stats/clubs
   * Query: season, sort, order, page, limit
   *
   * Returns paginated ClubStatDto list.
   *
   * Example:
   *   GET /stats/clubs?season=season-2025-26&sort=goalsFor&order=desc
   */
  @Get('clubs')
  @ApiOperation({ summary: 'Get club stats with sorting and pagination' })
  getClubStats(@Query() query: ClubStatsQueryDto) {
    return this.statsService.getClubStats({
      seasonId: query.season,
      sort:     query.sort  ?? 'goalsFor',
      order:    query.order ?? 'desc',
      page:     query.page  ?? 1,
      limit:    query.limit ?? 20,
    });
  }

  // ── NEW: Top performers by category (cached — heavy aggregation) ───────────

  /**
   * GET /stats/top
   * Query: season (required), type, limit
   *
   * Returns top N players for a given stat category. Response is cached
   * for 2 minutes — invalidated when player_stats are updated.
   *
   * Example:
   *   GET /stats/top?season=season-2025-26&type=goals&limit=10
   */
  @Get('top')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120)   // 2 minutes
  @ApiOperation({ summary: 'Get top N performers for a given stat category' })
  getTopPerformers(@Query() query: TopPerformersQueryDto) {
    return this.statsService.getTopPerformers({
      seasonId: query.season,
      category: query.type ?? 'goals',
      limit:    query.limit ?? 10,
    });
  }
}