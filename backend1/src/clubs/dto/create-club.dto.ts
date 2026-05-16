import {
  IsString, IsInt, IsOptional, IsEnum,
  IsHexColor, MaxLength, MinLength, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubStatus } from '../club.entity';

export class CreateClubDto {
  @ApiProperty({ example: 'Canon Yaoundé' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Yaoundé' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Stade Omnisports Ahmadou Ahidjo' })
  @IsString()
  @MaxLength(150)
  stadium: string;

  @ApiProperty({ example: 1930 })
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/canon.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Club historique du Cameroun' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#007A5E' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({ enum: ClubStatus, default: ClubStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ClubStatus)
  status?: ClubStatus;
}