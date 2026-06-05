import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TalentProfileDocument = TalentProfile & Document;

@Schema({ collection: 'talent_profiles', timestamps: true })
export class TalentProfile {
  @Prop({ required: true, type: String })
  player_id: string; // references Player uuid in Postgres

  @Prop({ type: Object })
  bio: { fr: string; en: string };

  @Prop()
  potential_rating: number; // 1-10

  @Prop()
  scout_notes: string;

  @Prop({ type: String })
  similar_player_id: string; // references another player uuid in Postgres

  @Prop()
  academy: string;
}

export const TalentProfileSchema = SchemaFactory.createForClass(TalentProfile);
