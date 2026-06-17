import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Zap, BookOpen, ArrowUpRight,
  Square, Clock, Trophy,
} from 'lucide-react';
import type { PlayerStat, StatCategory } from '@/types/football.types';

// ─── Category config — defines which columns appear per category ───────────────
interface ColDef {
  key: keyof PlayerStat;
  header: string;
  title: string;          // tooltip
  highlight?: boolean;    // bold gold accent
}

const CATEGORY_CONFIG: Record<StatCategory, {
  label: string;
  icon: React.FC<{ className?: string }>;
  cols: ColDef[];
}> = {
  goals: {
    label: 'Meilleurs Buteurs',
    icon: Target,
    cols: [
      { key: 'appearances',    header: 'J',     title: 'Matchs joués' },
      { key: 'goals',          header: 'Buts',  title: 'Buts marqués',   highlight: true },
      { key: 'penaltiesScored',header: 'Pen.',  title: 'Buts sur penalty' },
    ],
  },
  assists: {
    label: 'Meilleurs Passeurs',
    icon: Zap,
    cols: [
      { key: 'appearances',    header: 'J',      title: 'Matchs joués' },
      { key: 'assists',        header: 'PD',     title: 'Passes décisives', highlight: true },
      { key: 'keyPasses',      header: 'Clés',   title: 'Passes clés' },
    ],
  },
  keyPasses: {
    label: 'Meilleurs Créateurs',
    icon: BookOpen,
    cols: [
      { key: 'appearances',    header: 'J',      title: 'Matchs joués' },
      { key: 'keyPasses',      header: 'Clés',   title: 'Passes clés', highlight: true },
      { key: 'assists',        header: 'PD',     title: 'Passes décisives' },
    ],
  },
  shots: {
    label: 'Plus de Tirs',
    icon: ArrowUpRight,
    cols: [
      { key: 'appearances',    header: 'J',      title: 'Matchs joués' },
      { key: 'shots',          header: 'Tirs',   title: 'Tentatives au but', highlight: true },
      { key: 'shotsOnTarget',  header: 'Cadrés', title: 'Tirs cadrés' },
    ],
  },
  cards: {
    label: 'Plus de Cartons',
    icon: Square,
    cols: [
      { key: 'appearances',    header: 'J',   title: 'Matchs joués' },
      { key: 'yellowCards',    header: '🟨',  title: 'Cartons jaunes', highlight: true },
      { key: 'redCards',       header: '🟥',  title: 'Cartons rouges' },
    ],
  },
  minutes: {
    label: 'Plus de Minutes',
    icon: Clock,
    cols: [
      { key: 'appearances',    header: 'J',    title: 'Matchs joués' },
      { key: 'minutesPlayed',  header: 'Min',  title: 'Minutes jouées', highlight: true },
      { key: 'goals',          header: 'Buts', title: 'Buts marqués' },
    ],
  },
};

// ─── Position badge colours ───────────────────────────────────────────────────
const POS_BADGE: Record<string, string> = {
  GK:  'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/30',
  DEF: 'bg-[#1F8A4C]/20 text-[#34D399] border-[#1F8A4C]/30',
  MID: 'bg-[#FCD116]/15 text-[#FCD116] border-[#FCD116]/30',
  FWD: 'bg-[#CE1126]/20 text-[#F87171] border-[#CE1126]/30',
  // legacy short codes
  DF:  'bg-[#1F8A4C]/20 text-[#34D399] border-[#1F8A4C]/30',
  MF:  'bg-[#FCD116]/15 text-[#FCD116] border-[#FCD116]/30',
  FW:  'bg-[#CE1126]/20 text-[#F87171] border-[#CE1126]/30',
};

// ─── Rank medal ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return (
    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#FCD116] shadow-[0_0_10px_rgba(252,209,22,0.35)]">
      <Trophy className="h-3 w-3 text-black" />
    </span>
  );
  if (rank === 2) return (
    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#C0C0C0] text-black text-[10px] font-black">2</span>
  );
  if (rank === 3) return (
    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#CD7F32] text-white text-[10px] font-black">3</span>
  );
  return (
    <span className="flex items-center justify-center h-6 w-6 text-[11px] text-muted-foreground/50 font-medium tabular-nums">{rank}</span>
  );
};

// ─── Player avatar (initials fallback) ────────────────────────────────────────
const Avatar = ({ photoUrl, name }: { photoUrl?: string; name: string }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return photoUrl
    ? <img src={photoUrl} alt={name} className="h-9 w-9 rounded-full object-cover shrink-0" loading="lazy" />
    : (
      <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-muted-foreground/60">
        {initials}
      </div>
    );
};

