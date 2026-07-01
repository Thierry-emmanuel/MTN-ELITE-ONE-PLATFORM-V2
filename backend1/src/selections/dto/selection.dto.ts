import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSelectionDto {
  @IsString() campaignLabel: string;
  @IsDateString() squadDate: string;
  @IsArray() @IsString({ each: true }) playerIds: string[];
  @IsOptional() @IsString() coachName?: string;
  @IsOptional() @IsEnum(['PROVISIONAL', 'FINAL']) status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateSelectionDto {
  @IsOptional() @IsString() campaignLabel?: string;
  @IsOptional() @IsDateString() squadDate?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) playerIds?: string[];
  @IsOptional() @IsString() coachName?: string;
  @IsOptional() @IsEnum(['PROVISIONAL', 'FINAL']) status?: string;
  @IsOptional() @IsString() notes?: string;
}