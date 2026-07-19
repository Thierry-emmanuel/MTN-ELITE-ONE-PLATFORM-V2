// src/clubs/clubs.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { PaginationDto } from '../common/dto/pagination.dto';


import { Secured } from '../iam/guards/permissions.guard';
@ApiTags('clubs')
@ApiBearerAuth()
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  // POST /clubs
  @Post()
  @Secured('clubs.create')
  @ApiOperation({ summary: 'Create a new club' })
  @ApiResponse({ status: 201, description: 'Club created successfully' })
  @ApiResponse({ status: 409, description: 'Club name already exists' })
  create(@Body() dto: CreateClubDto) {
    return this.clubsService.create(dto);
  }

  // GET /clubs?page=1&limit=10
  @Get()
  @ApiOperation({ summary: 'Get all clubs (paginated)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.clubsService.findAll(pagination);
  }

  // GET /clubs/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a club by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.findOne(id);
  }

  // GET /clubs/:id/squad
  @Get(':id/squad')
  @ApiOperation({ summary: 'Get full squad of a club' })
  findSquad(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.findSquad(id);
  }

  // GET /clubs/:id/matches
  @Get(':id/matches')
  @ApiOperation({ summary: 'Get all matches of a club' })
  findMatches(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.findMatches(id);
  }

  // PATCH /clubs/:id
  @Patch(':id')
  @Secured('clubs.update')
  @ApiOperation({ summary: 'Update a club' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubDto) {
    return this.clubsService.update(id, dto);
  }

  // DELETE /clubs/:id
  @Delete(':id')
  @Secured('clubs.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a club' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.remove(id);
  }
}
