import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { StandingsService } from './standings.service';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';

@ApiTags('standings')
@ApiBearerAuth()
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  // POST /standings
  @Post()
  @ApiOperation({ summary: 'Manually create a standing entry for a club in a season' })
  create(@Body() dto: CreateStandingDto) {
    return this.standingsService.create(dto);
  }

  // GET /standings/season/:seasonId
  @Get('season/:seasonId')
  @ApiOperation({
    summary: 'Get full league table for a season',
    description: 'Returns clubs sorted by points → goal difference → goals scored',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  findBySeason(@Param('seasonId', ParseUUIDPipe) seasonId: string) {
    return this.standingsService.findByseason(seasonId);
  }

  // GET /standings/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a single standing entry by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.standingsService.findOne(id);
  }

  // GET /standings/club/:clubId/season/:seasonId
  @Get('club/:clubId/season/:seasonId')
  @ApiOperation({ summary: 'Get standing of a specific club in a specific season' })
  @ApiParam({ name: 'clubId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  findByClubAndSeason(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
  ) {
    return this.standingsService.findByClubAndSeason(clubId, seasonId);
  }

  // PATCH /standings/:id
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a standing manually',
    description: 'Points and goal difference are auto-calculated from won/drawn/lost/goals',
  })
  @ApiResponse({ status: 400, description: 'won + drawn + lost must equal played' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStandingDto,
  ) {
    return this.standingsService.update(id, dto);
  }

  // PATCH /standings/:id/reset
  @Patch(':id/reset')
  @ApiOperation({ summary: 'Reset a standing to zero (useful for corrections)' })
  reset(@Param('id', ParseUUIDPipe) id: string) {
    return this.standingsService.reset(id);
  }

  // DELETE /standings/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a standing entry' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.standingsService.remove(id);
  }
}