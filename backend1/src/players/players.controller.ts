import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PlayerPosition } from './player.entity';

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

  // GET /players?page=1&limit=10&position=FWD&clubId=xxx&isActive=true
  @Get()
  @ApiOperation({ summary: 'Get all players with filters' })
  @ApiQuery({ name: 'position', enum: PlayerPosition, required: false })
  @ApiQuery({ name: 'clubId', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('position') position?: PlayerPosition,
    @Query('clubId') clubId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.playersService.findAll(pagination, {
      position,
      clubId: clubId ? Number(clubId) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
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