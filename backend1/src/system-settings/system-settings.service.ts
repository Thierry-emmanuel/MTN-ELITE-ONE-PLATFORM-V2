import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSettings, SystemSettingsDocument } from './schemas/system-settings.schema';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectModel(SystemSettings.name)
    private readonly settingsModel: Model<SystemSettingsDocument>,
  ) {}

  async getSettings(): Promise<SystemSettings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        logo_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/mtn-elite-logo.jpg',
        contact_email: 'contact@fecafoot.org',
        contact_phone: '+237 600 000 000',
      });
    }
    return settings;
  }

  async updateSettings(updateDto: Partial<SystemSettings>): Promise<SystemSettings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = new this.settingsModel(updateDto);
    } else {
      Object.assign(settings, updateDto);
    }
    return settings.save();
  }
}
