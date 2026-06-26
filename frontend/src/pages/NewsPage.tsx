import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, X, Newspaper, TrendingUp } from 'lucide-react';
import { useArticles } from '@/hooks/useNews';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { FeaturedArticle, FeaturedArticleSkeleton } from '@/components/elite/news/FeaturedArticle';
import { ArticleCard, ArticleCardSkeleton } from '@/components/elite/news/ArticleCard';
import { CATEGORY_META } from '@/types/news.types';
import type { ArticleCategory } from '@/types/news.types';

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_CATEGORIES = Object.entries(CATEGORY_META).map(([key, meta]) => ({
  id: key as ArticleCategory,
  label: meta.label,
  color: meta.color,
}));

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  icon: Icon,
  label,
  count,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  count?: number;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="h-6 w-6 rounded bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
      <Icon className="h-3 w-3 text-accent" />
    </div>
    <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
      {label}
    </h2>
    {count !== undefined && (
      <span className="ml-auto text-[10px] font-bold text-muted-foreground/30 tabular-nums">
        {count}
      </span>
    )}
    <div className="flex-1 h-px bg-border/30 ml-1" />
  </div>
);

// ─── NewsPage ─────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search,   setSearch]   = useState(searchParams.get('q')   ?? '');
  const [category, setCategory] = useState<ArticleCategory | 'ALL'>(
    (searchParams.get('cat') as ArticleCategory) ?? 'ALL',
  );

  // TanStack Query
  const { data: articles = [], isLoading, refetch } = useArticles({ status: 'PUBLISHED', limit: 50 });

  // Sync URL params
  useEffect(() => {
    const p: Record<string, string> = {};
    if (search)             p.q   = search;
    if (category !== 'ALL') p.cat = category;
    setSearchParams(p, { replace: true });
  }, [search, category, setSearchParams]);

  // Derived data
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

  const isFiltering = search.trim() !== '' || category !== 'ALL';

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="MTN Elite One · Actualités"
        title="Actualités"
        subtitle="Toute l'information du football camerounais"
        accentColor="green"
      />

      <div className="container py-6 lg:py-10 space-y-10">

        {/* ── Featured hero ─────────────────────────────────────────────────── */}
        {!isFiltering && (
          <section>
            {isLoading ? (
              <FeaturedArticleSkeleton />
            ) : featured ? (
              <FeaturedArticle article={featured} />
            ) : null}
          </section>
        )}

        {/* ── Filters bar ───────────────────────────────────────────────────── */}
        <div className="sticky top-[57px] z-20 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-md border-b border-border/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
              <input
                id="news-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un article…"
                className="w-full pl-9 pr-9 py-2 bg-white/[0.04] border border-border/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
              <button
                id="cat-all"
                onClick={() => setCategory('ALL')}
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
                  id={`cat-${cat.id}`}
                  onClick={() => setCategory(cat.id)}
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

            {/* Refresh */}
            <button
              onClick={() => void refetch()}
              className="shrink-0 flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground uppercase tracking-wider transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* ── Article grid ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={isFiltering ? TrendingUp : Newspaper}
            label={isFiltering ? 'Résultats' : 'Dernières actualités'}
            count={isLoading ? undefined : filtered.length}
          />

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 border border-dashed border-border/30 rounded-2xl"
              >
                <p className="text-4xl mb-4">📰</p>
                <p className="text-muted-foreground/50 text-sm mb-4">
                  Aucun article trouvé pour ces critères.
                </p>
                <button
                  onClick={() => { setSearch(''); setCategory('ALL'); }}
                  className="text-xs text-accent hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filtered.map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
}