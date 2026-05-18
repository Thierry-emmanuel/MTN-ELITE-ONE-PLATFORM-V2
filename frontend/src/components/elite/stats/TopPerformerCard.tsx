import { memo } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, BookOpen, Square, Circle, Timer } from 'lucide-react';
import type { StatCategory } from '@/types/football.types';

// ─── Medal colours ────────────────────────────────────────────────────────────
const MEDAL: Record<number, { ring: string; glow: string; badge: string; label: string }> = {
  1: { ring: 'ring-[#FCD116]/50',  glow: 'shadow-[0_0_24px_rgba(252,209,22,0.20)]', badge: 'bg-[#FCD116]   text-black',     label: 'Or'     },
  2: { ring: 'ring-[#C0C0C0]/40',  glow: 'shadow-[0_0_18px_rgba(192,192,192,0.12)]', badge: 'bg-[#C0C0C0]  text-black',     label: 'Argent' },
  3: { ring: 'ring-[#CD7F32]/40',  glow: 'shadow-[0_0_16px_rgba(205,127,50,0.12)]',  badge: 'bg-[#CD7F32]   text-white',    label: 'Bronze' },
};

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_META: Record<StatCategory, { label: string; unit: string; icon: React.FC<{ className?: string }> }> = {
  goals:     { label: 'Buteur',    unit: 'buts',    icon: Target  },
  assists:   { label: 'Passeur',   unit: 'passes',  icon: Zap     },
  keyPasses: { label: 'Créateur',  unit: 'créées',  icon: BookOpen },
  shots:     { label: 'Tireur',    unit: 'tirs',    icon: Circle  },
  cards:     { label: 'Cartons',   unit: 'cartons', icon: Square  },
  minutes:   { label: 'Présence',  unit: 'min',     icon: Timer   },
};

// ─── Avatar placeholder (initials) ───────────────────────────────────────────
const PlayerAvatar = memo(({
  photoUrl, name, size = 48,
}: { photoUrl?: string; name: string; size?: number }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        loading="lazy"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-white/10 flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-label={name}
    >
      {initials}
    </div>
  );
});
PlayerAvatar.displayName = 'PlayerAvatar';

// ─── Single top-performer card ────────────────────────────────────────────────
interface TopPerformerCardProps {
  rank: number;
  playerName: string;
  clubName: string;
  clubShort?: string;
  photoUrl?: string;
  value: number;
  category: StatCategory;
  secondaryValue?: number;
  secondaryLabel?: string;
  index?: number;
  compact?: boolean;
}

export const TopPerformerCard = memo(({
  rank,
  playerName,
  clubName,
  clubShort,
  photoUrl,
  value,
  category,
  secondaryValue,
  secondaryLabel,
  index = 0,
  compact = false,
}: TopPerformerCardProps) => {
  const medal = MEDAL[rank] ?? MEDAL[3];
  const meta  = CATEGORY_META[category];
  const Icon  = meta.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        className={`flex items-center gap-3 rounded-lg border border-border/60 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.05] transition-colors`}
      >
        <span className={`shrink-0 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center ${medal.badge}`}>
          {rank}
        </span>
        <PlayerAvatar photoUrl={photoUrl} name={playerName} size={32} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate text-foreground leading-tight">{playerName}</p>
          <p className="text-[10px] text-muted-foreground/60 truncate">{clubShort ?? clubName}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-base tabular-nums text-foreground leading-none">{value}</p>
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">{meta.unit}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-xl border border-border/60 bg-gradient-to-b from-white/[0.05] to-transparent ring-1 ${medal.ring} ${medal.glow} hover:from-white/[0.08] transition-all duration-300 overflow-hidden`}
    >
      {/* Top accent bar */}
      <div className={`h-[2px] ${rank === 1 ? 'bg-[#FCD116]' : rank === 2 ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]'}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">{meta.label}</span>
          </div>
          <span className={`h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center ${medal.badge}`}>
            {rank}
          </span>
        </div>

        {/* Player info */}
        <div className="flex items-center gap-3 mb-3">
          <PlayerAvatar photoUrl={photoUrl} name={playerName} size={44} />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-foreground truncate leading-tight">{playerName}</p>
            <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{clubShort ?? clubName}</p>
          </div>
        </div>

        {/* Stat value */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-3xl tabular-nums text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">{meta.unit}</p>
          </div>
          {secondaryValue !== undefined && (
            <div className="text-right">
              <p className="font-display text-lg tabular-nums text-muted-foreground leading-none">{secondaryValue}</p>
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mt-0.5">{secondaryLabel}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
TopPerformerCard.displayName = 'TopPerformerCard';

// ─── Top list section (title + stacked compact cards) ────────────────────────
interface TopListSectionProps {
  title: string;
  category: StatCategory;
  performers: Array<{
    playerId: string;
    playerName: string;
    clubName: string;
    clubShort?: string;
    photoUrl?: string;
    value: number;
  }>;
  loading?: boolean;
}

export const TopListSection = memo(({
  title, category, performers, loading = false,
}: TopListSectionProps) => (
  <div className="space-y-1.5">
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
      {title}
    </h3>
    {loading
      ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />
        ))
      : performers.slice(0, 5).map((p, i) => (
          <TopPerformerCard
            key={p.playerId}
            rank={i + 1}
            playerName={p.playerName}
            clubName={p.clubName}
            clubShort={p.clubShort}
            photoUrl={p.photoUrl}
            value={p.value}
            category={category}
            index={i}
            compact
          />
        ))
    }
  </div>
));
TopListSection.displayName = 'TopListSection';