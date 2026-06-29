import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import { CoachStatus } from './coach.entity';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@ApiTags('coaches')
@ApiBearerAuth()
@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  // POST /coaches
  @Post()
  @ApiOperation({ summary: 'Register a new coach' })
  create(@Body() dto: CreateCoachDto) {
    return this.coachesService.create(dto);
  }

  // GET /coaches?page=1&limit=20&clubId=xxx&status=ACTIVE
  @Get()
  @ApiOperation({ summary: 'Get all coaches with filters' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'clubId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: CoachStatus })
  findAll(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('clubId') clubId?: string,
    @Query('status') status?: CoachStatus,
  ) {
    return this.coachesService.findAll({
      page:   page  ? Number(page)  : 1,
      limit:  limit ? Number(limit) : 20,
      clubId,
      status,
    });
  }

  // GET /coaches/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a coach by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachesService.findOne(id);
  }

  // PATCH /coaches/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update coach info' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.coachesService.update(id, dto);
  }

  // PATCH /coaches/:id/assign/:clubId
  @Patch(':id/assign/:clubId')
  @ApiOperation({ summary: 'Assign coach to a club' })
  assignToClub(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('clubId', ParseUUIDPipe) clubId: string,
  ) {
    return this.coachesService.assignToClub(id, clubId);
  }

  // PATCH /coaches/:id/unassign
  @Patch(':id/unassign')
  @ApiOperation({ summary: 'Remove coach from his club' })
  unassign(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachesService.unassign(id);
  }

  // DELETE /coaches/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a coach' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachesService.remove(id);
  }
}
