import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { api, type ApiStanding } from '../services/api';
import { MOCK_STANDINGS, POSITION_CHANGES, DEV_SEASON_ID } from '../services/mockData';
import { ClubLogo, FormIndicator, PositionChange, StandingRowSkeleton } from '../components/elite/FootballUI';

const USE_MOCK  = false;
const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

// ─── Zone config ──────────────────────────────────────────────────────────────
const getZone = (pos: number, total: number) => {
  if (pos === 1)        return 'champion';
  if (pos <= 3)         return 'caf';
  if (pos >= total - 1) return 'relegation';
  return 'none';
};

const ZONE_BORDER: Record<string, string> = {
  champion:   'border-l-accent',
  caf:        'border-l-primary',
  relegation: 'border-l-destructive',
  none:       'border-l-transparent',
};

const ZONE_BG: Record<string, string> = {
  champion:   'bg-accent/[0.03]',
  caf:        'bg-primary/[0.03]',
  relegation: 'bg-destructive/[0.03]',
  none:       '',
};

// ─── Zone legend ──────────────────────────────────────────────────────────────
const ZoneLegend = () => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[10px] text-muted-foreground">
    {[
      { color: 'bg-accent',      label: 'Champion' },
      { color: 'bg-primary',     label: 'Zone CAF' },
      { color: 'bg-destructive', label: 'Zone relégation' },
    ].map(z => (
      <span key={z.label} className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-sm ${z.color}`} />
        {z.label}
      </span>
    ))}
  </div>
);

// ─── StandingsTable ───────────────────────────────────────────────────────────
interface StandingsTableProps { standings: ApiStanding[] }

const StandingsTable = ({ standings }: StandingsTableProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = standings.length;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-card">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-surface/80 backdrop-blur-sm">
        <div className="w-6 text-[10px] text-muted-foreground uppercase tracking-wider text-center">#</div>
        <div className="w-5" />
        <div className="w-7" />
        <div className="flex-1 text-[10px] text-muted-foreground uppercase tracking-wider">Club</div>
        <div className="hidden sm:flex items-center text-[10px] text-muted-foreground uppercase tracking-wider">
          {['J','V','N','D','BP','BC','DB'].map(h => (
            <span key={h} className="w-8 text-center">{h}</span>
          ))}
        </div>
        <div className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-wider w-[116px] text-center">
          Forme
        </div>
        <div className="w-10 text-right text-[10px] text-muted-foreground uppercase tracking-wider">Pts</div>
      </div>

      {/* Rows */}
      {standings.map((row, idx) => {
        const zone  = getZone(row.position, total);
        const delta = POSITION_CHANGES[row.club.id] ?? 0;
        const isHov = hovered === row.id;

        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.035, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHovered(row.id)}
            onMouseLeave={() => setHovered(null)}
            className={`relative flex items-center gap-2 px-4 py-3 border-b border-border/25 last:border-0 cursor-pointer transition-colors duration-150 border-l-2 ${
              ZONE_BORDER[zone]
            } ${ZONE_BG[zone]} ${isHov ? 'bg-white/[0.03]' : ''}`}
          >
            {/* Position */}
            <div className={`w-6 shrink-0 font-display text-sm tabular-nums text-center ${
              zone === 'champion' ? 'text-accent' : zone === 'caf' ? 'text-primary-glow' : 'text-muted-foreground'
            }`}>
              {row.position === 1
                ? <Trophy className="h-3.5 w-3.5 text-accent mx-auto" />
                : row.position}
            </div>

            {/* Position change */}
            <div className="w-5 shrink-0 flex items-center justify-center">
              <PositionChange delta={delta} />
            </div>

            {/* Club logo */}
            <ClubLogo club={row.club} size={28} className="shrink-0" />

            {/* Club name + city */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate transition-colors ${isHov ? 'text-accent' : 'text-foreground'}`}>
                {row.club.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate hidden sm:block">
                {row.club.city}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center text-xs tabular-nums">
              {[
                { val: row.played,       color: 'text-muted-foreground' },
                { val: row.won,          color: 'text-win' },
                { val: row.drawn,        color: 'text-draw' },
                { val: row.lost,         color: 'text-loss' },
                { val: row.goalsFor,     color: 'text-foreground/70' },
                { val: row.goalsAgainst, color: 'text-foreground/70' },
                {
                  val: row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference,
                  color: row.goalDifference > 0 ? 'text-win' : row.goalDifference < 0 ? 'text-loss' : 'text-muted-foreground'
                },
              ].map((s, i) => (
                <span key={i} className={`w-8 text-center ${s.color}`}>{s.val}</span>
              ))}
            </div>

            {/* Form guide */}
            <div className="hidden md:flex items-center gap-1">
              {(row.formGuide ?? []).slice(-5).map((r, i) => (
                <FormIndicator key={i} result={r} />
              ))}
            </div>

            {/* Points */}
            <div className={`w-10 text-right font-display text-base tabular-nums shrink-0 ${
              zone === 'champion' ? 'text-accent' : 'text-foreground'
            }`}>
              {row.points}
            </div>
          </motion.div>
        );
      })}

      {/* Relegation warning */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-destructive/20 bg-destructive/[0.04]">
        <AlertTriangle className="h-3 w-3 text-destructive/60 shrink-0" />
        <span className="text-[10px] text-destructive/50">
          Les 2 derniers clubs à la fin de la saison sont relégués en Elite Two.
        </span>
      </div>
    </div>
  );
};

