import { memo } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, BookOpen, ArrowUpRight, Square, Clock, ChevronRight } from 'lucide-react';
import type { StatCategory, PlayerStat } from '@/types/football.types';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: {
  id: StatCategory;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  getVal: (p: PlayerStat) => number;
  unit: string;
  description: string;
}[] = [
  {
    id: 'goals',
    label: 'Buteurs',
    shortLabel: 'Buts',
    icon: Target,
    getVal: p => p.goals,
    unit: 'buts',
    description: 'Classement des meilleurs buteurs de la saison',
  },
  {
    id: 'assists',
    label: 'Passeurs',
    shortLabel: 'Passes D.',
    icon: Zap,
    getVal: p => p.assists,
    unit: 'passes',
    description: 'Classement des meilleurs passeurs décisifs',
  },
  {
    id: 'keyPasses',
    label: 'Créateurs',
    shortLabel: 'Clés',
    icon: BookOpen,
    getVal: p => p.keyPasses,
    unit: 'passes clés',
    description: 'Passes menant directement à une occasion de but',
  },
  {
    id: 'shots',
    label: 'Tireurs',
    shortLabel: 'Tirs',
    icon: ArrowUpRight,
    getVal: p => p.shots,
    unit: 'tirs',
    description: 'Joueurs avec le plus de tentatives au but',
  },
  {
    id: 'cards',
    label: 'Cartons',
    shortLabel: 'Cartons',
    icon: Square,
    getVal: p => p.yellowCards + p.redCards,
    unit: 'cartons',
    description: 'Joueurs les plus sanctionnés',
  },
  {
    id: 'minutes',
    label: 'Présence',
    shortLabel: 'Min.',
    icon: Clock,
    getVal: p => p.minutesPlayed,
    unit: 'min',
    description: 'Joueurs ayant le plus de minutes jouées',
  },
];

// ─── Mini bar sparkline ────────────────────────────────────────────────────────
const MiniBar = ({ value, max }: { value: number; max: number }) => (
  <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
    <div
      className="h-full rounded-full bg-accent/60 transition-all duration-500"
      style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

// ─── Single mini row inside the tab preview ───────────────────────────────────
const MiniRow = ({ rank, name, club, value, unit, max }: {
  rank: number; name: string; club: string; value: number; unit: string; max: number;
}) => (
  <div className="flex items-center gap-2 py-1">
    <span className="w-4 text-center text-[10px] text-muted-foreground/40 tabular-nums shrink-0">{rank}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium truncate text-foreground/90 leading-tight">{name}</p>
      <MiniBar value={value} max={max} />
    </div>
    <span className="text-[11px] font-display tabular-nums text-foreground shrink-0">{value}</span>
  </div>
);

// ─── StatCategoryTabs ─────────────────────────────────────────────────────────
interface StatCategoryTabsProps {
  active: StatCategory;
  onChange: (cat: StatCategory) => void;
  players: PlayerStat[];
  showPreview?: boolean;
}

export const StatCategoryTabs = memo(({
  active,
  onChange,
  players,
  showPreview = true,
}: StatCategoryTabsProps) => {
  const activeTab = TABS.find(t => t.id === active) ?? TABS[0];

  // Top 5 for the active category
  const sorted = [...players]
    .sort((a, b) => activeTab.getVal(b) - activeTab.getVal(a))
    .slice(0, 5);
  const maxVal = sorted[0] ? activeTab.getVal(sorted[0]) : 1;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1 snap-x">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-pressed={isActive}
              className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? 'bg-accent text-black shadow-[0_0_12px_rgba(252,209,22,0.18)]'
                  : 'bg-white/[0.04] text-muted-foreground hover:bg-white/[0.07] hover:text-foreground border border-border/30'
              }`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Quick-view preview panel */}
      {showPreview && sorted.length > 0 && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-3"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{activeTab.description}</p>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
          </div>
          <div className="space-y-0.5">
            {sorted.map((p, i) => (
              <MiniRow
                key={p.playerId}
                rank={i + 1}
                name={p.playerName}
                club={p.clubShort ?? p.clubName}
                value={activeTab.getVal(p)}
                unit={activeTab.unit}
                max={maxVal}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
});
StatCategoryTabs.displayName = 'StatCategoryTabs';