// ─── Single leaderboard row ───────────────────────────────────────────────────
const LeaderboardRow = memo(({
  player, rank, cols, primaryKey, idx,
}: {
  player: PlayerStat;
  rank: number;
  cols: ColDef[];
  primaryKey: keyof PlayerStat;
  idx: number;
}) => (
  <motion.tr
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.22, delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
    className="group border-b border-border/20 last:border-0 hover:bg-white/[0.025] transition-colors"
  >
    {/* Rank */}
    <td className="pl-4 py-3 w-10">
      <RankBadge rank={rank} />
    </td>

    {/* Player */}
    <td className="px-3 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar photoUrl={player.photoUrl} name={player.playerName} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-foreground group-hover:text-accent transition-colors leading-tight">
            {player.playerName}
          </p>
          <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
            {player.clubName}
          </p>
        </div>
        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase hidden sm:inline ${POS_BADGE[player.position] ?? 'bg-white/10 text-muted-foreground border-border'}`}>
          {player.position}
        </span>
      </div>
    </td>

    {/* Club (visible on md+) */}
    <td className="px-3 py-3 hidden md:table-cell">
      <p className="text-sm text-muted-foreground/70 truncate max-w-[120px]">{player.clubName}</p>
    </td>

    {/* Dynamic stat columns */}
    {cols.map(col => {
      const val = player[col.key] as number ?? 0;
      const isHighlight = col.key === primaryKey;
      return (
        <td key={String(col.key)} className="px-4 py-3 text-center">
          <span className={
            isHighlight
              ? 'font-display text-xl tabular-nums text-foreground font-bold'
              : 'font-display text-base tabular-nums text-muted-foreground/70'
          }>
            {val}
          </span>
        </td>
      );
    })}
  </motion.tr>
));
LeaderboardRow.displayName = 'LeaderboardRow';

// ─── CategoryLeaderboard ──────────────────────────────────────────────────────
interface CategoryLeaderboardProps {
  category: StatCategory;
  players: PlayerStat[];
  loading?: boolean;
  limit?: number;
}

// Derive the primary sort key from category
const PRIMARY_KEY: Record<StatCategory, keyof PlayerStat> = {
  goals:     'goals',
  assists:   'assists',
  keyPasses: 'keyPasses',
  shots:     'shots',
  cards:     'yellowCards',
  minutes:   'minutesPlayed',
};

export const CategoryLeaderboard = memo(({
  category, players, loading = false, limit = 15,
}: CategoryLeaderboardProps) => {
  const config     = CATEGORY_CONFIG[category];
  const primaryKey = PRIMARY_KEY[category];
  const Icon       = config.icon;

  // Sort by primary key descending
  const sorted = [...players]
    .sort((a, b) => {
      const va = a[primaryKey] as number ?? 0;
      const vb = b[primaryKey] as number ?? 0;
      return vb - va;
    })
    .slice(0, limit);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-white/[0.03]">
        <Icon className="h-3.5 w-3.5 text-accent/70 shrink-0" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
          {config.label}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-border/40 bg-white/[0.015]">
              <th className="pl-4 py-2 w-10" />
              <th className="px-3 py-2 text-left text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                Joueur
              </th>
              <th className="px-3 py-2 text-left text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium hidden md:table-cell">
                Club
              </th>
              {config.cols.map(col => (
                <th
                  key={String(col.key)}
                  title={col.title}
                  className={`px-4 py-2 text-center text-[10px] uppercase tracking-wider font-medium ${
                    col.key === primaryKey
                      ? 'text-accent/80'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {Array.from({ length: config.cols.length + 3 }).map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-4 rounded bg-white/[0.05] animate-pulse"
                          style={{ width: j === 1 ? '70%' : '40%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.length === 0
              ? (
                <tr>
                  <td colSpan={config.cols.length + 3}
                    className="py-12 text-center text-sm text-muted-foreground/40">
                    Aucune donnée disponible.
                  </td>
                </tr>
              )
              : sorted.map((p, i) => (
                  <LeaderboardRow
                    key={p.playerId}
                    player={p}
                    rank={i + 1}
                    cols={config.cols}
                    primaryKey={primaryKey}
                    idx={i}
                  />
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
});
CategoryLeaderboard.displayName = 'CategoryLeaderboard';