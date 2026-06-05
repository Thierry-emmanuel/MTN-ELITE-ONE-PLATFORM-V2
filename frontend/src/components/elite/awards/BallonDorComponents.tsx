import { memo, useState, useRef } from 'react';
import {
  motion, AnimatePresence, useInView,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import {
  Trophy, Star, ChevronUp, ChevronDown,
  Minus, Crown, Users, Calendar, Sparkles,
} from 'lucide-react';
import { useAwardCountdown } from '@/hooks/useAwards';
import { MOCK_HISTORICAL } from '@/services/mockAwards';
import type { BallonDorEdition, BallonDorRanking, HistoricalWinner } from '@/types/awards.types';

// ─── Floating particles ───────────────────────────────────────────────────────
const Particle = ({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-[#FCD116] pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
    animate={{ opacity: [0, 0.8, 0], y: [0, -80, -160], scale: [0, 1.2, 0] }}
    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay, ease: 'easeOut' }}
  />
);

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 28 }).map((_, i) => (
      <Particle key={i} x={Math.random() * 100} y={30 + Math.random() * 70} delay={Math.random() * 4} size={Math.random() * 3 + 1} />
    ))}
  </div>
);

// ─── Animated spotlight ───────────────────────────────────────────────────────
const Spotlight = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute top-0 w-80 h-full bg-gradient-to-b from-[#FCD116]/12 via-[#FCD116]/5 to-transparent blur-3xl"
      animate={{ x: ['-20%', '80%', '-20%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

// ─── Countdown ────────────────────────────────────────────────────────────────
const CountdownBox = ({ value, label, urgent }: { value: number; label: string; urgent: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border overflow-hidden ${urgent ? 'border-[#CE1126]/40 bg-[#CE1126]/10' : 'border-[#FCD116]/30 bg-black/60'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 flex items-center justify-center font-display text-3xl sm:text-4xl font-black tabular-nums ${urgent ? 'text-[#CE1126]' : 'text-[#FCD116]'}`}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="text-[9px] text-white/30 uppercase tracking-[.2em]">{label}</span>
  </div>
);

const VoteCountdown = memo(({ deadline }: { deadline: string }) => {
  const { days, hours, minutes, seconds, expired, urgent } = useAwardCountdown(deadline);
  if (expired) return null;
  const sep = <span className="font-display text-3xl text-white/15 mb-6">:</span>;
  return (
    <div className="flex items-center gap-3 sm:gap-4 justify-center">
      {days > 0 && <>{<CountdownBox value={days} label="Jours" urgent={urgent} />}{sep}</>}
      <CountdownBox value={hours}   label="Heures" urgent={urgent} />{sep}
      <CountdownBox value={minutes} label="Min"    urgent={urgent} />{sep}
      <CountdownBox value={seconds} label="Sec"    urgent={urgent} />
    </div>
  );
});
VoteCountdown.displayName = 'VoteCountdown';

// ─── BallonDorHero ────────────────────────────────────────────────────────────
export const BallonDorHero = memo(({ edition }: { edition: BallonDorEdition }) => {
  const top = edition.ranking[0];
  return (
    <section className="relative min-h-[72vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#050505]">
      {/* Radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_70%,rgba(252,209,22,0.13)_0%,transparent_65%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FCD116]/5 to-transparent" />
      <Spotlight />
      <ParticleField />
      <div className="absolute inset-0 rounded-3xl border border-[#FCD116]/12 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/50 to-transparent" />

      <div className="relative z-10 text-center px-6 py-16 space-y-8 max-w-3xl mx-auto w-full">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#FCD116]/30 bg-[#FCD116]/8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#FCD116]" />
            <span className="text-[11px] font-black uppercase tracking-[.2em] text-[#FCD116]">Ballon d'Or Cameroun {edition.year}</span>
            <Sparkles className="h-3.5 w-3.5 text-[#FCD116]" />
          </div>
        </motion.div>

        {/* Trophy + Title */}
        <div className="space-y-3">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 12, delay: 0.2 }} className="flex justify-center">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} className="text-7xl sm:text-9xl" style={{ filter: 'drop-shadow(0 0 50px rgba(252,209,22,0.55))' }}>
              🏆
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
            <h1 className="font-display font-black leading-[0.9]">
              <span className="block text-5xl sm:text-7xl lg:text-8xl text-white">BALLON</span>
              <span className="block text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-[#FCD116] via-[#FFE566] to-[#FCD116] bg-clip-text text-transparent">D'OR</span>
            </h1>
          </motion.div>
        </div>

        {/* Leader card */}
        {top && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.75 }} className="mx-auto max-w-sm">
            <div className="relative rounded-2xl border border-[#FCD116]/30 bg-[#FCD116]/[0.05] p-5 overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116]/8 to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-full border-2 border-[#FCD116] overflow-hidden shadow-[0_0_24px_rgba(252,209,22,0.4)]">
                    {top.nominee.photoUrl
                      ? <img src={top.nominee.photoUrl} alt={top.nominee.name} className="w-full h-full object-cover object-top" loading="lazy" />
                      : <div className="w-full h-full bg-white/10 flex items-center justify-center font-black text-white text-lg">
                          {top.nominee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                    }
                  </div>
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute -inset-1.5 rounded-full border border-[#FCD116]/30" />
                  <Crown className="absolute -top-2 -right-1 h-5 w-5 text-[#FCD116]" fill="currentColor" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[10px] text-[#FCD116]/60 uppercase tracking-widest font-bold">{edition.votingOpen ? '🔴 En tête' : '🏆 Vainqueur'}</p>
                  <p className="font-display text-lg font-black text-white leading-tight">{top.nominee.name}</p>
                  <p className="text-xs text-white/40">{top.nominee.clubName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-2xl font-black text-[#FCD116] tabular-nums">{top.totalPoints}</p>
                  <p className="text-[9px] text-white/30 uppercase">pts</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Meta */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center justify-center gap-2 text-sm text-white/25">
          <Users className="h-4 w-4" />{edition.totalVotes.toLocaleString('fr-FR')} votes
        </motion.div>

        {/* Countdown */}
        {edition.votingOpen && edition.votingDeadline && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="space-y-4">
            <p className="text-[11px] text-white/25 uppercase tracking-[.2em]">Fermeture des votes dans</p>
            <VoteCountdown deadline={edition.votingDeadline} />
          </motion.div>
        )}

        {/* Ceremony */}
        {!edition.votingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center justify-center gap-2 text-sm text-white/30">
            <Calendar className="h-4 w-4 text-[#FCD116]/40" />
            Cérémonie : {new Date(edition.ceremonyDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </motion.div>
        )}
      </div>
    </section>
  );
});
BallonDorHero.displayName = 'BallonDorHero';

// ─── BallonDorRankingList ─────────────────────────────────────────────────────
export const BallonDorRankingList = memo(({ edition }: { edition: BallonDorEdition }) => {
  const [expandedRank, setExpandedRank] = useState<number | null>(1);
  const maxPts = edition.ranking[0]?.totalPoints ?? 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-black text-white">Classement</h3>
        <div className="flex items-center gap-4 text-[10px] text-white/25 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#60A5FA]" />Jury</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#FCD116]" />Fans</span>
        </div>
      </div>

      {edition.ranking.map((entry, i) => {
        const isFirst = entry.rank === 1;
        const isTop3  = entry.rank <= 3;
        const medal   = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
        const expanded = expandedRank === entry.rank;

        return (
          <motion.div
            key={entry.nominee.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
              isFirst ? 'border-[#FCD116]/45 bg-gradient-to-r from-[#FCD116]/[0.07] to-black/60 shadow-[0_0_30px_rgba(252,209,22,0.07)]'
              : isTop3 ? 'border-white/12 bg-white/[0.025]'
              : 'border-border/20 bg-white/[0.01] hover:border-border/40'
            }`}
          >
            {isFirst && <div className="h-px bg-gradient-to-r from-transparent via-[#FCD116]/50 to-transparent" />}

            <button onClick={() => setExpandedRank(p => p === entry.rank ? null : entry.rank)}
              className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left group" aria-expanded={expanded}>
              <div className="w-8 shrink-0 text-center">
                {medal ? <span className="text-xl">{medal}</span>
                  : <span className="font-display text-lg font-black text-white/20 tabular-nums">{entry.rank}</span>}
              </div>
              <div className="w-6 shrink-0 flex justify-center">
                {entry.rankChange === 0 ? <Minus className="h-3 w-3 text-white/20" />
                  : entry.rankChange > 0
                  ? <span className="flex items-center text-[#10B981] text-[10px] font-bold"><ChevronUp className="h-3 w-3" />{entry.rankChange}</span>
                  : <span className="flex items-center text-[#CE1126]/70 text-[10px] font-bold"><ChevronDown className="h-3 w-3" />{Math.abs(entry.rankChange)}</span>}
              </div>
              <div className={`relative h-11 w-11 shrink-0 rounded-full border-2 flex items-center justify-center font-black text-sm bg-white/10 ${isFirst ? 'border-[#FCD116] shadow-[0_0_16px_rgba(252,209,22,0.35)]' : 'border-white/10'}`}>
                {entry.nominee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                {isFirst && <Crown className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-4 text-[#FCD116]" fill="currentColor" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isFirst ? 'text-[#FCD116]' : 'text-white/90 group-hover:text-white'}`}>{entry.nominee.name}</p>
                <p className="text-[11px] text-white/35 truncate">{entry.nominee.clubName}</p>
                {isTop3 && (
                  <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
                    <motion.div className="h-full bg-[#60A5FA]" initial={{ width: 0 }} animate={{ width: `${(entry.juryPoints / maxPts) * 100}%` }} transition={{ duration: 1.2, delay: i * 0.1 + 0.3 }} />
                    <motion.div className="h-full bg-[#FCD116]" initial={{ width: 0 }} animate={{ width: `${(entry.fanPoints / maxPts) * 100}%` }} transition={{ duration: 1.2, delay: i * 0.1 + 0.5 }} />
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right mr-1">
                <p className={`font-display text-xl font-black tabular-nums ${isFirst ? 'text-[#FCD116]' : 'text-white/75'}`}>{entry.totalPoints}</p>
                <p className="text-[9px] text-white/25 uppercase">pts</p>
              </div>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/20 shrink-0">
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden border-t border-white/[0.05]">
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { l: 'Jury',     v: entry.juryPoints,                         c: 'text-[#60A5FA]' },
                      { l: 'Fans',     v: entry.fanPoints,                          c: 'text-[#FCD116]' },
                      { l: 'Buts',     v: entry.nominee.stats.goals ?? 0,           c: 'text-white/80'  },
                      { l: 'Note',     v: entry.nominee.stats.rating?.toFixed(1) ?? '—', c: 'text-white/80' },
                    ].map(s => (
                      <div key={s.l} className="rounded-xl bg-white/[0.04] border border-white/[0.05] p-3 text-center">
                        <p className={`font-display text-xl font-black tabular-nums ${s.c}`}>{s.v}</p>
                        <p className="text-[9px] text-white/25 uppercase tracking-wide mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
});
BallonDorRankingList.displayName = 'BallonDorRankingList';

// ─── Past Winners Gallery ─────────────────────────────────────────────────────
const WinnerCard = memo(({ winner, index }: { winner: HistoricalWinner; index: number }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const mx     = useMotionValue(0);
  const my     = useMotionValue(0);
  const rx     = useTransform(useSpring(my, { stiffness: 400, damping: 40 }), [-0.5, 0.5], [6, -6]);
  const ry     = useTransform(useSpring(mx, { stiffness: 400, damping: 40 }), [-0.5, 0.5], [-6, 6]);
  const clubName = 'clubName' in winner.winner ? (winner.winner as any).clubName : '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top)  / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className="group relative rounded-2xl border border-[#FCD116]/18 bg-gradient-to-b from-[#FCD116]/[0.06] to-black/80 overflow-hidden cursor-default hover:border-[#FCD116]/40 transition-colors duration-400"
      >
        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#FCD116]/40 to-transparent" />

        {/* Hover shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116]/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

        <div className="p-5 relative">
          {/* Year + Trophy */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] text-[#FCD116]/40 uppercase tracking-[.2em] font-bold mb-0.5">Édition</p>
              <p className="font-display text-4xl font-black text-[#FCD116]/85 tabular-nums leading-none">{winner.year}</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ type: 'spring', delay: index * 0.08 + 0.3, stiffness: 200 }}
              className="text-3xl"
              style={{ filter: 'drop-shadow(0 0 10px rgba(252,209,22,0.45))' }}
            >
              🏆
            </motion.div>
          </div>

          {/* Winner */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-[#FCD116]/35 overflow-hidden shrink-0 shadow-[0_0_14px_rgba(252,209,22,0.18)] group-hover:shadow-[0_0_20px_rgba(252,209,22,0.30)] transition-shadow">
              {(winner.winner as any).photoUrl
                ? <img src={(winner.winner as any).photoUrl} alt={winner.winner.name} className="w-full h-full object-cover object-top" loading="lazy" />
                : <div className="w-full h-full bg-white/8 flex items-center justify-center font-black text-white/65">
                    {winner.winner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
              }
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white/90 truncate leading-tight">{winner.winner.name}</p>
              {clubName && <p className="text-[11px] text-white/35 truncate">{clubName}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-white/25 uppercase tracking-wider">
              {winner.season.replace('season-', '')}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: index * 0.08 + 0.5 + i * 0.06 }}>
                  <Star className="h-3 w-3 text-[#FCD116]/55" fill="currentColor" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
WinnerCard.displayName = 'WinnerCard';

export const PastWinnersGallery = memo(() => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section ref={ref} className="space-y-6">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-[#FCD116]/25 to-transparent" />
        <div className="flex items-center gap-2 shrink-0">
          <Trophy className="h-5 w-5 text-[#FCD116]/70" />
          <h3 className="font-display text-xl font-black text-white">Palmarès historique</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-[#FCD116]/25 to-transparent" />
      </motion.div>

      {/* Winners grid */}
      {MOCK_HISTORICAL.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_HISTORICAL.map((w, i) => (
            <WinnerCard key={w.year} winner={w} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center py-12"
        >
          <div className="text-4xl mb-3 opacity-30">📜</div>
          <p className="text-white/25 text-sm">Palmarès disponible après la première édition.</p>
        </motion.div>
      )}
    </section>
  );
});
PastWinnersGallery.displayName = 'PastWinnersGallery';