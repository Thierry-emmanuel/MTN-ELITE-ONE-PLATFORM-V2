import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomepageLayout, HomepageLayoutDocument } from './schemas/homepage-layout.schema';

@Injectable()
export class HomepageLayoutService {
  private readonly defaultOrder = [
    'hero',
    'matches',
    'standings',
    'stats',
    'explore',
    'awards',
    'halloffame',
    'roadtolions',
  ];

  private readonly defaultVisibility = {
    hero: true,
    matches: true,
    standings: true,
    stats: true,
    explore: true,
    awards: true,
    halloffame: true,
    roadtolions: true,
  };

  constructor(
    @InjectModel(HomepageLayout.name)
    private readonly layoutModel: Model<HomepageLayoutDocument>,
  ) {}

  async getLayout(): Promise<HomepageLayout> {
    let layout = await this.layoutModel.findOne().exec();
    if (!layout) {
      layout = await this.layoutModel.create({
        section_order: this.defaultOrder,
        section_visibility: this.defaultVisibility,
      });
    }
    return layout;
  }

  async updateLayout(
    sectionOrder: string[],
    sectionVisibility: Record<string, boolean>,
  ): Promise<HomepageLayout> {
    let layout = await this.layoutModel.findOne().exec();
    if (!layout) {
      layout = new this.layoutModel();
    }
    layout.section_order = sectionOrder;
    layout.section_visibility = sectionVisibility;
    return layout.save();
  }
}
