import {
  IsString, IsDateString, IsEnum,
  IsObject, IsOptional, MaxLength, MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeasonStatus } from '../season.entity';

// WHY: All fields optional — explicit declaration avoids PartialType mixin TypeScript issues.
export class UpdateSeasonDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(4) @MaxLength(50)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: SeasonStatus })
  @IsOptional() @IsEnum(SeasonStatus)
  status?: SeasonStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  config?: Record<string, unknown>;
}