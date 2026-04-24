import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStandingDto {
  @ApiProperty({ description: 'Club UUID' })
  @IsUUID()
  clubId: string;

  @ApiProperty({ description: 'Season UUID' })
  @IsUUID()
  seasonId: string;
}