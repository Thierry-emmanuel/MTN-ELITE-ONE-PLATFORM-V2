import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    IamModule,
  ],
  providers: [WorkflowService],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
