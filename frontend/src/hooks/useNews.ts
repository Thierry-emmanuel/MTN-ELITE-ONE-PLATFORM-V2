import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { newsApi, NEWS_QK } from '@/services/newsApi';
import { MOCK_ARTICLES } from '@/services/mockNews';
import type {
  Article, ArticlesFilter, CreateArticlePayload,
} from '@/types/news.types';

// ─── Stale times ──────────────────────────────────────────────────────────────
const STALE = {
  articles: 120_000,  // 2 min
  article:   60_000,  // 1 min  — single article may get comments
  featured:  180_000, // 3 min
} as const;

// ─── useArticles ──────────────────────────────────────────────────────────────
/** List of articles, filtered. Falls back to mock data when API is unreachable. */
export function useArticles(filters?: ArticlesFilter, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: NEWS_QK.articles(filters),
    queryFn: async () => {
      try {
        const res = await newsApi.getArticles(filters);
        return res.data?.length > 0 ? res.data : MOCK_ARTICLES;
      } catch {
        return MOCK_ARTICLES;
      }
    },
    staleTime:      STALE.articles,
    placeholderData: MOCK_ARTICLES,
    enabled:        options?.enabled ?? true,
  });
}

// ─── useArticle ───────────────────────────────────────────────────────────────
/** Single article by slug. */
export function useArticle(slug: string) {
  return useQuery({
    queryKey: NEWS_QK.article(slug),
    queryFn:  () => newsApi.getArticle(slug),
    staleTime: STALE.article,
    enabled:   !!slug,
  });
}

// ─── useFeatured ──────────────────────────────────────────────────────────────
/** Featured articles (separate endpoint). Falls back to the first featured mock. */
export function useFeatured() {
  return useQuery({
    queryKey: NEWS_QK.featured(),
    queryFn: async () => {
      try {
        const res = await newsApi.getFeatured();
        return res.length > 0 ? res : MOCK_ARTICLES.filter(a => a.featured);
      } catch {
        return MOCK_ARTICLES.filter(a => a.featured);
      }
    },
    staleTime: STALE.featured,
  });
}

// ─── useAllArticlesEditor ─────────────────────────────────────────────────────
/** All articles (all statuses) for the editor CMS view. */
export function useAllArticlesEditor() {
  return useQuery({
    queryKey: NEWS_QK.articles({ limit: 200 } as ArticlesFilter),
    queryFn: async () => {
      try {
        const res = await newsApi.getArticles({ limit: 200 });
        return res.data?.length > 0 ? res.data : MOCK_ARTICLES;
      } catch {
        return MOCK_ARTICLES;
      }
    },
    staleTime: STALE.articles,
  });
}

// ─── useCreateArticle ─────────────────────────────────────────────────────────
export function useCreateArticle(): UseMutationResult<Article, Error, CreateArticlePayload> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => newsApi.createArticle(payload),
    onSuccess: (created) => {
      // Prepend to list caches
      qc.setQueriesData<Article[]>(
        { queryKey: ['articles'] },
        (prev) => (prev ? [created, ...prev] : [created]),
      );
    },
  });
}

// ─── useUpdateArticle ─────────────────────────────────────────────────────────
export function useUpdateArticle(): UseMutationResult<
  Article, Error, { id: string; payload: Partial<CreateArticlePayload> }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => newsApi.updateArticle(id, payload),
    onSuccess: (updated) => {
      qc.setQueriesData<Article[]>(
        { queryKey: ['articles'] },
        (prev) => prev?.map(a => (a.id === updated.id ? updated : a)) ?? prev,
      );
    },
  });
}

// ─── useDeleteArticle ─────────────────────────────────────────────────────────
export function useDeleteArticle(): UseMutationResult<unknown, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => newsApi.deleteArticle(id),
    onSuccess: (_data, id) => {
      qc.setQueriesData<Article[]>(
        { queryKey: ['articles'] },
        (prev) => prev?.filter(a => a.id !== id) ?? prev,
      );
    },
  });
}
