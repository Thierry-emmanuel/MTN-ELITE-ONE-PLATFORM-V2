import {
  Controller, Get, Post, Param, ParseIntPipe,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { StandingsService } from './standings.service';
import { Standing } from './standing.entity';
import { Throttle } from '@nestjs/throttler';

@ApiTags('standings')
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  // ── GET /standings/:seasonId ──────────────────────────────────────────────
  @Get(':seasonId')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Get full standings table for a season' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  @ApiResponse({
    status: 200,
    description: 'Standings ordered by position (pts, GD, GF)',
    type: [Standing],
  })
  async findBySeason(
    @Param('seasonId', ParseIntPipe) seasonId: number,
  ): Promise<Standing[]> {
    return this.standingsService.findBySeason(seasonId);
  }

  // ── GET /standings/:seasonId/club/:clubId ─────────────────────────────────
  @Get(':seasonId/club/:clubId')
  @ApiOperation({ summary: 'Get standings row for one club in a season' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  @ApiParam({ name: 'clubId',   description: 'Club ID' })
  async findOneByClubAndSeason(
    @Param('seasonId', ParseIntPipe) seasonId: number,
    @Param('clubId',   ParseIntPipe) clubId:   number,
  ): Promise<Standing> {
    return this.standingsService.findOneByClubAndSeason(clubId, seasonId);
  }

  // ── POST /standings/:seasonId/recalculate ─────────────────────────────────
  // WHY: Admin-only manual trigger. Normally standings auto-update
  // via MatchesService.finishMatch(), but this endpoint lets admins
  // force a full recalc after bulk data import or score correction.
  @Post(':seasonId/recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: force full standings recalculation from match results',
  })
  async recalculate(
    @Param('seasonId', ParseIntPipe) seasonId: number,
  ): Promise<{ message: string; clubs: number }> {
    const standings = await this.standingsService.recalculateForSeason(seasonId);
    return {
      message: `Standings recalculated successfully`,
      clubs: standings.length,
    };
  }
}