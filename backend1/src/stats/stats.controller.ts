import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

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
  @ApiOperation({ summary: 'Get global summary stats for a season' })
  @ApiParam({ name: 'seasonId', required: true })
  getSeasonSummary(@Param('seasonId', ParseUUIDPipe) seasonId: string) {
    return this.statsService.getSeasonSummary(seasonId);
  }
}
