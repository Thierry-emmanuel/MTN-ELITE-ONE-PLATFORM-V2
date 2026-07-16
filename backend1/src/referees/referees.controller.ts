// src/referees/referees.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RefereesService } from './referees.service';
import { RefereeLevel, RefereeStatus } from './referee.entity';
import { CreateRefereeDto } from './dto/create-referee.dto';
import { UpdateRefereeDto } from './dto/update-referee.dto';

@ApiTags('referees')
@ApiBearerAuth()
@Controller('referees')
export class RefereesController {
  constructor(private readonly service: RefereesService) {}

  // POST /referees
  @Post()
  @ApiOperation({ summary: 'Register a referee' })
  create(@Body() dto: CreateRefereeDto) {
    return this.service.create(dto);
  }

  // GET /referees?page=1&limit=50&licenseLevel=FIFA&status=ACTIVE
  @Get()
  @ApiOperation({ summary: 'List referees with filters' })
  @ApiQuery({ name: 'page',         required: false, type: Number })
  @ApiQuery({ name: 'limit',        required: false, type: Number })
  @ApiQuery({ name: 'nationality',  required: false, type: String })
  @ApiQuery({ name: 'licenseLevel', required: false, enum: RefereeLevel })
  @ApiQuery({ name: 'status',       required: false, enum: RefereeStatus })
  findAll(
    @Query('page')         page?:         string,
    @Query('limit')        limit?:        string,
    @Query('nationality')  nationality?:  string,
    @Query('licenseLevel') licenseLevel?: RefereeLevel,
    @Query('status')       status?:       RefereeStatus,
  ) {
    return this.service.findAll({
      page:   page  ? Number(page)  : 1,
      limit:  limit ? Number(limit) : 50,
      nationality,
      licenseLevel,
      status,
    });
  }

  // GET /referees/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get referee by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // PATCH /referees/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update referee info' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRefereeDto) {
    return this.service.update(id, dto);
  }

  // DELETE /referees/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete referee' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
