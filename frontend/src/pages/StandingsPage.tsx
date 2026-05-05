import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { api, type ApiStanding } from '../services/api';
import { MOCK_STANDINGS, DEV_SEASON_ID } from '../services/mockData';
import { ClubLogo, FormIndicator, StandingRowSkeleton } from '../components/elite/FootballUI';

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

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

const normalizeForm = (f: string): 'W' | 'D' | 'L' => {
  const u = f.toUpperCase();
  if (u === 'V' || u === 'W') return 'W';
  if (u === 'D') return 'D';
  return 'L';
};

const ZoneLegend = () => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[10px] text-muted-foreground">
    {[
      { color: 'bg-accent',      label: 'Champion MTN Elite One' },
      { color: 'bg-primary',     label: 'Qualification CAF' },
      { color: 'bg-destructive', label: 'Relégation Elite Two' },
    ].map(z => (
      <span key={z.label} className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-sm ${z.color}`} />
        {z.label}
      </span>
    ))}
  </div>
);

const SummaryCards = ({ standings }: { standings: ApiStanding[] }) => {
  const leader     = standings[0];
  const totalGoals = standings.reduce((a, s) => a + s.goalsFor, 0);
  const totalGames = Math.round(standings.reduce((a, s) => a + s.played, 0) / 2);
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: 'Leader',       value: leader?.club.name ?? '—', sub: `${leader?.points ?? 0} pts` },
        { label: 'Buts marqués', value: totalGoals,                sub: 'cette saison' },
        { label: 'Matchs joués', value: totalGames,                sub: `J${leader?.played ?? 0} en cours` },
      ].map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          className="bg-surface/50 border border-border/50 rounded-xl px-4 py-3 text-center">
          <div className="font-display text-xl lg:text-2xl text-accent truncate">{s.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
          <div className="text-[9px] text-muted-foreground/50 mt-0.5">{s.sub}</div>
        </motion.div>
      ))}
    </div>
  );
};

const StandingsTable = ({ standings }: { standings: ApiStanding[] }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = standings.length;
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-card">
      <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-surface/90 backdrop-blur-sm">
        <div className="w-6 text-[10px] text-muted-foreground uppercase tracking-wider text-center">#</div>
        <div className="w-7" />
        <div className="flex-1 text-[10px] text-muted-foreground uppercase tracking-wider">Club</div>
        <div className="hidden sm:flex text-[10px] text-muted-foreground uppercase tracking-wider">
          {['J','V','N','D','BP','BC','DB'].map(h => (
            <span key={h} className="w-8 text-center">{h}</span>
          ))}
        </div>
        <div className="hidden lg:block text-[10px] text-muted-foreground uppercase tracking-wider w-[116px] text-center">Forme</div>
        <div className="w-10 text-right text-[10px] text-muted-foreground uppercase tracking-wider">Pts</div>
      </div>

      {standings.map((row, idx) => {
        const zone  = getZone(row.position, total);
        const isHov = hovered === row.id;
        const gd    = row.goalDifference;
        return (
          <motion.div key={row.id}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHovered(row.id)} onMouseLeave={() => setHovered(null)}
            className={`relative flex items-center gap-2 px-4 py-3 border-b border-border/20 last:border-0 cursor-pointer transition-colors duration-150 border-l-2 ${ZONE_BORDER[zone]} ${ZONE_BG[zone]} ${isHov ? 'bg-white/[0.025]' : ''}`}
          >
            <div className={`w-6 shrink-0 font-display text-sm tabular-nums text-center ${zone === 'champion' ? 'text-accent' : zone === 'caf' ? 'text-primary' : 'text-muted-foreground'}`}>
              {row.position === 1 ? <Trophy className="h-3.5 w-3.5 text-accent mx-auto" /> : row.position}
            </div>
            <ClubLogo club={row.club} size={28} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate transition-colors ${isHov ? 'text-accent' : 'text-foreground'}`}>{row.club.name}</div>
              <div className="text-[10px] text-muted-foreground truncate hidden sm:block">{row.club.city}</div>
            </div>
            <div className="hidden sm:flex text-xs tabular-nums">
              {[
                { val: row.played,       color: 'text-muted-foreground' },
                { val: row.won,          color: 'text-win' },
                { val: row.drawn,        color: 'text-draw' },
                { val: row.lost,         color: 'text-loss' },
                { val: row.goalsFor,     color: 'text-foreground/70' },
                { val: row.goalsAgainst, color: 'text-foreground/70' },
                { val: gd >= 0 ? `+${gd}` : gd, color: gd > 0 ? 'text-win' : gd < 0 ? 'text-loss' : 'text-muted-foreground' },
              ].map((s, i) => <span key={i} className={`w-8 text-center ${s.color}`}>{s.val}</span>)}
            </div>
            <div className="hidden lg:flex items-center gap-1">
              {(row.formGuide ?? []).slice(-5).map((r, i) => <FormIndicator key={i} result={normalizeForm(r)} />)}
            </div>
            <div className={`w-10 text-right font-display text-base tabular-nums shrink-0 ${zone === 'champion' ? 'text-accent' : 'text-foreground'}`}>{row.points}</div>
          </motion.div>
        );
      })}

      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-destructive/20 bg-destructive/[0.03]">
        <AlertTriangle className="h-3 w-3 text-destructive/60 shrink-0" />
        <span className="text-[10px] text-destructive/50">Les 2 derniers clubs sont relégués en MTN Elite Two à la fin de la saison.</span>
      </div>
    </div>
  );
};

