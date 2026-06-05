import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, ToggleLeft, ToggleRight } from 'lucide-react';
import type { PlayerPosition, PlayerStatsFilter } from '@/types/football.types';

// ─── Position options ─────────────────────────────────────────────────────────
const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'GK',  label: 'Gardiens' },
  { value: 'DF',  label: 'Défenseurs' },
  { value: 'MF',  label: 'Milieux' },
  { value: 'FW',  label: 'Attaquants' },
];

const MIN_MINUTES_OPTIONS = [
  { value: 0,   label: 'Tous' },
  { value: 360, label: '360\u202fmin' },
  { value: 540, label: '540\u202fmin' },
  { value: 720, label: '720\u202fmin' },
  { value: 900, label: '900\u202fmin' },
];

// ─── Active filter pill ────────────────────────────────────────────────────────
const ActivePill = memo(({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-medium"
  >
    {label}
    <button onClick={onRemove} aria-label={`Supprimer le filtre ${label}`} className="hover:text-accent/70 transition-colors">
      <X className="h-3 w-3" />
    </button>
  </motion.span>
));
ActivePill.displayName = 'ActivePill';

// ─── Props ────────────────────────────────────────────────────────────────────
interface StatsFiltersProps {
  filters: PlayerStatsFilter;
  onChange: (updates: Partial<PlayerStatsFilter>) => void;
  onReset: () => void;
  clubOptions: { id: string; name: string; short?: string }[];
  per90: boolean;
  onPer90Toggle: (v: boolean) => void;
  /** Whether this is for club stats (hides player-only filters) */
  mode?: 'player' | 'club';
}

export const StatsFilters = memo(({
  filters,
  onChange,
  onReset,
  clubOptions,
  per90,
  onPer90Toggle,
  mode = 'player',
}: StatsFiltersProps) => {
  const hasActiveFilters =
    (filters.position && filters.position !== 'ALL') ||
    filters.teamId ||
    (filters.minMinutes && filters.minMinutes > 0);

  const handlePosition = useCallback((pos: PlayerPosition) => {
    onChange({ position: pos === 'ALL' ? undefined : pos, page: 1 });
  }, [onChange]);

  const handleTeam = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ teamId: e.target.value || undefined, page: 1 });
  }, [onChange]);

  const handleMinMinutes = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ minMinutes: Number(e.target.value) || undefined, page: 1 });
  }, [onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border/60 bg-white/[0.02] p-4 space-y-4"
    >
      {/* Row 1: controls */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 uppercase tracking-wider shrink-0">
          <Filter className="h-3 w-3" />
          Filtres
        </span>

        {/* Position filter (player mode only) */}
        {mode === 'player' && (
          <div className="flex gap-1 flex-wrap" role="group" aria-label="Filtrer par poste">
            {POSITIONS.map(pos => {
              const active = (filters.position ?? 'ALL') === pos.value;
              return (
                <button
                  key={pos.value}
                  onClick={() => handlePosition(pos.value)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? 'bg-accent text-black'
                      : 'bg-white/[0.04] text-muted-foreground hover:bg-white/[0.07] hover:text-foreground border border-border/40'
                  }`}
                >
                  {pos.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Club selector */}
        {clubOptions.length > 0 && (
          <select
            value={filters.teamId ?? ''}
            onChange={handleTeam}
            aria-label="Filtrer par club"
            className="bg-white/[0.04] border border-border/40 rounded-lg px-3 py-1.5 text-[12px] text-foreground focus:outline-none focus:border-accent/50 transition-colors cursor-pointer min-w-[130px]"
          >
            <option value="">Tous les clubs</option>
            {clubOptions.map(c => (
              <option key={c.id} value={c.id}>{c.short ?? c.name}</option>
            ))}
          </select>
        )}

        {/* Min minutes (player mode) */}
        {mode === 'player' && (
          <select
            value={filters.minMinutes ?? 0}
            onChange={handleMinMinutes}
            aria-label="Minutes minimum jouées"
            className="bg-white/[0.04] border border-border/40 rounded-lg px-3 py-1.5 text-[12px] text-foreground focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
          >
            {MIN_MINUTES_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label === 'Tous' ? 'Min. joués' : `≥ ${o.label}`}</option>
            ))}
          </select>
        )}

        {/* Per-90 toggle */}
        {mode === 'player' && (
          <button
            onClick={() => onPer90Toggle(!per90)}
            aria-pressed={per90}
            title="Basculer entre totaux et statistiques par 90 minutes"
            className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all border ${
              per90
                ? 'bg-accent/15 border-accent/30 text-accent'
                : 'bg-white/[0.04] border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            {per90
              ? <ToggleRight className="h-3.5 w-3.5" />
              : <ToggleLeft className="h-3.5 w-3.5" />
            }
            <span>Par 90'</span>
          </button>
        )}

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2 ml-auto"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Row 2: active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {filters.position && filters.position !== 'ALL' && (
            <ActivePill
              label={POSITIONS.find(p => p.value === filters.position)?.label ?? filters.position}
              onRemove={() => onChange({ position: undefined, page: 1 })}
            />
          )}
          {filters.teamId && (
            <ActivePill
              label={clubOptions.find(c => c.id === filters.teamId)?.name ?? filters.teamId}
              onRemove={() => onChange({ teamId: undefined, page: 1 })}
            />
          )}
          {filters.minMinutes && filters.minMinutes > 0 && (
            <ActivePill
              label={`≥ ${filters.minMinutes}min`}
              onRemove={() => onChange({ minMinutes: undefined, page: 1 })}
            />
          )}
        </div>
      )}
    </motion.div>
  );
});
StatsFilters.displayName = 'StatsFilters';