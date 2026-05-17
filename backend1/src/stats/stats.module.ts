import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PlayerStats } from '../players/player-stats.entity';
import { Standing } from '../standings/standing.entity';
import { MatchStats } from '../matches/match-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerStats, Standing, MatchStats]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}


