import { IsString, IsBoolean, IsOptional, IsArray, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class LocalizedString {
  @IsString()
  fr: string;

  @IsString()
  en: string;
}

export class CreateArticleDto {
  @IsObject()
  @Type(() => LocalizedString)
  title: LocalizedString;

  @IsObject()
  @Type(() => LocalizedString)
  body: LocalizedString;

  @IsString()
  category: string;

  @IsString()
  author: string;

  @IsString()
  slug: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsString()
  @IsOptional()
  cover_image?: string;

  @IsNumber()
  @IsOptional()
  read_time?: number;
}
