import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaAsset, MediaDocument } from './schemas/media.schema';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(@InjectModel(MediaAsset.name) private readonly model: Model<MediaDocument>) {}

  create(dto: CreateMediaDto) {
    return this.model.create(dto);
  }

  findAll(filters: { type?: string; relatedMatchId?: number; relatedClubId?: number; relatedPlayerId?: number; tag?: string }) {
    const q: Record<string, unknown> = {};
    if (filters.type) q.type = filters.type;
    if (filters.relatedMatchId) q.relatedMatchId = filters.relatedMatchId;
    if (filters.relatedClubId) q.relatedClubId = filters.relatedClubId;
    if (filters.relatedPlayerId) q.relatedPlayerId = filters.relatedPlayerId;
    if (filters.tag) q.tags = filters.tag;
    return this.model.find(q).sort({ createdAt: -1 }).limit(200).lean();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException(`Media "${id}" not found`);
    return doc;
  }

  async update(id: string, dto: UpdateMediaDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!doc) throw new NotFoundException(`Media "${id}" not found`);
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException(`Media "${id}" not found`);
    return { message: 'Media deleted' };
  }
}
