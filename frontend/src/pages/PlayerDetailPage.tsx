import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, User, BarChart2, History, Trophy, Repeat, TrendingUp, Images, Newspaper } from 'lucide-react';
import { usePlayerStats } from '@/hooks/useFootball';
import { useArticles } from '@/hooks/useNews';
import PageLayout from '@/layout/PageLayout';
import { getPlayerProfile } from '@/data/playerProfile.mock';
import { DEV_SEASON_ID } from '@/services/mockData';

import { PlayerProfileHero } from '@/components/elite/player-profile/PlayerProfileHero';
import { PlayerSubNav, type ProfileNavSection } from '@/components/elite/player-profile/PlayerSubNav';
import { OverviewSection } from '@/components/elite/player-profile/OverviewSection';
import { SeasonStatsSection } from '@/components/elite/player-profile/SeasonStatsSection';
import { CareerSection } from '@/components/elite/player-profile/CareerSection';
import { AchievementsSection } from '@/components/elite/player-profile/AchievementsSection';
import { TransfersInjuriesSection } from '@/components/elite/player-profile/TransfersInjuriesSection';
import { TrendsSection } from '@/components/elite/player-profile/TrendsSection';
import { GallerySection } from '@/components/elite/player-profile/GallerySection';
import { RelatedNewsSection } from '@/components/elite/player-profile/RelatedNewsSection';

const NAV_SECTIONS: ProfileNavSection[] = [
  { id: 'apercu', label: 'Aperçu', icon: User },
  { id: 'statistiques', label: 'Stats', icon: BarChart2 },
  { id: 'carriere', label: 'Carrière', icon: History },
  { id: 'palmares', label: 'Palmarès', icon: Trophy },
  { id: 'transferts', label: 'Transferts', icon: Repeat },
  { id: 'tendances', label: 'Tendances', icon: TrendingUp },
  { id: 'galerie', label: 'Galerie', icon: Images },
  { id: 'actualites', label: 'Actualités', icon: Newspaper },
];

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: allPlayers, isLoading } = usePlayerStats(DEV_SEASON_ID, { limit: 500 });
  const { data: articles } = useArticles();

  const baseStat = useMemo(
    () => allPlayers?.find(p => p.playerId === id),
    [allPlayers, id],
  );

  const player = useMemo(() => (baseStat ? getPlayerProfile(baseStat) : undefined), [baseStat]);

  const relatedPlayers = useMemo(() => {
    if (!player || !allPlayers) return [];
    return allPlayers
      .filter(p => p.playerId !== player.playerId && p.position === player.position)
      .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
      .slice(0, 5);
  }, [player, allPlayers]);

  const relatedArticles = useMemo(() => {
    if (!articles) return [];
    if (!player) return articles.slice(0, 4);
    const nameMatch = articles.filter(a =>
      a.title.toLowerCase().includes(player.playerName.toLowerCase().split(' ')[0]) ||
      a.tags?.some(t => t.toLowerCase().includes(player.clubName.toLowerCase())),
    );
    const rest = articles.filter(a => !nameMatch.includes(a));
    return [...nameMatch, ...rest].slice(0, 4);
  }, [articles, player]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground mt-4 uppercase tracking-widest">Chargement du joueur...</span>
        </div>
      </PageLayout>
    );
  }

  if (!player) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <Shield className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Joueur introuvable</h2>
          <Link to="/players" className="text-accent hover:underline mt-2 text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour aux joueurs
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-border/30 bg-surface-elevated/20 text-xs">
        <Link to="/" className="text-muted-foreground hover:text-accent flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Accueil
        </Link>
        <Link to="/stats" className="text-muted-foreground hover:text-accent flex items-center gap-1">
          Stats
        </Link>
        <Link to="/players" className="text-muted-foreground hover:text-accent flex items-center gap-1">
          Joueurs
        </Link>
      </div>

      <PlayerProfileHero player={player} />
      <PlayerSubNav sections={NAV_SECTIONS} />

      <OverviewSection player={player} />
      <SeasonStatsSection player={player} />
      <CareerSection player={player} />
      <AchievementsSection player={player} />
      <TransfersInjuriesSection player={player} />
      <TrendsSection player={player} />
      <GallerySection player={player} />
      <RelatedNewsSection player={player} articles={relatedArticles} relatedPlayers={relatedPlayers} />
    </PageLayout>
  );
}
