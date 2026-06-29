import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach, CoachStatus } from './coach.entity';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepo: Repository<Coach>,
  ) {}

  async create(dto: CreateCoachDto): Promise<Coach> {
    const coach = this.coachRepo.create(dto as any) as unknown as Coach;
    return this.coachRepo.save(coach);
  }


  async findAll(opts: { page?: number; limit?: number; clubId?: string; status?: CoachStatus }) {
    const page  = opts.page  ?? 1;
    const limit = opts.limit ?? 20;
    const where: any = {};
    if (opts.clubId) where.clubId = opts.clubId;
    if (opts.status) where.status = opts.status;
    const [data, total] = await this.coachRepo.findAndCount({
      where,
      relations: ['club'],
      skip: (page - 1) * limit,
      take: limit,
      order: { lastName: 'ASC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Coach> {
    const coach = await this.coachRepo.findOne({ where: { id }, relations: ['club'] });
    if (!coach) throw new NotFoundException(`Entraîneur introuvable`);
    return coach;
  }

  async update(id: string, dto: any): Promise<Coach> {
    const coach = await this.findOne(id);
    Object.assign(coach, dto);
    return this.coachRepo.save(coach);
  }

  async assignToClub(id: string, clubId: string): Promise<Coach> {
    const coach = await this.findOne(id);
    coach.clubId = clubId;
    return this.coachRepo.save(coach);
  }

  async unassign(id: string): Promise<Coach> {
    const coach = await this.findOne(id);
    coach.clubId = null as any;
    return this.coachRepo.save(coach);
  }

  async remove(id: string): Promise<{ message: string }> {
    const coach = await this.findOne(id);
    await this.coachRepo.remove(coach);
    return { message: `Entraîneur ${coach.firstName} ${coach.lastName} supprimé` };
  }
}
