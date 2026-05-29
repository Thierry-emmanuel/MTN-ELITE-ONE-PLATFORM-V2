import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import type { FormationPlayer, TeamOfWeek } from '@/types/awards.types';

// ─── Position badge colours ───────────────────────────────────────────────────
const POS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  GK:  { bg: 'bg-[#7C3AED]',   text: 'text-white',       border: 'border-[#A78BFA]/60' },
  DEF: { bg: 'bg-[#1F8A4C]',   text: 'text-white',       border: 'border-[#34D399]/60' },
  MID: { bg: 'bg-[#1E3A8A]',   text: 'text-white',       border: 'border-[#60A5FA]/60' },
  FWD: { bg: 'bg-[#CE1126]',   text: 'text-white',       border: 'border-[#F87171]/60' },
};

// ─── Player marker on pitch ───────────────────────────────────────────────────
const PitchPlayer = memo(({
  player, index, onSelect, isSelected,
}: {
  player: FormationPlayer;
  index: number;
  onSelect: (p: FormationPlayer) => void;
  isSelected: boolean;
}) => {
  const col = POS_COLOR[player.position] ?? POS_COLOR.MID;
  const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, type: 'spring', stiffness: 200 }}
      onClick={() => onSelect(player)}
      aria-label={player.name}
      className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center gap-1 z-10"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      {/* Player circle */}
      <div className={`relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${col.bg} ${col.border} ${
        isSelected
          ? 'scale-125 shadow-[0_0_20px_rgba(252,209,22,0.5)] ring-2 ring-[#FCD116]'
          : 'group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]'
      }`}>
        {player.photoUrl
          ? <img src={player.photoUrl} alt={player.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
          : <span className={`${col.text} font-black`}>{initials}</span>
        }
        {/* Rating badge */}
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#FCD116] flex items-center justify-center shadow-md">
          <span className="text-[8px] sm:text-[9px] font-black text-black">{player.rating.toFixed(0)}</span>
        </div>
      </div>

      {/* Name label */}
      <div className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold whitespace-nowrap transition-all ${
        isSelected
          ? 'bg-[#FCD116] text-black'
          : 'bg-black/70 text-white/90 group-hover:bg-black/90'
      }`}>
        {player.name.split(' ').slice(-1)[0]}
      </div>
    </motion.button>
  );
});
PitchPlayer.displayName = 'PitchPlayer';

// ─── Player detail panel ──────────────────────────────────────────────────────
const PlayerDetailPanel = memo(({ player, onClose }: { player: FormationPlayer; onClose: () => void }) => {
  const col      = POS_COLOR[player.position] ?? POS_COLOR.MID;
  const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute top-4 right-4 z-20 w-52 rounded-2xl border border-border/60 bg-[hsl(168,45%,7%)] shadow-2xl overflow-hidden"
    >
      <div className={`h-[3px] ${col.bg}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-black text-sm ${col.bg} ${col.border}`}>
              {player.photoUrl
                ? <img src={player.photoUrl} alt={player.name} className="w-full h-full rounded-full object-cover" />
                : <span className="text-white">{initials}</span>
              }
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">{player.name}</p>
              <p className="text-[10px] text-muted-foreground/60">{player.clubName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground/50">Poste</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${col.bg} text-white`}>{player.positionLabel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground/50">Note</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-[#FCD116]" fill="#FCD116" />
              <span className="font-display text-sm font-bold text-[#FCD116]">{player.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground/50">{player.highlightStat.label}</span>
            <span className="font-display text-sm font-bold text-foreground">{player.highlightStat.value}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
PlayerDetailPanel.displayName = 'PlayerDetailPanel';

// ─── Pitch lines (SVG) ────────────────────────────────────────────────────────
const PitchLines = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 550" preserveAspectRatio="none" aria-hidden>
    {/* Outer border */}
    <rect x="10" y="10" width="380" height="530" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" rx="4" />
    {/* Centre line */}
    <line x1="10" y1="275" x2="390" y2="275" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
    {/* Centre circle */}
    <circle cx="200" cy="275" r="50" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
    <circle cx="200" cy="275" r="2" fill="rgba(255,255,255,0.2)" />
    {/* Penalty areas */}
    <rect x="80"  y="10"  width="240" height="80"  fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
    <rect x="80"  y="460" width="240" height="80"  fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
    {/* Goal areas */}
    <rect x="140" y="10"  width="120" height="35"  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="140" y="505" width="120" height="35"  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    {/* Goals */}
    <rect x="160" y="5"   width="80" height="10"   fill="rgba(255,255,255,0.06)" />
    <rect x="160" y="535" width="80" height="10"   fill="rgba(255,255,255,0.06)" />
    {/* Penalty spots */}
    <circle cx="200" cy="120" r="2.5" fill="rgba(255,255,255,0.2)" />
    <circle cx="200" cy="430" r="2.5" fill="rgba(255,255,255,0.2)" />
    {/* Corner arcs */}
    {[[10,10],[390,10],[10,540],[390,540]].map(([x,y], i) => (
      <path key={i} d={`M ${x} ${y + (y < 275 ? 15 : -15)} A 15 15 0 0 ${x < 200 ? 1 : 0} ${x + (x < 200 ? 15 : -15)} ${y}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    ))}
  </svg>
);

// ─── FormationPitch ───────────────────────────────────────────────────────────
interface FormationPitchProps {
  teamOfWeek: TeamOfWeek;
}

export const FormationPitch = memo(({ teamOfWeek }: FormationPitchProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<FormationPlayer | null>(null);

  const handleSelect = (p: FormationPlayer) => {
    setSelectedPlayer(prev => prev?.id === p.id ? null : p);
  };

  return (
    <div className="space-y-4">
      {/* Formation label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Formation</p>
          <h3 className="font-display text-2xl font-black text-[#FCD116]">{teamOfWeek.formation}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground/50">{teamOfWeek.period}</p>
          <p className="text-xs text-muted-foreground/70">{teamOfWeek.totalVotes.toLocaleString('fr-FR')} votes</p>
        </div>
      </div>

      {/* Pitch */}
      <div className="relative w-full" style={{ paddingBottom: '137.5%' }}>
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10">
          {/* Grass gradient */}
          <div className="absolute inset-0 bg-[#0a3d1e]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 34px, rgba(0,0,0,0.08) 34px, rgba(0,0,0,0.08) 68px)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d4a24]/80 to-[#0a3d1e]/80" />

          {/* Pitch lines */}
          <PitchLines />

          {/* Players */}
          {teamOfWeek.players.map((p, i) => (
            <PitchPlayer
              key={p.id}
              player={p}
              index={i}
              onSelect={handleSelect}
              isSelected={selectedPlayer?.id === p.id}
            />
          ))}

          {/* Player detail card */}
          <AnimatePresence>
            {selectedPlayer && (
              <PlayerDetailPanel player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Position legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {Object.entries(POS_COLOR).map(([pos, col]) => (
          <div key={pos} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${col.bg}`} />
            <span className="text-[10px] text-muted-foreground/60">
              {pos === 'GK' ? 'Gardien' : pos === 'DEF' ? 'Défenseur' : pos === 'MID' ? 'Milieu' : 'Attaquant'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
FormationPitch.displayName = 'FormationPitch';