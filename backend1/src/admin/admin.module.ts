import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ArticleSchema } from '../articles/schemas/article.schema';

@Module({
  imports: [
    // We import Article schema to count documents
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
