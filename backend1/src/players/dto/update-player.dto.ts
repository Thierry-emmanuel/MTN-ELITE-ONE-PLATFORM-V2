import {
  IsString, IsEnum, IsDateString, IsOptional,
  IsInt, IsBoolean, IsNumber,
  MaxLength, Min, Max, IsArray, IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition, PreferredFoot, PlayerStatus } from '../player.entity';
import { Type } from 'class-transformer';

class SocialMediaUpdateDto {
  @IsOptional() @IsString() @MaxLength(200) twitter?:   string;
  @IsOptional() @IsString() @MaxLength(200) instagram?: string;
  @IsOptional() @IsString() @MaxLength(200) facebook?:  string;
  @IsOptional() @IsString() @MaxLength(200) youtube?:   string;
  @IsOptional() @IsString() @MaxLength(200) tiktok?:    string;
}

// WHY: All fields optional — PartialType mixin has TypeScript resolution issues.
export class UpdatePlayerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) nickname?: string;
  @ApiPropertyOptional({ enum: PlayerPosition }) @IsOptional() @IsEnum(PlayerPosition) position?: PlayerPosition;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) nationality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) secondNationality?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) birthPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(99) jerseyNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(140) @Max(220) height?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(40) @Max(150) weight?: number;
  @ApiPropertyOptional({ enum: PreferredFoot }) @IsOptional() @IsEnum(PreferredFoot) preferredFoot?: PreferredFoot;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) photoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) secondaryPhotoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() biography?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) formerClubs?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) marketValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() contractExpiry?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) agentName?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) appearances?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) goals?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) assists?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) internationalCaps?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) internationalGoals?: number;
  @ApiPropertyOptional({ enum: PlayerStatus }) @IsOptional() @IsEnum(PlayerStatus) status?: PlayerStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsObject() @Type(() => SocialMediaUpdateDto) socialMedia?: SocialMediaUpdateDto;
  @ApiPropertyOptional() @IsOptional() @IsInt() clubId?: number;
}