import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match }             from './match.entity';
import { MatchEvent }        from './match-event.entity';
import { MatchStats }        from './match-stats.entity';
import { MatchesService }    from './matches.service';
import { MatchesController } from './matches.controller';
import { StandingsModule }   from '../standings/standings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, MatchEvent, MatchStats]),
    // WHY: MatchesService injects StandingsService to trigger recalculation
    // on match finish. StandingsModule exports StandingsService.
    StandingsModule,
  ],
  controllers: [MatchesController],
  providers:   [MatchesService],
  exports:     [MatchesService, TypeOrmModule],
})
export class MatchesModule {}