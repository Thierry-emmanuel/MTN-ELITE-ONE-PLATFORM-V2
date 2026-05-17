import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerStats } from '../players/player-stats.entity';
import { Standing } from '../standings/standing.entity';
import { MatchStats } from '../matches/match-stats.entity';
import { Repository } from 'typeorm';

describe('StatsService', () => {
  let service: StatsService;
  let playerStatsRepo: Repository<PlayerStats>;
  let standingRepo: Repository<Standing>;
  let matchStatsRepo: Repository<MatchStats>;

  const mockPlayerStats = { goals: 10, assists: 5, playerId: 'p1' };
  const mockStanding = { goalsFor: 20, played: 10, clubId: 'c1' };
  const mockMatchStats = { goals: 1, assists: 1, clubId: 'c1', matchId: 'm1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(PlayerStats),
          useValue: {
            find: jest.fn().mockResolvedValue([mockPlayerStats]),
          },
        },
        {
          provide: getRepositoryToken(Standing),
          useValue: {
            find: jest.fn().mockResolvedValue([mockStanding]),
          },
        },
        {
          provide: getRepositoryToken(MatchStats),
          useValue: {
            find: jest.fn().mockResolvedValue([mockMatchStats]),
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    playerStatsRepo = module.get<Repository<PlayerStats>>(getRepositoryToken(PlayerStats));
    standingRepo = module.get<Repository<Standing>>(getRepositoryToken(Standing));
    matchStatsRepo = module.get<Repository<MatchStats>>(getRepositoryToken(MatchStats));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopScorers', () => {
    it('should return top scorers', async () => {
      const result = await service.getTopScorers('season1');
      expect(result).toEqual([mockPlayerStats]);
    });
  });

  describe('getTeamsStats', () => {
    it('should return team stats', async () => {
      const result = await service.getTeamsStats('season1');
      expect(result).toEqual([mockStanding]);
    });
  });

  describe('getMatchStats', () => {
    it('should return aggregated match stats', async () => {
      const result = await service.getMatchStats('m1');
      expect(result).toHaveProperty('c1');
      expect(result['c1'].goals).toBe(1);
    });
  });

  describe('getSeasonSummary', () => {
    it('should return season summary', async () => {
      const result = await service.getSeasonSummary('season1');
      expect(result).toEqual({
        totalGoals: 20,
        totalMatches: 5, // 10 played / 2
        avgGoalsPerMatch: 4,
      });
    });
  });
});
