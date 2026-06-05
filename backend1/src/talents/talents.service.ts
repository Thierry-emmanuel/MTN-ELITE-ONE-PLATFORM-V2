import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TalentProfile, TalentProfileDocument } from './schemas/talent-profile.schema';
import { CreateTalentProfileDto } from './dto/create-talent-profile.dto';

@Injectable()
export class TalentsService {
  constructor(
    @InjectModel(TalentProfile.name) private talentProfileModel: Model<TalentProfileDocument>,
  ) {}

  async create(createDto: CreateTalentProfileDto): Promise<TalentProfile> {
    const createdProfile = new this.talentProfileModel(createDto);
    return createdProfile.save();
  }

  async findAll(): Promise<TalentProfile[]> {
    return this.talentProfileModel.find().exec();
  }

  async findOne(id: string): Promise<TalentProfile> {
    const profile = await this.talentProfileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`TalentProfile with ID ${id} not found`);
    }
    return profile;
  }

  async findByPlayerId(playerId: string): Promise<TalentProfile> {
    const profile = await this.talentProfileModel.findOne({ player_id: playerId }).exec();
    if (!profile) {
      throw new NotFoundException(`TalentProfile for player ID ${playerId} not found`);
    }
    return profile;
  }

  async update(id: string, updateDto: Partial<CreateTalentProfileDto>): Promise<TalentProfile> {
    const profile = await this.talentProfileModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!profile) {
      throw new NotFoundException(`TalentProfile with ID ${id} not found`);
    }
    return profile;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.talentProfileModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`TalentProfile with ID ${id} not found`);
    }
    return { message: 'Talent profile deleted successfully' };
  }
}
