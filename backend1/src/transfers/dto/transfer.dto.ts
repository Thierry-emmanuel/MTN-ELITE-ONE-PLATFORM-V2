import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsInt() playerId: number;
  @IsOptional() @IsInt() fromClubId?: number;
  @IsInt() toClubId: number;
  @IsEnum(['PERMANENT', 'LOAN', 'FREE', 'RETURN_FROM_LOAN']) type: string;
  @IsOptional() @IsNumber() fee?: number;
  @IsString() windowLabel: string;
  @IsDateString() transferDate: string;
  @IsOptional() @IsBoolean() announced?: boolean;
}

export class UpdateTransferDto {
  @IsOptional() @IsInt() fromClubId?: number;
  @IsOptional() @IsInt() toClubId?: number;
  @IsOptional() @IsEnum(['PERMANENT', 'LOAN', 'FREE', 'RETURN_FROM_LOAN']) type?: string;
  @IsOptional() @IsNumber() fee?: number;
  @IsOptional() @IsString() windowLabel?: string;
  @IsOptional() @IsDateString() transferDate?: string;
  @IsOptional() @IsBoolean() announced?: boolean;
}