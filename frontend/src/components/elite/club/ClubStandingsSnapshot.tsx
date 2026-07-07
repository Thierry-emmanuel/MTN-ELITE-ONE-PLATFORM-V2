import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ListOrdered, ArrowRight } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { ClubLogo, FormIndicator } from '@/components/ui/football';
import { getZone } from '@/utils/football.utils';
import type { Club, Standing } from '@/types/football.types';

interface ClubStandingsSnapshotProps {
  club: Club;
  standings?: Standing[];
  isLoading: boolean;
}

export const ClubStandingsSnapshot = memo(({ club, standings, isLoading }: ClubStandingsSnapshotProps) => {
  const primary = club.color || '#FCD116';

  const { window, total } = useMemo(() => {
    if (!standings || standings.length === 0) return { window: [], total: 0 };
    const sorted = [...standings].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex(s => s.club.id === club.id);
    if (idx === -1) return { window: sorted.slice(0, 5), total: sorted.length };
    const start = Math.max(0, idx - 2);
    const end = Math.min(sorted.length, start + 5);
    return { window: sorted.slice(start, end), total: sorted.length };
  }, [standings, club.id]);

  return (
    <>
      <SectionHeading
        icon={ListOrdered}
        room="Salle 06"
        title="Position au Classement"
        accentColor={primary}
        action={
          <Link to="/standings" className="text-xs font-bold flex items-center gap-1 hover:text-accent transition-colors">
            Classement complet <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="h-64 bg-white/5 animate-pulse" />
      ) : window.length === 0 ? (
        <p className="text-sm text-white/40">Classement indisponible pour le moment.</p>
      ) : (
        <Reveal>
          <div className="border border-white/10 overflow-hidden">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02] text-[9px] uppercase tracking-wider text-white/40 font-bold">
              <span className="w-8">#</span>
              <span className="flex-1">Club</span>
              <span className="w-8 text-center">J</span>
              <span className="w-8 text-center">V</span>
              <span className="w-8 text-center">N</span>
              <span className="w-8 text-center">D</span>
              <span className="w-10 text-center">+/-</span>
              <span className="w-10 text-center">Pts</span>
            </div>
            {window.map(row => {
              const isSelf = row.club.id === club.id;
              const zone = getZone(row.position, total);
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-2 px-4 py-3 border-b border-white/10 last:border-0 text-xs transition-colors ${
                    isSelf ? 'bg-white/[0.05]' : ''
                  } border-l-2 ${
                    zone === 'champion' ? 'border-l-accent' : zone === 'caf' ? 'border-l-primary' : zone === 'relegation' ? 'border-l-live' : 'border-l-transparent'
                  }`}
                >
                  <span className={`w-8 font-mono font-bold ${isSelf ? 'text-accent' : 'text-white/45'}`}>{row.position}</span>
                  <span className="flex-1 flex items-center gap-2 min-w-0">
                    <ClubLogo club={row.club} size={24} />
                    <span className={`truncate font-semibold ${isSelf ? 'text-white' : 'text-white/80'}`}>{row.club.name}</span>
                  </span>
                  <span className="w-8 text-center hidden sm:block text-white/45">{row.played}</span>
                  <span className="w-8 text-center hidden sm:block text-win">{row.won}</span>
                  <span className="w-8 text-center hidden sm:block text-draw">{row.drawn}</span>
                  <span className="w-8 text-center hidden sm:block text-live">{row.lost}</span>
                  <span className="w-10 text-center hidden sm:block font-semibold">{row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}</span>
                  <span className="w-10 text-center font-display font-black text-white">{row.points}</span>
                  <span className="hidden lg:flex gap-0.5 ml-2">
                    {row.formGuide.slice(-5).map((f, i) => <FormIndicator key={i} result={f} />)}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </>
  );
});
ClubStandingsSnapshot.displayName = 'ClubStandingsSnapshot';
