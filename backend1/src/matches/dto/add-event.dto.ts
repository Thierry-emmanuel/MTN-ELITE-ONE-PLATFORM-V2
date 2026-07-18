import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MatchEventType } from '../match-event.entity';

/**
 * Phase 3 — Match Builder. One DTO for every timeline event; the SERVICE is
 * the business authority (score increments, status transitions, standings).
 */
export class AddEventDto {
  @ApiProperty({ enum: MatchEventType })
  @IsEnum(MatchEventType)
  type: MatchEventType;

  @ApiProperty({ example: 27, description: 'Match minute (0–120)' })
  @IsInt() @Min(0) @Max(120)
  minute: number;

  @ApiPropertyOptional({ example: 2, description: "Added time (45+2')" })
  @IsOptional() @IsInt() @Min(0) @Max(15)
  extraTime?: number;

  @ApiPropertyOptional({ description: 'Required for player events (goals, cards, subs, injury)' })
  @IsOptional() @IsInt()
  playerId?: number;

  @ApiPropertyOptional({ description: 'Must be the home or away club of the match' })
  @IsOptional() @IsInt()
  clubId?: number;
}
