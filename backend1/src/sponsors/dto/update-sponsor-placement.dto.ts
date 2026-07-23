import {
  IsEnum, IsOptional, IsInt, IsBoolean, IsDateString
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorPlacementType } from '../sponsor-placement.entity';

// WHY: All fields optional — explicit declaration avoids PartialType mixin TypeScript issues.
export class UpdateSponsorPlacementDto {
  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  sponsorId?: number;

  @ApiPropertyOptional({ enum: SponsorPlacementType })
  @IsOptional() @IsEnum(SponsorPlacementType)
  placementType?: SponsorPlacementType;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  targetId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  endsAt?: string;
}
