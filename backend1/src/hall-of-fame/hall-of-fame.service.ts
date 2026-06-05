import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HallOfFame, HallOfFameDocument } from './schemas/hall-of-fame.schema';

@Injectable()
export class HallOfFameService {
  constructor(
    @InjectModel(HallOfFame.name) private hallOfFameModel: Model<HallOfFameDocument>,
  ) {}

  async create(createDto: any): Promise<HallOfFame> {
    const created = new this.hallOfFameModel(createDto);
    return created.save();
  }

  async findAll(): Promise<HallOfFame[]> {
    return this.hallOfFameModel.find().sort({ inducted_year: -1 }).exec();
  }

  async findOne(id: string): Promise<HallOfFame> {
    const legend = await this.hallOfFameModel.findById(id).exec();
    if (!legend) {
      throw new NotFoundException(`Legend with ID ${id} not found`);
    }
    return legend;
  }

  async update(id: string, updateDto: any): Promise<HallOfFame> {
    const legend = await this.hallOfFameModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!legend) {
      throw new NotFoundException(`Legend with ID ${id} not found`);
    }
    return legend;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.hallOfFameModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Legend with ID ${id} not found`);
    }
    return { message: 'Legend deleted successfully' };
  }
}
