import {
  IsString, IsInt, IsOptional, IsEnum, IsUrl,
  IsHexColor, MaxLength, MinLength, Min, Max,
  IsArray, IsObject, IsNumber, IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubStatus } from '../club.entity';
import { Type } from 'class-transformer';

class AchievementsDto {
  @IsOptional() @IsInt() @Min(0) league?:   number;
  @IsOptional() @IsInt() @Min(0) cup?:      number;
  @IsOptional() @IsInt() @Min(0) regional?: number;
  @IsOptional() @IsInt() @Min(0) african?:  number;
}

class SocialMediaDto {
  @IsOptional() @IsString() @MaxLength(200) twitter?:   string;
  @IsOptional() @IsString() @MaxLength(200) instagram?: string;
  @IsOptional() @IsString() @MaxLength(200) facebook?:  string;
  @IsOptional() @IsString() @MaxLength(200) youtube?:   string;
  @IsOptional() @IsString() @MaxLength(200) tiktok?:    string;
}

export class CreateClubDto {
  // ── Core Identity ──────────────────────────────────────────────
  @ApiProperty({ example: 'Canon Yaoundé' })
  @IsString() @MinLength(2) @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Les Diables Noirs' })
  @IsOptional() @IsString() @MaxLength(100)
  nickname?: string;

  @ApiProperty({ example: 'Yaoundé' })
  @IsString() @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: 'Centre' })
  @IsOptional() @IsString() @MaxLength(50)
  region?: string;

  @ApiProperty({ example: 1930 })
  @IsInt() @Min(1800) @Max(new Date().getFullYear())
  foundedYear: number;

  @ApiPropertyOptional({ example: 'https://www.canonyaounde.cm' })
  @IsOptional() @IsString() @MaxLength(500)
  websiteUrl?: string;

  // ── Visuals ────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/canon.png' })
  @IsOptional() @IsString() @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional({ example: '#007A5E' })
  @IsOptional() @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional() @IsHexColor()
  secondaryColor?: string;

  // ── Stadium ────────────────────────────────────────────────────
  @ApiProperty({ example: 'Stade Omnisports Ahmadou Ahidjo' })
  @IsString() @MaxLength(150)
  stadium: string;

  @ApiPropertyOptional({ example: 38500 })
  @IsOptional() @IsInt() @Min(0)
  stadiumCapacity?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  stadiumPhotoUrl?: string;

  // ── Club Narrative ────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  history?: string;

  @ApiPropertyOptional({ example: ['MTN Elite One 2010', 'Coupe du Cameroun 2015'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  palmares?: string[];

  // ── Leadership ────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Jean-Baptiste Manga' })
  @IsOptional() @IsString() @MaxLength(150)
  presidentName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  presidentPhotoUrl?: string;

  @ApiPropertyOptional({ example: 150000000 })
  @IsOptional() @IsNumber() @IsPositive()
  budget?: number;

  // ── Achievements ──────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => AchievementsDto)
  achievements?: AchievementsDto;

  // ── Social Media ──────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  // ── Status ────────────────────────────────────────────────────
  @ApiPropertyOptional({ enum: ClubStatus, default: ClubStatus.ACTIVE })
  @IsOptional() @IsEnum(ClubStatus)
  status?: ClubStatus;
}