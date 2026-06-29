import {
  IsString, IsEnum, IsDateString, IsOptional,
  IsUUID, MaxLength, IsArray, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoachStatus } from '../coach.entity';
import { Type } from 'class-transformer';

class SocialMediaDto {
  @IsOptional() @IsString() @MaxLength(200) twitter?:   string;
  @IsOptional() @IsString() @MaxLength(200) instagram?: string;
  @IsOptional() @IsString() @MaxLength(200) linkedin?:  string;
}

export class CreateCoachDto {
  // ── Core Identity ──────────────────────────────────────────────
  @ApiProperty({ example: 'Martin' })
  @IsString() @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Mpile' })
  @IsString() @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'Camerounais' })
  @IsString() @MaxLength(100)
  nationality: string;

  @ApiPropertyOptional({ example: '1970-05-20' })
  @IsOptional() @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Douala, Cameroun' })
  @IsOptional() @IsString() @MaxLength(150)
  birthPlace?: string;

  // ── Visuals ────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  bannerUrl?: string;

  // ── Qualifications ────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'CAF A' })
  @IsOptional() @IsString() @MaxLength(100)
  qualification?: string;

  @ApiPropertyOptional({ example: 'Offensive', description: 'Specialization area' })
  @IsOptional() @IsString() @MaxLength(100)
  specialization?: string;

  @ApiPropertyOptional({ example: '2027-06-30' })
  @IsOptional() @IsDateString()
  contractExpiry?: string;

  // ── Biography ────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  biography?: string;

  @ApiPropertyOptional({ example: ['Canon Yaoundé', 'Coton Sport'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  formerClubs?: string[];

  @ApiPropertyOptional({ example: ['MTN Elite One 2019'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  trophies?: string[];

  // ── Staff ────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Paul Essomba' })
  @IsOptional() @IsString() @MaxLength(150)
  assistantCoachName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  fitnessCoachName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  goalkeeperCoachName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  analystName?: string;

  // ── Social Media ──────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  // ── Club / Status ─────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  clubId?: string;

  @ApiPropertyOptional({ enum: CoachStatus, default: CoachStatus.ACTIVE })
  @IsOptional() @IsEnum(CoachStatus)
  status?: CoachStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
