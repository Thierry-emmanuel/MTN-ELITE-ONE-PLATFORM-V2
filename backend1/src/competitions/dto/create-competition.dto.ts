import {
  IsString, IsEnum, IsObject, IsOptional,
  MaxLength, MinLength, IsInt, Min, Max, IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompetitionType } from '../competition.entity';

export class CreateCompetitionDto {
  @ApiProperty({ example: 'MTN Elite One', description: 'Unique competition name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ enum: CompetitionType, default: CompetitionType.LEAGUE })
  @IsOptional()
  @IsEnum(CompetitionType)
  type?: CompetitionType;

  @ApiPropertyOptional({ example: 'CM', description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  country?: string;

  @ApiPropertyOptional({ example: 1, description: '1 = top flight' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  tier?: number;

  @ApiPropertyOptional({ description: 'URL of competition logo' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  /** Phase 5 — OS configuration blob; structure owned by the frontend
   *  builders, semantics enforced by the consuming engines. */
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
