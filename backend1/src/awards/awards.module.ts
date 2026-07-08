import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwardsService } from './awards.service';
import { AwardsController } from './awards.controller';
import { AwardsPublicService } from './public/awards-public.service';
import { AwardsPublicController } from './public/awards-public.controller';
import { Award } from './entities/award.entity';
import { AwardNomination } from './entities/award-nomination.entity';
import { Vote } from './entities/vote.entity';
import { Player } from '../players/player.entity';
import { Club } from '../clubs/club.entity';
import { Coach } from '../coaches/coach.entity';
import { PlayerStats } from '../players/player-stats.entity';
import { Standing } from '../standings/standing.entity';
import { Season } from '../seasons/season.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Award, AwardNomination, Vote, Player, Club, Coach, PlayerStats, Standing, Season]),
    WebsocketModule,
  ],
  // AwardsPublicController is registered before AwardsController so its more
  // specific 'awards/public...' routes are matched before AwardsController's
  // 'awards/:id' pattern would otherwise swallow them.
  controllers: [AwardsPublicController, AwardsController],
  providers: [AwardsService, AwardsPublicService],
})
export class AwardsModule {}