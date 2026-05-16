import {
  IsInt, IsDateString, IsEnum, IsOptional,
  IsString, IsUUID, MaxLength, Min, Max,
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

  @ApiProperty({ description: 'Home club UUID' })
  @IsUUID()
  homeClubId: string;

  @ApiProperty({ description: 'Away club UUID' })
  @IsUUID()
  awayClubId: string;

  @ApiProperty({ description: 'Season UUID' })
  @IsUUID()
  seasonId: string;

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
}