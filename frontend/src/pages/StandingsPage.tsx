import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Info, RefreshCw, TrendingUp, TrendingDown,
  Minus, Home, Plane, BarChart2, ListOrdered,
} from 'lucide-react';
import { footballApi as api } from "@/services/api";
import type { ApiStanding } from "@/types/football.types";
import { MOCK_STANDINGS, DEV_SEASON_ID } from '../services/mockData';
import { sortStandings, getZone } from '../utils/football.utils';
import type { StandingsView, Zone } from '../types/football.types';
import {
  ClubLogo, FormIndicator, StandingRowSkeleton,
  PageHero, ErrorState, SummaryCard,
} from '../components/ui/football';
import { Link } from 'react-router-dom';

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

// ─── Normalise legacy form strings (V→W etc.) ────────────────────────────────
function normaliseForm(f: string): 'W' | 'D' | 'L' {
  const u = f.toUpperCase();
  if (u === 'V' || u === 'W') return 'W';
  if (u === 'D' || u === 'N') return 'D';
  return 'L';
}

function adaptStanding(s: ApiStanding, idx: number) {
  return {
    id:             s.id,
    position:       s.position ?? idx + 1,
    club:           s.club,
    played:         s.played,
    won:            s.won,
    drawn:          s.drawn,
    lost:           s.lost,
    goalsFor:       s.goalsFor,
    goalsAgainst:   s.goalsAgainst,
    goalDifference: s.goalDifference,
    points:         s.points,
    formGuide:      (s.formGuide ?? []).slice(-5).map(normaliseForm) as ('W'|'D'|'L')[],
    homeWon:        s.homeWon,
    homeDrawn:      s.homeDrawn,
    awayWon:        s.awayWon,
    awayDrawn:      s.awayDrawn,
  };
}

// ─── Zone styling — using semantic tokens ─────────────────────────────────────
const ZONE_BORDER: Record<Zone, string> = {
  champion:   'border-l-accent',
  caf:        'border-l-primary',
  relegation: 'border-l-live',
  none:       'border-l-transparent',
};
const ZONE_BG: Record<Zone, string> = {
  champion:   'bg-accent/[0.03]',
  caf:        'bg-primary/[0.03]',
  relegation: 'bg-live/[0.03]',
  none:       '',
};

// ─── Position delta ───────────────────────────────────────────────────────────
const POSITION_CHANGES: Record<number, number> = {
  1: 2, 2: 0, 3: -1, 4: 1, 5: 0, 6: -2, 7: 1, 8: -1, 9: 0, 10: -1,
};

const PositionDelta = ({ pos }: { pos: number }) => {
  const d = POSITION_CHANGES[pos] ?? 0;
  if (d > 0) return (
    <span className="flex items-center gap-0.5 text-win text-[9px] font-bold">
      <TrendingUp className="h-2.5 w-2.5" />+{d}
    </span>
  );
  if (d < 0) return (
    <span className="flex items-center gap-0.5 text-live text-[9px] font-bold">
      <TrendingDown className="h-2.5 w-2.5" />{d}
    </span>
  );
  return <span className="text-white/20"><Minus className="h-2.5 w-2.5" /></span>;
};

// ─── Standing row ─────────────────────────────────────────────────────────────
interface RowData {
  id: string; position: number; club: any;
  played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number;
  points: number; formGuide: ('W'|'D'|'L')[];
}

