import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import {
  MatchesService, MatchFilters, MatchDay, PaginatedMatches,
  MatchStatsResult, HeadToHeadResult,
} from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { SetLineupsDto }  from './dto/set-lineup.dto';
import { AddEventDto }     from './dto/add-event.dto';
import { PaginationDto }  from '../common/dto/pagination.dto';
import { Match, MatchStatus } from './match.entity';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard }   from '../common/guards/roles.guard';
import { Roles }        from '../common/guards/roles.decorator';
import { UserRole }     from '../users/user.entity';

class ScoreDto {
  @IsInt() @Min(0) @Type(() => Number) homeScore: number;
  @IsInt() @Min(0) @Type(() => Number) awayScore: number;
}

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // ── POST /matches ─────────────────────────────────────────────────────────
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Schedule a new match (admin)' })
  create(@Body() dto: CreateMatchDto): Promise<Match> {
    return this.matchesService.create(dto);
  }

  // ── GET /matches ──────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'List matches with filtering and pagination' })
  @ApiQuery({ name: 'status',   enum: MatchStatus, required: false })
  @ApiQuery({ name: 'round',    type: Number,       required: false })
  @ApiQuery({ name: 'seasonId', type: String,       required: false })
  @ApiQuery({ name: 'clubId',   type: String,       required: false })
  @ApiQuery({ name: 'dateFrom', type: String,       required: false })
  @ApiQuery({ name: 'dateTo',   type: String,       required: false })
  @ApiQuery({ name: 'page',     type: Number,       required: false })
  @ApiQuery({ name: 'limit',    type: Number,       required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status')   status?:   MatchStatus,
    @Query('round')    round?:    number,
    @Query('seasonId') seasonId?: string,
    @Query('clubId')   clubId?:   string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo')   dateTo?:   string,
  ): Promise<PaginatedMatches> {
    const filters: MatchFilters = {
      status, round,
      seasonId: seasonId ? Number(seasonId) : undefined,
      clubId:   clubId   ? Number(clubId)   : undefined,
      dateFrom, dateTo,
    };
    return this.matchesService.findAll(pagination, filters);
  }

  // ── GET /matches/fixtures/:seasonId ───────────────────────────────────────
  @Get('fixtures/:seasonId')
  @ApiOperation({ summary: 'Get upcoming & live matches for a season, grouped by date' })
  @ApiParam({ name: 'seasonId' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findFixtures(
    @Param('seasonId', ParseIntPipe) seasonId: number,
    @Query('limit') limit?: number,
  ): Promise<MatchDay[]> {
    return this.matchesService.findFixtures(seasonId, limit ? +limit : 30);
  }

  // ── GET /matches/results/:seasonId ────────────────────────────────────────
  @Get('results/:seasonId')
  @ApiOperation({ summary: 'Get finished matches for a season, paginated and grouped by date' })
  @ApiParam({ name: 'seasonId' })
  @ApiQuery({ name: 'page',  type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findResults(
    @Param('seasonId', ParseIntPipe) seasonId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.matchesService.findResults(seasonId, pagination);
  }

  // ── GET /matches/:id ──────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get full match details (events, stats)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  // ── GET /matches/:id/stats ────────────────────────────────────────────────
  @Get(':id/stats')
  @ApiOperation({ summary: 'Team-level match stats aggregated from player stats' })
  getStats(@Param('id', ParseIntPipe) id: number): Promise<MatchStatsResult> {
    return this.matchesService.getTeamStats(id);
  }

  // ── GET /matches/:id/lineups ──────────────────────────────────────────────
  @Get(':id/lineups')
  @ApiOperation({ summary: 'Starting XI, substitutes and formations for both teams' })
  getLineups(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getLineups(id);
  }

  // ── PATCH /matches/:id/lineups ────────────────────────────────────────────
  @Patch(':id/lineups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set/replace lineups for a match (admin)' })
  setLineups(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetLineupsDto,
  ): Promise<{ message: string }> {
    return this.matchesService.setLineups(id, dto);
  }

  // ── GET /matches/:id/head-to-head ─────────────────────────────────────────
  @Get(':id/head-to-head')
  @ApiOperation({ summary: 'Past meetings between the two clubs in this fixture' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  getHeadToHead(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: number,
  ): Promise<HeadToHeadResult> {
    return this.matchesService.getHeadToHead(id, limit ? +limit : 6);
  }

  // ── PATCH /matches/:id ────────────────────────────────────────────────────
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update match info (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMatchDto,
  ): Promise<Match> {
    return this.matchesService.update(id, dto);
  }

  // ── PATCH /matches/:id/score ──────────────────────────────────────────────
  @Patch(':id/score')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update live match score (admin)' })
  updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ScoreDto,
  ): Promise<Match> {
    return this.matchesService.updateScore(id, body.homeScore, body.awayScore);
  }

  // ── PATCH /matches/:id/finish ─────────────────────────────────────────────
  @Patch(':id/finish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark match as finished — triggers standings update (admin)' })
  finishMatch(@Param('id', ParseIntPipe) id: number): Promise<Match> {
    return this.matchesService.finishMatch(id);
  }

  // ── DELETE /matches/:id ───────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a match (not allowed if LIVE) (admin)' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.matchesService.remove(id);
  }

  // POST /matches/:id/events — Phase 3 (Match Builder). One endpoint for the
  // whole timeline; business consequences (score, status, standings) are
  // decided by the service. Returns the full authoritative match.
  @Post(':id/events')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Record a match event (goal, card, sub, kickoff, full-time…) (admin)' })
  addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddEventDto,
  ): Promise<Match> {
    return this.matchesService.addEvent(id, dto);
  }

  // DELETE /matches/:id/events/:eventId — undo before full-time; score effects reversed.
  @Delete(':id/events/:eventId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a match event and reverse its effects (admin)' })
  removeEvent(
    @Param('id', ParseIntPipe) id: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<Match> {
    return this.matchesService.removeEvent(id, eventId);
  }

}