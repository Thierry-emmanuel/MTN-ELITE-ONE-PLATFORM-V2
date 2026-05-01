import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, RefreshCw } from 'lucide-react';
import { api, type MatchDay, type ApiClub } from '../services/api';
import { MOCK_FIXTURES, MOCK_CLUBS, DEV_SEASON_ID } from '../services/mockData';
import {
  MatchdaySection,
  FixtureCardSkeleton,
  EmptyState,
  ErrorState,
} from '../components/elite/FootballUI';

// ─── Dev flag — flip to false when real backend is ready ─────────────────────
const USE_MOCK = true;

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

// ─── FixturesPage ─────────────────────────────────────────────────────────────

const SEASON_ID = import.meta.env.VITE_SEASON_ID as string | undefined ?? DEV_SEASON_ID;

export default function FixturesPage() {
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
      const data = USE_MOCK
        ? MOCK_FIXTURES
        : await api.getFixtures(SEASON_ID);
      setDays(data);
    } catch (e) {
      setError((e as Error).message ?? 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Derived filters
  const rounds = useMemo(() => [...new Set(days.map(d => d.round))].sort((a, b) => a - b), [days]);
  const clubs  = useMemo<ApiClub[]>(() => {
    const seen = new Set<string>();
    const out:  ApiClub[] = [];
    days.forEach(d => d.matches.forEach(m => {
      [m.homeClub, m.awayClub].forEach(c => {
        if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
      });
    }));
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }, [days]);

  const filtered = useMemo(() => {
    const sq = search.toLowerCase().trim();
    return days
      .map(d => ({
        ...d,
        matches: d.matches.filter(m => {
          const matchesRound = roundFilter === null || d.round === roundFilter;
          const matchesClub  = clubFilter  === null || m.homeClub.id === clubFilter || m.awayClub.id === clubFilter;
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
            <h1 className="font-display text-3xl lg:text-4xl">Calendrier</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Prochains matchs du championnat
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 lg:py-8 space-y-6">

        {/* ── Filters bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-3"
        >
          {/* Search */}
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

          {/* Round filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Tous" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
              {rounds.map(r => (
                <FilterPill key={r} label={`J${r}`} active={roundFilter === r} onClick={() => setRoundFilter(r)} />
              ))}
            </div>
          </div>

          {/* Club filters */}
          {clubs.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Tous les clubs" active={clubFilter === null} onClick={() => setClubFilter(null)} />
              {clubs.map(c => (
                <FilterPill key={c.id} label={c.name} active={clubFilter === c.id} onClick={() => setClubFilter(c.id)} />
              ))}
            </div>
          )}
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
              <EmptyState message="Aucun match trouvé" />
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {filtered.map((day, i) => (
                <MatchdaySection key={`${day.date}-${day.round}`} day={day} variant="fixtures" index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refresh */}
        {!loading && !error && (
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