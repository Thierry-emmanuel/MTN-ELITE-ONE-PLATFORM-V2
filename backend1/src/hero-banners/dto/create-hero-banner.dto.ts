import { IsString, IsBoolean, IsOptional, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class LocalizedString {
  @IsString()
  fr: string;

  @IsString()
  en: string;
}

export class CreateHeroBannerDto {
  @IsObject()
  @Type(() => LocalizedString)
  title: LocalizedString;

  @IsObject()
  @IsOptional()
  @Type(() => LocalizedString)
  subtitle?: LocalizedString;

  @IsString()
  image_url: string;

  @IsString()
  @IsOptional()
  link_url?: string;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  type?: string;
}
