import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomepageLayoutService } from './homepage-layout.service';
import { HomepageLayoutController } from './homepage-layout.controller';
import { HomepageLayout, HomepageLayoutSchema } from './schemas/homepage-layout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HomepageLayout.name, schema: HomepageLayoutSchema }]),
  ],
  providers: [HomepageLayoutService],
  controllers: [HomepageLayoutController],
  exports: [HomepageLayoutService],
})
export class HomepageLayoutModule {}
