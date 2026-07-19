import { Body, Controller, Delete, Get, Param, Patch, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto, UpdateTransferDto } from './dto/transfer.dto';


import { Secured } from '../iam/guards/permissions.guard';
@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @Get()
  findAll(@Query('playerId') playerId?: string) {
    return this.service.findAll(playerId ? Number(playerId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Secured('transfers.create')
  create(@Body() dto: CreateTransferDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Secured('transfers.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Secured('transfers.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}