import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Radio, RefreshCw,
  MapPin, User, ChevronDown, ChevronUp,
} from 'lucide-react';
import { footballApi as api } from "@/services/api";
import { MOCK_FIXTURES, DEV_SEASON_ID } from '../services/mockData';
import { filterMatchDays, extractRounds, extractClubs, formatKickoff, formatKickoffDate } from '../utils/football.utils';
import type { Match, MatchDay } from '../types/football.types';
import {
  ClubLogo, MatchStatusChip, FilterPill, PageHero,
  FixtureCardSkeleton, EmptyState, ErrorState,
  SummaryCard, MatchdayHeader, EventsTimeline,
} from '@/components/ui/football';
import { useFixtures } from '@/hooks/useFootball';

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

// ─── Fixture Card ─────────────────────────────────────────────────────────────
const FixtureCard = memo(({ match, index }: { match: Match; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  return (
    <motion.article
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-xl border overflow-hidden transition-all duration-300 ${
        isLive
          ? 'border-live/35 bg-live/[0.04] hover:border-live/55'
          : 'border-border bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      }`}
    >
      {isLive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-live" />}

      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Status row */}
        <div className="flex items-center justify-between text-[10px] mb-4">
          <span className="text-muted-foreground/50 uppercase tracking-wider">
            {formatKickoffDate(match.kickoffUtc)}
          </span>
          <MatchStatusChip status={match.status} minute={match.liveMinute} />
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
            <ClubLogo club={match.homeClub} size={40} />
            <span className="font-display text-[11px] leading-tight truncate w-full">{match.homeClub.name}</span>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            {match.homeScore !== null && match.awayScore !== null ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 font-mono font-bold text-amber-500 text-sm flex items-center gap-1 shadow-inner">
                <span>{match.homeScore}</span>
                <span className="text-stone-600">:</span>
                <span>{match.awayScore}</span>
              </div>
            ) : (
              <div className="text-[11px] font-mono font-semibold text-stone-400 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1">
                {formatKickoff(match.kickoffUtc)}
              </div>
            )}
            {isLive && match.liveMinute && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-wider animate-pulse">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                {match.liveMinute}'
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
            <ClubLogo club={match.awayClub} size={40} />
            <span className="font-display text-[11px] leading-tight truncate w-full">{match.awayClub.name}</span>
          </div>
        </div>

        {/* Micro-grid of events */}
        {match.events && match.events.length > 0 && (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mt-3 pt-2 border-t border-border/20 text-[9px] text-muted-foreground/60 font-mono">
            <div className="text-right space-y-0.5 min-w-0 truncate">
              {match.events.filter(e => e.clubId === match.homeClub.id).map(e => (
                <div key={e.id} className="truncate">
                  {e.playerName} ({e.minute}') {e.type === 'GOAL' || e.type === 'PENALTY_GOAL' ? '⚽' : e.type === 'YELLOW_CARD' ? '🟨' : e.type === 'RED_CARD' ? '🟥' : ''}
                </div>
              ))}
            </div>
            <div className="w-4" />
            <div className="text-left space-y-0.5 min-w-0 truncate">
              {match.events.filter(e => e.clubId === match.awayClub.id).map(e => (
                <div key={e.id} className="truncate">
                  {e.type === 'GOAL' || e.type === 'PENALTY_GOAL' ? '⚽' : e.type === 'YELLOW_CARD' ? '🟨' : e.type === 'RED_CARD' ? '🟥' : ''} {e.playerName} ({e.minute}')
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        {(match.venue || match.referee) && (
          <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/30 flex-wrap text-[10px] text-muted-foreground/40 uppercase tracking-wide">
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />{typeof match.venue === 'object' ? match.venue.name : match.venue}
              </span>
            )}
            {match.referee && (
              <span className="flex items-center gap-1">
                <User className="h-2.5 w-2.5" />{match.referee.name}
              </span>
            )}
            {match.events && match.events.length > 0 && (
              expanded
                ? <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                : <ChevronDown className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        )}
      </div>

      {/* Expandable events */}
      <AnimatePresence>
        {expanded && match.events && match.events.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/30 bg-white/[0.02] px-4"
          >
            <EventsTimeline events={match.events} homeClubId={match.homeClub.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
FixtureCard.displayName = 'FixtureCard';

// ─── Matchday group ────────────────────────────────────────────────────────────
const MatchdayGroup = memo(({ day, globalIndex }: { day: MatchDay; globalIndex: number }) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: globalIndex * 0.06 }}
    aria-label={`Journée ${day.round}`}
  >
    <MatchdayHeader round={day.round} date={day.date} matchCount={day.matches.length} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {day.matches.map((m, i) => (
        <FixtureCard key={m.id} match={m as Match} index={i} />
      ))}
    </div>
  </motion.section>
));
MatchdayGroup.displayName = 'MatchdayGroup';

// ─── Summary bar ─────────────────────────────────────────────────────────────
const FixturesSummary = memo(({ days }: { days: MatchDay[] }) => {
  const allMatches = days.flatMap(d => d.matches);
  const total      = allMatches.length;
  const liveCount  = allMatches.filter(m => m.status === 'LIVE' || m.status === 'HT').length;
  const rounds     = [...new Set(days.map(d => d.round))];
  const nextDate   = days[0]?.date
    ? new Date(days[0].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '—';
  const roundRange = rounds.length > 1
    ? `J${Math.min(...rounds)}–J${Math.max(...rounds)}`
    : `J${rounds[0] ?? '—'}`;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <SummaryCard
        label="Matchs à venir" value={total} delay={0}
        badge={liveCount > 0 ? (
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
            <span className="text-[9px] text-live font-bold uppercase">{liveCount} live</span>
          </div>
        ) : undefined}
      />
      <SummaryCard label="Prochaine date" value={nextDate} delay={0.07} />
      <SummaryCard label="Journées" value={roundRange} delay={0.14} />
    </div>
  );
});
FixturesSummary.displayName = 'FixturesSummary';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FixturesPage() {
  const { data: daysData, isLoading: loading } = useFixtures();
  const days = daysData ?? MOCK_FIXTURES;
  const [roundFilter, setRoundFilter] = useState<number | null>(null);
  const [clubFilter,  setClubFilter]  = useState<string | null>(null);
  const [search,      setSearch]      = useState('');

  const rounds = useMemo(() => extractRounds(days, 'asc'), [days]);
  const clubs  = useMemo(() => extractClubs(days), [days]);

  const filtered = useMemo(
    () => filterMatchDays(days as any, { round: roundFilter, clubId: clubFilter, search }),
    [days, roundFilter, clubFilter, search],
  ) as MatchDay[];

  const liveCount = useMemo(
    () => days.flatMap(d => d.matches).filter(m => m.status === 'LIVE' || m.status === 'HT').length,
    [days],
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setRoundFilter(null);
    setClubFilter(null);
  }, []);

  const resetFilters = useCallback(() => {
    setRoundFilter(null); setClubFilter(null); setSearch('');
  }, []);

  return (
    <>
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Calendrier"
        subtitle="Prochains matchs · Saison 2025–2026"
        accentColor="green"
        badge={liveCount > 0 ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-live/15 border border-live/30 text-live text-xs font-bold uppercase tracking-wider animate-pulse">
            <Radio className="h-3 w-3" />
            {liveCount} en direct
          </span>
        ) : undefined}
      />

      <div className="container py-6 lg:py-8 space-y-6">
        {!loading && !error && days.length > 0 && (
          <FixturesSummary days={filtered.length > 0 ? filtered : days} />
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }} className="space-y-3"
        >
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
            <input
              type="search" value={search} onChange={handleSearch}
              placeholder="Rechercher un club…"
              className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Tous" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
              {rounds.map(r => (
                <FilterPill
                  key={r} label={`J${r}`} active={roundFilter === r}
                  onClick={() => setRoundFilter(roundFilter === r ? null : r)}
                  count={days.find(d => d.round === r)?.matches.length}
                />
              ))}
            </div>
          </div>

          {clubs.length > 0 && !search && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Tous les clubs" active={clubFilter === null} onClick={() => setClubFilter(null)} />
              {clubs.map(c => (
                <FilterPill
                  key={c.id} label={c.name} active={clubFilter === c.id}
                  onClick={() => setClubFilter(clubFilter === c.id ? null : c.id)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {[0, 1].map(g => (
                <div key={g} className="space-y-3">
                  <div className="h-4 w-40 rounded bg-white/6 animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => <FixtureCardSkeleton key={i} />)}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState message={error} onRetry={load} />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                message="Aucun match trouvé pour ces critères."
                action={<button onClick={resetFilters} className="text-xs text-accent hover:underline">Réinitialiser les filtres</button>}
              />
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {filtered.map((day, i) => (
                <MatchdayGroup key={`${day.date}-${day.round}`} day={day} globalIndex={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && (
          <div className="flex justify-center pt-4">
            <button onClick={load} className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>
        )}
      </div>
    </>
  );
}