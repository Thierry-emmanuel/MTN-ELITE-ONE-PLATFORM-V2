import { memo } from 'react';
import { motion } from 'framer-motion';

interface StatComparisonBarProps {
  label: string;
  home: number;
  away: number;
  /** Render values with a suffix, e.g. '%' for possession */
  suffix?: string;
  /** When true, higher home value is highlighted (default true for most stats) */
  delay?: number;
}

/**
 * Single-row Sofascore-style stat comparison: value — label — value,
 * with a split bar underneath showing relative share.
 */
export const StatComparisonBar = memo(({ label, home, away, suffix = '', delay = 0 }: StatComparisonBarProps) => {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  const awayPct = 100 - homePct;
  const homeLead = home > away;
  const awayLead = away > home;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono font-bold tabular-nums w-12 ${homeLead ? 'text-foreground' : 'text-muted-foreground/60'}`}>
          {home}{suffix}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 text-center flex-1">
          {label}
        </span>
        <span className={`font-mono font-bold tabular-nums w-12 text-right ${awayLead ? 'text-foreground' : 'text-muted-foreground/60'}`}>
          {away}{suffix}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
        <div
          className={`h-full rounded-l-full transition-all ${homeLead ? 'bg-primary' : 'bg-primary/30'}`}
          style={{ width: `${homePct}%` }}
        />
        <div
          className={`h-full rounded-r-full transition-all ${awayLead ? 'bg-accent' : 'bg-accent/30'}`}
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </motion.div>
  );
});
StatComparisonBar.displayName = 'StatComparisonBar';
