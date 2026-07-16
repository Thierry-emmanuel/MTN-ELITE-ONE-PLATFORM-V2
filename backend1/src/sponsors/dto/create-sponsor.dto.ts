import {
  IsString, IsEnum, IsOptional, MaxLength, IsUrl, IsEmail, IsDateString
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorTier } from '../sponsor.entity';

export class CreateSponsorDto {
  @ApiProperty({ example: 'MTN Cameroun' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ enum: SponsorTier, default: SponsorTier.PARTNER })
  @IsOptional()
  @IsEnum(SponsorTier)
  tier?: SponsorTier;

  @ApiPropertyOptional({ example: 'https://www.mtn.cm' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.mtn.cm' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'sponsorship@mtn.cm' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  contactEmail?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  contractStart?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  contractEnd?: string;
}
