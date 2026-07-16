import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Images, Play, Newspaper } from 'lucide-react';
import { useArticles } from '@/hooks/useNews';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { CATEGORY_META } from '@/types/news.types';
import type { Article } from '@/types/news.types';

type MediaTab = 'videos' | 'gallery';

const TABS: { id: MediaTab; label: string; icon: typeof Film }[] = [
  { id: 'videos', label: 'Vidéos', icon: Film },
  { id: 'gallery', label: 'Galerie photo', icon: Images },
];

// ─── Video card ────────────────────────────────────────────────────────────────
const VideoCard = ({ article, index }: { article: Article; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04 }}
  >
    <Link to={`/news/${article.slug}`} className="group block">
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/40 bg-white/[0.03]">
        {article.videoThumbnail || article.imageUrl ? (
          <img
            src={article.videoThumbnail ?? article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-12 w-12 rounded-full bg-black/50 border border-white/30 grid place-items-center group-hover:bg-accent/90 group-hover:border-accent transition-all">
            <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
        <span
          className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm"
          style={{ color: CATEGORY_META[article.category]?.color, backgroundColor: CATEGORY_META[article.category]?.bg }}
        >
          {CATEGORY_META[article.category]?.label ?? article.category}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
        {article.title}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground/50">{article.readingTime} min · {article.author?.name}</p>
    </Link>
  </motion.div>
);

// ─── Gallery image ─────────────────────────────────────────────────────────────
const GalleryTile = ({
  src, title, href, index,
}: { src: string; title: string; href: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.025 }}
  >
    <Link to={href} className="group block relative aspect-square rounded-xl overflow-hidden border border-border/40 bg-white/[0.03]">
      <img src={src} alt={title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="absolute bottom-2 left-2 right-2 text-[10.5px] font-medium text-white line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {title}
      </p>
    </Link>
  </motion.div>
);

// ─── MediaPage ───────────────────────────────────────────────────────────────
export default function MediaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<MediaTab>(tabParam === 'gallery' ? 'gallery' : 'videos');

  const { data: articles = [], isLoading } = useArticles({ status: 'PUBLISHED', limit: 100 });

  const videoArticles = useMemo(() => articles.filter((a) => !!a.videoUrl), [articles]);
  const galleryImages = useMemo(
    () =>
      articles
        .filter((a) => a.gallery && a.gallery.length > 0)
        .flatMap((a) => (a.gallery ?? []).map((src, i) => ({ src, article: a, key: `${a.id}-${i}` }))),
    [articles],
  );

  const setTabAndUrl = (t: MediaTab) => {
    setTab(t);
    setSearchParams({ tab: t }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="MTN Elite One · Média"
        title="Centre Média"
        subtitle="Images, vidéos et archives visuelles du championnat"
        accentColor="gold"
      />

      <div className="container py-6 lg:py-10 space-y-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border/30 pb-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTabAndUrl(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                tab === id
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                {id === 'videos' ? videoArticles.length : galleryImages.length}
              </span>
            </button>
          ))}
          <Link
            to="/news"
            className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-accent transition-colors"
          >
            <Newspaper className="h-3.5 w-3.5" />
            Toutes les histoires
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : tab === 'videos' ? (
          videoArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoArticles.map((a, i) => (
                <VideoCard key={a.id} article={a} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Film} label="Aucune vidéo publiée pour le moment" />
          )
        ) : galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {galleryImages.map(({ src, article, key }, i) => (
              <GalleryTile key={key} src={src} title={article.title} href={`/news/${article.slug}`} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Images} label="Aucune galerie publiée pour le moment" />
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ icon: Icon, label }: { icon: typeof Film; label: string }) => (
  <div className="flex flex-col items-center gap-3 py-20 text-center">
    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-border/30 grid place-items-center">
      <Icon className="h-6 w-6 text-muted-foreground/30" />
    </div>
    <p className="text-sm text-muted-foreground/50">{label}</p>
  </div>
);
