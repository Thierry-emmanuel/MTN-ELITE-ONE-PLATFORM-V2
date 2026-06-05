import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TalentsService } from './talents.service';
import { TalentsController } from './talents.controller';
import { TalentProfile, TalentProfileSchema } from './schemas/talent-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TalentProfile.name, schema: TalentProfileSchema }]),
  ],
  controllers: [TalentsController],
  providers: [TalentsService],
  exports: [TalentsService],
})
export class TalentsModule {}
