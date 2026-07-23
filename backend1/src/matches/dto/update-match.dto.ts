import { IsInt, IsDateString, IsEnum, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../match.entity';
import { Type } from 'class-transformer';

// WHY: All fields optional for partial match updates (reschedule, status change, score, etc.)
export class UpdateMatchDto {
  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(34)
  round?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional() @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  homeClubId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  awayClubId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  seasonId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  referee?: string;

  @ApiPropertyOptional({ description: 'Home team score', minimum: 0 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  homeScore?: number;

  @ApiPropertyOptional({ description: 'Away team score', minimum: 0 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  awayScore?: number;
}