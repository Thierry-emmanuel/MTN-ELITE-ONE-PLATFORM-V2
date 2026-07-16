// src/staff/staff.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff, StaffRole, StaffStatus } from './staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly repo: Repository<Staff>,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const member = this.repo.create(dto as any) as unknown as Staff;
    return this.repo.save(member);
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    clubId?: number;
    role?: StaffRole;
    status?: StaffStatus;
  }) {
    const page  = opts.page  ?? 1;
    const limit = opts.limit ?? 50;
    const where: any = {};
    if (opts.clubId) where.clubId = opts.clubId;
    if (opts.role)   where.role   = opts.role;
    if (opts.status) where.status = opts.status;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['club'],
      skip: (page - 1) * limit,
      take: limit,
      order: { lastName: 'ASC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Staff> {
    const m = await this.repo.findOne({ where: { id }, relations: ['club'] });
    if (!m) throw new NotFoundException(`Membre du staff introuvable`);
    return m;
  }

  async update(id: number, dto: UpdateStaffDto): Promise<Staff> {
    const m = await this.findOne(id);
    Object.assign(m, dto);
    return this.repo.save(m);
  }

  async assignToClub(id: number, clubId: number): Promise<Staff> {
    const m = await this.findOne(id);
    m.clubId = clubId;
    return this.repo.save(m);
  }

  async remove(id: number): Promise<{ message: string }> {
    const m = await this.findOne(id);
    await this.repo.remove(m);
    return { message: `${m.firstName} ${m.lastName} supprimé du staff` };
  }
}
