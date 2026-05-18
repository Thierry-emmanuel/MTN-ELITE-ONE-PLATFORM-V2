import { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Download, X, Info, User,
} from 'lucide-react';
import type { PlayerStat, StatSortField } from '@/types/football.types';

// ─── Column definitions ───────────────────────────────────────────────────────
interface ColDef {
  key: StatSortField | 'playerName';
  label: string;
  shortLabel: string;
  tooltip: string;
  defaultVisible: boolean;
  align: 'left' | 'right';
  format?: (v: number, per90: boolean, mins: number) => string;
}

const COLUMNS: ColDef[] = [
  { key: 'playerName',     label: 'Joueur',          shortLabel: 'Joueur',  tooltip: 'Nom du joueur',                        defaultVisible: true,  align: 'left' },
  { key: 'appearances',    label: 'App',              shortLabel: 'App',     tooltip: 'Apparitions',                          defaultVisible: true,  align: 'right', format: v => String(v) },
  { key: 'minutesPlayed',  label: 'Min',              shortLabel: 'Min',     tooltip: 'Minutes jouées',                       defaultVisible: true,  align: 'right', format: v => String(v) },
  { key: 'goals',          label: 'Buts',             shortLabel: 'Buts',    tooltip: 'Buts marqués',                         defaultVisible: true,  align: 'right', format: (v, p, m) => p ? ((v / m) * 90).toFixed(2) : String(v) },
  { key: 'assists',        label: 'Passes D.',        shortLabel: 'PD',      tooltip: 'Passes décisives',                     defaultVisible: true,  align: 'right', format: (v, p, m) => p ? ((v / m) * 90).toFixed(2) : String(v) },
  { key: 'keyPasses',      label: 'Clés',             shortLabel: 'Clés',    tooltip: 'Passes clés menant à une occasion',    defaultVisible: true,  align: 'right', format: (v, p, m) => p ? ((v / m) * 90).toFixed(1) : String(v) },
  { key: 'shots',          label: 'Tirs',             shortLabel: 'Tirs',    tooltip: 'Tentatives au but',                    defaultVisible: true,  align: 'right', format: (v, p, m) => p ? ((v / m) * 90).toFixed(1) : String(v) },
  { key: 'shotsOnTarget',  label: 'C/C',              shortLabel: 'C/C',     tooltip: 'Tirs cadrés',                          defaultVisible: true,  align: 'right', format: (v, p, m) => p ? ((v / m) * 90).toFixed(1) : String(v) },
  { key: 'xG',             label: 'xG',               shortLabel: 'xG',      tooltip: 'Expected Goals (buts attendus)',        defaultVisible: false, align: 'right', format: v => (v ?? 0).toFixed(1) },
  { key: 'penaltiesScored',label: 'Pen. M.',          shortLabel: 'P.M.',    tooltip: 'Penaltys marqués',                     defaultVisible: false, align: 'right', format: v => String(v) },
  { key: 'yellowCards',    label: '🟨',               shortLabel: 'J.',      tooltip: 'Cartons jaunes',                       defaultVisible: true,  align: 'right', format: v => String(v) },
  { key: 'redCards',       label: '🟥',               shortLabel: 'R.',      tooltip: 'Cartons rouges',                       defaultVisible: true,  align: 'right', format: v => String(v) },
  { key: 'passAccuracy',   label: 'Pass%',            shortLabel: 'Pass%',   tooltip: 'Précision des passes (%)',             defaultVisible: false, align: 'right', format: v => v ? `${v}%` : '—' },
];

const POSITION_BADGE: Record<string, string> = {
  GK: 'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/30',
  DF: 'bg-[#1F8A4C]/20 text-[#34D399] border-[#1F8A4C]/30',
  MF: 'bg-[#FCD116]/15 text-[#FCD116] border-[#FCD116]/30',
  FW: 'bg-[#CE1126]/20 text-[#F87171] border-[#CE1126]/30',
};

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ field, sortField, sortDir }: {
  field: string; sortField: string; sortDir: 'asc' | 'desc';
}) => {
  if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-accent" />
    : <ChevronDown className="h-3 w-3 text-accent" />;
};

