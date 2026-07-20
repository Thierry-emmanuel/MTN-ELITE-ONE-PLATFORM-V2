import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    IamModule,
  ],
  providers: [ExportsService],
  controllers: [ExportsController],
  exports: [ExportsService],
})
export class ExportsModule {}
