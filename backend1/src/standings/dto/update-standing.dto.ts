import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStandingDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  played?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  won?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  drawn?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lost?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  goalsFor?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  goalsAgainst?: number;

  @ApiPropertyOptional({ example: 'WWDLW' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  formGuide?: string;
}