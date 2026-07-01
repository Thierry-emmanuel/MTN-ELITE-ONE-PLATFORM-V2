import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateInjuryDto {
  @IsInt() playerId: number;
  @IsString() type: string;
  @IsEnum(['MINOR', 'MODERATE', 'SEVERE']) severity: string;
  @IsOptional() @IsEnum(['ACTIVE', 'RECOVERING', 'CLEARED']) status?: string;
  @IsDateString() injuredAt: string;
  @IsOptional() @IsDateString() expectedReturn?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateInjuryDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsEnum(['MINOR', 'MODERATE', 'SEVERE']) severity?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'RECOVERING', 'CLEARED']) status?: string;
  @IsOptional() @IsDateString() expectedReturn?: string;
  @IsOptional() @IsString() notes?: string;
}