const MobileTable = ({ standings }: { standings: ApiStanding[] }) => {
  const total = standings.length;
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-card sm:hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-surface/80 text-[9px] text-muted-foreground uppercase tracking-wider">
        <span className="w-5 text-center">#</span>
        <span className="w-6" />
        <span className="flex-1">Club</span>
        <span className="w-6 text-center">J</span>
        <span className="w-7 text-center">DB</span>
        <span className="w-7 text-center">Pts</span>
      </div>
      {standings.map((row, idx) => {
        const zone = getZone(row.position, total);
        const gd   = row.goalDifference;
        return (
          <motion.div key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.025 }}
            className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/20 last:border-0 border-l-2 ${ZONE_BORDER[zone]}`}>
            <span className={`w-5 text-center font-display text-xs ${zone === 'champion' ? 'text-accent' : 'text-muted-foreground'}`}>{row.position}</span>
            <ClubLogo club={row.club} size={22} />
            <span className="flex-1 text-xs font-medium truncate">{row.club.name}</span>
            <span className="w-6 text-center text-xs text-muted-foreground">{row.played}</span>
            <span className={`w-7 text-center text-xs ${gd > 0 ? 'text-win' : gd < 0 ? 'text-loss' : 'text-muted-foreground'}`}>{gd > 0 ? `+${gd}` : gd}</span>
            <span className={`w-7 text-center font-display text-sm ${zone === 'champion' ? 'text-accent' : 'text-foreground'}`}>{row.points}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function StandingsPage() {
  const [standings, setStandings] = useState<ApiStanding[]>([]);
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getStandings(SEASON_ID);
      setStandings(data.length > 0 ? data : MOCK_STANDINGS);
    } catch {
      setStandings(MOCK_STANDINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const currentRound = standings[0]?.played ?? 0;

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
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight">Classement</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {currentRound > 0 ? `Journée ${currentRound} · Mis à jour en temps réel` : 'Mis à jour après chaque match'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 lg:py-8">
        {!loading && standings.length > 0 && <SummaryCards standings={standings} />}

        <div className="hidden sm:flex items-center gap-1.5 mb-4 text-[10px] text-muted-foreground/60">
          <Info className="h-3 w-3 shrink-0" />
          <span>J=Joués · V=Victoires · N=Nuls · D=Défaites · BP=Buts pour · BC=Buts contre · DB=Différence</span>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-xl border border-border overflow-hidden bg-gradient-card">
              {Array.from({ length: 14 }).map((_, i) => <StandingRowSkeleton key={i} i={i} />)}
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="hidden sm:block"><StandingsTable standings={standings} /></div>
              <MobileTable standings={standings} />
            </motion.div>
          )}
        </AnimatePresence>

        <ZoneLegend />

        {!loading && (
          <div className="flex justify-center mt-8">
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