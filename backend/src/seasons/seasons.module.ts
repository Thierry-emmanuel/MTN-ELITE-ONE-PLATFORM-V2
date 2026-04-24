import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './season.entity';
import { Standing } from '../standings/standing.entity';
import { Club } from '../clubs/club.entity';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season, Standing, Club])],
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}