import { Module } from '@nestjs/common';
import { HeroBannersService } from './hero-banners.service';
import { HeroBannersController } from './hero-banners.controller';

@Module({
  providers: [HeroBannersService],
  controllers: [HeroBannersController]
})
export class HeroBannersModule {}
