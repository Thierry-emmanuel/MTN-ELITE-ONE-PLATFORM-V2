import {
  IsString, IsEnum, IsOptional, MaxLength, IsUrl, IsEmail, IsDateString
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorTier } from '../sponsor.entity';

// WHY: All fields optional — explicit declaration avoids PartialType mixin TypeScript issues.
export class UpdateSponsorDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: SponsorTier })
  @IsOptional() @IsEnum(SponsorTier)
  tier?: SponsorTier;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl() @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl() @MaxLength(255)
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsEmail() @MaxLength(150)
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  contractStart?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  contractEnd?: string;
}
