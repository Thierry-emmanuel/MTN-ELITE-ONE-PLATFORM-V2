import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { TransferRecord } from '@/types/transfersInjuries.types';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { formatDateShort, formatDateLong } from '@/utils/transfersInjuries.utils';
import { TransferStageBadge } from './TransferBadges';

interface Props {
  transfers: TransferRecord[];
}

export const TransferTimeline = memo(({ transfers }: Props) => {
  const groups = useMemo(() => {
    const map = new Map<string, TransferRecord[]>();
    for (const t of transfers) {
      const list = map.get(t.transferDate) ?? [];
      list.push(t);
      map.set(t.transferDate, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [transfers]);

  const [activeDate, setActiveDate] = useState<string | null>(groups[0]?.[0] ?? null);
  const activeGroup = groups.find(([date]) => date === activeDate)?.[1] ?? [];

  if (groups.length === 0) return null;

  return (
    <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
        <Calendar className="h-4 w-4 text-accent" />
        <h3 className="font-display text-sm uppercase tracking-wide">Timeline du mercato</h3>
      </div>

      {/* ── Horizontal date rail ── */}
      <div className="relative px-4 pt-5 pb-4 border-b border-border overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-0 min-w-max relative">
          <div className="absolute left-0 right-0 top-3 h-px bg-border" />
          {groups.map(([date, items]) => {
            const isActive = date === activeDate;
            return (
              <button
                key={date}
                onClick={() => setActiveDate(date)}
                className="relative flex flex-col items-center gap-2 px-4 shrink-0 group"
              >
                <span
                  className={`relative z-10 h-2.5 w-2.5 rounded-full transition-all ${
                    isActive ? 'bg-accent ring-4 ring-accent/20 scale-125' : 'bg-white/20 group-hover:bg-white/40'
                  }`}
                />
                <span className={`text-[10px] uppercase tracking-wide whitespace-nowrap transition-colors ${
                  isActive ? 'text-accent font-bold' : 'text-muted-foreground/60'
                }`}>
                  {formatDateShort(date)}
                </span>
                <span className={`text-[9px] rounded-full px-1.5 ${isActive ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted-foreground/50'}`}>
                  {items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected day detail ── */}
      <div className="p-4">
        {activeDate && (
          <p className="text-xs text-muted-foreground mb-3 capitalize">{formatDateLong(activeDate)}</p>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDate}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            {activeGroup.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-elevated/40">
                <div className="flex items-center gap-1.5 text-xs flex-1 min-w-0">
                  <span className="font-medium truncate">{t.playerName}</span>
                  <span className="text-muted-foreground/40">→</span>
                  <ClubBadge club={t.toClub} size={16} />
                  <span className="text-muted-foreground truncate">{t.toClub.short}</span>
                </div>
                <TransferStageBadge stage={t.stage} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});
TransferTimeline.displayName = 'TransferTimeline';
