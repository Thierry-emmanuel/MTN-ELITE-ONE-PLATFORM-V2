// src/staff/staff.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { StaffRole, StaffStatus } from './staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  // POST /staff
  @Post()
  @ApiOperation({ summary: 'Add a staff member' })
  create(@Body() dto: CreateStaffDto) {
    return this.service.create(dto);
  }

  // GET /staff?clubId=1&role=PHYSIO&status=ACTIVE
  @Get()
  @ApiOperation({ summary: 'List staff members with filters' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'clubId', required: false, type: Number })
  @ApiQuery({ name: 'role',   required: false, enum: StaffRole })
  @ApiQuery({ name: 'status', required: false, enum: StaffStatus })
  findAll(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('clubId') clubId?: string,
    @Query('role')   role?:   StaffRole,
    @Query('status') status?: StaffStatus,
  ) {
    return this.service.findAll({
      page:   page   ? Number(page)   : 1,
      limit:  limit  ? Number(limit)  : 50,
      clubId: clubId ? Number(clubId) : undefined,
      role,
      status,
    });
  }

  // GET /staff/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // PATCH /staff/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update staff member' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.service.update(id, dto);
  }

  // PATCH /staff/:id/assign/:clubId
  @Patch(':id/assign/:clubId')
  @ApiOperation({ summary: 'Assign staff member to a club' })
  assignToClub(
    @Param('id',     ParseIntPipe) id:     number,
    @Param('clubId', ParseIntPipe) clubId: number,
  ) {
    return this.service.assignToClub(id, clubId);
  }

  // DELETE /staff/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove staff member' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
