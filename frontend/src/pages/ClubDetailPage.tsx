import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useClub, useClubSquad, useClubMatches, useClubCoaches, useStandings, useClubStats } from '@/hooks/useFootball';
import { DEV_SEASON_ID } from '@/services/mockData';
import PageLayout from '@/layout/PageLayout';
import {
  ClubHero,
  ClubSectionNav,
  ClubSection,
  ClubOverview,
  ClubHistoryHonours,
  ClubSquad,
  ClubStaff,
  ClubFixturesResults,
  ClubStandingsSnapshot,
  ClubStatsPanel,
  ClubGallery,
  ClubVideos,
  ClubNews,
  ClubSocialBar,
  type ClubSectionMeta,
} from '@/components/elite/club';

const SECTIONS: ClubSectionMeta[] = [
  { id: 'apercu',       label: "Aperçu" },
  { id: 'histoire',     label: 'Histoire & Palmarès' },
  { id: 'effectif',     label: 'Effectif' },
  { id: 'staff',        label: 'Encadrement' },
  { id: 'calendrier',   label: 'Calendrier' },
  { id: 'classement',   label: 'Classement' },
  { id: 'stats',        label: 'Statistiques' },
  { id: 'galerie',      label: 'Galerie' },
  { id: 'videos',       label: 'Vidéos' },
  { id: 'actualites',   label: 'Actualités' },
];

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clubId = id || '';

  const { data: club,      isLoading: clubLoading }     = useClub(clubId);
  const { data: squad,     isLoading: squadLoading }    = useClubSquad(clubId);
  const { data: matches,   isLoading: matchesLoading }  = useClubMatches(clubId);
  const { data: coaches,   isLoading: coachesLoading }  = useClubCoaches(clubId);
  const { data: standings, isLoading: standingsLoading } = useStandings();
  const { data: clubStats, isLoading: statsLoading }    = useClubStats(DEV_SEASON_ID);

  const clubStanding = useMemo(
    () => standings?.find(s => s.club.id === clubId),
    [standings, clubId],
  );
  const clubStat = useMemo(
    () => clubStats?.find(s => s.clubId === clubId),
    [clubStats, clubId],
  );

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

  if (!club) {
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

      <ClubSection id="apercu">
        <ClubOverview club={club} />
      </ClubSection>

      <ClubSection id="histoire" tone="corridor">
        <ClubHistoryHonours club={club} />
      </ClubSection>

      <ClubSection id="effectif">
        <ClubSquad club={club} squad={squad} isLoading={squadLoading} />
      </ClubSection>

      <ClubSection id="staff" tone="corridor">
        <ClubStaff club={club} coaches={coaches} isLoading={coachesLoading} />
      </ClubSection>

      <ClubSection id="calendrier">
        <ClubFixturesResults club={club} matches={matches} isLoading={matchesLoading} />
      </ClubSection>

      <ClubSection id="classement" tone="corridor">
        <ClubStandingsSnapshot club={club} standings={standings} isLoading={standingsLoading} />
      </ClubSection>

      <ClubSection id="stats">
        <ClubStatsPanel club={club} clubStat={clubStat} isLoading={statsLoading} />
      </ClubSection>

      <ClubSection id="galerie" tone="corridor">
        <ClubGallery club={club} />
      </ClubSection>

      <ClubSection id="videos">
        <ClubVideos club={club} />
      </ClubSection>

      <ClubSection id="actualites" tone="corridor">
        <ClubNews club={club} />
        <div className="mt-10">
          <ClubSocialBar club={club} />
        </div>
      </ClubSection>
    </PageLayout>
  );
}