// ─── Player detail slide-over ─────────────────────────────────────────────────
const PlayerDetailSlideOver = memo(({
  player, onClose,
}: { player: PlayerStat; onClose: () => void }) => {
  const stats = [
    { label: 'Apparitions',      value: player.appearances },
    { label: 'Minutes',          value: player.minutesPlayed },
    { label: 'Buts',             value: player.goals },
    { label: 'Passes D.',        value: player.assists },
    { label: 'Passes Clés',      value: player.keyPasses },
    { label: 'Tirs',             value: player.shots },
    { label: 'Tirs cadrés',      value: player.shotsOnTarget },
    { label: 'Cartons jaunes',   value: player.yellowCards },
    { label: 'Cartons rouges',   value: player.redCards },
    { label: 'Penalties',        value: player.penaltiesScored },
    { label: 'xG',               value: player.xG?.toFixed(1) ?? '—' },
    { label: 'Pass. précision',  value: player.passAccuracy ? `${player.passAccuracy}%` : '—' },
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-[hsl(168,45%,7%)] border-l border-border shadow-2xl flex flex-col"
      role="dialog"
      aria-label={`Détails de ${player.playerName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h2 className="font-display text-sm font-bold text-foreground">Fiche joueur</h2>
        <button onClick={onClose} aria-label="Fermer" className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Player info */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {player.photoUrl
              ? <img src={player.photoUrl} alt={player.playerName} className="h-14 w-14 rounded-full object-cover" loading="lazy" />
              : <User className="h-6 w-6 text-muted-foreground/40" />
            }
          </div>
          <div>
            <p className="font-display text-base font-bold text-foreground">{player.playerName}</p>
            <p className="text-[11px] text-muted-foreground/60">{player.clubName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${POSITION_BADGE[player.position] ?? 'bg-white/10 text-muted-foreground border-border'}`}>
                {player.position}
              </span>
              {player.nationality && (
                <span className="text-[10px] text-muted-foreground/50">{player.nationality}</span>
              )}
              {player.age && (
                <span className="text-[10px] text-muted-foreground/50">{player.age} ans</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg bg-white/[0.03] border border-border/30 px-3 py-2.5 text-center">
              <p className="font-display text-xl tabular-nums text-foreground leading-none">{s.value}</p>
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});
PlayerDetailSlideOver.displayName = 'PlayerDetailSlideOver';

// ─── Export to CSV ────────────────────────────────────────────────────────────
function exportCsv(players: PlayerStat[], per90: boolean) {
  const header = ['Joueur', 'Club', 'Poste', 'App', 'Min', 'Buts', 'Passes D.', 'Passes Clés', 'Tirs', 'C/C', 'xG', 'J.', 'R.'];
  const rows = players.map(p => [
    p.playerName, p.clubName, p.position,
    p.appearances, p.minutesPlayed,
    per90 ? ((p.goals / p.minutesPlayed) * 90).toFixed(2) : p.goals,
    per90 ? ((p.assists / p.minutesPlayed) * 90).toFixed(2) : p.assists,
    per90 ? ((p.keyPasses / p.minutesPlayed) * 90).toFixed(1) : p.keyPasses,
    per90 ? ((p.shots / p.minutesPlayed) * 90).toFixed(1) : p.shots,
    per90 ? ((p.shotsOnTarget / p.minutesPlayed) * 90).toFixed(1) : p.shotsOnTarget,
    (p.xG ?? 0).toFixed(1), p.yellowCards, p.redCards,
  ]);

  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `stats-joueurs${per90 ? '-par90' : ''}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Table row ────────────────────────────────────────────────────────────────
const TableRow = memo(({
  player, idx, rank, per90, visibleKeys, onSelect,
}: {
  player: PlayerStat;
  idx: number;
  rank: number;
  per90: boolean;
  visibleKeys: string[];
  onSelect: (p: PlayerStat) => void;
}) => {
  const fmt = (col: ColDef, val: number) =>
    col.format ? col.format(val, per90, player.minutesPlayed || 1) : String(val);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: idx * 0.025, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(player)}
      className="group cursor-pointer border-b border-border/20 last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      {/* Rank */}
      <td className="pl-4 pr-2 py-3 text-center w-8">
        <span className="text-xs text-muted-foreground/50 tabular-nums font-medium">{rank}</span>
      </td>

      {visibleKeys.map(key => {
        const col = COLUMNS.find(c => c.key === key);
        if (!col) return null;

        if (key === 'playerName') {
          return (
            <td key={key} className="px-3 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {player.photoUrl
                    ? <img src={player.photoUrl} alt={player.playerName} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                    : <span className="text-[10px] font-bold text-muted-foreground/60">
                        {player.playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-accent transition-colors">{player.playerName}</p>
                  <p className="text-[10px] text-muted-foreground/50 truncate">{player.clubShort ?? player.clubName}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase hidden sm:inline ${POSITION_BADGE[player.position] ?? 'bg-white/10 text-muted-foreground border-border'}`}>
                  {player.position}
                </span>
              </div>
            </td>
          );
        }

        const rawVal = (player as Record<string, unknown>)[key] as number ?? 0;
        return (
          <td key={key} className={`px-3 py-3 text-right text-sm tabular-nums ${key === 'yellowCards' ? 'text-[#FCD116]/80' : key === 'redCards' ? 'text-[#CE1126]/80' : 'text-foreground/80'}`}>
            {fmt(col, rawVal)}
          </td>
        );
      })}
    </motion.tr>
  );
});
TableRow.displayName = 'TableRow';

