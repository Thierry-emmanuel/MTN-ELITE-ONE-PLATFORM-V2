import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './sponsor.entity';
import { SponsorPlacement } from './sponsor-placement.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { CreateSponsorPlacementDto } from './dto/create-sponsor-placement.dto';
import { UpdateSponsorPlacementDto } from './dto/update-sponsor-placement.dto';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepo: Repository<Sponsor>,

    @InjectRepository(SponsorPlacement)
    private readonly placementRepo: Repository<SponsorPlacement>,
  ) {}

  // ── Sponsor CRUD ───────────────────────────────────────────────────────────

  async createSponsor(dto: CreateSponsorDto): Promise<Sponsor> {
    const exists = await this.sponsorRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException(`Sponsor with name "${dto.name}" already exists`);
    }
    const sponsor = this.sponsorRepo.create(dto);
    return this.sponsorRepo.save(sponsor);
  }

  async findAllSponsors(): Promise<Sponsor[]> {
    return this.sponsorRepo.find({ order: { name: 'ASC' } });
  }

  async findOneSponsor(id: number): Promise<Sponsor> {
    const sponsor = await this.sponsorRepo.findOne({ where: { id } });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID "${id}" not found`);
    }
    return sponsor;
  }

  async updateSponsor(id: number, dto: UpdateSponsorDto): Promise<Sponsor> {
    const sponsor = await this.findOneSponsor(id);
    if (dto.name && dto.name !== sponsor.name) {
      const exists = await this.sponsorRepo.findOne({ where: { name: dto.name } });
      if (exists) {
        throw new ConflictException(`Sponsor with name "${dto.name}" already exists`);
      }
    }
    Object.assign(sponsor, dto);
    return this.sponsorRepo.save(sponsor);
  }

  async removeSponsor(id: number): Promise<{ message: string }> {
    const sponsor = await this.findOneSponsor(id);
    await this.sponsorRepo.remove(sponsor);
    return { message: `Sponsor "${sponsor.name}" deleted successfully` };
  }

  // ── SponsorPlacement CRUD ──────────────────────────────────────────────────

  async createPlacement(dto: CreateSponsorPlacementDto): Promise<SponsorPlacement> {
    // Verify sponsor exists first
    await this.findOneSponsor(dto.sponsorId);
    
    const placement = this.placementRepo.create({
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
    return this.placementRepo.save(placement);
  }

  async findAllPlacements(): Promise<SponsorPlacement[]> {
    return this.placementRepo.find({
      relations: ['sponsor'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findActivePlacements(): Promise<SponsorPlacement[]> {
    const now = new Date();
    // Fetch placements where active is true, and (startsAt is null or in past) and (endsAt is null or in future)
    return this.placementRepo.createQueryBuilder('placement')
      .leftJoinAndSelect('placement.sponsor', 'sponsor')
      .where('placement.active = :active', { active: true })
      .andWhere('(placement.startsAt IS NULL OR placement.startsAt <= :now)', { now })
      .andWhere('(placement.endsAt IS NULL OR placement.endsAt >= :now)', { now })
      .orderBy('placement.priority', 'DESC')
      .getMany();
  }

  async findOnePlacement(id: number): Promise<SponsorPlacement> {
    const placement = await this.placementRepo.findOne({
      where: { id },
      relations: ['sponsor'],
    });
    if (!placement) {
      throw new NotFoundException(`Sponsor placement with ID "${id}" not found`);
    }
    return placement;
  }

  async updatePlacement(id: number, dto: UpdateSponsorPlacementDto): Promise<SponsorPlacement> {
    const placement = await this.findOnePlacement(id);
    if (dto.sponsorId) {
      await this.findOneSponsor(dto.sponsorId);
    }
    
    const { startsAt, endsAt, ...rest } = dto;
    Object.assign(placement, rest);
    if (startsAt !== undefined) placement.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) placement.endsAt = endsAt ? new Date(endsAt) : null;

    return this.placementRepo.save(placement);
  }

  async removePlacement(id: number): Promise<{ message: string }> {
    const placement = await this.findOnePlacement(id);
    await this.placementRepo.remove(placement);
    return { message: 'Sponsor placement deleted successfully' };
  }
}
