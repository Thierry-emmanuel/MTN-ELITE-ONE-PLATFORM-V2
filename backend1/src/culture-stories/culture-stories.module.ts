import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CultureStoriesService } from './culture-stories.service';
import { CultureStoriesController } from './culture-stories.controller';
import { CultureStory, CultureStorySchema } from './schemas/culture-story.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CultureStory.name, schema: CultureStorySchema }]),
  ],
  controllers: [CultureStoriesController],
  providers: [CultureStoriesService],
  exports: [CultureStoriesService],
})
export class CultureStoriesModule {}
