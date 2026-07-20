import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ExploreRail } from '@/components/elite/ExploreRail';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Eye, MessageCircle,
  Calendar, Share2, Bookmark, ExternalLink, Link2,
} from 'lucide-react';
import { newsApi } from '@/services/newsApi';
import { CategoryBadge, ArticleCard } from '@/components/elite/news/ArticleCard';
import { CommentsSection } from '@/components/elite/news/CommentsSection';
import type { Article, Comment } from '@/types/news.types';

// ─── Video embed helper ────────────────────────────────────────────────────────
function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Share button ─────────────────────────────────────────────────────────────
const ShareBar = ({ title }: { title: string }) => {
  const url = encodeURIComponent(window.location.href);
  const txt = encodeURIComponent(title);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground/40 uppercase tracking-wider">Partager</span>
      <a href={`https://twitter.com/intent/tweet?url=${url}&text=${txt}`} target="_blank" rel="noreferrer"
        className="h-8 w-8 rounded-full bg-white/[0.05] border border-border/40 flex items-center justify-center hover:bg-[#1DA1F2]/15 hover:border-[#1DA1F2]/30 transition-all">
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer"
        className="h-8 w-8 rounded-full bg-white/[0.05] border border-border/40 flex items-center justify-center hover:bg-[#1877F2]/15 hover:border-[#1877F2]/30 transition-all">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
      </a>
      <button
        onClick={() => navigator.clipboard.writeText(window.location.href)}
        className="h-8 w-8 rounded-full bg-white/[0.05] border border-border/40 flex items-center justify-center hover:bg-white/10 transition-all" title="Copier le lien">
        <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default function ArticlePage() {
  const { slug }     = useParams<{ slug: string }>();
  const navigate     = useNavigate();

  const [article,   setArticle]   = useState<Article | null>(null);
  const [comments,  setComments]  = useState<Comment[]>([]);
  const [related,   setRelated]   = useState<Article[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const art = await newsApi.getArticle(slug);
      setArticle(art);
      const [cms, allArts] = await Promise.allSettled([
        newsApi.getComments(art.id),
        newsApi.getArticles({ status: 'PUBLISHED', limit: 20 }),
      ]);
      setComments(cms.status === 'fulfilled' ? cms.value : []);
      if (allArts.status === 'fulfilled') {
        setRelated(allArts.value.data.filter(a => a.id !== art.id && a.category === art.category).slice(0, 3));
      }
    } catch {
      // Sprint 2 (de-mock): unknown slug or unreachable API → back to the news hub.
      navigate('/news');
      return;
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  // Reading progress bar
  useEffect(() => {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-border/20 z-50">
          <div id="reading-progress" className="h-full bg-accent transition-all duration-100" style={{ width: '0%' }} />
        </div>
        <div className="container py-10 max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 w-24 rounded bg-white/[0.06]" />
          <div className="aspect-[16/9] rounded-2xl bg-white/[0.05]" />
          <div className="space-y-3">
            <div className="h-8 rounded bg-white/[0.06]" />
            <div className="h-8 w-3/4 rounded bg-white/[0.06]" />
            <div className="h-4 w-1/2 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-border/20 z-50">
        <div id="reading-progress" className="h-full bg-accent transition-all duration-100" style={{ width: '0%' }} />
      </div>

      {/* Hero media — video takes precedence over the static cover image */}
      {article.videoUrl ? (
        <div className="relative w-full aspect-video bg-black">
          {toEmbedUrl(article.videoUrl) ? (
            <iframe
              src={toEmbedUrl(article.videoUrl)!}
              title={article.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <video src={article.videoUrl} controls poster={article.videoThumbnail ?? article.imageUrl} className="w-full h-full object-contain" />
          )}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />
        </div>
      ) : article.imageUrl && (
        <div className="relative w-full aspect-[21/8] overflow-hidden">
          <img src={article.imageUrl} alt={article.title}
            className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />
        </div>
      )}

      <div className="container max-w-3xl mx-auto px-4 pb-16">
        <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>

          {/* Back */}
          <div className="flex items-center justify-between py-5">
            <Link to="/news"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Toutes les actualités
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookmarked(v => !v)}
                className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${bookmarked ? 'bg-accent/15 border-accent/30 text-accent' : 'bg-white/[0.04] border-border/40 text-muted-foreground hover:text-foreground'}`}
                title={bookmarked ? 'Retiré des favoris' : 'Sauvegarder'}
              >
                <Bookmark className="h-3.5 w-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
              <ShareBar title={article.title} />
            </div>
          </div>

          {/* Category + tags */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <CategoryBadge category={article.category} />
            {article.tags.map(tag => (
              <span key={tag} className="text-[10px] text-muted-foreground/40 uppercase tracking-wide">· {tag}</span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-tight mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base text-muted-foreground/70 leading-relaxed mb-6 border-l-2 border-accent/50 pl-4">
            {article.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between flex-wrap gap-3 py-4 border-y border-border/30 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-muted-foreground/70 shrink-0">
                {article.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/80">{article.author.name}</p>
                <p className="text-[10px] text-muted-foreground/40">{article.author.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground/40">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(article.publishedAt)}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{article.readingTime} min de lecture</span>
              {article.views && <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{article.views.toLocaleString('fr-FR')} vues</span>}
              <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />{article.commentsCount}</span>
            </div>
          </div>

          {/* Article body */}
          <div
            className="
              prose prose-invert max-w-none
              prose-p:text-foreground/75 prose-p:leading-relaxed prose-p:text-[15px]
              prose-h2:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-3
              prose-strong:text-foreground prose-strong:font-bold
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-ul:text-foreground/75 prose-li:text-[15px]
              prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground/70
              [&_img]:rounded-xl [&_img]:border [&_img]:border-border/30
              [&_video]:rounded-xl [&_video]:w-full [&_video]:border [&_video]:border-border/30
            "
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Photo gallery */}
          {article.gallery && article.gallery.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border/30">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 mb-4">
                Galerie photo
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {article.gallery.map(src => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-border/30 aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags footer */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border/30">
              {article.tags.map(tag => (
                <Link key={tag} to={`/news?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-white/[0.05] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/70 transition-all">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Comments */}
          <CommentsSection
            articleId={article.id}
            initialComments={comments}
          />
        </motion.article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border/30">
            <h3 className="text-lg font-display font-bold text-foreground mb-5">
              Articles similaires
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
      <ExploreRail entity={{
        matchId: (article as { relatedMatchId?: string | number } | null)?.relatedMatchId != null
          ? Number((article as { relatedMatchId?: string | number }).relatedMatchId) : undefined,
        clubId: (article as { relatedClubIds?: (string | number)[] } | null)?.relatedClubIds?.[0] != null
          ? Number((article as { relatedClubIds?: (string | number)[] }).relatedClubIds![0]) : undefined,
      }} />
    </div>
  );
}