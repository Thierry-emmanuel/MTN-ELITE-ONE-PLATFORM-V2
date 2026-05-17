import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroBannersService } from './hero-banners.service';
import { HeroBannersController } from './hero-banners.controller';
import { HeroBanner, HeroBannerSchema } from './schemas/hero-banner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HeroBanner.name, schema: HeroBannerSchema }]),
  ],
  providers: [HeroBannersService],
  controllers: [HeroBannersController],
})
export class HeroBannersModule {}

