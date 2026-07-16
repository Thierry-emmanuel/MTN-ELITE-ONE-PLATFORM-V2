// src/stadiums/dto/create-stadium.dto.ts
import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StadiumSurface, StadiumStatus } from '../stadium.entity';

export class CreateStadiumDto {
  @ApiProperty()
  @IsString() @MaxLength(150)
  name: string;

  @ApiProperty()
  @IsString() @MaxLength(100)
  city: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ enum: StadiumSurface })
  @IsOptional() @IsEnum(StadiumSurface)
  surface?: StadiumSurface;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  openedYear?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: StadiumStatus })
  @IsOptional() @IsEnum(StadiumStatus)
  status?: StadiumStatus;
}
