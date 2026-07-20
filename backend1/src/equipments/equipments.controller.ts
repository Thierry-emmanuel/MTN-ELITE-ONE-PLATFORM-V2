import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EquipmentsService } from './equipments.service';
import { Equipment } from './equipment.entity';
import { Secured } from '../iam/guards/permissions.guard';

@ApiTags('equipments')
@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly service: EquipmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List equipment (optionally by club)' })
  findAll(@Query('clubId') clubId?: string) {
    return this.service.findAll(clubId ? Number(clubId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Secured('media.create')
  create(@Body() dto: Partial<Equipment>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Secured('media.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Equipment>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Secured('media.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
