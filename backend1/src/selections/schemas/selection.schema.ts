import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SelectionDocument = Selection & Document;

@Schema({ timestamps: true })
export class Selection {
  @Prop({ required: true })
  campaignLabel: string;

  @Prop({ required: true })
  squadDate: Date;

  @Prop({ type: [String], default: [] })
  playerIds: string[];

  @Prop()
  coachName?: string;

  @Prop({ enum: ['PROVISIONAL', 'FINAL'], default: 'PROVISIONAL' })
  status: string;

  @Prop()
  notes?: string;
}

export const SelectionSchema = SchemaFactory.createForClass(Selection);