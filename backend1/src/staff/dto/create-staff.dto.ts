// src/staff/dto/create-staff.dto.ts
import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole, StaffStatus } from '../staff.entity';

export class CreateStaffDto {
  @ApiProperty()
  @IsString() @MaxLength(100)
  firstName: string;

  @ApiProperty()
  @IsString() @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  birthDate?: string;

  @ApiProperty({ enum: StaffRole })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  clubId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  contractStart?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  contractEnd?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsOptional() @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bio?: string;
}
