import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Activity, ShieldAlert, Goal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMatch } from '@/hooks/useFootball';
import PageLayout from '@/layout/PageLayout';
import { ClubLogo, MatchStatusChip } from '@/components/ui/football';
import { formatKickoffDate, formatKickoff } from '@/utils/football.utils';
import type { MatchEvent } from '@/types/football.types';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const matchId = id || '';

  const { data: match, isLoading } = useMatch(matchId);

  // Group events for timeline
  const timelineEvents = useMemo(() => {
    if (!match?.events) return [];
    return [...match.events].sort((a, b) => a.minute - b.minute);
  }, [match]);

  const homeEvents = timelineEvents.filter(e => e.clubId === match?.homeClub.id);
  const awayEvents = timelineEvents.filter(e => e.clubId === match?.awayClub.id);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background">
          <div className="h-10 w-10 border-2 border-accent border-t-transparent animate-spin rounded-full" />
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.28em]">Chargement du match…</span>
        </div>
      </PageLayout>
    );
  }

  if (!match) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 p-4 text-center bg-background">
          <Activity className="h-14 w-14 text-white/20 mb-2" />
          <h2 className="font-serif italic text-2xl text-foreground">Match introuvable</h2>
          <p className="text-sm text-muted-foreground/40 max-w-sm">Le match demandé n'existe pas ou a été supprimé.</p>
          <Link to="/fixtures" className="text-accent hover:underline mt-2 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour au calendrier
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isPlayed = match.status === 'FT' || match.status === 'FINISHED';
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  return (
    <PageLayout>
      <div className="container py-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-white/[0.04] bg-white/[0.01] text-xs">
        <Link to="/" className="text-muted-foreground/40 hover:text-accent flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Accueil
        </Link>
        <Link to={isPlayed ? "/results" : "/fixtures"} className="text-muted-foreground/40 hover:text-accent flex items-center gap-1">
          {isPlayed ? 'Résultats' : 'Calendrier'}
        </Link>
      </div>

      {/* ── Match Header ── */}
      <section className="relative py-12 lg:py-16 bg-surface overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-surface z-0" />
        <div className="container relative z-10 flex flex-col items-center">
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Journée {match.round}
            </span>
            {(isLive || !isPlayed) && (
               <MatchStatusChip status={match.status} minute={match.liveMinute} />
            )}
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-16 w-full max-w-3xl">
            {/* Home Club */}
            <div className="flex flex-col items-center gap-4 flex-1">
              <ClubLogo club={match.homeClub} size={80} className="md:w-28 md:h-28 drop-shadow-2xl" />
              <h2 className="text-lg md:text-2xl font-display font-black text-center text-foreground uppercase tracking-wide">
                <Link to={`/clubs/${match.homeClub.id}`} className="hover:text-accent transition-colors">
                  {match.homeClub.name}
                </Link>
              </h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center px-4">
              {isPlayed || isLive ? (
                <div className="flex items-center gap-4 text-5xl md:text-7xl font-mono font-black text-foreground drop-shadow-lg">
                  <span>{match.homeScore}</span>
                  <span className="text-muted-foreground/20 text-4xl">-</span>
                  <span>{match.awayScore}</span>
                </div>
              ) : (
                <div className="text-2xl md:text-4xl font-display font-bold text-muted-foreground/40 uppercase tracking-widest">
                  VS
                </div>
              )}
              {isPlayed && (
                <span className="mt-4 text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                  Terminé
                </span>
              )}
            </div>

            {/* Away Club */}
            <div className="flex flex-col items-center gap-4 flex-1">
              <ClubLogo club={match.awayClub} size={80} className="md:w-28 md:h-28 drop-shadow-2xl" />
              <h2 className="text-lg md:text-2xl font-display font-black text-center text-foreground uppercase tracking-wide">
                <Link to={`/clubs/${match.awayClub.id}`} className="hover:text-accent transition-colors">
                  {match.awayClub.name}
                </Link>
              </h2>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/60 uppercase tracking-wider">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              {formatKickoffDate(match.kickoffUtc)} · {formatKickoff(match.kickoffUtc)}
            </div>
            {match.stadium && (
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {match.stadium}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Match Content ── */}
      <div className="container py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content (Timeline) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-surface-elevated rounded-2xl border border-border/60 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-6 flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                Chronologie du match
              </h3>
              
              {timelineEvents.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground/40">
                  Aucun événement enregistré pour ce match.
                </div>
              ) : (
                <div className="relative border-l-2 border-border/40 ml-4 space-y-6">
                  {timelineEvents.map((evt, idx) => {
                    const isHome = evt.clubId === match.homeClub.id;
                    return (
                      <motion.div 
                        key={evt.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`relative pl-6 ${!isHome ? 'flex-row-reverse pr-6' : ''}`}
                      >
                        {/* Dot */}
                        <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-accent ring-4 ring-surface-elevated" />
                        
                        <div className="flex items-start gap-4">
                          <span className="font-mono text-accent text-sm font-bold">
                            {evt.minute}'
                          </span>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {evt.type === 'GOAL' && <Goal className="h-4 w-4 text-emerald-400" />}
                              {evt.type === 'YELLOW_CARD' && <ShieldAlert className="h-4 w-4 text-yellow-400" />}
                              {evt.type === 'RED_CARD' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {isHome ? match.homeClub.name : match.awayClub.name}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              {evt.player?.firstName} {evt.player?.lastName}
                            </div>
                            {evt.detail && (
                              <div className="text-xs text-muted-foreground/60 mt-1">
                                {evt.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar (Lineups/Stats) */}
          <div className="space-y-8">
            <section className="bg-surface-elevated rounded-2xl border border-border/60 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-6">
                Statistiques
              </h3>
              <div className="py-12 text-center text-sm text-muted-foreground/40">
                Statistiques détaillées bientôt disponibles.
              </div>
            </section>
            
            <section className="bg-surface-elevated rounded-2xl border border-border/60 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-6">
                Compositions
              </h3>
              <div className="py-12 text-center text-sm text-muted-foreground/40">
                Feuilles de match en attente.
              </div>
            </section>
          </div>
          
        </div>
      </div>
    </PageLayout>
  );
}
