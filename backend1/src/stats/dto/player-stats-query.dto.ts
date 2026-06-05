// backend1/src/stats/dto/player-stats-query.dto.ts
import {
  IsOptional, IsString, IsEnum, IsInt, IsIn,
  Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
// Import the single source of truth — no local redeclaration
import { PlayerPosition } from '../../players/player.entity';

export type StatSortField =
  | 'goals' | 'assists' | 'keyPasses' | 'shots' | 'shotsOnTarget'
  | 'yellowCards' | 'redCards' | 'minutesPlayed' | 'appearances'
  | 'xG' | 'penaltiesScored' | 'passAccuracy';

export class PlayerStatsQueryDto {
  @ApiPropertyOptional({ description: 'Season ID', example: 'season-2025-26' })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({ description: 'Filter by team/club ID' })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiPropertyOptional({ enum: PlayerPosition, description: 'Player position' })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @ApiPropertyOptional({ description: 'Minimum minutes played', example: 900 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minMinutes?: number;

  @ApiPropertyOptional({ description: 'Filter by nationality (ISO 3166-1 alpha-3)', example: 'CMR' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['goals','assists','keyPasses','shots','shotsOnTarget','yellowCards',
           'redCards','minutesPlayed','appearances','xG','penaltiesScored','passAccuracy'],
    default: 'goals',
  })
  @IsOptional()
  @IsIn(['goals','assists','keyPasses','shots','shotsOnTarget','yellowCards',
         'redCards','minutesPlayed','appearances','xG','penaltiesScored','passAccuracy'])
  sort?: StatSortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}