// src/stadiums/stadiums.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stadium, StadiumStatus } from './stadium.entity';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';

@Injectable()
export class StadiumsService {
  constructor(
    @InjectRepository(Stadium)
    private readonly repo: Repository<Stadium>,
  ) {}

  async create(dto: CreateStadiumDto): Promise<Stadium> {
    const stadium = this.repo.create(dto);
    return this.repo.save(stadium);
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    city?: string;
    status?: StadiumStatus;
  }) {
    const page  = opts.page  ?? 1;
    const limit = opts.limit ?? 50;

    const qb = this.repo.createQueryBuilder('s');
    if (opts.city)   qb.andWhere('LOWER(s.city) LIKE :city',     { city:   `%${opts.city.toLowerCase()}%` });
    if (opts.status) qb.andWhere('s.status = :status',           { status: opts.status });

    qb.orderBy('s.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Stadium> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Stade introuvable`);
    return s;
  }

  async update(id: number, dto: UpdateStadiumDto): Promise<Stadium> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: number): Promise<{ message: string }> {
    const s = await this.findOne(id);
    await this.repo.remove(s);
    return { message: `Stade "${s.name}" supprimé` };
  }
}
