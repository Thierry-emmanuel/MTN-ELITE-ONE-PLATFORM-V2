// src/referees/dto/create-referee.dto.ts
import { IsString, IsOptional, IsNumber, IsEnum, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefereeLevel, RefereeStatus } from '../referee.entity';

export class CreateRefereeDto {
  @ApiProperty()
  @IsString() @MaxLength(100)
  firstName: string;

  @ApiProperty()
  @IsString() @MaxLength(100)
  lastName: string;

  @ApiProperty()
  @IsString() @MaxLength(100)
  nationality: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  birthPlace?: string;

  @ApiPropertyOptional({ enum: RefereeLevel })
  @IsOptional() @IsEnum(RefereeLevel)
  licenseLevel?: RefereeLevel;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(50)
  licenseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  yearsActive?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ enum: RefereeStatus })
  @IsOptional() @IsEnum(RefereeStatus)
  status?: RefereeStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
