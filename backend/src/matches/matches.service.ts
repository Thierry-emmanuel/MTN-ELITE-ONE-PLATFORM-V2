import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
  ) {}

  async create(dto: CreateMatchDto): Promise<Match> {
    if (dto.homeClubId === dto.awayClubId)
      throw new BadRequestException('Home and away clubs must be different');

    const match = this.matchRepo.create(dto);
    return this.matchRepo.save(match);
  }

  async findAll(
    pagination: PaginationDto,
    filters?: { status?: MatchStatus; round?: number; seasonId?: string; clubId?: string },
  ): Promise<{ data: Match[]; total: number; page: number; limit: number }> {
    const query = this.matchRepo.createQueryBuilder('match')
      .leftJoinAndSelect('match.homeClub', 'homeClub')
      .leftJoinAndSelect('match.awayClub', 'awayClub')
      .leftJoinAndSelect('match.season', 'season')
      .orderBy('match.scheduledAt', 'ASC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (filters?.status)
      query.andWhere('match.status = :status', { status: filters.status });
    if (filters?.round)
      query.andWhere('match.round = :round', { round: filters.round });
    if (filters?.seasonId)
      query.andWhere('match.seasonId = :seasonId', { seasonId: filters.seasonId });
    if (filters?.clubId)
      query.andWhere(
        '(match.homeClubId = :clubId OR match.awayClubId = :clubId)',
        { clubId: filters.clubId },
      );

    const [data, total] = await query.getManyAndCount();
    return { data, total, page: pagination.page ?? 1, limit: pagination.limit ?? 10 };
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id },
      relations: ['homeClub', 'awayClub', 'season', 'events', 'events.player', 'stats'],
    });
    if (!match) throw new NotFoundException(`Match with id "${id}" not found`);
    return match;
  }

  async update(id: string, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);

    if (match.status === MatchStatus.FINISHED && dto.status !== MatchStatus.FINISHED)
      throw new BadRequestException('Cannot reopen a finished match');

    if (dto.homeClubId && dto.awayClubId && dto.homeClubId === dto.awayClubId)
      throw new BadRequestException('Home and away clubs must be different');

    Object.assign(match, dto);
    return this.matchRepo.save(match);
  }

  async updateScore(
    id: string,
    homeScore: number,
    awayScore: number,
  ): Promise<Match> {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.FINISHED)
      throw new BadRequestException('Match is already finished');

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = MatchStatus.LIVE;
    return this.matchRepo.save(match);
  }

  async finishMatch(id: string): Promise<Match> {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.FINISHED)
      throw new BadRequestException('Match is already finished');
    match.status = MatchStatus.FINISHED;
    return this.matchRepo.save(match);
  }

  async remove(id: string): Promise<{ message: string }> {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.LIVE)
      throw new BadRequestException('Cannot delete a live match');
    await this.matchRepo.remove(match);
    return { message: `Match deleted successfully` };
  }
}