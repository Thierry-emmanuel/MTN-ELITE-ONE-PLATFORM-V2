import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, TrendingUp, Shield, Zap, Award } from 'lucide-react';
import type { FormationPlayer, TeamOfWeek } from '@/types/awards.types';

// ─── Position badge colours ───────────────────────────────────────────────────
const POS_COLOR: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  GK:  { bg: 'bg-[#7C3AED]',   text: 'text-white', border: 'border-[#A78BFA]/60', glow: 'rgba(124,58,237,0.6)'  },
  DEF: { bg: 'bg-[#1F8A4C]',   text: 'text-white', border: 'border-[#34D399]/60', glow: 'rgba(31,138,76,0.6)'   },
  MID: { bg: 'bg-[#1E3A8A]',   text: 'text-white', border: 'border-[#60A5FA]/60', glow: 'rgba(30,58,138,0.6)'   },
  FWD: { bg: 'bg-[#CE1126]',   text: 'text-white', border: 'border-[#F87171]/60', glow: 'rgba(206,17,38,0.6)'   },
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
      initial={{ opacity: 0, scale: 0, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, type: 'spring', stiffness: 180, damping: 16 }}
      onClick={() => onSelect(player)}
      aria-label={player.name}
      whileTap={{ scale: 0.9 }}
      className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center gap-1 z-10"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      {/* Pulse ring when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-[-6px] rounded-full"
          style={{ border: '2px solid #FCD116' }}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Player circle */}
      <motion.div
        animate={isSelected ? {
          boxShadow: ['0 0 0 0 rgba(252,209,22,0)', '0 0 20px 4px rgba(252,209,22,0.5)', '0 0 0 0 rgba(252,209,22,0)'],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 overflow-hidden ${col.bg} ${col.border} ${
          isSelected
            ? 'scale-125 ring-2 ring-[#FCD116]'
            : 'group-hover:scale-110'
        }`}
        style={{
          boxShadow: isSelected ? `0 0 20px ${col.glow}` : undefined,
        }}
      >
        {player.photoUrl
          ? <img src={player.photoUrl} alt={player.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
          : <span className={`${col.text} font-black`}>{initials}</span>
        }
        {/* Rating badge */}
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#FCD116] flex items-center justify-center shadow-md z-10">
          <span className="text-[8px] sm:text-[9px] font-black text-black">{player.rating.toFixed(0)}</span>
        </div>
      </motion.div>

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

// ─── Full player detail modal (click) ─────────────────────────────────────────
const PlayerModal = memo(({ player, onClose }: { player: FormationPlayer; onClose: () => void }) => {
  const col      = POS_COLOR[player.position] ?? POS_COLOR.MID;
  const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden border bg-[#060606]"
        style={{ borderColor: `${col.glow.replace('0.6', '0.5')}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Position-coloured top bar */}
        <div className={`h-1 ${col.bg}`} />

        {/* Glow bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${col.glow.replace('0.6', '0.08')}, transparent 70%)` }}
        />

        {/* Particle burst */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute h-1.5 w-1.5 rounded-full ${col.bg}`}
              style={{ left: '50%', top: '10%' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * 100,
                y: Math.sin((i / 6) * Math.PI * 2) * 60,
                scale: [0, 1, 0],
                opacity: [1, 0.7, 0],
              }}
              transition={{ duration: 0.7, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="relative shrink-0"
            >
              <div
                className={`h-18 w-18 rounded-2xl overflow-hidden border-2 ${col.border}`}
                style={{ height: 72, width: 72, boxShadow: `0 0 24px ${col.glow.replace('0.6', '0.4')}` }}
              >
                {player.photoUrl
                  ? <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                  : <div className={`w-full h-full ${col.bg} flex items-center justify-center font-black text-white text-2xl`}>
                      {initials}
                    </div>
                }
              </div>
            </motion.div>

            <div className="min-w-0 flex-1">
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-xl font-black text-white leading-tight"
              >
                {player.name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.16 }}
                className="text-sm text-white/40"
              >
                {player.clubName}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="flex items-center gap-2 mt-1.5"
              >
                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${col.bg} text-white uppercase tracking-wide`}>
                  {player.positionLabel}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Rating + highlight stat */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <div className="rounded-2xl bg-[#FCD116]/[0.06] border border-[#FCD116]/15 p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-3.5 w-3.5 text-[#FCD116]" fill="currentColor" />
                <span className="text-[10px] text-[#FCD116]/60 uppercase tracking-wide font-bold">Note</span>
              </div>
              <p className="font-display text-4xl font-black text-[#FCD116] tabular-nums">{player.rating.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4 text-center">
              <p className="text-[10px] text-white/35 uppercase tracking-wide font-bold mb-1">
                {player.highlightStat.label}
              </p>
              <p className="font-display text-4xl font-black text-white/90 tabular-nums">
                {player.highlightStat.value}
              </p>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="grid grid-cols-3 gap-2 mb-5"
          >
            {[
              { label: 'Poste',   value: player.position,        icon: <Shield className="h-3.5 w-3.5" /> },
              { label: 'Forme',   value: player.rating >= 8 ? '🔥 En feu' : player.rating >= 7.5 ? '✅ Bon' : '📊 Correct', icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { label: 'Élu par', value: 'Jury', icon: <Award className="h-3.5 w-3.5" /> },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.32 + i * 0.05, type: 'spring', stiffness: 300 }}
                className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 text-center"
              >
                <div className="flex justify-center text-white/30 mb-1">{s.icon}</div>
                <p className="text-[10px] font-bold text-white/80 leading-tight">{s.value}</p>
                <p className="text-[9px] text-white/25 uppercase mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Rating bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between text-[10px]">
              <span className="text-white/30 uppercase tracking-wide">Performance</span>
              <span className="text-[#FCD116] font-bold">{player.rating}/10</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${col.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${player.rating * 10}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                style={{ boxShadow: `0 0 8px ${col.glow}` }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
});
PlayerModal.displayName = 'PlayerModal';

// ─── Pitch lines (SVG) ────────────────────────────────────────────────────────
const PitchLines = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 550" preserveAspectRatio="none" aria-hidden>
    <rect x="10" y="10" width="380" height="530" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" rx="4" />
    <line x1="10" y1="275" x2="390" y2="275" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
    <circle cx="200" cy="275" r="50" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
    <circle cx="200" cy="275" r="2" fill="rgba(255,255,255,0.2)" />
    <rect x="80"  y="10"  width="240" height="80"  fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
    <rect x="80"  y="460" width="240" height="80"  fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
    <rect x="140" y="10"  width="120" height="35"  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="140" y="505" width="120" height="35"  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="160" y="5"   width="80" height="10"   fill="rgba(255,255,255,0.06)" />
    <rect x="160" y="535" width="80" height="10"   fill="rgba(255,255,255,0.06)" />
    <circle cx="200" cy="120" r="2.5" fill="rgba(255,255,255,0.2)" />
    <circle cx="200" cy="430" r="2.5" fill="rgba(255,255,255,0.2)" />
    {[[10,10],[390,10],[10,540],[390,540]].map(([x,y], i) => (
      <path key={i} d={`M ${x} ${y + (y < 275 ? 15 : -15)} A 15 15 0 0 ${x < 200 ? 1 : 0} ${x + (x < 200 ? 15 : -15)} ${y}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    ))}
  </svg>
);

// ─── Best player spotlight strip ──────────────────────────────────────────────
const BestPlayerStrip = memo(({ players }: { players: FormationPlayer[] }) => {
  const top = [...players].sort((a, b) => b.rating - a.rating)[0];
  if (!top) return null;
  const col = POS_COLOR[top.position] ?? POS_COLOR.MID;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-[#FCD116]/20 bg-[#FCD116]/[0.04]"
    >
      <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-[#FCD116]/30 shrink-0">
        {top.photoUrl
          ? <img src={top.photoUrl} alt={top.name} className="w-full h-full object-cover object-top" />
          : <div className={`w-full h-full ${col.bg} flex items-center justify-center font-black text-white text-sm`}>
              {top.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#FCD116]/60 uppercase tracking-wider font-black">⭐ Meilleure note</p>
        <p className="text-sm font-bold text-white truncate">{top.name}</p>
        <p className="text-[10px] text-white/35">{top.clubName}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display text-2xl font-black text-[#FCD116]">{top.rating.toFixed(1)}</p>
        <p className="text-[9px] text-white/30">/ 10</p>
      </div>
    </motion.div>
  );
});
BestPlayerStrip.displayName = 'BestPlayerStrip';

// ─── FormationPitch ───────────────────────────────────────────────────────────
interface FormationPitchProps {
  teamOfWeek: TeamOfWeek;
}

export const FormationPitch = memo(({ teamOfWeek }: FormationPitchProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<FormationPlayer | null>(null);
  const [modalPlayer,    setModalPlayer]    = useState<FormationPlayer | null>(null);

  const handleSelect = useCallback((p: FormationPlayer) => {
    setSelectedPlayer(prev => {
      if (prev?.id === p.id) {
        // Second click on same player → open modal
        setModalPlayer(p);
        return null;
      }
      return p;
    });
  }, []);

  // Tap hint label
  const [showHint, setShowHint] = useState(true);

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

      {/* Tap hint */}
      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-white/25 text-center flex items-center justify-center gap-1"
          >
            <Zap className="h-3 w-3" /> Cliquez sur un joueur pour le détail
          </motion.p>
        )}
      </AnimatePresence>

      {/* Pitch */}
      <div
        className="relative w-full"
        style={{ paddingBottom: '137.5%' }}
        onClick={() => setShowHint(false)}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10">
          {/* Grass gradient */}
          <div className="absolute inset-0 bg-[#0a3d1e]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 34px, rgba(0,0,0,0.08) 34px, rgba(0,0,0,0.08) 68px)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d4a24]/80 to-[#0a3d1e]/80" />
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

          {/* Inline detail panel (first click) */}
          <AnimatePresence>
            {selectedPlayer && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="absolute top-4 right-4 z-20 w-52 rounded-2xl border border-border/60 bg-[hsl(168,45%,7%)] shadow-2xl overflow-hidden"
              >
                {(() => {
                  const col = POS_COLOR[selectedPlayer.position] ?? POS_COLOR.MID;
                  const initials = selectedPlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <>
                      <div className={`h-[3px] ${col.bg}`} />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-black text-sm overflow-hidden ${col.bg} ${col.border}`}>
                              {selectedPlayer.photoUrl
                                ? <img src={selectedPlayer.photoUrl} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                                : <span className="text-white">{initials}</span>
                              }
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-tight">{selectedPlayer.name}</p>
                              <p className="text-[10px] text-muted-foreground/60">{selectedPlayer.clubName}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedPlayer(null)}
                            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-muted-foreground/50">Poste</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${col.bg} text-white`}>{selectedPlayer.positionLabel}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-muted-foreground/50">Note</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-[#FCD116]" fill="#FCD116" />
                              <span className="font-display text-sm font-bold text-[#FCD116]">{selectedPlayer.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-muted-foreground/50">{selectedPlayer.highlightStat.label}</span>
                            <span className="font-display text-sm font-bold text-foreground">{selectedPlayer.highlightStat.value}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => { setModalPlayer(selectedPlayer); setSelectedPlayer(null); }}
                          className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                          Voir plus →
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Best player strip */}
      <BestPlayerStrip players={teamOfWeek.players} />

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

      {/* Player detail modal (full screen) */}
      <AnimatePresence>
        {modalPlayer && (
          <PlayerModal player={modalPlayer} onClose={() => setModalPlayer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
});
FormationPitch.displayName = 'FormationPitch';