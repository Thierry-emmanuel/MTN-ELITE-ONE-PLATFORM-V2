import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, X } from 'lucide-react';
import { newsApi } from '@/services/newsApi';
import { MOCK_ARTICLES } from '@/services/mockNews';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { FeaturedArticle, FeaturedArticleSkeleton } from '@/components/elite/news/FeaturedArticle';
import { ArticleCard, ArticleCardSkeleton } from '@/components/elite/news/ArticleCard';
import { CATEGORY_META } from '@/types/news.types';
import type { Article, ArticleCategory } from '@/types/news.types';

const ALL_CATEGORIES = Object.entries(CATEGORY_META).map(([key, meta]) => ({
  id: key as ArticleCategory, label: meta.label, color: meta.color,
}));

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles,  setArticles]  = useState<Article[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState(searchParams.get('q') ?? '');
  const [category,  setCategory]  = useState<ArticleCategory | 'ALL'>((searchParams.get('cat') as ArticleCategory) ?? 'ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsApi.getArticles({ status: 'PUBLISHED', limit: 50 });
      setArticles(res.data?.length > 0 ? res.data : MOCK_ARTICLES.filter(a => a.status === 'PUBLISHED'));
    } catch {
      setArticles(MOCK_ARTICLES.filter(a => a.status === 'PUBLISHED'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sync URL
  useEffect(() => {
    const p: Record<string, string> = {};
    if (search)             p.q   = search;
    if (category !== 'ALL') p.cat = category;
    setSearchParams(p, { replace: true });
  }, [search, category]);

  // Derived
  const featured = useMemo(() => articles.find(a => a.featured), [articles]);

  const filtered = useMemo(() => {
    let list = articles.filter(a => a.id !== featured?.id);
    if (category !== 'ALL') list = list.filter(a => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [articles, featured, category, search]);

  const handleCategoryChange = useCallback((cat: ArticleCategory | 'ALL') => {
    setCategory(cat);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="MTN Elite One · Actualités"
        title="Actualités"
        subtitle="Toute l'information du football camerounais"
        accentColor="green"
      />

      <div className="container py-6 lg:py-10 space-y-8">

        {/* ── Featured article ──────────────────────────────────────────── */}
        {loading ? (
          <FeaturedArticleSkeleton />
        ) : featured ? (
          <FeaturedArticle article={featured} />
        ) : null}

        {/* ── Filters bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full pl-9 pr-9 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
            <button
              onClick={() => handleCategoryChange('ALL')}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all border ${
                category === 'ALL'
                  ? 'bg-accent text-black border-accent'
                  : 'bg-white/[0.03] text-muted-foreground border-border/40 hover:bg-white/[0.06] hover:text-foreground'
              }`}
            >
              Toutes
            </button>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all border ${
                  category === cat.id
                    ? `${CATEGORY_META[cat.id].bg} ${cat.color} border-current`
                    : 'bg-white/[0.03] text-muted-foreground border-border/40 hover:bg-white/[0.06] hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ─────────────────────────────────────────────── */}
        {!loading && (
          <p className="text-[11px] text-muted-foreground/40">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            {category !== 'ALL' && ` · ${CATEGORY_META[category].label}`}
            {search && ` · "${search}"`}
          </p>
        )}

        {/* ── Article grid ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <p className="text-4xl mb-3">📰</p>
              <p className="text-muted-foreground/50 text-sm">Aucun article trouvé pour ces critères.</p>
              <button onClick={() => { setSearch(''); setCategory('ALL'); }}
                className="mt-3 text-xs text-accent hover:underline">
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refresh */}
        {!loading && (
          <div className="flex justify-center pt-4">
            <button onClick={load}
              className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}