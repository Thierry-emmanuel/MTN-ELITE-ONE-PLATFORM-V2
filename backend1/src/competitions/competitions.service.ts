import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly repo: Repository<Competition>,
  ) {}

  async create(dto: CreateCompetitionDto): Promise<Competition> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists)
      throw new ConflictException(`Competition "${dto.name}" already exists`);

    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Competition[]> {
    return this.repo.find({ order: { tier: 'ASC', name: 'ASC' } });
  }

  async findOne(id: number): Promise<Competition> {
    const comp = await this.repo.findOne({
      where: { id },
      relations: ['seasons'],
    });
    if (!comp)
      throw new NotFoundException(`Competition ${id} not found`);
    return comp;
  }

  async update(id: number, dto: UpdateCompetitionDto): Promise<Competition> {
    const comp = await this.findOne(id);
    if (dto.name && dto.name !== comp.name) {
      const exists = await this.repo.findOne({ where: { name: dto.name } });
      if (exists)
        throw new ConflictException(`Competition "${dto.name}" already exists`);
    }
    Object.assign(comp, dto);
    return this.repo.save(comp);
  }

  async remove(id: number): Promise<{ message: string }> {
    const comp = await this.findOne(id);
    await this.repo.remove(comp);
    return { message: `Competition "${comp.name}" deleted` };
  }
}
