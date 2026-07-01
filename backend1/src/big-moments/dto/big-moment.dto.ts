import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateBigMomentDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsDateString() momentDate: string;
  @IsEnum(['GOAL', 'TROPHY', 'RECORD', 'CEREMONY', 'OTHER']) category: string;
  @IsString() mediaUrl: string;
  @IsOptional() @IsEnum(['image', 'video']) mediaType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) relatedClubIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) relatedPlayerIds?: string[];
  @IsOptional() @IsBoolean() featured?: boolean;
}

export class UpdateBigMomentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() momentDate?: string;
  @IsOptional() @IsEnum(['GOAL', 'TROPHY', 'RECORD', 'CEREMONY', 'OTHER']) category?: string;
  @IsOptional() @IsString() mediaUrl?: string;
  @IsOptional() @IsEnum(['image', 'video']) mediaType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) relatedClubIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) relatedPlayerIds?: string[];
  @IsOptional() @IsBoolean() featured?: boolean;
}