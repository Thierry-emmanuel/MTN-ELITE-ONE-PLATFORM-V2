import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwardsService } from './awards.service';
import { AwardsController } from './awards.controller';
import { Award } from './entities/award.entity';
import { AwardNomination } from './entities/award-nomination.entity';
import { Vote } from './entities/vote.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Award, AwardNomination, Vote]),
    WebsocketModule,
  ],
  controllers: [AwardsController],
  providers: [AwardsService],
})
export class AwardsModule {}
