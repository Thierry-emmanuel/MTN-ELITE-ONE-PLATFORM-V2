import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroBanner, HeroBannerDocument } from './schemas/hero-banner.schema';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

@Injectable()
export class HeroBannersService {
  constructor(
    @InjectModel(HeroBanner.name) private heroBannerModel: Model<HeroBannerDocument>,
  ) {}

  async create(createHeroBannerDto: CreateHeroBannerDto): Promise<HeroBanner> {
    const createdHeroBanner = new this.heroBannerModel(createHeroBannerDto);
    return createdHeroBanner.save();
  }

  async findAll(): Promise<HeroBanner[]> {
    return this.heroBannerModel.find({ active: true }).sort({ priority: -1 }).exec();
  }

  async findOne(id: string): Promise<HeroBanner> {
    const heroBanner = await this.heroBannerModel.findById(id).exec();
    if (!heroBanner) {
      throw new NotFoundException(`HeroBanner with ID ${id} not found`);
    }
    return heroBanner;
  }

  async update(id: string, updateHeroBannerDto: UpdateHeroBannerDto): Promise<HeroBanner> {
    const existingHeroBanner = await this.heroBannerModel
      .findByIdAndUpdate(id, updateHeroBannerDto, { new: true })
      .exec();
    if (!existingHeroBanner) {
      throw new NotFoundException(`HeroBanner with ID ${id} not found`);
    }
    return existingHeroBanner;
  }

  async remove(id: string): Promise<HeroBanner> {
    const deletedHeroBanner = await this.heroBannerModel.findByIdAndDelete(id).exec();
    if (!deletedHeroBanner) {
      throw new NotFoundException(`HeroBanner with ID ${id} not found`);
    }
    return deletedHeroBanner;
  }
}
