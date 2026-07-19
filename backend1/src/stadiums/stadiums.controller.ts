// src/stadiums/stadiums.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StadiumsService } from './stadiums.service';
import { StadiumStatus } from './stadium.entity';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';

import { Secured } from '../iam/guards/permissions.guard';
@ApiTags('stadiums')
@ApiBearerAuth()
@Controller('stadiums')
export class StadiumsController {
  constructor(private readonly service: StadiumsService) {}

  // POST /stadiums
  @Post()
  @Secured('stadiums.create')
  @ApiOperation({ summary: 'Create a new stadium' })
  create(@Body() dto: CreateStadiumDto) {
    return this.service.create(dto);
  }

  // GET /stadiums?page=1&limit=50&city=Yaoundé&status=ACTIVE
  @Get()
  @ApiOperation({ summary: 'List all stadiums' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'city',   required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: StadiumStatus })
  findAll(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('city')   city?:   string,
    @Query('status') status?: StadiumStatus,
  ) {
    return this.service.findAll({
      page:   page  ? Number(page)  : 1,
      limit:  limit ? Number(limit) : 50,
      city,
      status,
    });
  }

  // GET /stadiums/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get stadium by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // PATCH /stadiums/:id
  @Patch(':id')
  @Secured('stadiums.update')
  @ApiOperation({ summary: 'Update a stadium' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStadiumDto) {
    return this.service.update(id, dto);
  }

  // DELETE /stadiums/:id
  @Delete(':id')
  @Secured('stadiums.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a stadium' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
