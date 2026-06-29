import {
  IsString, IsBoolean, IsOptional, IsArray, IsObject,
  IsNumber, IsEnum, IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ArticleType, ArticleCategory } from '../schemas/article.schema';

class LocalizedString {
  @IsString() fr: string;
  @IsString() en: string;
}

export class CreateArticleDto {
  // ── Type & Category ──────────────────────────────────────────
  @ApiPropertyOptional({ enum: ArticleType, default: ArticleType.STANDARD })
  @IsOptional() @IsEnum(ArticleType)
  articleType?: ArticleType;

  @ApiProperty({ example: 'CLUB_NEWS' })
  @IsString()
  category: string;

  // ── Titles & Content ─────────────────────────────────────────
  @ApiProperty()
  @IsObject()
  @Type(() => LocalizedString)
  title: LocalizedString;

  @ApiPropertyOptional({ description: 'Deck / sub-headline' })
  @IsOptional() @IsObject()
  @Type(() => LocalizedString)
  subtitle?: LocalizedString;

  @ApiProperty()
  @IsObject()
  @Type(() => LocalizedString)
  body: LocalizedString;

  // ── Publishing ────────────────────────────────────────────────
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isBreaking?: boolean;

  // ── Media ─────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  cover_image?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  videoThumbnail?: string;

  // ── Related Entities ──────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  relatedMatchId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  relatedClubIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  relatedPlayerIds?: string[];

  // ── SEO & Metadata ───────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => LocalizedString)
  metaDescription?: LocalizedString;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @IsNumber()
  read_time?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  sourceCredit?: string;
}
