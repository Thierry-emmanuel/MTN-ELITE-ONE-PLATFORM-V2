import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Standing } from './standing.entity';
import { UpdateStandingDto } from './dto/update-standing.dto';
import { CreateStandingDto } from './dto/create-standing.dto';

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Standing)
    private readonly standingRepo: Repository<Standing>,
  ) {}

  async create(dto: CreateStandingDto): Promise<Standing> {
    const exists = await this.standingRepo.findOne({
      where: { clubId: dto.clubId, seasonId: dto.seasonId },
    });
    if (exists)
      throw new ConflictException(
        'Standing already exists for this club in this season',
      );

    const standing = this.standingRepo.create(dto);
    return this.standingRepo.save(standing);
  }

  // Full league table for a season — sorted by points, GD, GF
  async findByseason(seasonId: string): Promise<Standing[]> {
    return this.standingRepo.find({
      where: { seasonId },
      relations: ['club'],
      order: {
        points: 'DESC',
        goalDifference: 'DESC',
        goalsFor: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Standing> {
    const standing = await this.standingRepo.findOne({
      where: { id },
      relations: ['club', 'season'],
    });
    if (!standing)
      throw new NotFoundException(`Standing with id "${id}" not found`);
    return standing;
  }

  async findByClubAndSeason(clubId: string, seasonId: string): Promise<Standing> {
    const standing = await this.standingRepo.findOne({
      where: { clubId, seasonId },
      relations: ['club', 'season'],
    });
    if (!standing)
      throw new NotFoundException(
        'No standing found for this club in this season',
      );
    return standing;
  }

  async update(id: string, dto: UpdateStandingDto): Promise<Standing> {
    const standing = await this.findOne(id);

    // Validate consistency: won + drawn + lost must equal played
    const won    = dto.won    ?? standing.won;
    const drawn  = dto.drawn  ?? standing.drawn;
    const lost   = dto.lost   ?? standing.lost;
    const played = dto.played ?? standing.played;

    if (won + drawn + lost !== played)
      throw new BadRequestException(
        `won (${won}) + drawn (${drawn}) + lost (${lost}) must equal played (${played})`,
      );

    // Recalculate derived fields automatically
    const goalsFor     = dto.goalsFor     ?? standing.goalsFor;
    const goalsAgainst = dto.goalsAgainst ?? standing.goalsAgainst;

    standing.won           = won;
    standing.drawn         = drawn;
    standing.lost          = lost;
    standing.played        = played;
    standing.goalsFor      = goalsFor;
    standing.goalsAgainst  = goalsAgainst;
    standing.goalDifference = goalsFor - goalsAgainst;
    standing.points        = won * 3 + drawn;

    if (dto.formGuide !== undefined)
      standing.formGuide = dto.formGuide;

    return this.standingRepo.save(standing);
  }

  // Called automatically after every match result
  async recalculateAfterMatch(
    seasonId: string,
    homeClubId: string,
    awayClubId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<void> {
    const homeStanding = await this.findByClubAndSeason(homeClubId, seasonId);
    const awayStanding = await this.findByClubAndSeason(awayClubId, seasonId);

    const homeResult = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
    const awayResult = homeResult === 'W' ? 'L' : homeResult === 'L' ? 'W' : 'D';

    this.applyResult(homeStanding, homeScore, awayScore, homeResult);
    this.applyResult(awayStanding, awayScore, homeScore, awayResult);

    await this.standingRepo.save([homeStanding, awayStanding]);
  }

  private applyResult(
    standing: Standing,
    goalsFor: number,
    goalsAgainst: number,
    result: 'W' | 'D' | 'L',
  ): void {
    standing.played       += 1;
    standing.goalsFor     += goalsFor;
    standing.goalsAgainst += goalsAgainst;
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst;

    if (result === 'W') { standing.won   += 1; standing.points += 3; }
    if (result === 'D') { standing.drawn += 1; standing.points += 1; }
    if (result === 'L') { standing.lost  += 1; }

    // Update form guide (keep last 5 results)
    const current = standing.formGuide ?? '';
    standing.formGuide = (current + result).slice(-5);
  }

  async reset(id: string): Promise<Standing> {
    const standing = await this.findOne(id);
    Object.assign(standing, {
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0,
      goalDifference: 0, points: 0, formGuide: '',
    });
    return this.standingRepo.save(standing);
  }

  async remove(id: string): Promise<{ message: string }> {
    const standing = await this.findOne(id);
    await this.standingRepo.remove(standing);
    return { message: 'Standing deleted successfully' };
  }
}