import {
  IsEnum, IsOptional, IsInt, IsBoolean, IsDateString
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorPlacementType } from '../sponsor-placement.entity';

export class CreateSponsorPlacementDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  sponsorId: number;

  @ApiPropertyOptional({ enum: SponsorPlacementType, default: SponsorPlacementType.HERO_BANNER })
  @IsOptional()
  @IsEnum(SponsorPlacementType)
  placementType?: SponsorPlacementType;

  @ApiPropertyOptional({ example: 1, description: 'Optional target ID e.g. club or award ID' })
  @IsOptional()
  @IsInt()
  targetId?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ example: '2026-07-16T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
