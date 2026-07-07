import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, RefreshCw, Target, TrendingUp, Home, Plane, Equal,
} from 'lucide-react';
import { MOCK_RESULTS } from '../services/mockData';
import { filterMatchDays, extractRounds, extractClubs, calcResultsSummary } from '../utils/football.utils';
import type { MatchDay } from '../types/football.types';
import {
  FilterPill, PageHero, ResultCardSkeleton, EmptyState, ErrorState,
} from '@/components/ui/football';
import { MatchdayCard } from '@/components/elite/matches/MatchdayCard';
import { MatchStatCard } from '@/components/elite/matches/MatchStatCard';
import { SegmentedTabs } from '@/components/elite/matches/SegmentedTabs';
import { useResults } from '@/hooks/useFootball';

type OutcomeFilter = 'all' | 'home' | 'draw' | 'away';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { data: daysData, isLoading: loading, error, refetch } = useResults();
  const days = daysData ?? MOCK_RESULTS;

  const [roundFilter,   setRoundFilter]   = useState<number | null>(null);
  const [clubFilter,    setClubFilter]    = useState<string | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [search,        setSearch]        = useState('');

  const rounds = useMemo(() => extractRounds(days as any, 'desc'), [days]);
  const clubs  = useMemo(() => extractClubs(days as any), [days]);

  const baseFiltered = useMemo(
    () => filterMatchDays(days as any, { round: roundFilter, clubId: clubFilter, search }),
    [days, roundFilter, clubFilter, search],
  ) as MatchDay[];

  const filtered = useMemo(() => {
    if (outcomeFilter === 'all') return baseFiltered;
    return baseFiltered
      .map(day => ({
        ...day,
        matches: day.matches.filter(m => {
          const hs = m.homeScore ?? 0, as_ = m.awayScore ?? 0;
          if (outcomeFilter === 'home') return hs > as_;
          if (outcomeFilter === 'away') return as_ > hs;
          return hs === as_;
        }),
      }))
      .filter(day => day.matches.length > 0);
  }, [baseFiltered, outcomeFilter]);

  const summary = useMemo(() => calcResultsSummary((filtered.length > 0 ? filtered : days) as any), [filtered, days]);
  const latestRound = rounds[0] ?? 0;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setRoundFilter(null);
    setClubFilter(null);
  }, []);

  const resetFilters = useCallback(() => {
    setRoundFilter(null); setClubFilter(null); setSearch(''); setOutcomeFilter('all');
  }, []);

  const load = () => refetch();

  return (
    <>
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Résultats"
        subtitle={latestRound > 0 ? `Dernière journée : J${latestRound}` : 'Scores et buteurs des matchs joués'}
        accentColor="gold"
      />

      <div className="container py-6 lg:py-8 space-y-8">

        {/* ── Vue d'ensemble ─────────────────────────────────────────────── */}
        <section aria-label="Vue d'ensemble des résultats">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Vue d'ensemble
            </p>
            <h2 className="text-lg font-display font-bold text-foreground">La journée en chiffres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MatchStatCard icon={Target}     label="Matchs joués"    value={summary.totalMatches} delay={0}    />
            <MatchStatCard icon={Target}     label="Buts marqués"    value={summary.totalGoals}   color="text-accent" delay={0.05} />
            <MatchStatCard icon={TrendingUp} label="Moy. buts/match" value={summary.avgGoals}     delay={0.10} />
            <MatchStatCard icon={Home}       label="Victoires dom."  value={summary.homeWins}     color="text-[#1F8A4C]" delay={0.15} />
            <MatchStatCard icon={Plane}      label="Victoires ext."  value={summary.awayWins}     color="text-[#008751]" delay={0.20} />
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
              { id: 'all',  label: 'Tous',            icon: Target },
              { id: 'home', label: 'Victoires dom.',  icon: Home },
              { id: 'draw', label: 'Nuls',            icon: Equal },
              { id: 'away', label: 'Victoires ext.',  icon: Plane },
            ]}
            active={outcomeFilter}
            onChange={id => setOutcomeFilter(id as OutcomeFilter)}
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
                  <div className="h-4 w-40 rounded bg-white/6 animate-pulse mb-2" />
                  {[0, 1, 2].map(i => <ResultCardSkeleton key={i} />)}
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
                message="Aucun résultat trouvé pour ces critères."
                action={<button onClick={resetFilters} className="text-xs text-accent hover:underline">Réinitialiser les filtres</button>}
              />
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {filtered.map((day, i) => (
                <MatchdayCard key={`${day.date}-${day.round}`} day={day} globalIndex={i} showXg />
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
