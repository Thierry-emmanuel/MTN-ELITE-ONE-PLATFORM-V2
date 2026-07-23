import {
  IsString, IsInt, IsOptional, IsEnum,
  IsHexColor, MaxLength, MinLength, Min, Max,
  IsArray, IsObject, IsNumber, IsPositive,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClubStatus } from '../club.entity';
import { Type } from 'class-transformer';

class AchievementsUpdateDto {
  @IsOptional() @IsInt() @Min(0) league?:   number;
  @IsOptional() @IsInt() @Min(0) cup?:      number;
  @IsOptional() @IsInt() @Min(0) regional?: number;
  @IsOptional() @IsInt() @Min(0) african?:  number;
}

class SocialMediaUpdateDto {
  @IsOptional() @IsString() @MaxLength(200) twitter?:   string;
  @IsOptional() @IsString() @MaxLength(200) instagram?: string;
  @IsOptional() @IsString() @MaxLength(200) facebook?:  string;
  @IsOptional() @IsString() @MaxLength(200) youtube?:   string;
  @IsOptional() @IsString() @MaxLength(200) tiktok?:    string;
}

export class UpdateClubDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  nickname?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(50)
  region?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1800) @Max(new Date().getFullYear())
  foundedYear?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  stadium?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(0)
  stadiumCapacity?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  stadiumPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  history?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  palmares?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  presidentName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  presidentPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @IsPositive()
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => AchievementsUpdateDto)
  achievements?: AchievementsUpdateDto;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => SocialMediaUpdateDto)
  socialMedia?: SocialMediaUpdateDto;

  @ApiPropertyOptional({ enum: ClubStatus })
  @IsOptional() @IsEnum(ClubStatus)
  status?: ClubStatus;
}