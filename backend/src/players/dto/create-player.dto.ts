import {
  IsString, IsEnum, IsDateString, IsOptional,
  IsInt, IsBoolean, IsNumber, IsUUID,
  MaxLength, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition } from '../player.entity';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Samuel' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Eto\'o' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.FWD })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiProperty({ example: 'Camerounais' })
  @IsString()
  @MaxLength(100)
  nationality: string;

  @ApiProperty({ example: '1981-03-10' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photos/etoo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ example: 9 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  jerseyNumber?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  marketValue?: number;

  @ApiPropertyOptional({ description: 'UUID of the club' })
  @IsOptional()
  @IsUUID()
  clubId?: string;
}