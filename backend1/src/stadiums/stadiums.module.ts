// src/stadiums/stadiums.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stadium } from './stadium.entity';
import { StadiumsService } from './stadiums.service';
import { StadiumsController } from './stadiums.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium])],
  providers: [StadiumsService],
  controllers: [StadiumsController],
  exports: [StadiumsService],
})
export class StadiumsModule {}
