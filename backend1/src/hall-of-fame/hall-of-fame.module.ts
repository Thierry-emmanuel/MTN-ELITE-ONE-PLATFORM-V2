import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HallOfFameService } from './hall-of-fame.service';
import { HallOfFameController } from './hall-of-fame.controller';
import { HallOfFame, HallOfFameSchema } from './schemas/hall-of-fame.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HallOfFame.name, schema: HallOfFameSchema }]),
  ],
  controllers: [HallOfFameController],
  providers: [HallOfFameService],
  exports: [HallOfFameService],
})
export class HallOfFameModule {}
