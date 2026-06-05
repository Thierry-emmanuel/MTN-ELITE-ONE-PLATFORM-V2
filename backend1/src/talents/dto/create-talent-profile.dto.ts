import { IsString, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTalentProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  player_id: string;

  @ApiProperty()
  @IsOptional()
  bio?: { fr: string; en: string };

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  potential_rating?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  scout_notes?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  similar_player_id?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  academy?: string;
}
