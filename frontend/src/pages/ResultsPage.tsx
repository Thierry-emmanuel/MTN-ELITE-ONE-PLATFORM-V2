import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp, Home, Plane } from 'lucide-react';
import { footballApi as api } from "@/services/api"
import { footballApi as api } from "@/services/api";
import { MOCK_RESULTS, DEV_SEASON_ID } from '../services/mockData';
import { filterMatchDays, extractRounds, extractClubs, calcResultsSummary, formatKickoff } from '../utils/football.utils';
import type { Match } from '../types/football.types';
import {
  ClubLogo, MatchStatusChip, FilterPill, PageHero,
  ResultCardSkeleton, EmptyState, ErrorState,
  SummaryCard, MatchdayHeader, EventsTimeline, MatchMeta,
} from '../components/elite/FootballPrimitives';

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

// ─── xG bar (placeholder — replace val with real xG from API) ────────────────
const XgBar = ({ home, away }: { home: number; away: number }) => {
  const total = home + away || 1;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px] text-muted-foreground/50 uppercase tracking-wider">
        <span className="tabular-nums">{home.toFixed(1)}</span>
        <span>xG</span>
        <span className="tabular-nums">{away.toFixed(1)}</span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden">
        <div className="h-full rounded-l-full bg-[#1F8A4C]/60 transition-all" style={{ width: `${(home / total) * 100}%` }} />
        <div className="h-full rounded-r-full flex-1 bg-[#CE1126]/40" />
      </div>
    </div>
  );
};

