import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Radio, RefreshCw, CalendarDays, Trophy
} from 'lucide-react';
import { extractRounds, extractClubs } from '../utils/football.utils';
import type { MatchDay } from '../types/football.types';
import {
  FixtureCardSkeleton, EmptyState, ErrorState,
} from '@/components/ui/football';
import { MatchdayCard } from '@/components/elite/matches/MatchdayCard';
import { SegmentedTabs } from '@/components/elite/matches/SegmentedTabs';
import { useFixtures } from '@/hooks/useFootball';

type StatusFilter = 'all' | 'live' | 'upcoming';

export default function FixturesPage() {
  const { data: daysData, isLoading: loading, error, refetch } = useFixtures();
  const days = daysData ?? [];

  const [activeRound, setActiveRound]   = useState<number>(19); // Default to current round
  const [clubFilter,   setClubFilter]   = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search,       setSearch]       = useState('');

  const rounds = useMemo(() => extractRounds(days, 'asc'), [days]);
  const clubs  = useMemo(() => extractClubs(days), [days]);

  // Adjust activeRound if it falls out of range on data load
  useMemo(() => {
    if (rounds.length > 0 && !rounds.includes(activeRound)) {
      setActiveRound(rounds[0]);
    }
  }, [rounds, activeRound]);

  const filteredDays = useMemo(() => {
    // Filter days/matches based on selected round, club search, and status
    return days
      .map(day => {
        // If searching or filtering by club, ignore the round filter to search the entire season
        const matchesRoundMatch = (search || clubFilter) ? true : day.round === activeRound;

        if (!matchesRoundMatch) return null;

        const filteredMatches = day.matches.filter(m => {
          // Status filter
          const matchesStatus =
            statusFilter === 'all'
              ? true
              : statusFilter === 'live'
              ? m.status === 'LIVE' || m.status === 'HT'
              : m.status !== 'LIVE' && m.status !== 'HT';

          // Club / Search filter
          const matchesClub = clubFilter
            ? m.homeClub.id === clubFilter || m.awayClub.id === clubFilter
            : true;

          const matchesSearch = search
            ? m.homeClub.name.toLowerCase().includes(search.toLowerCase()) ||
              m.awayClub.name.toLowerCase().includes(search.toLowerCase())
            : true;

          return matchesStatus && matchesClub && matchesSearch;
        });

        if (filteredMatches.length === 0) return null;

        return {
          ...day,
          matches: filteredMatches,
        };
      })
      .filter((d): d is MatchDay => d !== null);
  }, [days, activeRound, clubFilter, statusFilter, search]);

  const liveCount = useMemo(
    () => days.flatMap(d => d.matches).filter(m => m.status === 'LIVE' || m.status === 'HT').length,
    [days],
  );
  const upcomingCount = useMemo(
    () => days.flatMap(d => d.matches).filter(m => m.status !== 'LIVE' && m.status !== 'HT').length,
    [days],
  );
  const totalMatches = liveCount + upcomingCount;


  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setClubFilter(null);
  }, []);

  const resetFilters = useCallback(() => {
    setClubFilter(null); setSearch(''); setStatusFilter('all');
  }, []);

  const load = () => refetch();

  return (
    <div className="min-h-screen bg-[#050D08] text-white">
      {/* ── Rich Apple Music Glassmorphic Hero ───────────────────────────────── */}
      <div className="relative overflow-hidden pt-24 pb-12">
        {/* Apple Music style vibrant radial glow behind */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#008751]/10 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FCD116]/5 blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#008751] mb-4">
                <CalendarDays className="h-3.5 w-3.5" />
                Saison 2025/2026
              </div>
              <h1 className="font-display text-4xl lg:text-6xl font-black tracking-tight leading-none mb-3">
                Calendrier
              </h1>
              <p className="text-white/45 text-sm max-w-lg font-medium">
                Découvrez toutes les journées de championnat, suivez les rencontres en direct et planifiez vos prochains chocs.
              </p>
            </motion.div>

            {/* Live Count Badge */}
            {liveCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#CE1126]/10 border border-[#CE1126]/30 text-[#CE1126] font-bold text-xs uppercase tracking-wider animate-pulse self-start md:self-end"
              >
                <Radio className="h-4 w-4" />
                {liveCount} match{liveCount > 1 ? 's' : ''} en direct
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        {/* ── Apple Music Style 3-column Layout ────────────────────────────────── */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          
          {/* LEFT: Apple Music style "Playlists" round selector sidebar — Hidden on mobile/tablet */}
          <aside className="hidden lg:block bg-white/[0.02] border border-white/5 rounded-3xl p-4 space-y-4 backdrop-blur-md sticky top-28">
            <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/5">
              <Trophy className="h-4 w-4 text-[#FCD116]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Toutes les journées</span>
            </div>
            
            {/* Rounds list */}
            <div className="space-y-1 max-h-[480px] overflow-y-auto scrollbar-hide pr-1">
              {rounds.map((r) => {
                const isActive = activeRound === r;
                const matchesCount = days.find(d => d.round === r)?.matches.length ?? 0;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRound(r);
                      setSearch('');
                      setClubFilter(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#008751] to-[#008751]/80 text-white shadow-[0_4px_16px_rgba(0,135,81,0.25)]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>Journée {r}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'
                    }`}>
                      {matchesCount} M
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT: Main Schedule Panel */}
          <div className="space-y-6">

            {/* Responsive Filters Toolbar (Apple Music inspired Glassmorphism) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 backdrop-blur-md space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-between">
                
                {/* 1. Selector for Journée (Visible on mobile/tablet as dropdown, synced with sidebar) */}
                <div className="lg:hidden flex flex-col gap-1.5 w-full">
                  <label className="text-white/45 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="h-3 w-3 text-[#FCD116]" />
                    Journée de championnat
                  </label>
                  <div className="relative">
                    <select
                      value={activeRound}
                      onChange={(e) => {
                        setActiveRound(Number(e.target.value));
                        setSearch('');
                        setClubFilter(null);
                      }}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl text-xs py-2.5 pl-4 pr-10 outline-none cursor-pointer text-white font-bold focus:border-[#008751] transition-colors appearance-none"
                    >
                      {rounds.map(r => (
                        <option key={r} value={r} className="bg-[#050D08] text-white">
                          Journée {r}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* 2. Selector for Club (Dropdown button for all screens) */}
                {clubs.length > 0 && !search && (
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-white/45 text-[9px] font-bold uppercase tracking-widest">
                      Filtrer par Club
                    </label>
                    <div className="relative">
                      <select
                        value={clubFilter ?? ''}
                        onChange={(e) => setClubFilter(e.target.value || null)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl text-xs py-2.5 pl-4 pr-10 outline-none cursor-pointer text-white font-bold focus:border-[#008751] transition-colors appearance-none"
                      >
                        <option value="" className="bg-[#050D08] text-white">Tous les clubs (MTN Elite One)</option>
                        {clubs.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#050D08] text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Segmented Status Tabs (Apple Music style Pill view) */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-white/45 text-[9px] font-bold uppercase tracking-widest">
                    Statut des rencontres
                  </label>
                  <SegmentedTabs
                    tabs={[
                      { id: 'all',      label: 'Tous',   count: totalMatches },
                      { id: 'live',     label: 'En Direct', count: liveCount, live: liveCount > 0 },
                      { id: 'upcoming', label: 'À Venir',  count: upcomingCount },
                    ]}
                    active={statusFilter}
                    onChange={id => setStatusFilter(id as StatusFilter)}
                  />
                </div>

                {/* 4. Live Search Input */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-white/45 text-[9px] font-bold uppercase tracking-widest">
                    Recherche par nom
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                    <input
                      type="search"
                      value={search}
                      onChange={handleSearch}
                      placeholder="Rechercher un club…"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#008751] transition-all"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* ── Main Schedule Content ──────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {[0, 1].map(g => (
                    <div key={g} className="space-y-3">
                      <div className="h-5 w-40 rounded-xl bg-white/6 animate-pulse" />
                      <div className="grid grid-cols-1 gap-3">
                        {[0, 1, 2].map(i => <FixtureCardSkeleton key={i} />)}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ErrorState message={(error as Error).message ?? 'Une erreur est survenue.'} onRetry={load} />
                </motion.div>
              ) : filteredDays.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState
                    message="Aucun match trouvé pour cette journée ou ces critères de filtres."
                    action={<button onClick={resetFilters} className="text-xs text-accent hover:underline">Réinitialiser les filtres</button>}
                  />
                </motion.div>
              ) : (
                <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {filteredDays.map((day, i) => (
                    <MatchdayCard key={`${day.date}-${i}`} day={day} globalIndex={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && (
              <div className="flex justify-center pt-4">
                <button onClick={load} className="flex items-center gap-2 text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Actualiser le calendrier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
