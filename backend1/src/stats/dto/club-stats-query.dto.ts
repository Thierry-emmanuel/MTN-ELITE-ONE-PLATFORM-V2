// backend1/src/stats/dto/club-stats-query.dto.ts
import {
  IsOptional, IsString, IsIn, IsInt, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export type ClubStatSortField =
  | 'goalsFor' | 'goalsAgainst' | 'shots' | 'shotsOnTarget'
  | 'yellowCards' | 'redCards' | 'cleanSheets' | 'points'
  | 'wins' | 'possession' | 'penaltiesFor' | 'penaltiesAgainst';

export class ClubStatsQueryDto {
  @ApiPropertyOptional({ description: 'Season ID', example: 'season-2025-26' })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['goalsFor','goalsAgainst','shots','shotsOnTarget','yellowCards','redCards','cleanSheets','points','wins','possession','penaltiesFor','penaltiesAgainst'],
    default: 'goalsFor',
  })
  @IsOptional()
  @IsIn(['goalsFor','goalsAgainst','shots','shotsOnTarget','yellowCards','redCards','cleanSheets','points','wins','possession','penaltiesFor','penaltiesAgainst'])
  sort?: ClubStatSortField;

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc','desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

// ─── Top performers query ─────────────────────────────────────────────────────

// backend1/src/stats/dto/top-performers-query.dto.ts
import { IsNotEmpty } from 'class-validator';

export type TopPerformerCategory =
  | 'goals' | 'assists' | 'keyPasses' | 'shots' | 'shotsOnTarget'
  | 'yellowCards' | 'redCards' | 'penalties';

export class TopPerformersQueryDto {
  @ApiPropertyOptional({ description: 'Season ID' })
  @IsNotEmpty()
  @IsString()
  season!: string;

  @ApiPropertyOptional({
    description: 'Stat category',
    enum: ['goals','assists','keyPasses','shots','shotsOnTarget','yellowCards','redCards','penalties'],
    default: 'goals',
  })
  @IsOptional()
  @IsIn(['goals','assists','keyPasses','shots','shotsOnTarget','yellowCards','redCards','penalties'])
  type?: TopPerformerCategory;

  @ApiPropertyOptional({ description: 'Max results', minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}