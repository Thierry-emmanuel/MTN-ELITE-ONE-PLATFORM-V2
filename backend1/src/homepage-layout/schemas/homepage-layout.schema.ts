import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomepageLayoutDocument = HomepageLayout & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class HomepageLayout {
  @Prop({ type: [String], required: true })
  section_order: string[];

  @Prop({ type: Map, of: Boolean, required: true })
  section_visibility: Record<string, boolean>;
}

export const HomepageLayoutSchema = SchemaFactory.createForClass(HomepageLayout);
