import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CultureStory, CultureStoryDocument } from './schemas/culture-story.schema';

@Injectable()
export class CultureStoriesService {
  constructor(
    @InjectModel(CultureStory.name) private cultureStoryModel: Model<CultureStoryDocument>,
  ) {}

  async create(createDto: any): Promise<CultureStory> {
    const created = new this.cultureStoryModel(createDto);
    return created.save();
  }

  async findAll(category?: string): Promise<CultureStory[]> {
    const query = category ? { category } : {};
    return this.cultureStoryModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<CultureStory> {
    const story = await this.cultureStoryModel.findById(id).exec();
    if (!story) {
      throw new NotFoundException(`Culture story with ID ${id} not found`);
    }
    return story;
  }

  async update(id: string, updateDto: any): Promise<CultureStory> {
    const story = await this.cultureStoryModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!story) {
      throw new NotFoundException(`Culture story with ID ${id} not found`);
    }
    return story;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.cultureStoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Culture story with ID ${id} not found`);
    }
    return { message: 'Culture story deleted successfully' };
  }
}
