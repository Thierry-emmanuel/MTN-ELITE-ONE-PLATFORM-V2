import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competition } from './competition.entity';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Competition])],
  controllers: [CompetitionsController],
  providers: [CompetitionsService],
  exports: [CompetitionsService, TypeOrmModule],
})
export class CompetitionsModule {}
