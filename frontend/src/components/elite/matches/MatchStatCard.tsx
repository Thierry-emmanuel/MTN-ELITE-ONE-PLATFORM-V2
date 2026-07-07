import { memo } from 'react';
import { motion } from 'framer-motion';

interface MatchStatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delay?: number;
  badge?: React.ReactNode;
}

/** Mirrors the Stats page's StatCard so Fixtures/Results feel like the same product. */
export const MatchStatCard = memo(({
  icon: Icon, label, value, sub, color = 'text-foreground', delay = 0, badge,
}: MatchStatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-xl border border-border/50 bg-gradient-to-b from-white/[0.05] to-transparent p-4 flex items-center gap-3 hover:border-border/80 transition-colors"
  >
    <div className="h-9 w-9 rounded-xl bg-white/[0.05] border border-border/40 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground/60" />
    </div>
    <div className="min-w-0">
      <p className={`font-display text-2xl tabular-nums leading-none ${color}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground/50 mt-0.5 truncate">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/30 mt-0.5 truncate">{sub}</p>}
      {badge}
    </div>
  </motion.div>
));
MatchStatCard.displayName = 'MatchStatCard';
