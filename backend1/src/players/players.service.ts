import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player, PlayerPosition } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Match, MatchStatus } from '../matches/match.entity';
import { MatchEventType } from '../matches/match-event.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
  ) {}

  async create(dto: CreatePlayerDto): Promise<Player> {
    // Validate jersey number uniqueness within a club
    if (dto.clubId && dto.jerseyNumber) {
      const conflict = await this.playerRepo.findOne({
        where: { clubId: dto.clubId, jerseyNumber: dto.jerseyNumber },
      });
      if (conflict)
        throw new BadRequestException(
          `Jersey #${dto.jerseyNumber} is already taken in this club`,
        );
    }

    const player = this.playerRepo.create(dto as any) as Player;
    return this.playerRepo.save(player);

  }

  async findAll(
    pagination: PaginationDto,
    filters?: { position?: PlayerPosition; clubId?: string; isActive?: boolean },
  ): Promise<{ data: Player[]; total: number; page: number; limit: number }> {
    const query = this.playerRepo.createQueryBuilder('player')
      .leftJoinAndSelect('player.club', 'club')
      .orderBy('player.lastName', 'ASC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (filters?.position)
      query.andWhere('player.position = :position', { position: filters.position });
    if (filters?.clubId)
      query.andWhere('player.clubId = :clubId', { clubId: filters.clubId });
    if (filters?.isActive !== undefined)
      query.andWhere('player.isActive = :isActive', { isActive: filters.isActive });

    const [data, total] = await query.getManyAndCount();
    return { data, total, page: pagination.page ?? 1, limit: pagination.limit ?? 10 };
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerRepo.findOne({
      where: { id },
      relations: ['club', 'stats', 'matchEvents'],
    });
    if (!player) throw new NotFoundException(`Player with id "${id}" not found`);
    return player;
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);

    const targetClubId = dto.clubId ?? player.clubId;
    const targetJersey = dto.jerseyNumber ?? player.jerseyNumber;

    if (dto.jerseyNumber && targetClubId) {
      const conflict = await this.playerRepo.findOne({
        where: { clubId: targetClubId, jerseyNumber: targetJersey },
      });
      if (conflict && conflict.id !== id)
        throw new BadRequestException(
          `Jersey #${targetJersey} is already taken in this club`,
        );
    }

    Object.assign(player, dto);
    return this.playerRepo.save(player);
  }

  async remove(id: string): Promise<{ message: string }> {
    const player = await this.findOne(id);
    await this.playerRepo.remove(player);
    return { message: `Player "${player.firstName} ${player.lastName}" deleted successfully` };
  }

  async transfer(id: string, newClubId: string): Promise<Player> {
    const player = await this.findOne(id);
    player.clubId = newClubId;
    player.jerseyNumber = null as any;// reset jersey on transfer
    return this.playerRepo.save(player);
  }

  async getFormGuide(id: string) {
    const player = await this.findOne(id);
    if (!player.clubId) {
      return { player, form: [] };
    }

    // Get the last 5 finished matches for the player's club
    const matches = await this.playerRepo.manager.find(Match, {
      where: [
        { homeClubId: player.clubId, status: MatchStatus.FINISHED },
        { awayClubId: player.clubId, status: MatchStatus.FINISHED },
      ],
      order: { scheduledAt: 'DESC' },
      take: 5,
      relations: ['events', 'homeClub', 'awayClub'],
    });

    const form = matches.map((match) => {
      const isHome = match.homeClubId === player.clubId;
      let result = 'D';
      if (match.homeScore !== null && match.awayScore !== null) {
        if (isHome && match.homeScore > match.awayScore) result = 'W';
        if (isHome && match.homeScore < match.awayScore) result = 'L';
        if (!isHome && match.awayScore > match.homeScore) result = 'W';
        if (!isHome && match.awayScore < match.homeScore) result = 'L';
      }

      const playerEvents = match.events.filter((e) => e.playerId === id);
      const goals = playerEvents.filter((e) => e.type === MatchEventType.GOAL || e.type === MatchEventType.PENALTY_GOAL).length;
      const yellowCards = playerEvents.filter((e) => e.type === MatchEventType.YELLOW_CARD).length;
      const redCards = playerEvents.filter((e) => e.type === MatchEventType.RED_CARD || e.type === MatchEventType.SECOND_YELLOW).length;

      return {
        matchId: match.id,
        opponent: isHome ? match.awayClub?.name : match.homeClub?.name,
        isHome,
        scheduledAt: match.scheduledAt,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        result,
        playerStats: {
          goals,
          yellowCards,
          redCards,
        },
      };
    });

    return { player, form };
  }
}