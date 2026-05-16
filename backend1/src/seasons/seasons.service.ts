import {
  Injectable, NotFoundException,
  ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season, SeasonStatus } from './season.entity';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { Standing } from '../standings/standing.entity';
import { Club } from '../clubs/club.entity';
import { ClubStatus } from '../clubs/club.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,

    @InjectRepository(Standing)
    private readonly standingRepo: Repository<Standing>,

    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
  ) {}

  async create(dto: CreateSeasonDto): Promise<Season> {
    // Ensure name is unique
    const exists = await this.seasonRepo.findOne({ where: { name: dto.name } });
    if (exists)
      throw new ConflictException(`Season "${dto.name}" already exists`);

    // Validate date range
    if (new Date(dto.startDate) >= new Date(dto.endDate))
      throw new BadRequestException('startDate must be before endDate');

    const season = this.seasonRepo.create(dto);
    return this.seasonRepo.save(season);
  }

  async findAll(): Promise<Season[]> {
    return this.seasonRepo.find({
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Season> {
    const season = await this.seasonRepo.findOne({
      where: { id },
      relations: ['matches', 'standings', 'standings.club'],
    });
    if (!season)
      throw new NotFoundException(`Season with id "${id}" not found`);
    return season;
  }

  async findCurrent(): Promise<Season> {
    const season = await this.seasonRepo.findOne({
      where: { status: SeasonStatus.ONGOING },
      relations: ['standings', 'standings.club'],
    });
    if (!season)
      throw new NotFoundException('No ongoing season found');
    return season;
  }

  async update(id: string, dto: UpdateSeasonDto): Promise<Season> {
    const season = await this.findOne(id);

    // Prevent re-opening a completed season
    if (
      season.status === SeasonStatus.COMPLETED &&
      dto.status !== SeasonStatus.COMPLETED
    )
      throw new BadRequestException('Cannot reopen a completed season');

    // Only one season can be ONGOING at a time
    if (dto.status === SeasonStatus.ONGOING) {
      const ongoing = await this.seasonRepo.findOne({
        where: { status: SeasonStatus.ONGOING },
      });
      if (ongoing && ongoing.id !== id)
        throw new ConflictException(
          `Season "${ongoing.name}" is already ongoing. Close it first.`,
        );
    }

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate))
        throw new BadRequestException('startDate must be before endDate');
    }

    Object.assign(season, dto);
    return this.seasonRepo.save(season);
  }

  async activate(id: string): Promise<Season> {
    // Close any currently ongoing season first
    const ongoing = await this.seasonRepo.findOne({
      where: { status: SeasonStatus.ONGOING },
    });
    if (ongoing && ongoing.id !== id) {
      ongoing.status = SeasonStatus.COMPLETED;
      await this.seasonRepo.save(ongoing);
    }

    const season = await this.findOne(id);
    season.status = SeasonStatus.ONGOING;
    return this.seasonRepo.save(season);
  }

  async close(id: string): Promise<Season> {
    const season = await this.findOne(id);
    if (season.status !== SeasonStatus.ONGOING)
      throw new BadRequestException('Only an ongoing season can be closed');
    season.status = SeasonStatus.COMPLETED;
    return this.seasonRepo.save(season);
  }

  // Auto-initialize standings for all active clubs when season starts
  async initializeStandings(id: string): Promise<{ message: string; count: number }> {
    const season = await this.findOne(id);

    const clubs = await this.clubRepo.find({
      where: { status: ClubStatus.ACTIVE },
    });

    if (clubs.length < 2)
      throw new BadRequestException(
        'At least 2 active clubs required to initialize standings',
      );

    // Avoid duplicate standings
    const existing = await this.standingRepo.find({
      where: { seasonId: id },
    });
    if (existing.length > 0)
      throw new ConflictException(
        `Standings already initialized for season "${season.name}"`,
      );

    const standings = clubs.map((club) =>
      this.standingRepo.create({
        clubId: club.id,
        seasonId: id,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0,
        goalDifference: 0, points: 0,
      }),
    );

    await this.standingRepo.save(standings);
    return {
      message: `Standings initialized for season "${season.name}"`,
      count: standings.length,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const season = await this.findOne(id);
    if (season.status === SeasonStatus.ONGOING)
      throw new BadRequestException('Cannot delete an ongoing season');
    await this.seasonRepo.remove(season);
    return { message: `Season "${season.name}" deleted successfully` };
  }
}