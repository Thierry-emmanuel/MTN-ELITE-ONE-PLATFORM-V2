import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Article {
  @Prop({ type: { fr: String, en: String }, required: true })
  title: { fr: string; en: string };

  @Prop({ type: { fr: String, en: String }, required: true })
  body: { fr: string; en: string };

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: Date.now })
  published_at: Date;

  @Prop([String])
  tags: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  cover_image: string;

  @Prop()
  read_time: number;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
