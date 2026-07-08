import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, Eye, Newspaper, PlayCircle } from 'lucide-react';
import { CATEGORY_META } from '@/types/news.types';
import type { Article } from '@/types/news.types';

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatViews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Category badge ───────────────────────────────────────────────────────────
export const CategoryBadge = ({ category }: { category: Article['category'] }) => {
  const meta = CATEGORY_META[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  );
};

// ─── Author line ──────────────────────────────────────────────────────────────
const AuthorLine = ({ author, date }: { author: Article['author']; date: string }) => (
  <div className="flex items-center gap-2">
    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-muted-foreground/60">
      {author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
    </div>
    <div className="min-w-0">
      <span className="text-[11px] font-medium text-foreground/70 truncate">{author.name}</span>
      <span className="text-[10px] text-muted-foreground/40 ml-1.5">{formatDate(date)}</span>
    </div>
  </div>
);

// ─── Article card — standard ──────────────────────────────────────────────────
interface ArticleCardProps {
  article: Article;
  index?: number;
  variant?: 'default' | 'compact' | 'horizontal';
}

export const ArticleCard = memo(({ article, index = 0, variant = 'default' }: ArticleCardProps) => {
  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
      >
        <Link to={`/news/${article.slug}`}
          className="flex gap-3 group p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
        >
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title}
              className="h-16 w-20 rounded-lg object-cover shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            <CategoryBadge category={article.category} />
            <p className="text-sm font-semibold text-foreground/90 group-hover:text-accent transition-colors line-clamp-2 mt-1 leading-snug">
              {article.title}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-1">{formatDate(article.publishedAt)}</p>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, delay: index * 0.05 }}
        className="group flex gap-4 rounded-xl border border-border/40 bg-white/[0.02] hover:border-border/70 hover:bg-white/[0.04] transition-all overflow-hidden"
      >
        {article.imageUrl ? (
          <div className="relative w-28 sm:w-36 shrink-0">
            <img src={article.imageUrl} alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {article.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <PlayCircle className="h-6 w-6 text-white/90" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-28 sm:w-36 shrink-0 bg-white/[0.04] flex items-center justify-center">
            <Newspaper className="h-6 w-6 text-muted-foreground/20" />
          </div>
        )}
        <div className="flex-1 min-w-0 py-4 pr-4">
          <CategoryBadge category={article.category} />
          <h3 className="font-display text-sm font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2 mt-1.5 leading-snug">
            {article.title}
          </h3>
          <p className="text-[11px] text-muted-foreground/50 line-clamp-2 mt-1">{article.excerpt}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/40">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingTime} min</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{article.commentsCount}</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Default card
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-xl border border-border/40 bg-gradient-to-b from-white/[0.04] to-transparent hover:border-border/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Cover image */}
      <Link to={`/news/${article.slug}`} className="relative block overflow-hidden aspect-[16/9]">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
            <Newspaper className="h-10 w-10 text-muted-foreground/15" />
          </div>
        )}
        {article.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-11 w-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <CategoryBadge category={article.category} />
        </div>
      </Link>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4">
        <Link to={`/news/${article.slug}`}>
          <h3 className="font-display text-sm font-bold text-foreground group-hover:text-accent transition-colors line-clamp-3 leading-snug mb-2">
            {article.title}
          </h3>
        </Link>
        <p className="text-[11px] text-muted-foreground/60 line-clamp-2 flex-1 mb-3">
          {article.excerpt}
        </p>

        <div className="border-t border-border/30 pt-3 flex items-center justify-between">
          <AuthorLine author={article.author} date={article.publishedAt} />
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{article.readingTime}min</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" />{article.commentsCount}</span>
            {article.views && <span className="flex items-center gap-0.5 hidden sm:flex"><Eye className="h-3 w-3" />{formatViews(article.views)}</span>}
          </div>
        </div>
      </div>
    </motion.article>
  );
});
ArticleCard.displayName = 'ArticleCard';

// ─── Skeleton card ────────────────────────────────────────────────────────────
export const ArticleCardSkeleton = () => (
  <div className="rounded-xl border border-border/40 overflow-hidden animate-pulse">
    <div className="aspect-[16/9] bg-white/[0.05]" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 rounded-full bg-white/[0.06]" />
      <div className="space-y-1.5">
        <div className="h-4 rounded bg-white/[0.06]" />
        <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
      </div>
      <div className="h-3 rounded bg-white/[0.04]" />
      <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
    </div>
  </div>
);