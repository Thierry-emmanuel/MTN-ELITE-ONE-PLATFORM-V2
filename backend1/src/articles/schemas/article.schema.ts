import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

export enum ArticleCategory {
  MATCH_REPORT  = 'MATCH_REPORT',
  TRANSFERS     = 'TRANSFERS',
  CLUB_NEWS     = 'CLUB_NEWS',
  NATIONAL_TEAM = 'NATIONAL_TEAM',
  INTERVIEW     = 'INTERVIEW',
  ANALYSIS      = 'ANALYSIS',
  RESULTS       = 'RESULTS',
}

export enum ArticleStatus {
  DRAFT     = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED  = 'ARCHIVED',
}

// ─── Localised string (matches DTO shape) ─────────────────────────────────────
@Schema({ _id: false })
export class LocalizedString {
  @Prop({ required: true }) fr: string;
  @Prop({ required: true }) en: string;
}
export const LocalizedStringSchema = SchemaFactory.createForClass(LocalizedString);

// ─── Embedded: reply ──────────────────────────────────────────────────────────
@Schema({ _id: true, timestamps: false })
export class CommentReply {
  @Prop({ required: true })            authorName: string;
  @Prop()                              authorAvatarUrl?: string;
  @Prop({ required: true })            content: string;
  @Prop({ default: () => new Date() }) createdAt: Date;
  @Prop({ default: 0 })                likes: number;
}
export const CommentReplySchema = SchemaFactory.createForClass(CommentReply);

// ─── Embedded: comment ────────────────────────────────────────────────────────
@Schema({ _id: true, timestamps: false })
export class Comment {
  @Prop({ required: true })            authorName: string;
  @Prop()                              authorAvatarUrl?: string;
  @Prop({ required: true })            content: string;
  @Prop({ default: () => new Date() }) createdAt: Date;
  @Prop({ default: 0 })                likes: number;
  @Prop({ type: [CommentReplySchema], default: [] }) replies: CommentReply[];
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

// ─── Article ──────────────────────────────────────────────────────────────────
@Schema({ timestamps: true, collection: 'articles' })
export class Article {
  // Matches DTO: title is { fr, en }
  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  // Matches DTO: body is { fr, en } (the article content)
  @Prop({ type: LocalizedStringSchema, required: true })
  body: LocalizedString;

  // Matches DTO: slug provided by client
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: String, enum: ArticleCategory, default: ArticleCategory.CLUB_NEWS })
  category: string;

  // Status managed by service, not in DTO
  @Prop({ type: String, enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Prop({ default: false })
  featured: boolean;

  // Matches DTO: cover_image
  @Prop()
  cover_image?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  // Matches DTO: read_time
  @Prop({ default: 1 })
  read_time: number;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: () => new Date() })
  publishedAt: Date;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Indexes
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ featured: 1, status: 1 });
ArticleSchema.index({ 'title.fr': 'text', 'title.en': 'text', 'body.fr': 'text' });