import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, MapPin, CalendarDays, Users2, Trophy } from 'lucide-react';
import type { Club, Standing } from '@/types/football.types';
import { CLUB_CRESTS, STADIUM_FALLBACK_IMAGE } from './clubAssets';

interface ClubHeroProps {
  club: Club;
  standing?: Standing;
}

/**
 * The "museum entrance" — a panoramic, parallax-scrolled stadium panorama
 * with the club crest presented like a vitrine centrepiece. Mirrors the
 * visual grammar of the Hall of Fame museum hero (dark wall, gold vignette,
 * serif italic title) while giving each club its own colour signature.
 */
export const ClubHero = memo(({ club, standing }: ClubHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ['0%', '18%']);
  const crest = CLUB_CRESTS[club.id] ?? club.logoUrl;
  const primary = club.color || '#FCD116';

  const facts = [
    { icon: MapPin,       label: club.stadium },
    { icon: CalendarDays, label: club.foundedYear ? `Fondé en ${club.foundedYear}` : undefined },
    { icon: Users2,       label: club.stadiumCapacity ? `${club.stadiumCapacity.toLocaleString('fr-FR')} places` : undefined },
  ].filter(f => f.label);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-white/10" style={{ background: '#06090a' }}>
      {/* Panoramic parallax backdrop — the museum's picture window onto the stadium */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img
          src={club.stadiumPhotoUrl || STADIUM_FALLBACK_IMAGE}
          alt={`${club.stadium || 'Stade'} — vue panoramique`}
          className="h-[120%] w-full object-cover object-center grayscale opacity-[0.16] scale-110"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#06090a] via-[#06090a]/88 to-[#06090a]" />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 65% 55% at 50% 22%, ${primary}1c, transparent 70%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }} />

      <div className="container relative z-10 py-16 lg:py-24">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors mb-10 uppercase tracking-[0.2em] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à la galerie des clubs
        </Link>

        {/* Museum wing eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="h-px w-8" style={{ backgroundColor: primary }} />
          <p className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: primary }}>
            MTN Elite One · Musée du Club
          </p>
          <div className="h-px w-8" style={{ backgroundColor: primary }} />
        </motion.div>

        <div className="flex flex-col items-center text-center gap-7">
          {/* Crest vitrine — a display case, not a badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-28 w-28 lg:h-36 lg:w-36 grid place-items-center"
            style={{
              background: `linear-gradient(160deg, ${primary}14, transparent 75%)`,
              border: `1px solid ${primary}40`,
            }}
          >
            <div className="absolute inset-2 border border-white/5" />
            {crest ? (
              <img src={crest} alt={`${club.name} — écusson`} className="h-[68%] w-[68%] object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)]" />
            ) : (
              <span className="font-display text-4xl font-black" style={{ color: primary }}>{club.short}</span>
            )}
          </motion.div>

          {/* Identity plaque */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {club.region && (
              <p className="text-[10px] text-white/35 uppercase tracking-[0.28em] font-semibold">{club.region} · Cameroun</p>
            )}
            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-white leading-[0.98] tracking-tight">
              {club.name}
            </h1>
            {club.nickname && (
              <p className="text-sm sm:text-base text-white/50 normal-case tracking-normal">« {club.nickname} »</p>
            )}
          </motion.div>

          {/* Placard strip — thin museum label with quick facts */}
          {facts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-6 border-y border-white/10"
            >
              {facts.map((f, i) => (
                <span key={i} className="flex items-center gap-2 text-xs text-white/60">
                  <f.icon className="h-3.5 w-3.5" style={{ color: primary }} />
                  {f.label}
                </span>
              ))}
            </motion.div>
          )}

          {/* Brass plaques — season snapshot */}
          {standing && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="flex gap-3 pt-1"
            >
              <PlaqueStat value={`#${standing.position}`} label="Classement" color={primary} />
              <PlaqueStat value={String(standing.points)} label="Points" color="#fff" />
              <PlaqueStat
                value={String((club.achievements?.league ?? 0) + (club.achievements?.cup ?? 0))}
                label="Titres"
                icon={Trophy}
                color="#FCD116"
              />
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-10 flex justify-center pb-6"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-6 w-4 border border-white/20 rounded-full grid place-items-center"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
});
ClubHero.displayName = 'ClubHero';

const PlaqueStat = memo(({ value, label, color, icon: Icon }: { value: string; label: string; color: string; icon?: typeof Trophy }) => (
  <div className="border border-white/10 bg-white/[0.03] px-5 py-3 text-center min-w-[90px]">
    <div className="font-display text-2xl font-black flex items-center justify-center gap-1.5" style={{ color }}>
      {Icon && <Icon className="h-4 w-4" />}
      {value}
    </div>
    <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
  </div>
));
PlaqueStat.displayName = 'PlaqueStat';
