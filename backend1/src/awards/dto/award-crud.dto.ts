import { IsString, IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';
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

  @IsUUID()
  seasonId: string;

  @IsUUID()
  @IsOptional()
  winnerId?: string;
}

export class CreateNominationDto {
  @IsUUID()
  playerId: string;
}
