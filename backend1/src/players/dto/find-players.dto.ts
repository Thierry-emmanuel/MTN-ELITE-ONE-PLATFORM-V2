import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PlayerPosition } from '../player.entity';

export class FindPlayersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: PlayerPosition, description: 'Filter by position' })
  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @ApiPropertyOptional({ description: 'Filter by club ID' })
  @IsOptional()
  @Type(() => String)
  @IsString()
  clubId?: string;

  @ApiPropertyOptional({ description: 'Filter active/inactive players' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
