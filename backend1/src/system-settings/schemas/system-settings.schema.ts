import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ default: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/mtn-elite-logo.jpg' })
  logo_url: string;

  @Prop({ default: 'contact@fecafoot.org' })
  contact_email: string;

  @Prop({ default: '+237 600 000 000' })
  contact_phone: string;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);
