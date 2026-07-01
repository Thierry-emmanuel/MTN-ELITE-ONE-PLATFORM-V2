import {
  IsString, IsEnum, IsDateString, IsOptional,
  IsInt, IsBoolean, IsNumber,
  MaxLength, Min, Max, IsArray, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition, PreferredFoot, PlayerStatus } from '../player.entity';
import { Type } from 'class-transformer';

class SocialMediaDto {
  @IsOptional() @IsString() @MaxLength(200) twitter?:   string;
  @IsOptional() @IsString() @MaxLength(200) instagram?: string;
  @IsOptional() @IsString() @MaxLength(200) facebook?:  string;
  @IsOptional() @IsString() @MaxLength(200) youtube?:   string;
  @IsOptional() @IsString() @MaxLength(200) tiktok?:    string;
}

export class CreatePlayerDto {
  // ── Core Identity ──────────────────────────────────────────────
  @ApiProperty({ example: 'Samuel' })
  @IsString() @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: "Eto'o" })
  @IsString() @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: 'Le Bison' })
  @IsOptional() @IsString() @MaxLength(100)
  nickname?: string;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.FORWARD })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiProperty({ example: 'Camerounais' })
  @IsString() @MaxLength(100)
  nationality: string;

  @ApiPropertyOptional({ example: 'Français' })
  @IsOptional() @IsString() @MaxLength(100)
  secondNationality?: string;

  @ApiPropertyOptional({ example: '1981-03-10' })
  @IsOptional() @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Nkon, Cameroun' })
  @IsOptional() @IsString() @MaxLength(150)
  birthPlace?: string;

  @ApiPropertyOptional({ example: 9 })
  @IsOptional() @IsInt() @Min(1) @Max(99)
  jerseyNumber?: number;

  // ── Physical ──────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 180, description: 'Height in cm' })
  @IsOptional() @IsInt() @Min(140) @Max(220)
  height?: number;

  @ApiPropertyOptional({ example: 75, description: 'Weight in kg' })
  @IsOptional() @IsInt() @Min(40) @Max(150)
  weight?: number;

  @ApiPropertyOptional({ enum: PreferredFoot })
  @IsOptional() @IsEnum(PreferredFoot)
  preferredFoot?: PreferredFoot;

  // ── Media ─────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  secondaryPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  videoUrl?: string;

  // ── Biography ────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  biography?: string;

  @ApiPropertyOptional({ example: ['Real Madrid', 'Chelsea FC'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  formerClubs?: string[];

  // ── Contract ─────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 500000 })
  @IsOptional() @IsNumber() @Min(0)
  marketValue?: number;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional() @IsDateString()
  contractExpiry?: string;

  @ApiPropertyOptional({ example: 'Sports Management Africa' })
  @IsOptional() @IsString() @MaxLength(150)
  agentName?: string;

  // ── Career Stats ─────────────────────────────────────────────
  @ApiPropertyOptional({ example: 120 })
  @IsOptional() @IsInt() @Min(0)
  appearances?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional() @IsInt() @Min(0)
  goals?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional() @IsInt() @Min(0)
  assists?: number;

  @ApiPropertyOptional({ example: 22 })
  @IsOptional() @IsInt() @Min(0)
  internationalCaps?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional() @IsInt() @Min(0)
  internationalGoals?: number;

  // ── Status ────────────────────────────────────────────────────
  @ApiPropertyOptional({ enum: PlayerStatus, default: PlayerStatus.ACTIVE })
  @IsOptional() @IsEnum(PlayerStatus)
  status?: PlayerStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;

  // ── Social Media ──────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  // ── Club ──────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'ID of the club' })
  @IsOptional() @IsInt()
  clubId?: number;
}