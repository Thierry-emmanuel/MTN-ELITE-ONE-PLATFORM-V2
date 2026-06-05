import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MultilingualText {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fr: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  en: string;
}

export class CreateCultureStoryDto {
  @ApiProperty({ type: MultilingualText })
  @ValidateNested()
  @Type(() => MultilingualText)
  @IsNotEmpty()
  title: MultilingualText;

  @ApiProperty({ type: MultilingualText })
  @ValidateNested()
  @Type(() => MultilingualText)
  @IsNotEmpty()
  body: MultilingualText;

  @ApiProperty({ enum: ['quartier', 'académie', 'ultras', 'rivalité'] })
  @IsString()
  @IsIn(['quartier', 'académie', 'ultras', 'rivalité'])
  category: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];
}
