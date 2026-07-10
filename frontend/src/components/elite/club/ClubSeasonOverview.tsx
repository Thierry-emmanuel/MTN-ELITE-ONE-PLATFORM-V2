import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Target as TargetIcon, Flag } from 'lucide-react';
import { SectionHeading, Reveal, VitrinePanel } from './ClubSectionShell';
import { ClubLogo, FormIndicator } from '@/components/ui/football';
import { formatKickoffDate, formatKickoff } from '@/utils/football.utils';
import type { Club, Standing, Match, ClubStat } from '@/types/football.types';

interface ClubSeasonOverviewProps {
  club: Club;
  standing?: Standing;
  matches?: Match[];
  clubStat?: ClubStat;
  seasonObjective?: string;
  isLoading: boolean;
}

/**
 * The season at a glance — where the club stands right now, how it's
 * trending, what's next, what just happened, and what it's chasing.
 */
export const ClubSeasonOverview = memo(({ club, standing, matches, clubStat, seasonObjective, isLoading }: ClubSeasonOverviewProps) => {
  const primary = club.color || '#FCD116';

  const { next, last } = useMemo(() => {
    const all = matches ?? [];
    const scheduled = all.filter(m => m.status !== 'FT' && m.status !== 'FINISHED')
      .sort((a, b) => +new Date(a.kickoffUtc) - +new Date(b.kickoffUtc));
    const finished = all.filter(m => m.status === 'FT' || m.status === 'FINISHED')
      .sort((a, b) => +new Date(b.kickoffUtc) - +new Date(a.kickoffUtc));
    return { next: scheduled[0], last: finished[0] };
  }, [matches]);

  return (
    <>
      <SectionHeading
        icon={Activity}
        room="Salle 02"
        title="Saison en cours"
        subtitle="Classement, dynamique du moment et rendez-vous à venir."
        accentColor={primary}
        action={
          <Link to="/standings" className="text-xs font-bold flex items-center gap-1 hover:text-accent transition-colors">
            Classement complet <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Position + form */}
          <Reveal>
            <VitrinePanel className="p-6 h-full flex flex-col justify-between" accentColor={primary}>
              <div>
                <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40">Position</span>
                <div className="font-display text-5xl font-black text-white mt-1">
                  {standing ? `#${standing.position}` : '—'}
                </div>
                {standing && <p className="text-xs text-white/50 mt-1">{standing.points} points · {standing.played} matchs joués</p>}
              </div>
              {standing?.formGuide && standing.formGuide.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/35 mb-2 block">Forme récente</span>
                  <div className="flex gap-1">
                    {standing.formGuide.slice(-5).map((f, i) => <FormIndicator key={i} result={f} />)}
                  </div>
                </div>
              )}
            </VitrinePanel>
          </Reveal>

          {/* Next match */}
          <Reveal delay={0.06}>
            <VitrinePanel className="p-6 h-full">
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40 mb-3 block">Prochain match</span>
              {next ? (
                <Link to={`/matches/${next.id}`} className="block group">
                  <div className="flex items-center gap-3 mb-3">
                    <ClubLogo club={next.homeClub.id === club.id ? next.awayClub : next.homeClub} size={36} />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white group-hover:text-accent transition-colors truncate">
                        {next.homeClub.id === club.id ? 'vs' : '@'} {next.homeClub.id === club.id ? next.awayClub.name : next.homeClub.name}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">{formatKickoffDate(next.kickoffUtc)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/50">{formatKickoff(next.kickoffUtc)}{next.venue ? ` · ${next.venue.name}` : ''}</div>
                </Link>
              ) : (
                <p className="text-xs text-white/40">Aucun match programmé.</p>
              )}
            </VitrinePanel>
          </Reveal>

          {/* Last match */}
          <Reveal delay={0.12}>
            <VitrinePanel className="p-6 h-full">
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40 mb-3 block">Dernier match</span>
              {last ? (
                <Link to={`/matches/${last.id}`} className="block group">
                  <div className="flex items-center gap-3 mb-3">
                    <ClubLogo club={last.homeClub.id === club.id ? last.awayClub : last.homeClub} size={36} />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white group-hover:text-accent transition-colors truncate">
                        {last.homeClub.id === club.id ? 'vs' : '@'} {last.homeClub.id === club.id ? last.awayClub.name : last.homeClub.name}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">{formatKickoffDate(last.kickoffUtc)}</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold px-2.5 py-1 border border-white/10 bg-white/5 inline-block">
                    {last.homeClub.id === club.id ? `${last.homeScore} - ${last.awayScore}` : `${last.awayScore} - ${last.homeScore}`}
                  </span>
                </Link>
              ) : (
                <p className="text-xs text-white/40">Aucun résultat disponible.</p>
              )}
            </VitrinePanel>
          </Reveal>

          {/* Season objective */}
          <Reveal delay={0.18}>
            <VitrinePanel className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <Flag className="h-3.5 w-3.5" style={{ color: primary }} />
                <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40">Objectif de la saison</span>
              </div>
              <p className="font-serif text-sm text-white/80 leading-relaxed">
                {seasonObjective ?? 'Confirmer la progression collective et viser le haut de tableau.'}
              </p>
            </VitrinePanel>
          </Reveal>
        </div>
      )}

      {/* Season stat strip */}
      {clubStat && (
        <Reveal delay={0.22}>
          <div className="mt-5 border border-white/10 bg-white/[0.015] p-5">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TargetIcon className="h-3.5 w-3.5 text-white/30" />
              Statistiques de la saison
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Buts marqués', value: clubStat.goalsFor },
                { label: 'Buts encaissés', value: clubStat.goalsAgainst },
                { label: 'Clean sheets', value: clubStat.cleanSheets },
                { label: 'Possession moy.', value: clubStat.possession ? `${clubStat.possession}%` : '—' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-xl font-black text-white">{s.value}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wide mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </>
  );
});
ClubSeasonOverview.displayName = 'ClubSeasonOverview';
