import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, RefreshCw } from 'lucide-react';
import { api, type MatchDay } from '../services/api';
import { MOCK_RESULTS, DEV_SEASON_ID } from '../services/mockData';
import {
  MatchdaySection,
  ResultCardSkeleton,
  EmptyState,
  ErrorState,
} from '../components/elite/FootballUI';

const USE_MOCK  = false;
const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

// ─── Filter pill ──────────────────────────────────────────────────────────────
const FilterPill = ({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ${
      active
        ? 'bg-accent text-accent-foreground shadow-gold'
        : 'bg-surface border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
    }`}
  >
    {label}
  </button>
);

// ─── Summary stats bar ────────────────────────────────────────────────────────
const SummaryBar = ({ days }: { days: MatchDay[] }) => {
  let totalGoals = 0, totalMatches = 0;
  days.forEach(d => d.matches.forEach(m => {
    totalMatches++;
    totalGoals += (m.homeScore ?? 0) + (m.awayScore ?? 0);
  }));
  const avg = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '–';

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: 'Matchs joués',    value: totalMatches },
        { label: 'Buts marqués',    value: totalGoals },
        { label: 'Moy. buts/match', value: avg },
      ].map(s => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/50 border border-border/50 rounded-xl px-4 py-3 text-center"
        >
          <div className="font-display text-2xl text-accent">{s.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── ResultsPage ──────────────────────────────────────────────────────────────
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
      if (USE_MOCK) {
        setDays(MOCK_RESULTS);
      } else {
        const res = await api.getResults(SEASON_ID, 1, 100);
        const data = res.grouped ?? res.data;
        setDays(data.length > 0 ? data : MOCK_RESULTS);
      }
    } catch (e) {
      console.warn('API error, using mock data:', e);
      setDays(MOCK_RESULTS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rounds = useMemo(() =>
    [...new Set(days.map(d => d.round))].sort((a, b) => b - a),
  [days]);

  const filtered = useMemo(() => {
    const sq = search.toLowerCase().trim();
    return days
      .map(d => ({
        ...d,
        matches: d.matches.filter(m => {
          const matchesRound  = roundFilter === null || d.round === roundFilter;
          const matchesClub   = clubFilter  === null || m.homeClub.id === clubFilter || m.awayClub.id === clubFilter;
          const matchesSearch = !sq || m.homeClub.name.toLowerCase().includes(sq) || m.awayClub.name.toLowerCase().includes(sq);
          return matchesRound && matchesClub && matchesSearch;
        }),
      }))
      .filter(d => d.matches.length > 0);
  }, [days, roundFilter, clubFilter, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border/50 bg-surface/30">
        <div className="container py-8 lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium mb-1">
              MTN Elite One · 2025–26
            </p>
            <h1 className="font-display text-3xl lg:text-4xl">Résultats</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Scores et buteurs des matchs joués
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 lg:py-8 space-y-6">

        {/* Stats bar */}
        {!loading && !error && <SummaryBar days={days} />}

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un club…"
              className="w-full max-w-sm pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <FilterPill label="Toutes" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
              {rounds.map(r => (
                <FilterPill key={r} label={`J${r}`} active={roundFilter === r} onClick={() => setRoundFilter(r)} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
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
              <EmptyState message="Aucun résultat disponible pour le moment" />
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {filtered.map((day, i) => (
                <MatchdaySection key={`${day.date}-${day.round}`} day={day} variant="results" index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && (
          <div className="flex justify-center pt-4">
            <button
              onClick={load}
              className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}