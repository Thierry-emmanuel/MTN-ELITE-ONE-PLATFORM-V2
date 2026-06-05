import { apiClient } from './api';
import type {
  Article, Comment, PaginatedArticles,
  ArticlesFilter, CreateArticlePayload, CreateCommentPayload,
} from '../types/news.types';


// ─── Map backend snake_case/localised shape → frontend Article type ────────────
function mapArticle(raw: any): import('../types/news.types').Article {
  return {
    id:            raw._id ?? raw.id,
    title:         raw.title?.fr ?? raw.title ?? '',
    slug:          raw.slug,
    excerpt:       raw.body?.fr?.slice(0, 160) ?? raw.excerpt ?? '',
    content:       raw.body?.fr ?? raw.content ?? '',
    category:      raw.category,
    status:        raw.status ?? 'PUBLISHED',
    featured:      raw.featured ?? false,
    imageUrl:      raw.cover_image ?? raw.imageUrl,
    author:        typeof raw.author === 'string'
                     ? { id: 'unknown', name: raw.author }
                     : raw.author,
    tags:          raw.tags ?? [],
    publishedAt:   raw.publishedAt ?? raw.createdAt ?? new Date().toISOString(),
    commentsCount: raw.comments?.length ?? raw.commentsCount ?? 0,
    readingTime:   raw.read_time ?? raw.readingTime ?? 1,
    views:         raw.views ?? 0,
  };
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

  createArticle: (payload: CreateArticlePayload) =>
    apiClient.post<Article>('/articles', payload)
      .then(r => r.data),

  updateArticle: (id: string, payload: Partial<CreateArticlePayload>) =>
    apiClient.patch<Article>(`/articles/${id}`, payload)
      .then(r => r.data),

  deleteArticle: (id: string) =>
    apiClient.delete(`/articles/${id}`)
      .then(r => r.data),

  publishArticle: (id: string) =>
    apiClient.patch<Article>(`/articles/${id}/publish`)
      .then(r => r.data),

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