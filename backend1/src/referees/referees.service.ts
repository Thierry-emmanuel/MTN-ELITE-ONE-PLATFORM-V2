// src/referees/referees.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referee, RefereeLevel, RefereeStatus } from './referee.entity';
import { CreateRefereeDto } from './dto/create-referee.dto';
import { UpdateRefereeDto } from './dto/update-referee.dto';

@Injectable()
export class RefereesService {
  constructor(
    @InjectRepository(Referee)
    private readonly repo: Repository<Referee>,
  ) {}

  async create(dto: CreateRefereeDto): Promise<Referee> {
    const ref = this.repo.create(dto as any) as unknown as Referee;
    return this.repo.save(ref);
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    nationality?: string;
    licenseLevel?: RefereeLevel;
    status?: RefereeStatus;
  }) {
    const page  = opts.page  ?? 1;
    const limit = opts.limit ?? 50;

    const qb = this.repo.createQueryBuilder('r');
    if (opts.nationality)  qb.andWhere('LOWER(r.nationality) LIKE :nat', { nat: `%${opts.nationality.toLowerCase()}%` });
    if (opts.licenseLevel) qb.andWhere('r.licenseLevel = :level',        { level: opts.licenseLevel });
    if (opts.status)       qb.andWhere('r.status = :status',             { status: opts.status });

    qb.orderBy('r.lastName', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Referee> {
    const ref = await this.repo.findOne({ where: { id } });
    if (!ref) throw new NotFoundException(`Arbitre introuvable`);
    return ref;
  }

  async update(id: number, dto: UpdateRefereeDto): Promise<Referee> {
    const ref = await this.findOne(id);
    Object.assign(ref, dto);
    return this.repo.save(ref);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ref = await this.findOne(id);
    await this.repo.remove(ref);
    return { message: `Arbitre ${ref.firstName} ${ref.lastName} supprimé` };
  }
}
