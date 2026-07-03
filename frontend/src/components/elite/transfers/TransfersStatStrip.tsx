import { memo } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, MessagesSquare, Radio, Wallet } from 'lucide-react';
import { formatFeeCompact } from '@/utils/transfersInjuries.utils';

interface Props {
  confirmed: number;
  inTalks: number;
  rumors: number;
  totalSpend: number;
}

const build = (p: Props) => [
  { label: 'Transferts officiels', value: String(p.confirmed), icon: BadgeCheck, color: 'text-primary-glow' },
  { label: 'En négociation',       value: String(p.inTalks),   icon: MessagesSquare, color: 'text-draw' },
  { label: 'Rumeurs suivies',      value: String(p.rumors),    icon: Radio, color: 'text-muted-foreground' },
  { label: 'Volume déclaré',       value: `${formatFeeCompact(p.totalSpend)} FCFA`, icon: Wallet, color: 'text-accent' },
];

export const TransfersStatStrip = memo((props: Props) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {build(props).map((s, i) => {
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
TransfersStatStrip.displayName = 'TransfersStatStrip';
