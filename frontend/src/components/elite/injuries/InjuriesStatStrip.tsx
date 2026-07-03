import { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, TrendingUp, CheckCircle2, Users } from 'lucide-react';

interface Props {
  total: number;
  active: number;
  recovering: number;
  cleared: number;
}

const STATS = (p: Props) => [
  { label: 'Joueurs suivis', value: p.total, icon: Users, color: 'text-foreground' },
  { label: 'Forfaits',       value: p.active, icon: AlertOctagon, color: 'text-destructive' },
  { label: 'En reprise',     value: p.recovering, icon: TrendingUp, color: 'text-draw' },
  { label: 'Rétablis (30j)', value: p.cleared, icon: CheckCircle2, color: 'text-primary-glow' },
];

export const InjuriesStatStrip = memo((props: Props) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {STATS(props).map((s, i) => {
      const Icon = s.icon;
      return (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className="bg-gradient-card border border-border rounded-2xl p-4 flex items-center gap-3"
        >
          <div className={`h-9 w-9 rounded-xl bg-white/5 grid place-items-center shrink-0 ${s.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className={`font-display text-xl leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 truncate">{s.label}</div>
          </div>
        </motion.div>
      );
    })}
  </div>
));
InjuriesStatStrip.displayName = 'InjuriesStatStrip';
