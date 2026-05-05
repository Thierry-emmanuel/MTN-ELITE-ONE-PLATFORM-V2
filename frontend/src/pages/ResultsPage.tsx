import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, RefreshCw, Goal } from 'lucide-react';
import { api, type MatchDay } from '../services/api';
import { MOCK_RESULTS, DEV_SEASON_ID } from '../services/mockData';
import { MatchdaySection, ResultCardSkeleton, EmptyState, ErrorState } from '../components/elite/FootballUI';

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick}
    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ${
      active
        ? 'bg-accent text-accent-foreground shadow-gold'
        : 'bg-surface border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
    }`}>
    {label}
  </button>
);

// Bundesliga-style stat bar
const SummaryBar = ({ days }: { days: MatchDay[] }) => {
  let totalGoals = 0, totalMatches = 0, homeWins = 0, draws = 0, awayWins = 0;
  days.forEach(d => d.matches.forEach(m => {
    totalMatches++;
    const hs = m.homeScore ?? 0;
    const as_ = m.awayScore ?? 0;
    totalGoals += hs + as_;
    if (hs > as_) homeWins++;
    else if (hs === as_) draws++;
    else awayWins++;
  }));
  const avg = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '—';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {[
        { label: 'Matchs joués',    value: totalMatches, color: 'text-accent' },
        { label: 'Buts marqués',    value: totalGoals,   color: 'text-accent' },
        { label: 'Moy. buts/match', value: avg,          color: 'text-accent' },
        { label: 'Victoires dom.',  value: homeWins,     color: 'text-win' },
        { label: 'Victoires ext.',  value: awayWins,     color: 'text-primary' },
      ].map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="bg-surface/50 border border-border/50 rounded-xl px-4 py-3 text-center col-span-1">
          <div className={`font-display text-xl lg:text-2xl ${s.color}`}>{s.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default function ResultsPage() {
  const [days,        setDays]        = useState<MatchDay[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [roundFilter, setRoundFilter] = useState<number | null>(null);
  const [clubFilter,  setClubFilter]  = useState<string | null>(null);
  const [search,      setSearch]      = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await api.getResults(SEASON_ID, 1, 200);
      const data = res.grouped ?? res.data;
      setDays(data.length > 0 ? data : MOCK_RESULTS);
    } catch {
      setDays(MOCK_RESULTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rounds = useMemo(() => [...new Set(days.map(d => d.round))].sort((a, b) => b - a), [days]);

  const filtered = useMemo(() => {
    const sq = search.toLowerCase().trim();
    return days.map(d => ({
      ...d,
      matches: d.matches.filter(m => {
        const matchesRound  = roundFilter === null || d.round === roundFilter;
        const matchesClub   = clubFilter  === null || m.homeClub.id === clubFilter || m.awayClub.id === clubFilter;
        const matchesSearch = !sq || m.homeClub.name.toLowerCase().includes(sq) || m.awayClub.name.toLowerCase().includes(sq);
        return matchesRound && matchesClub && matchesSearch;
      }),
    })).filter(d => d.matches.length > 0);
  }, [days, roundFilter, clubFilter, search]);

  // Latest completed round number
  const latestRound = rounds[0] ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-win/5 via-background to-background" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/5 blur-[90px] pointer-events-none" />
        <div className="container relative py-10 lg:py-14">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-accent rounded-full" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">MTN Elite One · Saison 2025–26</p>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight">Résultats</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {latestRound > 0 ? `Dernière journée: J${latestRound}` : 'Scores et buteurs des matchs joués'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 lg:py-8 space-y-6">
        {!loading && !error && days.length > 0 && <SummaryBar days={filtered.length > 0 ? filtered : days} />}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un club…"
              className="w-full max-w-sm pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <FilterPill label="Toutes" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
              {rounds.map(r => <FilterPill key={r} label={`J${r}`} active={roundFilter === r} onClick={() => setRoundFilter(r)} />)}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {[0, 1].map(g => (
                <div key={g} className="space-y-2">
                  <div className="h-4 w-40 rounded bg-white/6 animate-pulse mb-3" />
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
              <EmptyState message="Aucun résultat disponible" />
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {filtered.map((day, i) => (
                <MatchdaySection key={`${day.date}-${day.round}`} day={day} variant="results" index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && (
          <div className="flex justify-center pt-4">
            <button onClick={load} className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}