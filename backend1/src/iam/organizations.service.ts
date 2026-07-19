import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationType } from './entities/organization.entity';

const TYPES: OrganizationType[] = ['FEDERATION', 'DEPARTMENT', 'COMMITTEE', 'REGIONAL_LEAGUE', 'TEAM'];

@Injectable()
export class OrganizationsService {
  constructor(@InjectRepository(Organization) private readonly repo: Repository<Organization>) {}

  findAll(includeArchived = false) {
    return this.repo.find({
      where: includeArchived ? {} : { status: 'active' },
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  /** flat list + children index — the frontend renders the tree */
  async tree() {
    const all = await this.findAll();
    const byParent: Record<string, Organization[]> = {};
    for (const o of all) {
      const p = o.parentId ?? 'root';
      (byParent[p] ??= []).push(o);
    }
    return { organizations: all, byParent };
  }

  async findOne(id: string) {
    const org = await this.repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organisation introuvable');
    return org;
  }

  async create(dto: Partial<Organization>) {
    if (!dto.name) throw new BadRequestException('name est requis');
    if (!dto.type || !TYPES.includes(dto.type)) throw new BadRequestException(`type doit être un de: ${TYPES.join(', ')}`);
    if (dto.parentId) await this.findOne(dto.parentId); // must exist
    return this.repo.save(this.repo.create({
      name: dto.name,
      type: dto.type,
      parentId: dto.parentId ?? null,
      clubId: dto.clubId ?? null,
      description: dto.description ?? null,
    }));
  }

  async update(id: string, dto: Partial<Organization>) {
    const org = await this.findOne(id);
    if (dto.parentId) {
      if (dto.parentId === id) throw new BadRequestException('Une organisation ne peut pas être son propre parent');
      await this.findOne(dto.parentId);
    }
    if (dto.type && !TYPES.includes(dto.type)) throw new BadRequestException('type invalide');
    Object.assign(org, {
      name: dto.name ?? org.name,
      type: dto.type ?? org.type,
      parentId: dto.parentId !== undefined ? dto.parentId : org.parentId,
      clubId: dto.clubId !== undefined ? dto.clubId : org.clubId,
      description: dto.description !== undefined ? dto.description : org.description,
    });
    return this.repo.save(org);
  }

  async archive(id: string) {
    const org = await this.findOne(id);
    org.status = 'archived';
    return this.repo.save(org);
  }

  async remove(id: string) {
    const org = await this.findOne(id);
    const children = await this.repo.count({ where: { parentId: id } });
    if (children > 0)
      throw new BadRequestException('Impossible de supprimer: des organisations enfants existent. Archivez plutôt.');
    await this.repo.remove(org);
    return { message: 'Organisation supprimée' };
  }
}