// ─── Mobile compact view ──────────────────────────────────────────────────────
const MobileStandings = ({ standings }: StandingsTableProps) => {
  const total = standings.length;
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-card sm:hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-surface/80 text-[9px] text-muted-foreground uppercase tracking-wider">
        <span className="w-5 text-center">#</span>
        <span className="flex-1">Club</span>
        <span className="w-7 text-center">J</span>
        <span className="w-7 text-center">Pts</span>
      </div>
      {standings.map((row, idx) => {
        const zone = getZone(row.position, total);
        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.03 }}
            className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/20 last:border-0 border-l-2 ${ZONE_BORDER[zone]}`}
          >
            <span className={`w-5 text-center font-display text-xs ${zone === 'champion' ? 'text-accent' : 'text-muted-foreground'}`}>
              {row.position}
            </span>
            <ClubLogo club={row.club} size={22} />
            <span className="flex-1 text-xs font-medium truncate">{row.club.name}</span>
            <span className="w-7 text-center text-xs text-muted-foreground">{row.played}</span>
            <span className={`w-7 text-center font-display text-sm ${zone === 'champion' ? 'text-accent' : 'text-foreground'}`}>
              {row.points}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── StandingsPage ────────────────────────────────────────────────────────────
export default function StandingsPage() {
  const [standings, setStandings] = useState<ApiStanding[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        setStandings(MOCK_STANDINGS);
      } else {
        const data = await api.getStandings(SEASON_ID);
        // If standings not yet initialized, use mock data
        setStandings(data.length > 0 ? data : MOCK_STANDINGS);
      }
    } catch (e) {
      console.warn('API error, falling back to mock standings:', e);
      setStandings(MOCK_STANDINGS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
            <h1 className="font-display text-3xl lg:text-4xl">Classement</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Mis à jour après chaque match · {standings.length} clubs
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 lg:py-8">
        {/* Column legend */}
        <div className="hidden sm:flex items-center gap-1.5 mb-4 text-[10px] text-muted-foreground/60">
          <Info className="h-3 w-3" />
          <span>J=Joués · V=Victoires · N=Nuls · D=Défaites · BP=Buts pour · BC=Buts contre · DB=Différence</span>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-xl border border-border overflow-hidden bg-gradient-card">
              {Array.from({ length: 14 }).map((_, i) => <StandingRowSkeleton key={i} i={i} />)}
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 gap-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button onClick={load} className="text-xs text-accent hover:underline uppercase tracking-wider">
                Réessayer
              </button>
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <StandingsTable standings={standings} />
              </div>
              {/* Mobile compact */}
              <MobileStandings standings={standings} />
            </motion.div>
          )}
        </AnimatePresence>

        <ZoneLegend />

        {!loading && (
          <div className="flex justify-center mt-6">
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