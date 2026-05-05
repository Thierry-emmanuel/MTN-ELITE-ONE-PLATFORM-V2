import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, RefreshCw, Radio, Calendar } from 'lucide-react';
import { api, type MatchDay, type ApiClub } from '../services/api';
import { MOCK_FIXTURES, DEV_SEASON_ID } from '../services/mockData';
import { MatchdaySection, FixtureCardSkeleton, EmptyState, ErrorState } from '../components/elite/FootballUI';

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

// Premier League style summary bar
const FixturesSummary = ({ days }: { days: MatchDay[] }) => {
  const total    = days.flatMap(d => d.matches).length;
  const live     = days.flatMap(d => d.matches).filter(m => m.status === 'LIVE').length;
  const rounds   = [...new Set(days.map(d => d.round))];
  const nextDate = days[0]?.date
    ? new Date(days[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: 'Matchs à venir', value: total },
        { label: 'Prochaine date', value: nextDate },
        { label: 'Journées',       value: rounds.length > 1 ? `J${Math.min(...rounds)}–J${Math.max(...rounds)}` : `J${rounds[0] ?? '—'}` },
      ].map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className="bg-surface/50 border border-border/50 rounded-xl px-4 py-3 text-center">
          <div className="font-display text-xl lg:text-2xl text-accent truncate">{s.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
          {live > 0 && i === 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
              <span className="text-[9px] text-live font-semibold uppercase">{live} en direct</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

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
      const data = await api.getFixtures(SEASON_ID, 100);
      setDays(data.length > 0 ? data : MOCK_FIXTURES);
    } catch {
      setDays(MOCK_FIXTURES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rounds = useMemo(() => [...new Set(days.map(d => d.round))].sort((a, b) => a - b), [days]);
  const clubs  = useMemo<ApiClub[]>(() => {
    const seen = new Set<string>();
    const out: ApiClub[] = [];
    days.forEach(d => d.matches.forEach(m => {
      [m.homeClub, m.awayClub].forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); out.push(c); } });
    }));
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }, [days]);

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

  const liveCount = days.flatMap(d => d.matches).filter(m => m.status === 'LIVE').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/5 blur-[90px] pointer-events-none" />
        <div className="container relative py-10 lg:py-14">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-accent rounded-full" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">MTN Elite One · Saison 2025–26</p>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl lg:text-5xl tracking-tight">Calendrier</h1>
              {liveCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-live/15 text-live text-xs font-semibold uppercase tracking-wider animate-pulse">
                  <Radio className="h-3 w-3" />
                  {liveCount} en direct
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-2">Prochains matchs · Saison 2025–2026</p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 lg:py-8 space-y-6">
        {!loading && !error && days.length > 0 && <FixturesSummary days={filtered} />}

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
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Tous" active={roundFilter === null} onClick={() => setRoundFilter(null)} />
              {rounds.map(r => <FilterPill key={r} label={`J${r}`} active={roundFilter === r} onClick={() => setRoundFilter(r)} />)}
            </div>
          </div>
          {clubs.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
              <FilterPill label="Tous les clubs" active={clubFilter === null} onClick={() => setClubFilter(null)} />
              {clubs.map(c => <FilterPill key={c.id} label={c.name} active={clubFilter === c.id} onClick={() => setClubFilter(c.id)} />)}
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
              <EmptyState message="Aucun match à venir" />
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {filtered.map((day, i) => (
                <MatchdaySection key={`${day.date}-${day.round}`} day={day} variant="fixtures" index={i} />
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