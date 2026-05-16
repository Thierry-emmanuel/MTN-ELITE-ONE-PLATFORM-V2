import { PartialType } from '@nestjs/swagger';
import { CreateMatchDto } from './create-match.dto';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// WHY: PartialType makes every CreateMatchDto field optional automatically.
// No need to duplicate all decorators.
export class UpdateMatchDto extends PartialType(CreateMatchDto) {
  @ApiPropertyOptional({ description: 'Home team score', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  homeScore?: number;

  @ApiPropertyOptional({ description: 'Away team score', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  awayScore?: number;
}