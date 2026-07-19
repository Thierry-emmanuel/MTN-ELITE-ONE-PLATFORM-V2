import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { MediaType } from '../schemas/media.schema';

export class CreateMediaDto {
  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @IsUrl({ require_tld: false })
  url: string;

  @IsOptional() @IsUrl({ require_tld: false })
  thumbnailUrl?: string;

  @IsString() @MaxLength(200)
  title: string;

  @IsOptional() @IsString() @MaxLength(300)
  altText?: string;

  @IsOptional() @IsString() @MaxLength(150)
  credit?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsInt() relatedMatchId?: number;
  @IsOptional() @IsInt() relatedClubId?: number;
  @IsOptional() @IsInt() relatedPlayerId?: number;
}
