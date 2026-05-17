import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeroBannerDocument = HeroBanner & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class HeroBanner {
  @Prop({ type: { fr: String, en: String }, required: true })
  title: { fr: string; en: string };

  @Prop({ type: { fr: String, en: String } })
  subtitle: { fr: string; en: string };

  @Prop({ required: true })
  image_url: string;

  @Prop()
  link_url: string;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  type: string;
}

export const HeroBannerSchema = SchemaFactory.createForClass(HeroBanner);
