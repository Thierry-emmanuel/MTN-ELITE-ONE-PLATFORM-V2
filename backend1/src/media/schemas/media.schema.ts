import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = MediaAsset & Document;

export enum MediaType { IMAGE = 'IMAGE', VIDEO = 'VIDEO' }

/**
 * Phase 4 — unified media library. One record per asset: the binary lives on
 * Cloudinary (uploads module), THIS is the catalogue — metadata, credit and
 * entity relationships that make an asset findable and reusable across
 * stories, matches, clubs and players.
 */
@Schema({ collection: 'media_assets', timestamps: true })
export class MediaAsset {
  @Prop({ type: String, enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;

  @Prop({ required: true })
  url: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  altText?: string;

  @Prop()
  credit?: string;

  @Prop([String])
  tags: string[];

  // ── Entity relationships (automatic linkage across the OS) ──────────────
  @Prop() relatedMatchId?: number;
  @Prop() relatedClubId?: number;
  @Prop() relatedPlayerId?: number;
}
export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
