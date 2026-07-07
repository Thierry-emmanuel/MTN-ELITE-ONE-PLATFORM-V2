import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
  ) {}

  async create(dto: CreateClubDto): Promise<Club> {
    const exists = await this.clubRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`Club "${dto.name}" already exists`);

    const club = this.clubRepo.create(dto);
    return this.clubRepo.save(club);
  }

  async findAll(pagination: PaginationDto): Promise<{ data: Club[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.clubRepo.findAndCount({
      skip: pagination.skip,
      take: pagination.limit,
      order: { name: 'ASC' },
    });
    return { data, total, page: pagination.page ?? 1, limit: pagination.limit ?? 10 };
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.clubRepo.findOne({
      where: { id },
      relations: ['players', 'standings'],
    });
    if (!club) throw new NotFoundException(`Club with id "${id}" not found`);
    return club;
  }

  async update(id: number, dto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);

    if (dto.name && dto.name !== club.name) {
      const exists = await this.clubRepo.findOne({ where: { name: dto.name } });
      if (exists) throw new ConflictException(`Club "${dto.name}" already exists`);
    }

    Object.assign(club, dto);
    return this.clubRepo.save(club);
  }

  async remove(id: number): Promise<{ message: string }> {
    const club = await this.findOne(id);
    await this.clubRepo.remove(club);
    return { message: `Club "${club.name}" deleted successfully` };
  }

  async findSquad(id: number): Promise<Club> {
    const club = await this.clubRepo.findOne({
      where: { id },
      relations: ['players'],
    });
    if (!club) throw new NotFoundException(`Club with id "${id}" not found`);
    return club;
  }

  async findMatches(id: number): Promise<Club> {
    const club = await this.clubRepo.findOne({
      where: { id },
      relations: [
        'homeMatches', 'awayMatches',
        'homeMatches.homeClub', 'homeMatches.awayClub',
        'awayMatches.homeClub', 'awayMatches.awayClub'
      ],
    });
    if (!club) throw new NotFoundException(`Club with id "${id}" not found`);
    return club;
  }
}