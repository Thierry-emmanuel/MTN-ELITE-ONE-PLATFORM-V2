import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString,
  Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LineupPosition } from '../match-lineup.entity';

export class LineupEntryDto {
  @ApiProperty()
  @IsInt()
  playerId: number;

  @ApiPropertyOptional({ enum: LineupPosition })
  @IsOptional()
  @IsEnum(LineupPosition)
  position?: LineupPosition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isStarting?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @ApiPropertyOptional({ description: 'Pitch X position, 0-100' })
  @IsOptional()
  @Min(0) @Max(100)
  posX?: number;

  @ApiPropertyOptional({ description: 'Pitch Y position, 0-100' })
  @IsOptional()
  @Min(0) @Max(100)
  posY?: number;
}

export class SetTeamLineupDto {
  @ApiPropertyOptional({ example: '4-2-3-1' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  formation?: string;

  @ApiProperty({ type: [LineupEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineupEntryDto)
  players: LineupEntryDto[];
}

export class SetLineupsDto {
  @ApiProperty()
  @IsInt()
  homeClubId: number;

  @ApiProperty()
  @IsInt()
  awayClubId: number;

  @ApiProperty({ type: SetTeamLineupDto })
  @ValidateNested()
  @Type(() => SetTeamLineupDto)
  home: SetTeamLineupDto;

  @ApiProperty({ type: SetTeamLineupDto })
  @ValidateNested()
  @Type(() => SetTeamLineupDto)
  away: SetTeamLineupDto;
}
