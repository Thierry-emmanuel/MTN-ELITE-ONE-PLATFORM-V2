import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStats } from '../players/player-stats.entity';
import { Standing } from '../standings/standing.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(PlayerStats)
    private playerStatsRepository: Repository<PlayerStats>,
    @InjectRepository(Standing)
    private standingRepository: Repository<Standing>,
  ) {}

  async getTopScorers(seasonId: string, limit: number = 10) {
    return this.playerStatsRepository.find({
      where: { seasonId },
      relations: ['player', 'player.club'],
      order: { goals: 'DESC' },
      take: limit,
    });
  }

  async getTopAssisters(seasonId: string, limit: number = 10) {
    return this.playerStatsRepository.find({
      where: { seasonId },
      relations: ['player', 'player.club'],
      order: { assists: 'DESC' },
      take: limit,
    });
  }

  async getTeamsStats(seasonId: string) {
    return this.standingRepository.find({
      where: { seasonId },
      relations: ['club'],
      order: { goalsFor: 'DESC' },
    });
  }
}
