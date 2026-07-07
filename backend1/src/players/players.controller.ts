import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { FindPlayersDto } from './dto/find-players.dto';

@ApiTags('players')
@ApiBearerAuth()
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // POST /players
  @Post()
  @ApiOperation({ summary: 'Register a new player' })
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  // GET /players?page=1&limit=10&position=GK&clubId=1&isActive=true
  @Get()
  @ApiOperation({ summary: 'Get all players with filters' })
  findAll(@Query() query: FindPlayersDto) {
    return this.playersService.findAll(query, {
      position: query.position,
      clubId:   query.clubId ? Number(query.clubId) : undefined,
      isActive: query.isActive,
    });
  }

  // GET /players/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a player by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  // GET /players/:id/form
  @Get(':id/form')
  @ApiOperation({ summary: 'Get a player\'s form guide (last 5 matches)' })
  getFormGuide(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.getFormGuide(id);
  }

  // PATCH /players/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update player info' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, dto);
  }

  // PATCH /players/:id/transfer/:clubId
  @Patch(':id/transfer/:clubId')
  @ApiOperation({ summary: 'Transfer a player to another club' })
  @ApiParam({ name: 'id', description: 'Player ID' })
  @ApiParam({ name: 'clubId', description: 'Destination club ID' })
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @Param('clubId', ParseIntPipe) clubId: number,
  ) {
    return this.playersService.transfer(id, clubId);
  }

  // DELETE /players/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a player' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.remove(id);
  }
}