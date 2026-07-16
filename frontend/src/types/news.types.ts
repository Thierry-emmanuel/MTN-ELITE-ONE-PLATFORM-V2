// ─── Enums ────────────────────────────────────────────────────────────────────

export type ArticleCategory =
  | 'MATCH_REPORT'
  | 'TRANSFERS'
  | 'CLUB_NEWS'
  | 'NATIONAL_TEAM'
  | 'INTERVIEW'
  | 'ANALYSIS'
  | 'RESULTS'
  | 'CULTURE';

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface ArticleAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string; // e.g. "Rédacteur en chef"
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;               // HTML or markdown body
  category: ArticleCategory;
  status: ArticleStatus;
  featured: boolean;             // pinned as hero article
  imageUrl?: string;
  gallery?: string[];            // additional images
  videoUrl?: string;             // uploaded mp4 or embed URL (YouTube/Vimeo)
  videoThumbnail?: string;
  author: ArticleAuthor;
  tags: string[];
  publishedAt: string;           // ISO string
  updatedAt?: string;
  commentsCount: number;
  readingTime: number;           // estimated minutes
  views?: number;
  likesCount?: number;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ArticlesFilter {
  category?: ArticleCategory;
  status?: ArticleStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedArticles {
  data: Article[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateArticlePayload {
  title: string;
  slug?: string;                 // auto-generated from title when omitted
  excerpt: string;
  content: string;
  category: ArticleCategory;
  status: ArticleStatus;
  featured: boolean;
  imageUrl?: string;
  gallery?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  author?: string;                // display name of the writer
  tags: string[];
}

export interface CreateCommentPayload {
  articleId: string;
  authorName: string;
  content: string;
  parentId?: string; // for replies
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<ArticleCategory, { label: string; color: string; bg: string }> = {
  MATCH_REPORT:  { label: 'Compte-rendu',    color: 'text-[#10B981]', bg: 'bg-[#10B981]/15 border-[#10B981]/30' },
  TRANSFERS:     { label: 'Transferts',      color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
  CLUB_NEWS:     { label: 'Clubs',           color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/15 border-[#60A5FA]/30' },
  NATIONAL_TEAM: { label: 'Lions Indompt.', color: 'text-[#CE1126]', bg: 'bg-[#CE1126]/15 border-[#CE1126]/30' },
  INTERVIEW:     { label: 'Interview',       color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/15 border-[#A78BFA]/30' },
  ANALYSIS:      { label: 'Analyse',         color: 'text-[#FB923C]', bg: 'bg-[#FB923C]/15 border-[#FB923C]/30' },
  RESULTS:       { label: 'Résultats',       color: 'text-[#34D399]', bg: 'bg-[#34D399]/15 border-[#34D399]/30' },
  CULTURE:       { label: 'Culture & Heritage', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/15 border-[#F59E0B]/30' },
};