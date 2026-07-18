import {
  IsInt, IsDateString, IsEnum, IsOptional,
  IsString, MaxLength, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../match.entity';

export class CreateMatchDto {
  @ApiProperty({ example: 1, description: 'Journée (round) number' })
  @IsInt()
  @Min(1)
  @Max(34)
  round: number;

  @ApiProperty({ example: '2026-09-15T15:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ enum: MatchStatus, default: MatchStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiProperty({ description: 'Home club ID' })
  @IsInt()
  homeClubId: number;

  @ApiProperty({ description: 'Away club ID' })
  @IsInt()
  awayClubId: number;

  @ApiProperty({ description: 'Season ID' })
  @IsInt()
  seasonId: number;

  @ApiPropertyOptional({ example: 'Stade Omnisports Ahmadou Ahidjo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  venue?: string;

  @ApiPropertyOptional({ example: 'Yaoundé' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  // Officials — Phase 3 (Match Builder). Column existed on the entity
  // since AddRefereeToMatches; the DTO simply never exposed it.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referee?: string;
}