const StandingRow = memo(({
  row, idx, total, isHovered, onHover,
}: { row: RowData; idx: number; total: number; isHovered: boolean; onHover: (id: string | null) => void }) => {
  const zone = getZone(row.position, total);
  const gd   = row.goalDifference;

  const cols = [
    { val: row.played,       cls: 'text-muted-foreground' },
    { val: row.won,          cls: 'text-win' },
    { val: row.drawn,        cls: 'text-draw' },
    { val: row.lost,         cls: 'text-live' },
    { val: row.goalsFor,     cls: 'text-foreground/70' },
    { val: row.goalsAgainst, cls: 'text-foreground/70' },
    {
      val: gd >= 0 ? `+${gd}` : String(gd),
      cls: gd > 0 ? 'text-win' : gd < 0 ? 'text-live' : 'text-muted-foreground',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: idx * 0.025, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => onHover(row.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative flex items-center gap-2 px-4 py-2.5 border-b border-border/20 last:border-0 cursor-pointer transition-colors duration-150 border-l-2 ${ZONE_BORDER[zone]} ${ZONE_BG[zone]} ${isHovered ? 'bg-white/[0.025]' : ''}`}
    >
      {/* Position + delta */}
      <div className="w-10 flex items-center gap-1 shrink-0">
        <span className={`font-display text-sm tabular-nums w-4 text-center ${
          zone === 'champion'   ? 'text-accent' :
          zone === 'caf'        ? 'text-primary' :
          zone === 'relegation' ? 'text-live/70' :
          'text-muted-foreground'
        }`}>
          {row.position === 1
            ? <Trophy className="h-3.5 w-3.5 text-accent mx-auto" />
            : row.position}
        </span>
        <PositionDelta pos={row.position} />
      </div>

      <ClubLogo club={row.club} size={28} className="shrink-0" />

      <div className="flex-1 min-w-0">
        <Link
          to={`/clubs/${row.club.id}`}
          className={`text-sm font-semibold truncate transition-colors block leading-tight ${isHovered ? 'text-accent' : 'text-foreground'}`}
        >
          {row.club.name}
        </Link>
        <span className="text-[10px] text-muted-foreground/50 hidden sm:block">{row.club.city}</span>
      </div>

      <div className="hidden md:flex text-xs tabular-nums shrink-0">
        {cols.map((c, i) => (
          <span key={i} className={`w-8 text-center ${c.cls}`}>{c.val}</span>
        ))}
      </div>

      <div className="hidden lg:flex items-center justify-center gap-0.5 w-[116px] shrink-0">
        {row.formGuide.slice(-5).map((r, i) => <FormIndicator key={i} result={r} />)}
      </div>

      <div className={`w-10 text-right font-display text-base tabular-nums shrink-0 ${zone === 'champion' ? 'text-accent' : 'text-foreground'}`}>
        {row.points}
      </div>
    </motion.div>
  );
});
StandingRow.displayName = 'StandingRow';

// ─── Desktop table ────────────────────────────────────────────────────────────
const COL_HEADERS = ['J', 'V', 'N', 'D', 'BP', 'BC', 'DB'];
const COL_TITLES  = ['Joués','Victoires','Nuls','Défaites','Buts Pour','Buts Contre','Différence'];

const DesktopTable = memo(({ rows }: { rows: RowData[] }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = rows.length;
  return (
    <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-[hsl(168,45%,9%)] backdrop-blur-sm border-l-2 border-l-transparent">
        <div className="w-10 text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">#</div>
        <div className="w-7 shrink-0" />
        <div className="flex-1 text-[10px] text-muted-foreground uppercase tracking-wider">Club</div>
        <div className="hidden md:flex text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
          {COL_HEADERS.map((h, i) => (
            <span key={h} className="w-8 text-center" title={COL_TITLES[i]}>{h}</span>
          ))}
        </div>
        <div className="hidden lg:block text-[10px] text-muted-foreground uppercase tracking-wider w-[116px] text-center shrink-0">Forme</div>
        <div className="w-10 text-right text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">Pts</div>
      </div>

      {rows.map((row, idx) => (
        <StandingRow
          key={row.id}
          row={row}
          idx={idx}
          total={total}
          isHovered={hovered === row.id}
          onHover={setHovered}
        />
      ))}

      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-live/15 bg-live/[0.025]">
        <Info className="h-3 w-3 text-live/50 shrink-0" />
        <span className="text-[10px] text-live/40">
          Les 2 derniers clubs sont relégués en MTN Elite Two à la fin de la saison.
        </span>
      </div>
    </div>
  );
});
DesktopTable.displayName = 'DesktopTable';

// ─── Mobile table ─────────────────────────────────────────────────────────────
const MobileTable = memo(({ rows }: { rows: RowData[] }) => {
  const total = rows.length;
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent md:hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-white/[0.03] text-[9px] text-muted-foreground uppercase tracking-wider">
        <span className="w-8 text-center">#</span>
        <span className="w-6 shrink-0" />
        <span className="flex-1">Club</span>
        <span className="w-6 text-center">J</span>
        <span className="w-8 text-center">DB</span>
        <span className="w-8 text-center font-bold">Pts</span>
      </div>
      {rows.map((row, idx) => {
        const zone = getZone(row.position, total);
        const gd   = row.goalDifference;
        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/20 last:border-0 border-l-2 ${ZONE_BORDER[zone]}`}
          >
            <span className={`w-5 text-center font-display text-xs tabular-nums ${zone === 'champion' ? 'text-accent' : 'text-muted-foreground'}`}>
              {row.position}
            </span>
            <ClubLogo club={row.club} size={22} />
            <span className="flex-1 text-xs font-medium truncate">{row.club.name}</span>
            <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">{row.played}</span>
            <span className={`w-8 text-center text-xs tabular-nums ${gd > 0 ? 'text-win' : gd < 0 ? 'text-live' : 'text-muted-foreground'}`}>
              {gd > 0 ? `+${gd}` : gd}
            </span>
            <span className={`w-8 text-center font-display text-sm tabular-nums ${zone === 'champion' ? 'text-accent' : 'text-foreground'}`}>
              {row.points}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
});
MobileTable.displayName = 'MobileTable';

// ─── Zone legend ──────────────────────────────────────────────────────────────
const ZoneLegend = () => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[10px] text-muted-foreground">
    {[
      { cls: 'bg-accent',   label: 'Champion MTN Elite One' },
      { cls: 'bg-primary',  label: 'Qualification CAF' },
      { cls: 'bg-live',     label: 'Relégation Elite Two' },
    ].map(z => (
      <span key={z.label} className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-sm ${z.cls}`} />
        {z.label}
      </span>
    ))}
  </div>
);

// ─── View tabs ────────────────────────────────────────────────────────────────
const VIEW_TABS: { id: StandingsView; label: string; icon: React.ReactNode }[] = [
  { id: 'overall', label: 'Général',   icon: <ListOrdered className="h-3.5 w-3.5" /> },
  { id: 'home',    label: 'Domicile',  icon: <Home className="h-3.5 w-3.5" /> },
  { id: 'away',    label: 'Extérieur', icon: <Plane className="h-3.5 w-3.5" /> },
  { id: 'form',    label: 'Forme',     icon: <BarChart2 className="h-3.5 w-3.5" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StandingsPage() {
  const [raw,     setRaw]     = useState<ApiStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [view,    setView]    = useState<StandingsView>('overall');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStandings(SEASON_ID);
      setRaw(data.length > 0 ? data : MOCK_STANDINGS as unknown as ApiStanding[]);
    } catch {
      setRaw(MOCK_STANDINGS as unknown as ApiStanding[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const adapted = useMemo(() => raw.map(adaptStanding), [raw]);
  const rows    = useMemo(() => sortStandings(adapted as any, view) as RowData[], [adapted, view]);

  const leader     = rows[0];
  const totalGoals = rows.reduce((a, s) => a + s.goalsFor, 0);
  const totalGames = Math.round(rows.reduce((a, s) => a + s.played, 0) / 2);
  const currentRound = rows[0]?.played ?? 0;

  return (
    <>
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Classement"
        subtitle={currentRound > 0 ? `Journée ${currentRound} · Mis à jour après chaque match` : undefined}
        accentColor="green"
      />

      <div className="container py-6 lg:py-8">
        {/* Summary cards */}
        {!loading && rows.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <SummaryCard label="Leader"        value={leader?.club.short ?? '—'} sub={`${leader?.points ?? 0} pts`} delay={0} />
            <SummaryCard label="Buts marqués"  value={totalGoals} sub="cette saison" delay={0.06} />
            <SummaryCard label="Matchs joués"  value={totalGames} sub={`J${currentRound} en cours`} delay={0.12} />
          </div>
        )}

        {/* Column legend */}
        <div className="hidden md:flex items-center gap-1.5 mb-4 text-[10px] text-muted-foreground/50">
          <Info className="h-3 w-3 shrink-0" />
          <span>J=Joués · V=Victoires · N=Nuls · D=Défaites · BP=Buts Pour · BC=Buts Contre · DB=Différence</span>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 mb-5 w-fit">
          {VIEW_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              aria-pressed={view === t.id}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                view === t.id
                  ? 'bg-accent text-accent-foreground shadow-[0_0_14px_rgba(252,209,22,0.25)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-xl border border-border overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => <StandingRowSkeleton key={i} i={i} />)}
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState message={error} onRetry={load} />
            </motion.div>
          ) : (
            <motion.div key={`table-${view}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DesktopTable rows={rows} />
              <MobileTable rows={rows} />
            </motion.div>
          )}
        </AnimatePresence>

        <ZoneLegend />

        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground/40">
          <span className="flex items-center gap-1 text-win"><TrendingUp className="h-3 w-3" /> Progression</span>
          <span className="flex items-center gap-1 text-live"><TrendingDown className="h-3 w-3" /> Régression</span>
          <span className="flex items-center gap-1"><Minus className="h-3 w-3" /> Inchangé</span>
        </div>

        {!loading && (
          <div className="flex justify-center mt-8">
            <button onClick={load} className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>
        )}
      </div>
    </>
  );
}