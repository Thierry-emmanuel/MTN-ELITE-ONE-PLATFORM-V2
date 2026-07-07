import { Link } from 'react-router-dom';
import { Newspaper, Users, ArrowRight } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type { Article } from '@/types/news.types';
import type { PlayerStat } from '@/types/football.types';
import { ArticleCard } from '@/components/elite/news/ArticleCard';
import { PlayerAvatar } from '@/components/elite/PlayerAvatar';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { RatingBadge } from '@/components/elite/stats/RatingBadge';
import { clubs } from '@/components/elite/data';
import { computeRating } from '@/lib/statsRating';
import { POSITION_LABEL } from '@/data/playerProfile.mock';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
  articles: Article[];
  relatedPlayers: PlayerStat[];
}

export function RelatedNewsSection({ player, articles, relatedPlayers }: Props) {
  return (
    <section id="actualites" className="scroll-mt-32 py-10 sm:py-12">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Latest news */}
          <div className="lg:col-span-3">
            <SectionHeading
              icon={Newspaper}
              title="Actualités"
              subtitle={`Les dernières news autour de ${player.playerName}`}
              action={
                <Link to="/news" className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent/80 flex items-center gap-1 shrink-0">
                  Tout voir <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
            <div className="bg-gradient-card border border-border rounded-2xl divide-y divide-white/[0.05] overflow-hidden">
              {articles.length === 0 && (
                <p className="text-sm text-muted-foreground p-6">Aucune actualité récente pour ce joueur.</p>
              )}
              {articles.map((a, i) => (
                <div key={a.id} className="px-2">
                  <ArticleCard article={a} index={i} variant="compact" />
                </div>
              ))}
            </div>
          </div>

          {/* Related players */}
          <div className="lg:col-span-2">
            <SectionHeading icon={Users} title="Joueurs similaires" subtitle={POSITION_LABEL[player.position]} />
            <div className="space-y-2.5">
              {relatedPlayers.map(rp => {
                const club = clubs[rp.clubId];
                const rating = computeRating(rp);
                return (
                  <Link
                    key={rp.playerId}
                    to={`/players/${rp.playerId}`}
                    className="flex items-center gap-3 bg-gradient-card border border-border rounded-xl p-3 hover:border-white/20 hover:-translate-y-0.5 transition-all"
                  >
                    <PlayerAvatar name={rp.playerName} photoUrl={rp.photoUrl} size={38} ring={club?.color} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground truncate">{rp.playerName}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                        {club && <ClubBadge club={club} size={14} />}
                        {club?.name ?? rp.clubName}
                      </div>
                    </div>
                    <RatingBadge rating={rating} size="sm" />
                  </Link>
                );
              })}
              {relatedPlayers.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun joueur similaire trouvé.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
