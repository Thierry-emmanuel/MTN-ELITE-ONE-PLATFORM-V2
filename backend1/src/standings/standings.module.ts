import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandingsController } from './standings.controller';
import { StandingsService }    from './standings.service';
import { Standing }            from './standing.entity';
import { Match }               from '../matches/match.entity';
import { Club }                from '../clubs/club.entity';
import { Competition } from '../competitions/competition.entity';
import { Season }              from '../seasons/season.entity';

@Module({
  imports: [
    // WHY: StandingsService queries Match, Club and Season repos directly
    // to avoid circular dependency — no need to import full MatchesModule.
    TypeOrmModule.forFeature([Standing, Match, Club, Season, Competition]),
  ],
  controllers: [StandingsController],
  providers:   [StandingsService],
  exports:     [StandingsService], // ← MatchesModule injects this
})
export class StandingsModule {}