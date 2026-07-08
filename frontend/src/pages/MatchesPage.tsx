import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, RefreshCw, CalendarDays, Goal, Trophy } from 'lucide-react';
import { useFixtures, useResults } from '@/hooks/useFootball';
import { extractRounds, extractClubs, filterMatchDays } from '@/utils/football.utils';
import type { MatchDay } from '@/types/football.types';
import {
  FilterPill, PageHero, FixtureCardSkeleton, EmptyState, ErrorState,
} from '@/components/ui/football';
import { MatchdayCard } from '@/components/elite/matches/MatchdayCard';
import { MatchStatCard } from '@/components/elite/matches/MatchStatCard';
import { SegmentedTabs } from '@/components/elite/matches/SegmentedTabs';

type HubTab = 'live' | 'today' | 'upcoming' | 'results';

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export default function MatchesPage() {
  const { data: fixturesData, isLoading: fixturesLoading, error: fixturesError, refetch: refetchFixtures } = useFixtures();
  const { data: resultsData,  isLoading: resultsLoading,  error: resultsError,  refetch: refetchResults }  = useResults();

  const fixtures = fixturesData ?? [];
  const results  = resultsData ?? [];

  const [tab, setTab]         = useState<HubTab>('live');
  const [roundFilter, setRoundFilter] = useState<number | null>(null);
  const [clubFilter, setClubFilter]   = useState<string | null>(null);

  const allDays = useMemo(() => [...fixtures, ...results], [fixtures, results]);

  const liveDays = useMemo(
    () => fixtures
      .map(d => ({ ...d, matches: d.matches.filter(m => m.status === 'LIVE' || m.status === 'HT') }))
      .filter(d => d.matches.length > 0),
    [fixtures],
  );

  const todayDays = useMemo(
    () => fixtures
      .filter(d => isToday(d.date))
      .map(d => ({ ...d, matches: d.matches.filter(m => m.status !== 'LIVE' && m.status !== 'HT') }))
      .filter(d => d.matches.length > 0),
    [fixtures],
  );

  const upcomingDays = useMemo(
    () => fixtures
      .map(d => ({ ...d, matches: d.matches.filter(m => m.status !== 'LIVE' && m.status !== 'HT') }))
      .filter(d => d.matches.length > 0),
    [fixtures],
  );

  const baseByTab: Record<HubTab, MatchDay[]> = {
    live: liveDays,
    today: todayDays,
    upcoming: upcomingDays,
    results,
  };

  const filtered = useMemo(
    () => filterMatchDays(baseByTab[tab], { round: roundFilter, clubId: clubFilter, search: '' }),
    [tab, roundFilter, clubFilter, fixtures, results],
  );

  const rounds = useMemo(() => extractRounds(allDays, 'asc'), [allDays]);
  const clubs  = useMemo(() => extractClubs(allDays), [allDays]);

  const liveCount   = liveDays.reduce((n, d) => n + d.matches.length, 0);
  const todayCount  = todayDays.reduce((n, d) => n + d.matches.length, 0);
  const upcomingCount = upcomingDays.reduce((n, d) => n + d.matches.length, 0);
  const resultsCount  = results.reduce((n, d) => n + d.matches.length, 0);
  const goalsToday = todayDays.flatMap(d => d.matches).reduce((n, m) => n + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0);

  const loading = tab === 'results' ? resultsLoading : fixturesLoading;
  const error   = tab === 'results' ? resultsError   : fixturesError;
  const reload  = () => { refetchFixtures(); refetchResults(); };

  const resetFilters = () => { setRoundFilter(null); setClubFilter(null); };

  return (
    <>
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Matchs"
        subtitle="Direct, aujourd'hui, à venir et résultats — tout le championnat au même endroit"
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
        <section aria-label="Vue d'ensemble">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MatchStatCard
              icon={Radio} label="En direct" value={liveCount}
              color={liveCount > 0 ? 'text-live' : 'text-foreground'}
              delay={0}
              badge={liveCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
                  <span className="text-[9px] text-live font-bold uppercase">en cours</span>
                </div>
              )}
            />
            <MatchStatCard icon={CalendarDays} label="Aujourd'hui"  value={todayCount}    delay={0.06} />
            <MatchStatCard icon={Goal}         label="Buts du jour" value={goalsToday}     delay={0.12} />
            <MatchStatCard icon={Trophy}       label="Résultats"    value={resultsCount}   delay={0.18} />
          </div>
        </section>

        {/* ── Tabs + filters ─────────────────────────────────────────────── */}
        <motion.section
          aria-label="Filtres"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }} className="space-y-4"
        >
          <SegmentedTabs
            tabs={[
              { id: 'live',     label: 'En direct', count: liveCount, live: liveCount > 0 },
              { id: 'today',    label: "Aujourd'hui", count: todayCount },
              { id: 'upcoming', label: 'À venir',    count: upcomingCount },
              { id: 'results',  label: 'Résultats',  count: resultsCount },
            ]}
            active={tab}
            onChange={id => { setTab(id as HubTab); resetFilters(); }}
          />

          {rounds.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Toutes les journées" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
              {rounds.map(r => (
                <FilterPill
                  key={r} label={`J${r}`} active={roundFilter === r}
                  onClick={() => setRoundFilter(roundFilter === r ? null : r)}
                />
              ))}
            </div>
          )}

          {clubs.length > 0 && (
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
              <ErrorState message={(error as Error).message ?? 'Une erreur est survenue.'} onRetry={reload} />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                message={
                  tab === 'live'
                    ? "Aucun match en direct pour le moment."
                    : "Aucun match trouvé pour ces critères."
                }
                action={roundFilter || clubFilter ? (
                  <button onClick={resetFilters} className="text-xs text-accent hover:underline">Réinitialiser les filtres</button>
                ) : undefined}
              />
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {filtered.map((day, i) => (
                <MatchdayCard key={`${tab}-${day.date}-${day.round}`} day={day} globalIndex={i} showXg={tab === 'results'} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && (
          <div className="flex justify-center pt-2">
            <button onClick={reload} className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>
        )}
      </div>
    </>
  );
}
