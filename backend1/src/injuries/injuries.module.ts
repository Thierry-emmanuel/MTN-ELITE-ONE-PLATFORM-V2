import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Injury } from './injury.entity';
import { InjuriesService } from './injuries.service';
import { CreateInjuryDto, UpdateInjuryDto } from './dto/injury.dto';

@ApiTags('injuries')
@Controller('injuries')
export class InjuriesController {
  constructor(private readonly service: InjuriesService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInjuryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInjuryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Injury])],
  controllers: [InjuriesController],
  providers: [InjuriesService],
  exports: [InjuriesService],
})
export class InjuriesModule {}