// ─── PlayerStatsTable ─────────────────────────────────────────────────────────
interface PlayerStatsTableProps {
  players: PlayerStat[];
  loading: boolean;
  per90: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  onSortChange: (field: StatSortField, dir: 'asc' | 'desc') => void;
  sortField: StatSortField;
  sortDir: 'asc' | 'desc';
}

export const PlayerStatsTable = memo(({
  players, loading, per90,
  page, totalPages, totalCount,
  onPageChange, onSortChange,
  sortField, sortDir,
}: PlayerStatsTableProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStat | null>(null);
  const [visibleCols, setVisibleCols]       = useState<Set<string>>(
    () => new Set(COLUMNS.filter(c => c.defaultVisible).map(c => c.key))
  );
  const [showColPicker, setShowColPicker]   = useState(false);

  const visibleKeys = useMemo(
    () => COLUMNS.filter(c => visibleCols.has(c.key)).map(c => c.key),
    [visibleCols],
  );

  const toggleCol = useCallback((key: string) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (key === 'playerName') return next; // always visible
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const handleSort = useCallback((key: string) => {
    if (key === 'playerName') return;
    const field = key as StatSortField;
    const newDir = sortField === field && sortDir === 'desc' ? 'asc' : 'desc';
    onSortChange(field, newDir);
  }, [sortField, sortDir, onSortChange]);

  const startRow = (page - 1) * 25 + 1;
  const endRow   = Math.min(page * 25, totalCount);

  return (
    <>
      {/* Table toolbar */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="text-[11px] text-muted-foreground/50">
          {totalCount > 0 ? `${startRow}–${endRow} sur ${totalCount} joueurs` : ''}
          {per90 && <span className="ml-1.5 text-accent/60 font-medium">(par 90')</span>}
        </p>
        <div className="flex items-center gap-2">
          {/* Column picker */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all"
            >
              <Info className="h-3 w-3" />
              Colonnes
            </button>
            <AnimatePresence>
              {showColPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  className="absolute right-0 top-full mt-1.5 z-30 w-52 rounded-xl border border-border bg-[hsl(168,45%,8%)] shadow-xl p-2"
                >
                  {COLUMNS.filter(c => c.key !== 'playerName').map(col => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols.has(col.key)}
                        onChange={() => toggleCol(col.key)}
                        className="accent-accent h-3 w-3"
                      />
                      <span className="text-[11px] text-foreground/80">{col.label}</span>
                      <span className="ml-auto text-[9px] text-muted-foreground/40">{col.tooltip.slice(0, 20)}</span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export */}
          <button
            onClick={() => exportCsv(players, per90)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* Head */}
            <thead>
              <tr className="border-b border-border/60 bg-white/[0.03]">
                <th className="pl-4 pr-2 py-2.5 w-8 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium text-center">#</th>
                {visibleKeys.map(key => {
                  const col = COLUMNS.find(c => c.key === key)!;
                  const sortable = key !== 'playerName';
                  return (
                    <th
                      key={key}
                      onClick={() => sortable && handleSort(key)}
                      title={col.tooltip}
                      className={`px-3 py-2.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium ${col.align === 'right' ? 'text-right' : 'text-left'} ${sortable ? 'cursor-pointer hover:text-muted-foreground transition-colors select-none' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.align === 'right' && sortable && (
                          <SortIcon field={key} sortField={sortField} sortDir={sortDir} />
                        )}
                        {col.shortLabel}
                        {col.align === 'left' && sortable && (
                          <SortIcon field={key} sortField={sortField} sortDir={sortDir} />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence mode="wait">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/20">
                      {[...Array(visibleKeys.length + 1)].map((_, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-4 rounded bg-white/[0.05] animate-pulse" style={{ width: j === 1 ? '80%' : '60%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan={visibleKeys.length + 1} className="py-16 text-center text-sm text-muted-foreground/50">
                      Aucun joueur trouvé pour ces critères.
                    </td>
                  </tr>
                ) : (
                  players.map((p, i) => (
                    <TableRow
                      key={p.playerId}
                      player={p}
                      idx={i}
                      rank={(page - 1) * 25 + i + 1}
                      per90={per90}
                      visibleKeys={visibleKeys}
                      onSelect={setSelectedPlayer}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-border/40 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  p === page
                    ? 'bg-accent text-black font-bold shadow-[0_0_10px_rgba(252,209,22,0.20)]'
                    : 'bg-white/[0.04] border border-border/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-border/40 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ›
          </button>
        </div>
      )}

      {/* Slide-over */}
      <AnimatePresence>
        {selectedPlayer && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedPlayer(null)}
            />
            <PlayerDetailSlideOver
              key="slideover"
              player={selectedPlayer}
              onClose={() => setSelectedPlayer(null)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
});
PlayerStatsTable.displayName = 'PlayerStatsTable';