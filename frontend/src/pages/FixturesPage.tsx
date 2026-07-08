import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Radio, RefreshCw, CalendarDays, CalendarClock, ListChecks,
} from 'lucide-react';
import { MOCK_FIXTURES } from '../services/mockData';
import { filterMatchDays, extractRounds, extractClubs } from '../utils/football.utils';
import type { MatchDay } from '../types/football.types';
import {
  FilterPill, PageHero, FixtureCardSkeleton, EmptyState, ErrorState,
} from '@/components/ui/football';
import { MatchdayCard } from '@/components/elite/matches/MatchdayCard';
import { MatchStatCard } from '@/components/elite/matches/MatchStatCard';
import { SegmentedTabs } from '@/components/elite/matches/SegmentedTabs';
import { useFixtures } from '@/hooks/useFootball';

type StatusFilter = 'all' | 'live' | 'upcoming';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FixturesPage() {
  const { data: daysData, isLoading: loading, error, refetch } = useFixtures();
  const days = daysData ?? MOCK_FIXTURES;

  const [roundFilter,  setRoundFilter]  = useState<number | null>(null);
  const [clubFilter,   setClubFilter]   = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search,       setSearch]       = useState('');

  const rounds = useMemo(() => extractRounds(days, 'asc'), [days]);
  const clubs  = useMemo(() => extractClubs(days), [days]);

  const baseFiltered = useMemo(
    () => filterMatchDays(days as any, { round: roundFilter, clubId: clubFilter, search }),
    [days, roundFilter, clubFilter, search],
  ) as MatchDay[];

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return baseFiltered;
    return baseFiltered
      .map(day => ({
        ...day,
        matches: day.matches.filter(m =>
          statusFilter === 'live'
            ? m.status === 'LIVE' || m.status === 'HT'
            : m.status !== 'LIVE' && m.status !== 'HT',
        ),
      }))
      .filter(day => day.matches.length > 0);
  }, [baseFiltered, statusFilter]);

  const liveCount = useMemo(
    () => days.flatMap(d => d.matches).filter(m => m.status === 'LIVE' || m.status === 'HT').length,
    [days],
  );
  const upcomingCount = useMemo(
    () => days.flatMap(d => d.matches).filter(m => m.status !== 'LIVE' && m.status !== 'HT').length,
    [days],
  );
  const totalMatches = liveCount + upcomingCount;
  const roundsInScope = [...new Set(days.map(d => d.round))];
  const nextDate = days[0]?.date
    ? new Date(days[0].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '—';
  const roundRange = roundsInScope.length > 1
    ? `J${Math.min(...roundsInScope)}–J${Math.max(...roundsInScope)}`
    : `J${roundsInScope[0] ?? '—'}`;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setRoundFilter(null);
    setClubFilter(null);
  }, []);

  const resetFilters = useCallback(() => {
    setRoundFilter(null); setClubFilter(null); setSearch(''); setStatusFilter('all');
  }, []);

  const load = () => refetch();

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

      <div className="container py-6 lg:py-8 space-y-8">

        {/* ── Vue d'ensemble ─────────────────────────────────────────────── */}
        <section aria-label="Vue d'ensemble du calendrier">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Vue d'ensemble
            </p>
            <h2 className="text-lg font-display font-bold text-foreground">Le calendrier en un coup d'œil</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MatchStatCard icon={CalendarDays}  label="Matchs à venir" value={totalMatches} delay={0} />
            <MatchStatCard icon={CalendarClock} label="Prochaine date" value={nextDate}       delay={0.06} />
            <MatchStatCard icon={ListChecks}    label="Journées"       value={roundRange}     delay={0.12} />
            <MatchStatCard
              icon={Radio} label="En direct" value={liveCount}
              color={liveCount > 0 ? 'text-live' : 'text-foreground'}
              delay={0.18}
              badge={liveCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
                  <span className="text-[9px] text-live font-bold uppercase">en cours</span>
                </div>
              )}
            />
          </div>
        </section>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <motion.section
          aria-label="Filtres"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }} className="space-y-4"
        >
          <SegmentedTabs
            tabs={[
              { id: 'all',      label: 'Toutes',   count: totalMatches },
              { id: 'live',     label: 'En direct', count: liveCount, live: liveCount > 0 },
              { id: 'upcoming', label: 'À venir',  count: upcomingCount },
            ]}
            active={statusFilter}
            onChange={id => setStatusFilter(id as StatusFilter)}
          />

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
              <FilterPill label="Toutes les journées" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
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
        </motion.section>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
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
              <ErrorState message={(error as Error).message ?? 'Une erreur est survenue.'} onRetry={load} />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                message="Aucun match trouvé pour ces critères."
                action={<button onClick={resetFilters} className="text-xs text-accent hover:underline">Réinitialiser les filtres</button>}
              />
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {filtered.map((day, i) => (
                <MatchdayCard key={`${day.date}-${i}`} day={day} globalIndex={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && (
          <div className="flex justify-center pt-2">
            <button onClick={load} className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>
        )}
      </div>
    </>
  );
}
