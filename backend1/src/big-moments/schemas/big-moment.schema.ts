import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BigMomentDocument = BigMoment & Document;

@Schema({ timestamps: true })
export class BigMoment {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string; // HTML from the Tiptap editor

  @Prop({ required: true })
  momentDate: Date;

  @Prop({ enum: ['GOAL', 'TROPHY', 'RECORD', 'CEREMONY', 'OTHER'], default: 'OTHER' })
  category: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ enum: ['image', 'video'], default: 'image' })
  mediaType: string;

  @Prop({ type: [String], default: [] })
  relatedClubIds: string[];

  @Prop({ type: [String], default: [] })
  relatedPlayerIds: string[];

  @Prop({ default: false })
  featured: boolean;
}

export const BigMomentSchema = SchemaFactory.createForClass(BigMoment);