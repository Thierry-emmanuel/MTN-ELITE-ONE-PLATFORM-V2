import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Clock, ArrowRight } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { useArticles } from '@/hooks/useNews';
import type { Club } from '@/types/football.types';

interface ClubNewsProps {
  club: Club;
}

export const ClubNews = memo(({ club }: ClubNewsProps) => {
  const primary = club.color || '#FCD116';
  const { data: articles, isLoading } = useArticles();

  const clubArticles = useMemo(() => {
    if (!articles) return [];
    const needle = club.name.toLowerCase();
    const shortNeedle = club.short?.toLowerCase();
    const matches = articles.filter(a =>
      a.title.toLowerCase().includes(needle) ||
      a.tags?.some(t => t.toLowerCase().includes(needle) || (shortNeedle && t.toLowerCase().includes(shortNeedle))),
    );
    return (matches.length > 0 ? matches : articles).slice(0, 3);
  }, [articles, club.name, club.short]);

  return (
    <>
      <SectionHeading
        icon={Newspaper}
        room="Salle 10"
        title="Dernières Nouvelles"
        accentColor={primary}
        action={
          <Link to="/news" className="text-xs font-bold flex items-center gap-1 hover:text-accent transition-colors">
            Toute l'actualité <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 bg-white/5 animate-pulse" />)}
        </div>
      ) : clubArticles.length === 0 ? (
        <p className="text-sm text-white/40">Aucune actualité disponible pour ce club.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubArticles.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06}>
              <Link
                to={`/news/${a.slug}`}
                className="group block overflow-hidden border border-white/10 bg-white/[0.02] hover:border-white/25 transition-all"
              >
                {a.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img src={a.imageUrl} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {a.title}
                  </h4>
                  <p className="text-xs text-white/45 line-clamp-2">{a.excerpt}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/35 pt-1">
                    <Clock className="h-3 w-3" />
                    {a.readingTime} min de lecture
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
});
ClubNews.displayName = 'ClubNews';
