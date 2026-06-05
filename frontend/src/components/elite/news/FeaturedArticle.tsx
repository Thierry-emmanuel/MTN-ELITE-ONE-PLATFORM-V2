import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, Eye, ArrowRight } from 'lucide-react';
import { CategoryBadge } from './ArticleCard';
import type { Article } from '@/types/news.types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

interface FeaturedArticleProps {
  article: Article;
}

export const FeaturedArticle = memo(({ article }: FeaturedArticleProps) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="group relative rounded-2xl overflow-hidden border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
  >
    {/* Background image */}
    <div className="relative aspect-[21/9] sm:aspect-[3/1] lg:aspect-[21/8] overflow-hidden">
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="eager"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#008751]/20 via-[#FCD116]/10 to-[#CE1126]/20" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      {/* Cameroon accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />

      {/* À la une badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_14px_rgba(252,209,22,0.40)]">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          À la une
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={article.category} />
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] text-white/50 uppercase tracking-wide">
              · {tag}
            </span>
          ))}
        </div>

        <Link to={`/news/${article.slug}`}>
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-accent transition-colors leading-tight max-w-3xl mb-3">
            {article.title}
          </h2>
        </Link>

        <p className="text-sm text-white/60 line-clamp-2 max-w-2xl mb-5 hidden sm:block">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Author + date */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-[11px] font-bold text-white/70">
              {article.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">{article.author.name}</p>
              <p className="text-[10px] text-white/40 capitalize">{formatDate(article.publishedAt)}</p>
            </div>
          </div>

          {/* Meta + CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[11px] text-white/40">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.readingTime} min</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{article.commentsCount}</span>
              {article.views && <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views.toLocaleString('fr-FR')}</span>}
            </div>
            <Link
              to={`/news/${article.slug}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-black text-xs font-black uppercase tracking-wide hover:bg-accent/90 transition-colors shadow-[0_0_16px_rgba(252,209,22,0.30)]"
            >
              Lire l'article
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </motion.article>
));
FeaturedArticle.displayName = 'FeaturedArticle';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const FeaturedArticleSkeleton = () => (
  <div className="rounded-2xl border border-border/40 overflow-hidden animate-pulse">
    <div className="aspect-[21/8] bg-white/[0.04]" />
  </div>
);