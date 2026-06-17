import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react';
import type { ClubStat, StatSortField } from '@/types/football.types';


// ─── Mini horizontal bar ─────────────────────────────────────────────────────
const MiniBar = memo(({ value, max, color = 'bg-accent/50' }: {
  value: number; max: number; color?: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="font-display text-sm tabular-nums w-8 text-right text-foreground/80">{value}</span>
    <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden min-w-[40px]">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  </div>
));
MiniBar.displayName = 'MiniBar';

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ field, sortField, sortDir }: {
  field: string; sortField: string; sortDir: 'asc' | 'desc';
}) => {
  if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-accent" />
    : <ChevronDown className="h-3 w-3 text-accent" />;
};

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCsv(clubs: ClubStat[]) {
  const header = ['Club', 'J', 'V', 'N', 'D', 'BP', 'BC', 'DB', 'Tirs', 'C/C', 'CS', 'J.', 'R.', 'Pts'];
  const rows = clubs.map(c => [
    c.clubName, c.matchesPlayed, c.wins, c.draws, c.losses,
    c.goalsFor, c.goalsAgainst, c.goalDifference,
    c.shots, c.shotsOnTarget, c.cleanSheets,
    c.yellowCards, c.redCards, c.points,
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'stats-clubs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Club row ─────────────────────────────────────────────────────────────────
const ClubRow = memo(({ club, rank, idx, maxGoals, maxShots }: {
  club: ClubStat; rank: number; idx: number; maxGoals: number; maxShots: number;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, delay: idx * 0.025, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setExpanded(v => !v)}
        className="group cursor-pointer border-b border-border/20 last:border-0 hover:bg-white/[0.025] transition-colors"
      >
        {/* Rank */}
        <td className="pl-4 pr-2 py-3 text-center w-8">
          <span className="text-xs text-muted-foreground/50 tabular-nums font-medium">{rank}</span>
        </td>

        {/* Club name */}
        <td className="px-3 py-3 min-w-[140px]">
          <div className="flex items-center gap-2">
            {/* Club color dot */}
            <div
              className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center shrink-0 text-[9px] font-black"
              style={{ background: `hsl(0, 0%, 18%)` }}
            >
              {club.clubShort?.[0] ?? club.clubName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold group-hover:text-accent transition-colors">{club.clubName}</p>
              <p className="text-[10px] text-muted-foreground/50">{club.clubShort}</p>
            </div>
          </div>
        </td>

        {/* Numeric stats */}
        {(['matchesPlayed','wins','draws','losses','goalsFor','goalsAgainst','shots','shotsOnTarget','cleanSheets','yellowCards','redCards','points'] as const).map(key => {
          const val = club[key] as number;
          const isPoints  = key === 'points';
          const isYellow  = key === 'yellowCards';
          const isRed     = key === 'redCards';
          const isWin     = key === 'wins';
          return (
            <td key={key} className={`px-3 py-3 text-right text-sm tabular-nums ${
              isPoints ? 'font-display text-base font-bold text-foreground' :
              isYellow ? 'text-[#FCD116]/80' :
              isRed    ? 'text-[#CE1126]/80' :
              isWin    ? 'text-[#1F8A4C]/90' :
              'text-foreground/80'
            }`}>
              {val ?? '—'}
            </td>
          );
        })}
      </motion.tr>

      {/* Expanded detail row */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b border-border/20"
          >
            <td colSpan={14} className="px-6 py-3 bg-white/[0.015]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Attaque</p>
                  <div className="space-y-1.5">
                    <MiniBar value={club.goalsFor}      max={maxGoals} color="bg-[#1F8A4C]/60"  />
                    <MiniBar value={club.shots}         max={maxShots} color="bg-accent/40"      />
                    <MiniBar value={club.shotsOnTarget} max={maxShots} color="bg-accent/60"      />
                  </div>
                  <div className="flex gap-3 mt-1 text-[9px] text-muted-foreground/40">
                    <span>Buts</span><span>Tirs</span><span>Cadrés</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Discipline</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[#FCD116]/[0.05] border border-[#FCD116]/15 p-2 text-center">
                      <p className="font-display text-lg text-[#FCD116] tabular-nums">{club.yellowCards}</p>
                      <p className="text-[9px] text-muted-foreground/40 mt-0.5">Jaunes</p>
                    </div>
                    <div className="rounded-lg bg-[#CE1126]/[0.05] border border-[#CE1126]/15 p-2 text-center">
                      <p className="font-display text-lg text-[#CE1126] tabular-nums">{club.redCards}</p>
                      <p className="text-[9px] text-muted-foreground/40 mt-0.5">Rouges</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Résumé</p>
                  <div className="space-y-1 text-xs text-muted-foreground/70">
                    <div className="flex justify-between">
                      <span>Clean sheets</span>
                      <span className="font-display tabular-nums text-foreground">{club.cleanSheets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diff. de buts</span>
                      <span className={`font-display tabular-nums ${club.goalDifference > 0 ? 'text-[#1F8A4C]' : club.goalDifference < 0 ? 'text-[#CE1126]' : 'text-muted-foreground'}`}>
                        {club.goalDifference > 0 ? `+${club.goalDifference}` : club.goalDifference}
                      </span>
                    </div>
                    {club.possession && (
                      <div className="flex justify-between">
                        <span>Possession</span>
                        <span className="font-display tabular-nums text-foreground">{club.possession}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
});
ClubRow.displayName = 'ClubRow';

// ─── ClubStatsTable ───────────────────────────────────────────────────────────
interface ClubStatsTableProps {
  clubs: ClubStat[];
  loading: boolean;
  sortField: string;
  sortDir: 'asc' | 'desc';
  onSortChange: (field: StatSortField, dir: 'asc' | 'desc') => void;
}

export const ClubStatsTable = memo(({
  clubs, loading, sortField, sortDir, onSortChange,
}: ClubStatsTableProps) => {
  const maxGoals = Math.max(...clubs.map(c => c.goalsFor), 1);
  const maxShots = Math.max(...clubs.map(c => c.shots), 1);

  const handleSort = useCallback((key: string) => {
    if (key === 'clubName') return;
    const field = key as StatSortField;
    const newDir = sortField === field && sortDir === 'desc' ? 'asc' : 'desc';
    onSortChange(field, newDir);
  }, [sortField, sortDir, onSortChange]);

  const COL_HEADERS = ['J','V','N','D','BP','BC','Tirs','C/C','CS','🟨','🟥','Pts'];
  const COL_KEYS    = ['matchesPlayed','wins','draws','losses','goalsFor','goalsAgainst','shots','shotsOnTarget','cleanSheets','yellowCards','redCards','points'];
  const COL_TITLES  = ['Matchs joués','Victoires','Nuls','Défaites','Buts pour','Buts contre','Tirs','Tirs cadrés','Clean sheets','Cartons jaunes','Cartons rouges','Points'];

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-muted-foreground/50">{clubs.length} clubs</p>
        <button
          onClick={() => exportCsv(clubs)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all"
        >
          <Download className="h-3 w-3" />
          CSV
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border/60 bg-white/[0.03]">
                <th className="pl-4 pr-2 py-2.5 w-8 text-center" />
                <th className="px-3 py-2.5 text-left text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">Club</th>
                {COL_HEADERS.map((h, i) => (
                  <th
                    key={h}
                    onClick={() => handleSort(COL_KEYS[i])}
                    title={COL_TITLES[i]}
                    className="px-3 py-2.5 text-right text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium cursor-pointer hover:text-muted-foreground transition-colors select-none"
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      <SortIcon field={COL_KEYS[i]} sortField={sortField} sortDir={sortDir} />
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/20">
                      {Array.from({ length: 14 }).map((_, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-4 rounded bg-white/[0.05] animate-pulse" style={{ width: j === 1 ? '80%' : '50%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : clubs.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-16 text-center text-sm text-muted-foreground/50">
                      Aucun club trouvé.
                    </td>
                  </tr>
                ) : (
                  clubs.map((club, idx) => (
                    <ClubRow
                      key={club.clubId}
                      club={club}
                      rank={idx + 1}
                      idx={idx}
                      maxGoals={maxGoals}
                      maxShots={maxShots}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});
ClubStatsTable.displayName = 'ClubStatsTable';