import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@ApiTags('seasons')
@ApiBearerAuth()
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  // POST /seasons
  @Post()
  @ApiOperation({ summary: 'Create a new season' })
  @ApiResponse({ status: 201, description: 'Season created' })
  @ApiResponse({ status: 409, description: 'Season name already exists' })
  create(@Body() dto: CreateSeasonDto) {
    return this.seasonsService.create(dto);
  }

  // GET /seasons
  @Get()
  @ApiOperation({ summary: 'Get all seasons ordered by most recent' })
  findAll() {
    return this.seasonsService.findAll();
  }

  // GET /seasons/current
  @Get('current')
  @ApiOperation({ summary: 'Get the currently ongoing season' })
  @ApiResponse({ status: 404, description: 'No ongoing season found' })
  findCurrent() {
    return this.seasonsService.findCurrent();
  }

  // GET /seasons/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get season by ID with standings and matches' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasonsService.findOne(id);
  }

  // PATCH /seasons/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update season details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeasonDto,
  ) {
    return this.seasonsService.update(id, dto);
  }

  // PATCH /seasons/:id/activate
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a season (sets status to ONGOING)' })
  @ApiResponse({ status: 200, description: 'Season activated' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasonsService.activate(id);
  }

  // PATCH /seasons/:id/close
  @Patch(':id/close')
  @ApiOperation({ summary: 'Close the ongoing season (sets status to COMPLETED)' })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasonsService.close(id);
  }

  // POST /seasons/:id/initialize-standings
  @Post(':id/initialize-standings')
  @ApiOperation({
    summary: 'Initialize standings for all active clubs in this season',
    description: 'Creates one standing row per active club. Run once at season start.',
  })
  @ApiResponse({ status: 409, description: 'Standings already initialized' })
  initializeStandings(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasonsService.initializeStandings(id);
  }

  // DELETE /seasons/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a season (only if not ongoing)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasonsService.remove(id);
  }
}