import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from './equipment.entity';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Equipment) private readonly repo: Repository<Equipment>,
  ) {}

  findAll(clubId?: number) {
    return this.repo.find({
      where: clubId ? { clubId } : {},
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const eq = await this.repo.findOne({ where: { id } });
    if (!eq) throw new NotFoundException(`Équipement ${id} introuvable`);
    return eq;
  }

  create(dto: Partial<Equipment>) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<Equipment>) {
    const eq = await this.findOne(id);
    Object.assign(eq, dto);
    return this.repo.save(eq);
  }

  async remove(id: number) {
    const eq = await this.findOne(id);
    await this.repo.remove(eq);
    return { message: `Équipement ${id} supprimé` };
  }
}
