import {
  IsString, IsBoolean, IsOptional, IsArray, IsObject,
  IsNumber, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleType, ArticleCategory, ArticleStatus } from '../schemas/article.schema';

class LocalizedStringUpdate {
  @IsOptional() @IsString() fr?: string;
  @IsOptional() @IsString() en?: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ enum: ArticleType })
  @IsOptional() @IsEnum(ArticleType)
  articleType?: ArticleType;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => LocalizedStringUpdate)
  title?: LocalizedStringUpdate;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => LocalizedStringUpdate)
  subtitle?: LocalizedStringUpdate;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => LocalizedStringUpdate)
  body?: LocalizedStringUpdate;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  author?: string;

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional() @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isBreaking?: boolean;

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

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  relatedMatchId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  relatedClubIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  relatedPlayerIds?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @Type(() => LocalizedStringUpdate)
  metaDescription?: LocalizedStringUpdate;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  read_time?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  sourceCredit?: string;
}
