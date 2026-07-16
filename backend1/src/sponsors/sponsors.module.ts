import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sponsor } from './sponsor.entity';
import { SponsorPlacement } from './sponsor-placement.entity';
import { SponsorsService } from './sponsors.service';
import { SponsorsController } from './sponsors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, SponsorPlacement])],
  controllers: [SponsorsController],
  providers: [SponsorsService],
  exports: [SponsorsService, TypeOrmModule],
})
export class SponsorsModule {}
