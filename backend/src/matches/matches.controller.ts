import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MatchStatus } from './match.entity';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ScoreDto {
  @IsInt() @Min(0) @Type(() => Number) homeScore: number;
  @IsInt() @Min(0) @Type(() => Number) awayScore: number;
}

@ApiTags('matches')
@ApiBearerAuth()
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // POST /matches
  @Post()
  @ApiOperation({ summary: 'Schedule a new match' })
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  // GET /matches?status=LIVE&round=5&seasonId=xxx&clubId=xxx
  @Get()
  @ApiOperation({ summary: 'Get all matches with filters' })
  @ApiQuery({ name: 'status', enum: MatchStatus, required: false })
  @ApiQuery({ name: 'round', type: Number, required: false })
  @ApiQuery({ name: 'seasonId', type: String, required: false })
  @ApiQuery({ name: 'clubId', type: String, required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: MatchStatus,
    @Query('round') round?: number,
    @Query('seasonId') seasonId?: string,
    @Query('clubId') clubId?: string,
  ) {
    return this.matchesService.findAll(pagination, { status, round, seasonId, clubId });
  }

  // GET /matches/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get match details with events and stats' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchesService.findOne(id);
  }

  // PATCH /matches/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update match info' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchesService.update(id, dto);
  }

  // PATCH /matches/:id/score
  @Patch(':id/score')
  @ApiOperation({ summary: 'Update live match score' })
  updateScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ScoreDto,
  ) {
    return this.matchesService.updateScore(id, body.homeScore, body.awayScore);
  }

  // PATCH /matches/:id/finish
  @Patch(':id/finish')
  @ApiOperation({ summary: 'Mark a match as finished' })
  finishMatch(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchesService.finishMatch(id);
  }

  // DELETE /matches/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a match' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchesService.remove(id);
  }
}