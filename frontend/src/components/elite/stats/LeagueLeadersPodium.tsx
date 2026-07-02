import { memo } from 'react';
import { motion } from 'framer-motion';
import type { PlayerStat } from '@/types/football.types';
import { computeRating } from '@/lib/statsRating';
import { RatingBadge } from './RatingBadge';

const MEDAL: Record<number, { bar: string; ring: string; glow: string; badge: string; height: string }> = {
  1: { bar: 'bg-[#FCD116]', ring: 'ring-[#FCD116]/45', glow: 'shadow-[0_0_30px_rgba(252,209,22,0.22)]', badge: 'bg-[#FCD116] text-black', height: 'lg:pb-8' },
  2: { bar: 'bg-[#C7C7C7]', ring: 'ring-[#C7C7C7]/35', glow: 'shadow-[0_0_18px_rgba(199,199,199,0.14)]', badge: 'bg-[#C7C7C7] text-black', height: 'lg:pb-0 lg:mt-6' },
  3: { bar: 'bg-[#CD7F32]', ring: 'ring-[#CD7F32]/35', glow: 'shadow-[0_0_18px_rgba(205,127,50,0.14)]', badge: 'bg-[#CD7F32] text-white', height: 'lg:pb-0 lg:mt-9' },
};

const Avatar = ({ photoUrl, name, size }: { photoUrl?: string; name: string; size: number }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return photoUrl
    ? <img src={photoUrl} alt={name} width={size} height={size} className="rounded-full object-cover shrink-0" loading="lazy" />
    : (
      <div
        className="rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 font-bold text-foreground/70"
        style={{ width: size, height: size, fontSize: size * 0.32 }}
      >
        {initials}
      </div>
    );
};

const PodiumCard = memo(({
  player, rank, value, unit, idx,
}: { player: PlayerStat; rank: number; value: number; unit: string; idx: number }) => {
  const medal = MEDAL[rank];
  const rating = computeRating(player);
  const order = rank === 1 ? 'order-2 lg:order-none' : rank === 2 ? 'order-1 lg:order-none' : 'order-3 lg:order-none';
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${order} ${medal.height}`}
    >
      <div className={`relative rounded-2xl border border-border/60 bg-gradient-to-b from-white/[0.06] to-transparent ring-1 ${medal.ring} ${medal.glow} overflow-hidden`}>
        <div className={`h-[3px] ${medal.bar}`} />
        <div className="p-4 flex flex-col items-center text-center">
          <div className="relative mb-2.5">
            <Avatar photoUrl={player.photoUrl} name={player.playerName} size={rank === 1 ? 64 : 52} />
            <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[hsl(168,45%,11%)] ${medal.badge}`}>
              {rank}
            </span>
          </div>
          <p className="font-display text-sm font-bold text-foreground leading-tight truncate max-w-full">
            {player.playerName}
          </p>
          <p className="text-[10px] text-muted-foreground/60 truncate max-w-full mt-0.5">
            {player.clubShort ?? player.clubName}
          </p>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className={`font-display tabular-nums leading-none text-foreground ${rank === 1 ? 'text-4xl' : 'text-3xl'}`}>
              {value}
            </span>
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{unit}</span>
          </div>

          <div className="mt-2.5">
            <RatingBadge rating={rating} size="xs" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
PodiumCard.displayName = 'PodiumCard';

const ChaseRow = memo(({
  player, rank, value, max, idx,
}: { player: PlayerStat; rank: number; value: number; max: number; idx: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.25, delay: 0.3 + idx * 0.035 }}
    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
  >
    <span className="w-5 text-[11px] text-muted-foreground/50 tabular-nums text-center shrink-0">{rank}</span>
    <Avatar photoUrl={player.photoUrl} name={player.playerName} size={26} />
    <div className="min-w-0 flex-1">
      <p className="text-[12px] font-semibold text-foreground truncate leading-tight">{player.playerName}</p>
      <p className="text-[9px] text-muted-foreground/50 truncate">{player.clubShort ?? player.clubName}</p>
    </div>
    <div className="hidden sm:block w-24 h-1 rounded-full bg-white/[0.06] overflow-hidden shrink-0">
      <div
        className="h-full rounded-full bg-accent/50"
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
    <span className="font-display text-sm tabular-nums text-foreground w-7 text-right shrink-0">{value}</span>
  </motion.div>
));
ChaseRow.displayName = 'ChaseRow';

interface LeagueLeadersPodiumProps {
  title: string;
  icon: React.FC<{ className?: string }>;
  players: PlayerStat[];
  valueKey: keyof PlayerStat;
  unit: string;
  chaseCount?: number;
}

export const LeagueLeadersPodium = memo(({
  title, icon: Icon, players, valueKey, unit, chaseCount = 5,
}: LeagueLeadersPodiumProps) => {
  const sorted = [...players].sort((a, b) => ((b[valueKey] as number) ?? 0) - ((a[valueKey] as number) ?? 0));
  const top3 = sorted.slice(0, 3);
  const chase = sorted.slice(3, 3 + chaseCount);
  const max = (top3[0]?.[valueKey] as number) ?? 1;

  if (top3.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-white/[0.015] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <Icon className="h-3.5 w-3.5 text-accent/80 shrink-0" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">{title}</h3>
      </div>

      <div className="p-4 lg:p-5">
        <div className="grid grid-cols-3 gap-3 lg:gap-4 items-end mb-1">
          {top3.map((p, i) => (
            <PodiumCard
              key={p.playerId}
              player={p}
              rank={i + 1}
              value={(p[valueKey] as number) ?? 0}
              unit={unit}
              idx={i}
            />
          ))}
        </div>

        {chase.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30 space-y-0.5">
            {chase.map((p, i) => (
              <ChaseRow
                key={p.playerId}
                player={p}
                rank={i + 4}
                value={(p[valueKey] as number) ?? 0}
                max={max}
                idx={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
LeagueLeadersPodium.displayName = 'LeagueLeadersPodium';
