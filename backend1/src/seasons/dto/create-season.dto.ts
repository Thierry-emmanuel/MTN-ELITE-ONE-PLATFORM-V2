import {
  IsString, IsDateString, IsEnum,
  IsOptional, MaxLength, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeasonStatus } from '../season.entity';

export class CreateSeasonDto {
  @ApiProperty({ example: '2025-2026', description: 'Unique season name' })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '2025-08-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: SeasonStatus, default: SeasonStatus.UPCOMING })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;
}