import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
  HttpCode, HttpStatus, ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiQuery, ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { MatchesService, MatchFilters, MatchDay, PaginatedMatches } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PaginationDto }  from '../common/dto/pagination.dto';
import { Match, MatchStatus } from './match.entity';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
  @ApiOperation({ summary: 'Schedule a new match' })
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
  @ApiQuery({ name: 'dateFrom', type: String,       required: false, description: 'ISO date e.g. 2025-01-01' })
  @ApiQuery({ name: 'dateTo',   type: String,       required: false, description: 'ISO date e.g. 2025-06-30' })
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
    const filters: MatchFilters = { status, round, seasonId, clubId, dateFrom, dateTo };
    return this.matchesService.findAll(pagination, filters);
  }

  // ── GET /matches/fixtures/:seasonId ───────────────────────────────────────
  // WHY: dedicated endpoint so the frontend doesn't need to know status filters.
  // Returns matches grouped by date — ready to render directly.
  @Get('fixtures/:seasonId')
  @ApiOperation({ summary: 'Get upcoming & live matches for a season, grouped by date' })
  @ApiParam({ name: 'seasonId', description: 'Season UUID' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Max number of matches (default 30)' })
  findFixtures(
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
    @Query('limit') limit?: number,
  ): Promise<MatchDay[]> {
    return this.matchesService.findFixtures(seasonId, limit ? +limit : 30);
  }

  // ── GET /matches/results/:seasonId ────────────────────────────────────────
  @Get('results/:seasonId')
  @ApiOperation({ summary: 'Get finished matches for a season, paginated and grouped by date' })
  @ApiParam({ name: 'seasonId', description: 'Season UUID' })
  @ApiQuery({ name: 'page',  type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findResults(
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.matchesService.findResults(seasonId, pagination);
  }

  // ── GET /matches/:id ──────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get full match details (events, stats)' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  // ── PATCH /matches/:id ────────────────────────────────────────────────────
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update match info' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMatchDto,
  ): Promise<Match> {
    return this.matchesService.update(id, dto);
  }

  // ── PATCH /matches/:id/score ──────────────────────────────────────────────
  @Patch(':id/score')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update live match score' })
  updateScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ScoreDto,
  ): Promise<Match> {
    return this.matchesService.updateScore(id, body.homeScore, body.awayScore);
  }

  // ── PATCH /matches/:id/finish ─────────────────────────────────────────────
  // WHY: dedicated endpoint for finishing — triggers standings recalc automatically.
  @Patch(':id/finish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark match as finished — triggers standings update' })
  finishMatch(@Param('id', ParseUUIDPipe) id: string): Promise<Match> {
    return this.matchesService.finishMatch(id);
  }

  // ── DELETE /matches/:id ───────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a match (not allowed if LIVE)' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.matchesService.remove(id);
  }
}