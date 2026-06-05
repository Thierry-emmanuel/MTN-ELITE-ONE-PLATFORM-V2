import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CultureStoryDocument = CultureStory & Document;

@Schema({ collection: 'culture_stories', timestamps: true })
export class CultureStory {
  @Prop({ type: Object, required: true })
  title: { fr: string; en: string };

  @Prop({ type: Object, required: true })
  body: { fr: string; en: string };

  @Prop({ required: true, enum: ['quartier', 'académie', 'ultras', 'rivalité'] })
  category: string;

  @Prop([String])
  gallery: string[];
}

export const CultureStorySchema = SchemaFactory.createForClass(CultureStory);
