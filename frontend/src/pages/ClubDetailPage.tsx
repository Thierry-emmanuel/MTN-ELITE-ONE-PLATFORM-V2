import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExploreRail } from '@/components/elite/ExploreRail';
import { ArrowLeft, Shield } from 'lucide-react';
import { useClub, useClubSquad, useClubMatches, useClubCoaches, useStandings, useClubStats } from '@/hooks/useFootball';
import { SEASON_KEY } from '@/services/season';
import { getClubHubProfile } from '@/services/clubHubData';
import PageLayout from '@/layout/PageLayout';
import {
  ClubHero,
  ClubSectionNav,
  ClubSection,
  ClubIdentity,
  ClubSeasonOverview,
  ClubSquad,
  ClubRoadToLions,
  ClubTrophyRoom,
  ClubLegends,
  ClubTimeline,
  ClubHistoricSeasons,
  ClubRecords,
  ClubAcademy,
  ClubGallery,
  ClubNews,
  ClubSocialBar,
  type ClubSectionMeta,
} from '@/components/elite/club';

const SECTIONS: ClubSectionMeta[] = [
  { id: 'identite',    label: 'Identité' },
  { id: 'saison',      label: 'Saison' },
  { id: 'effectif',    label: 'Effectif' },
  { id: 'lions',       label: 'Route vers les Lions' },
  { id: 'trophees',    label: 'Trophées' },
  { id: 'legendes',    label: 'Légendes' },
  { id: 'chronologie', label: 'Chronologie' },
  { id: 'saisons',     label: 'Saisons Historiques' },
  { id: 'records',     label: 'Records' },
  { id: 'academie',    label: 'Académie' },
  { id: 'actualites',  label: 'Actualités' },
  { id: 'galerie',     label: 'Galerie' },
];

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clubId = id || '';

  const { data: club,      isLoading: clubLoading }     = useClub(clubId);
  const { data: squad,     isLoading: squadLoading }    = useClubSquad(clubId);
  const { data: matches,   isLoading: matchesLoading }  = useClubMatches(clubId);
  const { data: coaches }  = useClubCoaches(clubId);
  const { data: standings, isLoading: standingsLoading } = useStandings();
  const { data: clubStats, isLoading: statsLoading }    = useClubStats(SEASON_KEY);

  const clubStanding = useMemo(
    () => standings?.find(s => s.club.id === clubId),
    [standings, clubId],
  );
  const clubStat = useMemo(
    () => clubStats?.find(s => s.clubId === clubId),
    [clubStats, clubId],
  );

  const hub = useMemo(() => (club ? getClubHubProfile(club) : undefined), [club]);
  const seasonLoading = matchesLoading || standingsLoading || statsLoading;

  if (clubLoading) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4" style={{ background: '#06090a' }}>
          <div className="h-10 w-10 border-2 border-[#FCD116] border-t-transparent animate-spin rounded-full" />
          <span className="text-[10px] text-white/40 uppercase tracking-[0.28em]">Ouverture de la galerie…</span>
        </div>
      </PageLayout>
    );
  }

  if (!club || !hub) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 p-4 text-center" style={{ background: '#06090a' }}>
          <Shield className="h-14 w-14 text-white/20 mb-2" />
          <h2 className="font-serif italic text-2xl text-white">Cette galerie n'existe pas</h2>
          <p className="text-sm text-white/40 max-w-sm">Le club recherché est introuvable dans le musée MTN Elite One.</p>
          <Link to="/clubs" className="text-[#FCD116] hover:underline mt-2 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la galerie des clubs
          </Link>
        </div>
      </PageLayout>
    );
  }

  const primary = club.color || '#FCD116';

  return (
    <PageLayout>
      <div className="container py-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-white/[0.04] bg-white/[0.01] text-xs">
        <Link to="/" className="text-white/40 hover:text-[#FCD116] flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Accueil
        </Link>
        <Link to="/clubs" className="text-white/40 hover:text-[#FCD116] flex items-center gap-1">
          Clubs
        </Link>
      </div>

      <ClubHero club={club} standing={clubStanding} />
      <ClubSectionNav sections={SECTIONS} accentColor={primary} />

      <ClubSection id="identite">
        <ClubIdentity club={club} identity={hub.identity} headCoach={coaches?.[0]} />
      </ClubSection>

      <ClubSection id="saison" tone="corridor">
        <ClubSeasonOverview
          club={club}
          standing={clubStanding}
          matches={matches}
          clubStat={clubStat}
          seasonObjective={hub.identity.seasonObjective}
          isLoading={seasonLoading}
        />
      </ClubSection>

      <ClubSection id="effectif">
        <ClubSquad club={club} squad={squad} isLoading={squadLoading} />
      </ClubSection>

      <ClubSection id="lions" tone="corridor">
        <ClubRoadToLions club={club} callUps={hub.lionsCallUps} />
      </ClubSection>

      <ClubSection id="trophees">
        <ClubTrophyRoom club={club} trophies={hub.trophies} />
      </ClubSection>

      <ClubSection id="legendes" tone="corridor">
        <ClubLegends club={club} legends={hub.legends} />
      </ClubSection>

      <ClubSection id="chronologie">
        <ClubTimeline club={club} events={hub.timeline} />
      </ClubSection>

      <ClubSection id="saisons" tone="corridor">
        <ClubHistoricSeasons club={club} seasons={hub.historicSeasons} />
      </ClubSection>

      <ClubSection id="records">
        <ClubRecords club={club} records={hub.records} />
      </ClubSection>

      <ClubSection id="academie" tone="corridor">
        <ClubAcademy club={club} prospects={hub.academy} />
      </ClubSection>

      <ClubSection id="actualites">
        <ClubNews club={club} />
      </ClubSection>

      <ClubSection id="galerie" tone="corridor">
        <ClubGallery club={club} />
        <div className="mt-10">
          <ClubSocialBar club={club} />
        </div>
      </ClubSection>
      <ExploreRail entity={{ clubId: Number(id) }} />
    </PageLayout>
  );
}

