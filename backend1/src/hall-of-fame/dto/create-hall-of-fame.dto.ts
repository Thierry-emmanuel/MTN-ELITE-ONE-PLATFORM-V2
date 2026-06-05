import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHallOfFameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  birth_year: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  clubs: string[];

  @ApiProperty()
  @IsString()
  career_summary: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  achievements: string[];

  @ApiProperty()
  @IsString()
  era: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty()
  @IsString()
  quote: string;

  @ApiProperty()
  @IsNumber()
  inducted_year: number;
}
