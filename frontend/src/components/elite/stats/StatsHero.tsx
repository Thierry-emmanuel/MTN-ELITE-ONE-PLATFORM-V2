import { memo } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, BookOpen, Square } from 'lucide-react';
import { TopPerformerCard } from './TopPerformerCard';
import type { PlayerStat, StatCategory } from '@/types/football.types';

// ─── Season option ────────────────────────────────────────────────────────────
const SEASON_OPTIONS = [
  { value: 'season-2025-26', label: '2025 – 2026' },
  { value: 'season-2024-25', label: '2024 – 2025' },
  { value: 'season-2023-24', label: '2023 – 2024' },
];

// ─── Category tabs inside the hero ───────────────────────────────────────────
const HERO_CATEGORIES: { id: StatCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'goals',     label: 'Buts',          icon: Target  },
  { id: 'assists',   label: 'Passes D.',      icon: Zap     },
  { id: 'keyPasses', label: 'Passes Clés',    icon: BookOpen },
  { id: 'cards',     label: 'Cartons',        icon: Square  },
];

// ─── Derive top performers from raw stats ─────────────────────────────────────
function getTopByCategory(players: PlayerStat[], category: StatCategory, limit = 3) {
  const sorted = [...players].sort((a, b) => {
    switch (category) {
      case 'goals':     return b.goals - a.goals;
      case 'assists':   return b.assists - a.assists;
      case 'keyPasses': return b.keyPasses - a.keyPasses;
      case 'shots':     return b.shots - a.shots;
      case 'cards':     return (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2);
      case 'minutes':   return b.minutesPlayed - a.minutesPlayed;
      default:          return 0;
    }
  });

  return sorted.slice(0, limit).map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    clubName: p.clubName,
    clubShort: p.clubShort,
    photoUrl: p.photoUrl,
    value: (() => {
      switch (category) {
        case 'goals':     return p.goals;
        case 'assists':   return p.assists;
        case 'keyPasses': return p.keyPasses;
        case 'shots':     return p.shots;
        case 'cards':     return p.yellowCards + p.redCards;
        case 'minutes':   return p.minutesPlayed;
        default:          return 0;
      }
    })(),
  }));
}

// ─── Summary stat pill ────────────────────────────────────────────────────────
const StatPill = ({ label, value, delay = 0 }: { label: string; value: number | string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-xl border border-border/50 bg-white/[0.03] px-4 py-3 text-center"
  >
    <p className="font-display text-2xl tabular-nums text-foreground leading-none">{value}</p>
    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">{label}</p>
  </motion.div>
);

// ─── StatsHero ────────────────────────────────────────────────────────────────
interface StatsHeroProps {
  players: PlayerStat[];
  loading: boolean;
  seasonId: string;
  onSeasonChange: (seasonId: string) => void;
  activeCategory: StatCategory;
  onCategoryChange: (cat: StatCategory) => void;
  totalGoals: number;
  totalAssists: number;
  totalCards: number;
  totalMatches: number;
}

export const StatsHero = memo(({
  players,
  loading,
  seasonId,
  onSeasonChange,
  activeCategory,
  onCategoryChange,
  totalGoals,
  totalAssists,
  totalCards,
  totalMatches,
}: StatsHeroProps) => {
  const topPerformers = getTopByCategory(players, activeCategory, 3);

  return (
    <div className="space-y-5">
      {/* Season selector + category tabs row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 flex-wrap">
          {HERO_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? 'bg-accent text-black shadow-[0_0_12px_rgba(252,209,22,0.20)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Season selector */}
        <select
          value={seasonId}
          onChange={e => onSeasonChange(e.target.value)}
          className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
          aria-label="Sélectionner la saison"
        >
          {SEASON_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Buts marqués"  value={totalGoals}   delay={0}    />
        <StatPill label="Passes décis." value={totalAssists} delay={0.05} />
        <StatPill label="Cartons"       value={totalCards}   delay={0.1}  />
        <StatPill label="Matchs joués"  value={totalMatches} delay={0.15} />
      </div>

      {/* Top 3 podium cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-44 rounded-xl bg-white/[0.04] animate-pulse border border-border" />
          ))}
        </div>
      ) : topPerformers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Podium order: 2nd | 1st | 3rd on desktop */}
          {[topPerformers[1], topPerformers[0], topPerformers[2]].map((p, idx) => {
            if (!p) return <div key={idx} />;
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            return (
              <div key={p.playerId} className={idx === 1 ? 'sm:-mt-3' : ''}>
                <TopPerformerCard
                  rank={rank}
                  playerName={p.playerName}
                  clubName={p.clubName}
                  clubShort={p.clubShort}
                  photoUrl={p.photoUrl}
                  value={p.value}
                  category={activeCategory}
                  index={idx}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
StatsHero.displayName = 'StatsHero';