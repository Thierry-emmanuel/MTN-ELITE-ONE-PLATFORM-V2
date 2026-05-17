import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStats } from '../players/player-stats.entity';
import { Standing } from '../standings/standing.entity';
import { MatchStats } from '../matches/match-stats.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(PlayerStats)
    private playerStatsRepository: Repository<PlayerStats>,
    @InjectRepository(Standing)
    private standingRepository: Repository<Standing>,
    @InjectRepository(MatchStats)
    private matchStatsRepository: Repository<MatchStats>,
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

  async getMatchStats(matchId: string) {
    const stats = await this.matchStatsRepository.find({
      where: { matchId },
      relations: ['club'],
    });

    const teamStats = {};
    stats.forEach(stat => {
      const clubId = stat.clubId;
      if (!teamStats[clubId]) {
        teamStats[clubId] = {
          club: stat.club,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          shotsOnTarget: 0,
          passesCompleted: 0,
        };
      }
      teamStats[clubId].goals += stat.goals;
      teamStats[clubId].assists += stat.assists;
      teamStats[clubId].yellowCards += stat.yellowCards;
      teamStats[clubId].redCards += stat.redCards;
      teamStats[clubId].shotsOnTarget += stat.shotsOnTarget;
      teamStats[clubId].passesCompleted += stat.passesCompleted;
    });

    return teamStats;
  }

  async getSeasonSummary(seasonId: string) {
    const standings = await this.standingRepository.find({
      where: { seasonId },
    });

    const totalGoals = standings.reduce((sum, s) => sum + s.goalsFor, 0);
    const totalMatches = standings.reduce((sum, s) => sum + s.played, 0) / 2;
    const avgGoalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0;

    return {
      totalGoals,
      totalMatches,
      avgGoalsPerMatch: parseFloat(avgGoalsPerMatch.toFixed(2)),
    };
  }
}
