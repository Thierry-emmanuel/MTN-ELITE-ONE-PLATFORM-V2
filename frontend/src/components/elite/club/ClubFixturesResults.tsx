import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { ClubLogo, MatchStatusChip } from '@/components/ui/football';
import { formatKickoffDate, formatKickoff } from '@/utils/football.utils';
import type { Club, Match } from '@/types/football.types';

interface ClubFixturesResultsProps {
  club: Club;
  matches?: Match[];
  isLoading: boolean;
}

export const ClubFixturesResults = memo(({ club, matches, isLoading }: ClubFixturesResultsProps) => {
  const primary = club.color || '#FCD116';

  const { upcoming, recent } = useMemo(() => {
    const all = matches ?? [];
    const finished = all.filter(m => m.status === 'FT' || m.status === 'FINISHED')
      .sort((a, b) => +new Date(b.kickoffUtc) - +new Date(a.kickoffUtc));
    const scheduled = all.filter(m => m.status !== 'FT' && m.status !== 'FINISHED')
      .sort((a, b) => +new Date(a.kickoffUtc) - +new Date(b.kickoffUtc));
    return { upcoming: scheduled.slice(0, 4), recent: finished.slice(0, 4) };
  }, [matches]);

  return (
    <>
      <SectionHeading
        icon={CalendarDays}
        room="Salle 05"
        title="Calendrier & Résultats"
        accentColor={primary}
        action={
          <span className="text-xs text-white/40 flex items-center gap-1 hover:text-white transition-colors cursor-default">
            Saison en cours <ArrowRight className="h-3 w-3" />
          </span>
        }
      />

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[0, 1].map(i => (
            <div key={i} className="space-y-3">
              {[0, 1].map(j => <div key={j} className="h-16 bg-white/5 animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Prochains matchs</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-white/40">Aucun match à venir.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((m, idx) => (
                  <Reveal key={m.id} delay={idx * 0.04}>
                    <MatchRow club={club} match={m} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* Recent results */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Résultats récents</h3>
            {recent.length === 0 ? (
              <p className="text-xs text-white/40">Aucun résultat disponible.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((m, idx) => (
                  <Reveal key={m.id} delay={idx * 0.04}>
                    <MatchRow club={club} match={m} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
ClubFixturesResults.displayName = 'ClubFixturesResults';

const MatchRow = memo(({ club, match }: { club: Club; match: Match }) => {
  const isHome = match.homeClub.id === club.id;
  const opponent = isHome ? match.awayClub : match.homeClub;
  const played = match.status === 'FT' || match.status === 'FINISHED';

  return (
    <Link 
      to={`/matches/${match.id}`}
      className="flex items-center justify-between gap-3 p-4 bg-white/[0.02] border border-white/10 hover:border-white/25 transition-all relative group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <ClubLogo club={opponent} size={32} />
        <div className="min-w-0">
          <div className="text-sm font-bold truncate group-hover:text-accent transition-colors">
            {isHome ? 'vs' : '@'} {opponent.name}
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide">
            {formatKickoffDate(match.kickoffUtc)} · {formatKickoff(match.kickoffUtc)}
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {played ? (
          <span className="font-mono text-sm font-bold px-2.5 py-1 border border-white/10 bg-white/5">
            {isHome ? `${match.homeScore} - ${match.awayScore}` : `${match.awayScore} - ${match.homeScore}`}
          </span>
        ) : (
          <MatchStatusChip status={match.status} minute={match.liveMinute} />
        )}
      </div>
    </Link>
  );
});
MatchRow.displayName = 'MatchRow';
