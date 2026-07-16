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
  OPINION       = 'OPINION',
  FEATURE       = 'FEATURE',
  CULTURE       = 'CULTURE',   // Phase 0.2 — Heritage Centre content
}

export enum ArticleStatus {
  DRAFT     = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED  = 'ARCHIVED',
}

export enum ArticleType {
  STANDARD       = 'STANDARD',
  BREAKING       = 'BREAKING',
  OPINION        = 'OPINION',
  VIDEO          = 'VIDEO',
  PHOTO_GALLERY  = 'PHOTO_GALLERY',
  LIVE_BLOG      = 'LIVE_BLOG',
}

// ─── Localised string ─────────────────────────────────────────────────────────
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
  // ── Article Type & Category ──────────────────────────────────
  @Prop({ type: String, enum: ArticleType, default: ArticleType.STANDARD })
  articleType: ArticleType;

  @Prop({ type: String, enum: ArticleCategory, default: ArticleCategory.CLUB_NEWS })
  category: string;

  // ── Titles & Content ─────────────────────────────────────────
  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ type: LocalizedStringSchema })
  subtitle?: LocalizedString;   // Deck / sub-headline

  @Prop({ type: LocalizedStringSchema, required: true })
  body: LocalizedString;

  // ── Publishing ────────────────────────────────────────────────
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: String, enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: false })
  isPremium: boolean;           // Paywall article

  @Prop({ default: false })
  isBreaking: boolean;          // Breaking news flag

  @Prop({ default: () => new Date() })
  publishedAt: Date;

  // ── Media ─────────────────────────────────────────────────────
  @Prop()
  cover_image?: string;

  @Prop({ type: [String], default: [] })
  gallery: string[];            // Additional images

  @Prop()
  videoUrl?: string;            // Embedded / uploaded video

  @Prop()
  videoThumbnail?: string;

  // ── Related Entities (PostgreSQL IDs) ────────────────────────
  @Prop()
  relatedMatchId?: string;

  @Prop({ type: [String], default: [] })
  relatedClubIds: string[];

  @Prop({ type: [String], default: [] })
  relatedPlayerIds: string[];

  // ── SEO & Metadata ───────────────────────────────────────────
  @Prop({ type: LocalizedStringSchema })
  metaDescription?: LocalizedString;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 1 })
  read_time: number;            // Minutes

  @Prop()
  location?: string;            // Where event happened

  @Prop()
  sourceCredit?: string;        // "Source: FECAFOOT"

  // ── Engagement ───────────────────────────────────────────────
  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Indexes
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ articleType: 1, status: 1 });
ArticleSchema.index({ featured: 1, status: 1 });
ArticleSchema.index({ isPremium: 1 });
ArticleSchema.index({ relatedClubIds: 1 });
ArticleSchema.index({ relatedPlayerIds: 1 });
ArticleSchema.index({ 'title.fr': 'text', 'title.en': 'text', 'body.fr': 'text' });