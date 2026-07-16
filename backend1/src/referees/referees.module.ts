// src/referees/referees.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referee } from './referee.entity';
import { RefereesService } from './referees.service';
import { RefereesController } from './referees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Referee])],
  providers: [RefereesService],
  controllers: [RefereesController],
  exports: [RefereesService],
})
export class RefereesModule {}
