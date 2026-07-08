import { IsString, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { AwardStatus } from '../entities/award.entity';
import { NomineeType } from '../entities/award-nomination.entity';

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
  // Kept for backward compatibility with existing admin tooling that only
  // ever nominated players. New callers should prefer `nomineeType` +
  // `nomineeId` so Team / Coach categories can be nominated too.
  @IsNumber()
  @IsOptional()
  playerId?: number;

  @IsEnum(NomineeType)
  @IsOptional()
  nomineeType?: NomineeType;

  @IsNumber()
  @IsOptional()
  nomineeId?: number;
}
