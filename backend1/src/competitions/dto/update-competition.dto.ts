import {
  IsString, IsEnum, IsObject, IsOptional,
  MaxLength, MinLength, IsInt, Min, Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompetitionType } from '../competition.entity';

export class UpdateCompetitionDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: CompetitionType })
  @IsOptional() @IsEnum(CompetitionType)
  type?: CompetitionType;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(5)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(10)
  tier?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  config?: Record<string, unknown>;
}
