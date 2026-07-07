import { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { MatchRow } from './MatchRow';
import type { MatchDay, Match } from '@/types/football.types';

function formatRoundDate(date: string): string {
  try {
    return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  } catch { return date; }
}

interface MatchdayCardProps {
  day: MatchDay;
  globalIndex: number;
  showXg?: boolean;
}

export const MatchdayCard = memo(({ day, globalIndex, showXg = false }: MatchdayCardProps) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, delay: Math.min(globalIndex * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
    aria-label={`Journée ${day.round}`}
    className="rounded-2xl border border-border/60 bg-white/[0.015] overflow-hidden"
  >
    {/* Header — mirrors CategoryLeaderboard / LeagueLeadersPodium header style */}
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50 bg-white/[0.02]">
      <div className="flex items-center gap-2 min-w-0">
        <Trophy className="h-3.5 w-3.5 text-accent/80 shrink-0" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/80 shrink-0">
          Journée {day.round}
        </h3>
        <span className="text-muted-foreground/20 hidden sm:inline">·</span>
        <span className="text-[11px] text-muted-foreground/50 capitalize truncate hidden sm:inline">
          {formatRoundDate(day.date)}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider shrink-0">
        {day.matches.length} match{day.matches.length > 1 ? 's' : ''}
      </span>
    </div>

    <div>
      {day.matches.map((m, i) => (
        <MatchRow key={m.id ?? `match-${i}`} match={m as Match} index={i} showXg={showXg} />
      ))}
    </div>
  </motion.section>
));
MatchdayCard.displayName = 'MatchdayCard';
