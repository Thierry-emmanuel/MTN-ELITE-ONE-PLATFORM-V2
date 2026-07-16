import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Award, ArrowUpRight, Vote, CheckCircle2, ChevronDown } from 'lucide-react';
import type { BallonDorEdition, PlayerNominee } from '@/types/awards.types';

// Image paths resolved at build time via Vite (mirrors the convention used in mockAwards.ts)
const HERO_IMAGE  = new URL('../../../assets/images/actions/img9.png', import.meta.url).href;
const TROPHY_MARK = new URL("../../../assets/images/halloffame/ballon d'or.png", import.meta.url).href;

function timeUntil(iso?: string) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}j ${h}h` : `${h}h`;
}

// ─── 1. Cinematic Hero ──────────────────────────────────────────────────────
// A single fullscreen photograph, minimal typography, slow reveal. No stat
// chips, no live counters, no dashboard furniture — the museum entrance.
interface CinematicHeroProps {
  season: string;
  scrollTargetId?: string;
}

export function CinematicHero({ season, scrollTargetId = 'featured-winner' }: CinematicHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const parallaxY  = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const fadeOut     = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[94vh] min-h-[640px] w-full overflow-hidden bg-black">
      {/* Photograph — slow Ken Burns reveal on entry, gentle parallax on scroll */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0">
        <motion.img
          src={HERO_IMAGE}
          alt="Moment fort de la saison MTN Elite One"
          className="h-full w-full object-cover object-[50%_22%]"
          initial={{ scale: 1.14, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 3.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {/* Legibility gradients — restrained, no neon glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_100%,rgba(252,209,22,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/25 to-transparent" />

      {/* Content — anchored low, generous whitespace above */}
      <motion.div style={{ opacity: fadeOut }} className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-16 text-center sm:pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-px w-9 bg-[#FCD116]/55" />
          <span className="text-[10px] font-bold uppercase tracking-[.4em] text-[#FCD116]/85 sm:text-[11px]">
            MTN Elite One — Saison {season}
          </span>
          <span className="h-px w-9 bg-[#FCD116]/55" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif italic font-medium leading-[0.92] text-white text-[2.9rem] sm:text-7xl lg:text-8xl"
        >
          La nuit des <span className="not-italic font-black text-foil">Lions</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15 }}
          className="mt-6 max-w-md text-sm leading-relaxed text-white/55 sm:text-base"
        >
          Ici, on n'attribue pas un trophée — on inscrit un nom dans l'histoire du football camerounais.
        </motion.p>

        <motion.a
          href={`#${scrollTargetId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="group mt-14 flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-[#FCD116]/80"
        >
          <span className="text-[10px] font-bold uppercase tracking-[.32em]">Entrer</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.a>
      </motion.div>
    </section>
  );
}

// ─── 2. Featured Winner ─────────────────────────────────────────────────────
// One player. A large portrait, a season story, a milestone. No cards, no
// vote-percentage bars — the win itself is restyled as a quiet, editorial
// line rather than a call-to-action button.
interface FeaturedWinnerProps {
  edition: BallonDorEdition;
  votedNomineeId?: string | null;
}

export function FeaturedWinner({ edition, votedNomineeId }: FeaturedWinnerProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  const winner = edition.winner as PlayerNominee & { description?: string } | undefined;
  if (!winner) return null;
  const isVoted = votedNomineeId === winner.id;
  const closing = timeUntil(edition.votingDeadline);

  const stats = [
    winner.stats?.goals != null       && { label: 'Buts',          value: winner.stats.goals },
    winner.stats?.assists != null     && { label: 'Passes déc.',   value: winner.stats.assists },
    winner.stats?.appearances != null && { label: 'Apparitions',   value: winner.stats.appearances },
    winner.stats?.rating != null      && { label: 'Note moyenne',  value: winner.stats.rating.toFixed(1) },
  ].filter(Boolean) as { label: string; value: number | string }[];

  return (
    <section id="featured-winner" ref={sectionRef} className="relative overflow-hidden bg-black py-20 sm:py-28 lg:py-36">
      {/* Faint trophy watermark — the artwork in the corner of the gallery */}
      <div className="pointer-events-none absolute -right-16 top-1/2 hidden w-[420px] -translate-y-1/2 opacity-[0.05] sm:block lg:w-[540px]" aria-hidden>
        <img src={TROPHY_MARK} alt="" className="h-full w-full object-contain" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_50%,rgba(252,209,22,0.06),transparent_65%)]" />

      <div className="container relative grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        {/* Portrait */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-[360px]"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            {winner.photoUrl ? (
              <img src={winner.photoUrl} alt={winner.name} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.04] text-6xl font-black text-white/15">
                {winner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black to-transparent" />
          </div>
          {/* Plaque-style corner frame, not a bordered card */}
          <div className="pointer-events-none absolute -top-3 -left-3 h-6 w-6 border-t border-l border-[#FCD116]/40" />
          <div className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-[#FCD116]/40" />
        </motion.div>

        {/* Editorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-[#FCD116]/70" />
            <p className="text-[10px] font-black uppercase tracking-[.3em] text-[#FCD116]/70">
              Récompense suprême · Ballon d'Or Cameroun {edition.year}
            </p>
          </div>

          <h2 className="font-serif italic font-medium leading-[0.98] text-white text-4xl sm:text-5xl lg:text-6xl">
            {winner.name}
          </h2>
          <p className="mt-2 text-xs uppercase tracking-[.2em] text-white/40 sm:text-sm">
            {winner.clubName}
            {winner.position ? ` · ${winner.position}` : ''}
          </p>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            {winner.description ?? "Le meilleur joueur de la saison, distingué par le jury et par les supporters."}
          </p>

          {stats.length > 0 && (
            <>
              <div className="divider-engraved mt-10 mb-6 max-w-xl" />
              <div className="flex max-w-xl flex-wrap gap-x-10 gap-y-5">
                {stats.map(s => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-black tabular-nums text-[#FCD116] sm:text-3xl">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/awards/ballon-dor"
              className="group inline-flex items-center gap-2 text-sm font-bold text-white/85 transition-colors hover:text-[#FCD116]"
            >
              Lire son histoire
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <span className="hidden h-4 w-px bg-white/10 sm:block" />

            {edition.votingOpen ? (
              <Link to="/awards/vote" className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">
                <Vote className="h-3.5 w-3.5 text-[#FCD116]/60" />
                {isVoted ? 'Vous avez voté' : "Voter pour ce Ballon d'Or"}
                {isVoted && <CheckCircle2 className="h-3.5 w-3.5 text-[#FCD116]" />}
              </Link>
            ) : (
              <span className="text-sm text-white/30">Trophée décerné</span>
            )}

            {edition.votingOpen && closing && (
              <span className="text-[11px] text-white/25">Clôture dans {closing}</span>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}