// ─── Result Card ──────────────────────────────────────────────────────────────
const ResultCard = memo(({ match, index }: { match: Match; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const hs = match.homeScore ?? 0;
  const as_ = match.awayScore ?? 0;
  const homeWon = hs > as_, awayWon = as_ > hs, draw = hs === as_;
  // Mock xG until real data is wired
  const xg = { home: +(hs + Math.random() * 0.6 - 0.1).toFixed(1), away: +(as_ + Math.random() * 0.6 - 0.1).toFixed(1) };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-xl border border-border bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden"
    >
      <div className="h-[2px] bg-gradient-to-r from-[#008751]/40 via-[#FCD116]/40 to-[#CE1126]/40" />

      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Round + status */}
        <div className="flex items-center justify-between mb-3 text-[10px]">
          <span className="text-muted-foreground/40 uppercase tracking-wider">
            {formatKickoff(match.kickoffUtc)} · J{match.round}
          </span>
          <MatchStatusChip status={match.status} />
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-3">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ClubLogo club={match.homeClub} size={36} className="shrink-0" />
            <div className="min-w-0">
              <span className={`font-display text-sm leading-tight block truncate ${homeWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                {match.homeClub.name}
              </span>
              <span className="text-[9px] text-muted-foreground/40 uppercase flex items-center gap-0.5">
                <Home className="h-2.5 w-2.5" /> Domicile
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center shrink-0 gap-0.5">
            <div className="flex items-center gap-1.5 font-display text-2xl tabular-nums">
              <span className={homeWon ? 'text-foreground' : draw ? 'text-muted-foreground' : 'text-muted-foreground/50'}>{hs}</span>
              <span className="text-muted-foreground/20 text-lg">–</span>
              <span className={awayWon ? 'text-foreground' : draw ? 'text-muted-foreground' : 'text-muted-foreground/50'}>{as_}</span>
            </div>
            {draw && <span className="text-[9px] text-[#FCD116]/60 uppercase tracking-widest font-bold">Nul</span>}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
            <ClubLogo club={match.awayClub} size={36} className="shrink-0" />
            <div className="min-w-0 text-right">
              <span className={`font-display text-sm leading-tight block truncate ${awayWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                {match.awayClub.name}
              </span>
              <span className="text-[9px] text-muted-foreground/40 uppercase flex items-center gap-0.5 justify-end">
                <Plane className="h-2.5 w-2.5" /> Extérieur
              </span>
            </div>
          </div>
        </div>

        {/* xG */}
        <div className="mt-3 pt-3 border-t border-border/30">
          <XgBar home={xg.home} away={xg.away} />
        </div>

        {/* Venue / referee */}
        {(match.venue || match.referee || match.attendance) && (
          <div className="mt-2 flex justify-center">
            <MatchMeta match={match} showTime={false} />
          </div>
        )}

        {/* Expand toggle */}
        {match.events && match.events.length > 0 && (
          <div className="flex items-center justify-center mt-2 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        )}
      </div>

      {/* Expandable events */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/30 bg-white/[0.02] px-4"
          >
            {match.events && match.events.length > 0 && (
              <EventsTimeline events={match.events} homeClubId={match.homeClub.id} />
            )}
            {match.attendance && (
              <div className="py-2 text-center text-[10px] text-muted-foreground/30 uppercase tracking-wider">
                {match.attendance.toLocaleString('fr-FR')} spectateurs
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
ResultCard.displayName = 'ResultCard';

// ─── Matchday group ───────────────────────────────────────────────────────────
const MatchdayGroup = memo(({ day, globalIndex }: { day: MatchDay; globalIndex: number }) => (
  <motion.section
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: globalIndex * 0.06 }}
    aria-label={`Journée ${day.round}`}
  >
    <MatchdayHeader round={day.round} date={day.date} matchCount={day.matches.length} />
    <div className="space-y-3">
      {day.matches.map((m, i) => <ResultCard key={m.id} match={m as Match} index={i} />)}
    </div>
  </motion.section>
));
MatchdayGroup.displayName = 'MatchdayGroup';

// ─── Summary bar ──────────────────────────────────────────────────────────────
const SummaryBar = memo(({ days }: { days: MatchDay[] }) => {
  const s = calcResultsSummary(days as any);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <SummaryCard label="Matchs joués"    value={s.totalMatches} delay={0} />
      <SummaryCard label="Buts marqués"    value={s.totalGoals}   delay={0.06} />
      <SummaryCard label="Moy. buts/match" value={s.avgGoals}     delay={0.12} />
      <SummaryCard label="Victoires dom."  value={s.homeWins}     delay={0.18} color="text-[#1F8A4C]" />
      <SummaryCard label="Victoires ext."  value={s.awayWins}     delay={0.24} color="text-[#008751]" />
    </div>
  );
});
SummaryBar.displayName = 'SummaryBar';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [days,        setDays]        = useState<MatchDay[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [roundFilter, setRoundFilter] = useState<number | null>(null);
  const [clubFilter,  setClubFilter]  = useState<string | null>(null);
  const [search,      setSearch]      = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await api.getResults(SEASON_ID, 1, 200);
      const data = res.grouped ?? res.data;
      setDays(data.length > 0 ? data : MOCK_RESULTS);
    } catch {
      setDays(MOCK_RESULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rounds = useMemo(() => extractRounds(days as any, 'desc'), [days]);
  const clubs  = useMemo(() => extractClubs(days as any), [days]);

  const filtered = useMemo(
    () => filterMatchDays(days as any, { round: roundFilter, clubId: clubFilter, search }),
    [days, roundFilter, clubFilter, search],
  ) as MatchDay[];

  const latestRound = rounds[0] ?? 0;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setRoundFilter(null);
    setClubFilter(null);
  }, []);

  const resetFilters = useCallback(() => {
    setRoundFilter(null); setClubFilter(null); setSearch('');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Résultats"
        subtitle={latestRound > 0 ? `Dernière journée : J${latestRound}` : 'Scores et buteurs des matchs joués'}
        accentColor="gold"
      />

      <div className="container py-6 lg:py-8 space-y-6">
        {!loading && !error && <SummaryBar days={filtered.length > 0 ? filtered : days} />}

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
              <FilterPill label="Toutes" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
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
                  <div className="h-4 w-40 rounded bg-white/6 animate-pulse mb-2" />
                  {[0, 1, 2].map(i => <ResultCardSkeleton key={i} />)}
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
                message="Aucun résultat trouvé pour ces critères."
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
    </div>
  );
}