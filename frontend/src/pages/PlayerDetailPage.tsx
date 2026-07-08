import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, User, BarChart2, History, Trophy, Repeat, TrendingUp, Images, Newspaper } from 'lucide-react';
import { usePlayerStats, usePlayer } from '@/hooks/useFootball';
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
import type { PlayerStat } from '@/types/football.types';

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

/** Convert a raw backend Player entity to the PlayerStat shape getPlayerProfile expects */
function normalizeBackendPlayer(p: any): PlayerStat {
  const clubStats = (p.stats ?? []).reduce((acc: any, s: any) => ({
    goals:        (acc.goals        ?? 0) + (s.goals        ?? 0),
    assists:      (acc.assists      ?? 0) + (s.assists      ?? 0),
    appearances:  (acc.appearances  ?? 0) + (s.appearances  ?? 0),
    yellowCards:  (acc.yellowCards  ?? 0) + (s.yellowCards  ?? 0),
    redCards:     (acc.redCards     ?? 0) + (s.redCards     ?? 0),
    cleanSheets:  (acc.cleanSheets  ?? 0) + (s.cleanSheets  ?? 0),
    minutesPlayed:(acc.minutesPlayed?? 0) + (s.minutesPlayed?? 0),
  }), {});

  const age = p.birthDate
    ? Math.floor((Date.now() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : undefined;

  return {
    playerId:     String(p.id),
    playerName:   [p.firstName, p.lastName].filter(Boolean).join(' ') || '—',
    position:     p.position ?? 'MF',
    clubId:       String(p.club?.id ?? p.clubId ?? ''),
    clubName:     p.club?.name ?? p.clubName ?? '',
    age,
    goals:        p.careerGoals        ?? clubStats.goals        ?? 0,
    assists:      p.careerAssists      ?? clubStats.assists      ?? 0,
    appearances:  p.careerAppearances  ?? clubStats.appearances  ?? 0,
    yellowCards:  clubStats.yellowCards  ?? 0,
    redCards:     clubStats.redCards     ?? 0,
    cleanSheets:  clubStats.cleanSheets  ?? 0,
    minutesPlayed: clubStats.minutesPlayed ?? 0,
    photoUrl:     p.photoUrl,
    nationality:  p.nationality,
  } as PlayerStat;
}

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: allPlayers, isLoading: statsLoading } = usePlayerStats(DEV_SEASON_ID, { limit: 500 });
  const { data: backendPlayer, isLoading: playerLoading } = usePlayer(id ?? '');
  const { data: articles } = useArticles();

  const isLoading = statsLoading || playerLoading;

  // Try stats array first (mock data uses playerId string),
  // then fall back to matching numeric id against player.id from backend stats
  const baseStat = useMemo(() => {
    if (!allPlayers) return undefined;
    return allPlayers.find(p => {
      const p_ = p as any;
      return (
        p.playerId === id ||
        String(p.playerId) === id ||
        String(p_.player?.id) === id ||
        String(p_.id) === id
      );
    });
  }, [allPlayers, id]);

  // If stats lookup failed but we have a direct backend player, normalize it
  const effectiveStat = useMemo<PlayerStat | undefined>(() => {
    if (baseStat) return baseStat;
    if (backendPlayer) return normalizeBackendPlayer(backendPlayer);
    return undefined;
  }, [baseStat, backendPlayer]);

  const player = useMemo(() => (effectiveStat ? getPlayerProfile(effectiveStat) : undefined), [effectiveStat]);

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
      a.title.toLowerCase().includes((player.playerName ?? '').toLowerCase().split(' ')[0]) ||
      a.tags?.some(t => t.toLowerCase().includes((player.clubName ?? '').toLowerCase())),
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
