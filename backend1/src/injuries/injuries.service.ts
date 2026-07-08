import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injury } from './injury.entity';
import { CreateInjuryDto, UpdateInjuryDto } from './dto/injury.dto';

@Injectable()
export class InjuriesService {
  constructor(@InjectRepository(Injury) private readonly repo: Repository<Injury>) {}

  findAll(status?: string): Promise<Injury[]> {
    return this.repo.find({
      where: status ? { status: status as Injury['status'] } : {},
      relations: ['player', 'player.club'],
      order: { injuredAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Injury> {
    const injury = await this.repo.findOne({ where: { id } });
    if (!injury) throw new NotFoundException('Blessure introuvable');
    return injury;
  }

  create(dto: CreateInjuryDto): Promise<Injury> {
    return this.repo.save(this.repo.create(dto as Partial<Injury>));
  }

  async update(id: number, dto: UpdateInjuryDto): Promise<Injury> {
    await this.findOne(id);
    await this.repo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const injury = await this.findOne(id);
    await this.repo.remove(injury);
  }
}