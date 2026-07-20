import { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  motion, AnimatePresence, useInView,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import {
  Trophy, Star, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Minus, Crown, Users, Calendar, Sparkles, Play, Pause, ImagePlus,
} from 'lucide-react';
import { useAwardCountdown } from '@/hooks/useAwards';
import { useHistoricalWinners } from '@/hooks/useAwards';
import { CEREMONY_PHOTOS } from '@/services/ceremonyPhotos';
import { CeremonyBackdrop } from './CeremonyBackdrop';
import type { BallonDorEdition, HistoricalWinner } from '@/types/awards.types';

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

const Spotlight = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute top-0 w-80 h-full bg-gradient-to-b from-[#FCD116]/12 via-[#FCD116]/5 to-transparent blur-3xl"
      animate={{ x: ['-20%', '80%', '-20%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

// ─── TrophyShowcase — an original laurel-arch frame with a real image slot.
//     Pass `src` for your own trophy photo/render; otherwise shows a tasteful
//     placeholder so the layout & lighting stay correct until an asset lands ──
interface TrophyShowcaseProps { src?: string; alt?: string; width?: number; height?: number; }

const TrophyShowcase = ({ src, alt = "Trophée Ballon d'Or Cameroun", width = 240, height = 300 }: TrophyShowcaseProps) => {
  const leafAngles = [98, 118, 138, 158, 82, 62, 42, 22];
  return (
    <div className="relative flex flex-col items-center" style={{ width }}>
      {/* spotlight cone falling onto the piece from above */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -z-10 pointer-events-none"
        style={{
          top: -40, width: width * 0.9, height: height + 60,
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 40%, rgba(252,209,22,0.16) 50%, transparent 60%)',
          filter: 'blur(6px)',
        }}
      />

      {/* ambient stage glow behind the piece */}
      <div
        className="absolute -z-10 rounded-full blur-3xl"
        style={{
          width: width * 1.5, height: width * 1.5, top: -width * 0.2,
          background: 'radial-gradient(ellipse 60% 60% at 50% 45%, rgba(252,209,22,0.30), transparent 70%)',
        }}
      />

      {/* laurel + star crest, framing the top of the showcase */}
      <svg width={width} height={70} viewBox="0 0 220 70" className="mb-[-14px] relative z-10">
        <defs>
          <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3C4" />
            <stop offset="45%" stopColor="#FCD116" />
            <stop offset="100%" stopColor="#A9760F" />
          </linearGradient>
        </defs>
        <path d="M15,55 A80,80 0 0,1 90,10" fill="none" stroke="#FCD116" strokeOpacity="0.4" strokeWidth="1.2" />
        <path d="M205,55 A80,80 0 0,0 130,10" fill="none" stroke="#FCD116" strokeOpacity="0.4" strokeWidth="1.2" />
        {leafAngles.map((deg, i) => {
          const r = 80, cx = 110 + r * Math.cos((deg * Math.PI) / 180), cy = 60 + r * Math.sin((deg * Math.PI) / 180);
          return <ellipse key={i} cx={cx} cy={cy} rx="10" ry="4.5" fill="#FCD116" fillOpacity="0.55" transform={`rotate(${deg}, ${cx}, ${cy})`} />;
        })}
        <path
          d="M110,8 L113,16.2 L121.6,16.7 L114.9,22 L117,30.3 L110,25.6 L103,30.3 L105.1,22 L98.4,16.7 L107,16.2 Z"
          fill="url(#crestGold)"
        />
      </svg>

      {/* image showcase — arch niche, like a museum display */}
      <div
        className="relative w-full rounded-t-[9999px] rounded-b-2xl border-2 border-[#FCD116]/35 bg-gradient-to-b from-[#171104] via-[#0a0803] to-[#050505] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]"
        style={{ height }}
      >
        <div className="absolute inset-[3px] rounded-t-[9999px] rounded-b-xl border border-[#FCD116]/15 pointer-events-none" />

        {src ? (
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain p-7"
            style={{
              filter: 'drop-shadow(0 12px 22px rgba(0,0,0,0.55)) contrast(1.05) saturate(1.08)',
              maskImage: 'radial-gradient(closest-side, black 68%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(closest-side, black 68%, transparent 100%)',
            }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-3 rounded-t-[9999px] rounded-b-xl border-2 border-dashed border-[#FCD116]/25 flex flex-col items-center justify-center gap-2.5 px-6 text-center">
            <ImagePlus className="h-7 w-7 text-[#FCD116]/40" />
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#FCD116]/45">Emplacement du trophée</p>
            <p className="text-[9.5px] leading-relaxed text-white/25">
              Ajoutez ici la photo ou le rendu du trophée<br />(PNG transparent conseillé, min. 800×1000px)
            </p>
          </div>
        )}
      </div>

      {/* floor reflection — faint mirrored echo, like a trophy on a lit stage floor */}
      {src && (
        <div className="w-2/3 overflow-hidden -mt-1" style={{ height: height * 0.22 }}>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="w-full object-contain object-top"
            style={{
              height: height * 0.55,
              transform: 'scaleY(-1)',
              filter: 'blur(1.5px) contrast(1.05) saturate(1.08)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 85%)',
            }}
          />
        </div>
      )}

      {/* grounding shadow */}
      <div className="w-3/4 h-3.5 rounded-full blur-md bg-black/70 -mt-1.5" />
    </div>
  );
};


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
export const BallonDorHero = memo(({ edition, trophyImageSrc }: { edition: BallonDorEdition; trophyImageSrc?: string }) => {
  const top = edition.ranking[0];
  return (
    <section className="relative min-h-[72vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-black">
      <CeremonyBackdrop photos={CEREMONY_PHOTOS} intensity="medium" className="rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_70%,rgba(252,209,22,0.13)_0%,transparent_65%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FCD116]/5 to-transparent" />
      <Spotlight />
      <ParticleField />
      <div className="absolute inset-0 rounded-3xl border border-[#FCD116]/12 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/50 to-transparent" />

      <div className="relative z-10 text-center px-6 py-16 space-y-8 max-w-3xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#FCD116]/30 bg-[#FCD116]/8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#FCD116]" />
            <span className="text-[11px] font-black uppercase tracking-[.2em] text-[#FCD116]">Ballon d'Or Cameroun {edition.year}</span>
            <Sparkles className="h-3.5 w-3.5 text-[#FCD116]" />
          </div>
        </motion.div>

        <div className="space-y-3">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 12, delay: 0.2 }} className="flex justify-center">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: 'drop-shadow(0 0 50px rgba(252,209,22,0.35))' }}>
              <TrophyShowcase src={trophyImageSrc} />
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
            <h1 className="font-display font-black leading-[0.9]">
              <span className="block text-5xl sm:text-7xl lg:text-8xl text-white">BALLON</span>
              <span className="block text-5xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-[#FCD116] via-[#FFE566] to-[#FCD116] bg-clip-text text-transparent">D'OR</span>
            </h1>
          </motion.div>
        </div>

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
                  <p className="flex items-center gap-1.5 text-[10px] text-[#FCD116]/60 uppercase tracking-widest font-bold">
                    {edition.votingOpen
                      ? <><span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />En tête</>
                      : <><Trophy className="h-3 w-3" />Vainqueur</>}
                  </p>
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center justify-center gap-2 text-sm text-white/25">
          <Users className="h-4 w-4" />{edition.totalVotes.toLocaleString('fr-FR')} votes
        </motion.div>

        {edition.votingOpen && edition.votingDeadline && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="space-y-4">
            <p className="text-[11px] text-white/25 uppercase tracking-[.2em]">Fermeture des votes dans</p>
            <VoteCountdown deadline={edition.votingDeadline} />
          </motion.div>
        )}

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
              <div className={`relative h-11 w-11 shrink-0 rounded-full border-2 flex items-center justify-center font-black text-sm overflow-hidden ${isFirst ? 'border-[#FCD116] shadow-[0_0_16px_rgba(252,209,22,0.35)]' : 'border-white/10 bg-white/10'}`}>
                {entry.nominee.photoUrl
                  ? <img src={entry.nominee.photoUrl} alt={entry.nominee.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  : <span className="text-white/70">{entry.nominee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                }
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
                      { l: 'Jury',  v: entry.juryPoints,                          c: 'text-[#60A5FA]' },
                      { l: 'Fans',  v: entry.fanPoints,                           c: 'text-[#FCD116]' },
                      { l: 'Buts',  v: entry.nominee.stats.goals ?? 0,            c: 'text-white/80'  },
                      { l: 'Note',  v: entry.nominee.stats.rating?.toFixed(1) ?? '—', c: 'text-white/80' },
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

// ─── CAROUSEL WINNERS ─────────────────────────────────────────────────────────

// Carousel slide card
const CarouselSlide = memo(({
  winner, isActive, isPrev, isNext, onClick,
}: {
  winner: HistoricalWinner;
  isActive: boolean;
  isPrev: boolean;
  isNext: boolean;
  onClick: () => void;
}) => {
  const clubName = 'clubName' in winner.winner ? (winner.winner as any).clubName : '';
  const photoUrl = (winner.winner as any).photoUrl;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(useSpring(my, { stiffness: 400, damping: 40 }), [-0.5, 0.5], [8, -8]);
  const ry = useTransform(useSpring(mx, { stiffness: 400, damping: 40 }), [-0.5, 0.5], [-8, 8]);

  const scale    = isActive ? 1    : 0.82;
  const opacity  = isActive ? 1    : isPrev || isNext ? 0.45 : 0;
  const zIndex   = isActive ? 10   : isPrev || isNext ? 5    : 0;
  const x        = isActive ? 0    : isPrev ? '-110%'         : isNext ? '110%' : '0%';
  const blur     = isActive ? 0    : 4;

  return (
    <motion.div
      animate={{ scale, opacity, x, filter: `blur(${blur}px)` }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ zIndex, perspective: 1000, position: 'absolute', width: '100%' }}
      onClick={!isActive ? onClick : undefined}
      className={!isActive ? 'cursor-pointer' : ''}
    >
      <motion.div
        onMouseMove={isActive ? (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top)  / r.height - 0.5);
        } : undefined}
        onMouseLeave={isActive ? () => { mx.set(0); my.set(0); } : undefined}
        className="group relative rounded-3xl border overflow-hidden bg-[#070707]"
        style={{
          borderColor: isActive ? 'rgba(252,209,22,0.4)' : 'rgba(255,255,255,0.06)',
          boxShadow: isActive ? '0 0 60px rgba(252,209,22,0.12), 0 24px 60px rgba(0,0,0,0.7)' : 'none',
          ...(isActive ? { rotateX: rx, rotateY: ry } : {}),
        }}
      >
        {isActive && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/70 to-transparent" />
        )}

        {/* Background player image if available */}
        {photoUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover object-top scale-110 opacity-15 blur-sm"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/80 to-[#070707]/60" />
          </div>
        )}

        {/* Gold radial glow */}
        {isActive && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_80%,rgba(252,209,22,0.10)_0%,transparent_70%)] pointer-events-none" />
        )}

        <div className="relative z-10 p-8">
          {/* Edition year */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] text-[#FCD116]/40 uppercase tracking-[.25em] font-black mb-1">Édition</p>
              <motion.p
                key={winner.year}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-6xl font-black text-[#FCD116]/70 tabular-nums leading-none"
              >
                {winner.year}
              </motion.p>
            </div>
            <motion.div
              animate={isActive ? {
                filter: ['drop-shadow(0 0 20px rgba(252,209,22,0.4))', 'drop-shadow(0 0 50px rgba(252,209,22,0.75))', 'drop-shadow(0 0 20px rgba(252,209,22,0.4))'],
                scale: [1, 1.08, 1],
              } : { filter: 'drop-shadow(0 0 0px transparent)', scale: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🏆
            </motion.div>
          </div>

          {/* Winner player */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative shrink-0">
              <motion.div
                animate={isActive ? { boxShadow: ['0 0 0 0 rgba(252,209,22,0)', '0 0 0 6px rgba(252,209,22,0.15)', '0 0 0 0 rgba(252,209,22,0)'] } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-[#FCD116]/40"
              >
                {photoUrl
                  ? <img src={photoUrl} alt={winner.winner.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  : <div className="w-full h-full bg-white/10 flex items-center justify-center font-black text-white text-2xl">
                      {winner.winner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                }
              </motion.div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="absolute -top-2 -right-2"
                >
                  <Crown className="h-6 w-6 text-[#FCD116]" fill="currentColor" style={{ filter: 'drop-shadow(0 0 8px rgba(252,209,22,0.8))' }} />
                </motion.div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <motion.p
                key={`${winner.year}-name`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-2xl font-black text-white leading-tight"
              >
                {winner.winner.name}
              </motion.p>
              {clubName && (
                <motion.p
                  key={`${winner.year}-club`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18 }}
                  className="text-sm text-white/40 mt-0.5"
                >
                  {clubName}
                </motion.p>
              )}
              <div className="flex gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 400 }}
                  >
                    <Star className="h-3.5 w-3.5 text-[#FCD116]/60" fill="currentColor" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Highlight stat */}
            <div className="shrink-0 text-right">
              <motion.p
                key={`${winner.year}-stat`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="font-display text-4xl font-black text-[#FCD116] tabular-nums"
              >
                {winner.winner.highlightStat.value}
              </motion.p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">
                {winner.winner.highlightStat.label}
              </p>
            </div>
          </div>

          {/* Season badge */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-bold">
              {winner.season.replace('season-', '').replace('-', '–')}
            </span>
            {isActive && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-[#FCD116]/50 font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Trophy className="h-3 w-3" /> Ballon d'Or
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
CarouselSlide.displayName = 'CarouselSlide';

// ─── Past Winners Gallery (Carousel) ─────────────────────────────────────────
export const PastWinnersGallery = memo(() => {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: '-40px' });
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  // Sprint 2 (de-mock): palmarès from GET /awards/public/historical (Heritage Builder)
  const { data: winners } = useHistoricalWinners('BALLON_DOR');
  const total   = winners.length;

  // Autoplay
  useEffect(() => {
    if (!autoplay || !inView) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % total), 4500);
    return () => clearInterval(id);
  }, [autoplay, inView, total]);

  const prev = useCallback(() => { setAutoplay(false); setCurrent(c => (c - 1 + total) % total); }, [total]);
  const next = useCallback(() => { setAutoplay(false); setCurrent(c => (c + 1) % total); }, [total]);
  const goTo = (i: number) => { setAutoplay(false); setCurrent(i); };

  if (total === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="text-center py-12">
        <div className="text-4xl mb-3 opacity-30">📜</div>
        <p className="text-white/25 text-sm">Palmarès disponible après la première édition.</p>
      </motion.div>
    );
  }

  const prevIdx = (current - 1 + total) % total;
  const nextIdx = (current + 1) % total;

  return (
    <section ref={ref} className="space-y-8">
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

      {/* Carousel container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="relative"
      >
        {/* Slide area */}
        <div className="relative h-[340px] mx-12">
          {winners.map((winner, i) => (
            <CarouselSlide
              key={`${winner.year}-${winner.category}`}
              winner={winner}
              isActive={i === current}
              isPrev={i === prevIdx}
              isNext={i === nextIdx}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/12 hover:text-white transition-all z-20"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/12 hover:text-white transition-all z-20"
          aria-label="Suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Dots + autoplay toggle */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex gap-2">
          {winners.map((w, i) => (
            <button
              key={`${w.year}-${w.category}`}
              onClick={() => goTo(i)}
              aria-label={`Aller à ${w.year}`}
              className="relative"
            >
              <motion.div
                animate={{
                  width: i === current ? 24 : 6,
                  backgroundColor: i === current ? '#FCD116' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="h-1.5 rounded-full"
              />
            </button>
          ))}
        </div>

        {/* Autoplay toggle */}
        <button
          onClick={() => setAutoplay(a => !a)}
          className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors"
        >
          {autoplay
            ? <><Pause className="h-3 w-3" /> Auto</>
            : <><Play  className="h-3 w-3" /> Jouer</>
          }
        </button>
      </div>

      {/* Year thumbnails strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {winners.map((w, i) => (
          <motion.button
            key={`${w.year}-${w.category}`}
            onClick={() => goTo(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
              i === current
                ? 'border-[#FCD116]/50 bg-[#FCD116]/[0.08] text-[#FCD116]'
                : 'border-white/[0.06] bg-white/[0.02] text-white/30 hover:border-white/15 hover:text-white/60'
            }`}
          >
            <span className="font-display text-sm font-black tabular-nums">{w.year}</span>
            <span className="text-[9px] truncate max-w-[80px]">{w.winner.name.split(' ').slice(-1)[0]}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
});
PastWinnersGallery.displayName = 'PastWinnersGallery';