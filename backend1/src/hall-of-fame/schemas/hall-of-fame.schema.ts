import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HallOfFameDocument = HallOfFame & Document;

@Schema({ collection: 'hall_of_fame', timestamps: true })
export class HallOfFame {
  @Prop({ required: true })
  name: string;

  @Prop()
  birth_year: number;

  @Prop([String])
  clubs: string[];

  @Prop()
  career_summary: string;

  @Prop([String])
  achievements: string[];

  @Prop()
  era: string; // e.g., '1990-2005'

  @Prop([String])
  images: string[];

  @Prop()
  quote: string;

  @Prop()
  inducted_year: number;
}

export const HallOfFameSchema = SchemaFactory.createForClass(HallOfFame);
