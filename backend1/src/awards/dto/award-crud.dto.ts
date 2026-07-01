import { IsString, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { AwardStatus } from '../entities/award.entity';

export class CreateAwardDto {
  @IsString()
  category: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsEnum(AwardStatus)
  status: AwardStatus;

  @IsNumber()
  seasonId: number;

  @IsNumber()
  @IsOptional()
  winnerId?: number;
}

export class CreateNominationDto {
  @IsNumber()
  playerId: number;
}
