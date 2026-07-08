import { apiClient } from './api';
import type {
  Article, Comment, PaginatedArticles,
  ArticlesFilter, CreateArticlePayload, CreateCommentPayload,
} from '../types/news.types';

// ─── Map backend snake_case/localised shape → frontend Article type ────────────
function mapArticle(raw: any): import('../types/news.types').Article {
  return {
    id:             raw._id ?? raw.id,
    title:          raw.title?.fr ?? raw.title ?? '',
    slug:           raw.slug,
    excerpt:        raw.subtitle?.fr ?? raw.excerpt ?? (raw.body?.fr ?? '').replace(/<[^>]+>/g, '').slice(0, 160),
    content:        raw.body?.fr ?? raw.content ?? '',
    category:       raw.category,
    status:         raw.status ?? 'PUBLISHED',
    featured:       raw.featured ?? false,
    imageUrl:       resolveMediaUrl(raw.cover_image ?? raw.imageUrl),
    gallery:        (raw.gallery ?? []).map((g: string) => resolveMediaUrl(g)),
    videoUrl:       /^https?:\/\//i.test(raw.videoUrl ?? '') ? raw.videoUrl : resolveMediaUrl(raw.videoUrl),
    videoThumbnail: resolveMediaUrl(raw.videoThumbnail),
    author:         typeof raw.author === 'string'
                      ? { id: 'unknown', name: raw.author }
                      : raw.author,
    tags:           raw.tags ?? [],
    publishedAt:    raw.publishedAt ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt:      raw.updatedAt,
    commentsCount:  raw.comments?.length ?? raw.commentsCount ?? 0,
    readingTime:    raw.read_time ?? raw.readingTime ?? 1,
    views:          raw.views ?? 0,
  };
}

// ─── Media URL helper ─────────────────────────────────────────────────────────
// Uploaded files are served from the API's origin at /uploads/*, which sits
// outside the /api/v1 prefix — so a stored relative path like
// "/uploads/articles/cover/xyz.jpg" must be resolved against the API origin,
// not the app's own origin, and left untouched if it's already absolute.
const API_ORIGIN = ((apiClient.defaults.baseURL as string) ?? '').replace(/\/api\/v\d+\/?$/, '');

export function resolveMediaUrl(path?: string): string | undefined {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
export function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

// ─── Map frontend payload → backend DTO shape ──────────────────────────────────
function toBackendPayload(payload: Partial<CreateArticlePayload>) {
  const body: Record<string, unknown> = {};

  if (payload.title !== undefined) {
    body.title = { fr: payload.title, en: payload.title };
    if (!payload.slug) body.slug = slugify(payload.title);
  }
  if (payload.slug) body.slug = slugify(payload.slug);
  if (payload.excerpt !== undefined) {
    body.subtitle = { fr: payload.excerpt, en: payload.excerpt };
  }
  if (payload.content !== undefined) {
    body.body = { fr: payload.content, en: payload.content };
  }
  if (payload.category !== undefined) body.category = payload.category;
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.featured !== undefined) body.featured = payload.featured;
  if (payload.imageUrl !== undefined) body.cover_image = payload.imageUrl;
  if (payload.gallery !== undefined) body.gallery = payload.gallery;
  if (payload.videoUrl !== undefined) body.videoUrl = payload.videoUrl;
  if (payload.videoThumbnail !== undefined) body.videoThumbnail = payload.videoThumbnail;
  if (payload.tags !== undefined) body.tags = payload.tags;
  if (payload.author) body.author = payload.author;

  return body;
}

// ─── News API ─────────────────────────────────────────────────────────────────

export const newsApi = {
  // ── Articles ───────────────────────────────────────────────────────────────

  getArticles: (filters?: ArticlesFilter) =>
    apiClient.get<PaginatedArticles>('/articles', { params: filters })
      .then(r => ({ ...r.data, data: r.data.data?.map(mapArticle) ?? [] })),

  getArticle: (slug: string) =>
    apiClient.get<any>(`/articles/${slug}`)
      .then(r => mapArticle(r.data)),

  getFeatured: () =>
    apiClient.get<any[]>('/articles/featured')
      .then(r => r.data.map(mapArticle)),

  createArticle: (payload: CreateArticlePayload) => {
    const body = toBackendPayload(payload);
    if (!body.author) body.author = 'Rédaction MTN Elite One';
    return apiClient.post<any>('/articles', body).then(r => mapArticle(r.data));
  },

  updateArticle: (id: string, payload: Partial<CreateArticlePayload>) =>
    apiClient.patch<any>(`/articles/${id}`, toBackendPayload(payload))
      .then(r => mapArticle(r.data)),

  deleteArticle: (id: string) =>
    apiClient.delete(`/articles/${id}`)
      .then(r => r.data),

  publishArticle: (id: string) =>
    apiClient.patch<any>(`/articles/${id}/publish`)
      .then(r => mapArticle(r.data)),

  // ── Media uploads ─────────────────────────────────────────────────────────
  /**
   * Uploads a single image or video file, scoped under `articles/<field>`
   * (field is one of: cover, gallery, video, video-thumbnail).
   * Returns the public URL to store on the article.
   */
  uploadMedia: (file: File, field: 'cover' | 'gallery' | 'video' | 'video-thumbnail', onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<{ url: string }>(`/uploads/articles/${field}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: evt => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      })
      .then(r => r.data.url);
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  getComments: (articleId: string) =>
    apiClient.get<Comment[]>(`/articles/${articleId}/comments`)
      .then(r => r.data),

  createComment: (payload: CreateCommentPayload) =>
    apiClient.post<Comment>(`/articles/${payload.articleId}/comments`, payload)
      .then(r => r.data),

  likeComment: (articleId: string, commentId: string) =>
    apiClient.patch(`/articles/${articleId}/comments/${commentId}/like`)
      .then(r => r.data),
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const NEWS_QK = {
  articles:  (filters?: object) => ['articles', filters]  as const,
  article:   (slug: string)     => ['article',  slug]     as const,
  comments:  (articleId: string)=> ['comments', articleId]as const,
  featured:  ()                 => ['featured']            as const,
};