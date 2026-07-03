import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { youngTalents } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import { Link } from "react-router-dom";

import yt1 from "@/assets/images/youngtalents/NathanDouala.png";
import yt2 from "@/assets/images/youngtalents/SergeDaura.png";
import p3  from "@/assets/images/players/EdouardSombang.png";

const imgMap: Record<string, string> = { yt1, yt2, p3 };

// ─── Potential bar ────────────────────────────────────────────────────────────
const PotentialBar = ({ value, inView }: { value: number; inView: boolean }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-muted-foreground uppercase tracking-wider">Potentiel</span>
      <span className="font-bold text-accent">{value}</span>
    </div>
    <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-accent to-[#CE1126]"
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </div>
);

// ─── Carousel arrow button ────────────────────────────────────────────────────
const CarouselArrow = ({
  dir, onClick,
}: { dir: 'left' | 'right'; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="shrink-0 h-8 w-8 rounded-full bg-white/5 border border-border/50 grid place-items-center text-muted-foreground hover:bg-white/10 hover:text-accent transition-all cursor-pointer"
  >
    {dir === 'left'
      ? <ChevronLeft className="h-4 w-4" />
      : <ChevronRight className="h-4 w-4" />
    }
  </button>
);

// ─── Talent card — vertical card for carousel ─────────────────────────────────
const TalentCard = ({
  talent, i, inView,
}: { talent: typeof youngTalents[0]; i: number; inView: boolean }) => (
  <motion.article
    initial={{ opacity: 0, y: 16, scale: 0.97 }}
    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
    transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
    style={{ scrollSnapAlign: 'start' }}
    className="group relative flex-shrink-0 w-52 bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant cursor-pointer"
  >
    {/* Image */}
    <div className="relative h-44 overflow-hidden">
      <img
        src={imgMap[talent.imgKey] ?? imgMap.yt1}
        alt={talent.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

      {/* Age badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur border border-accent/20 px-2 py-0.5">
        <Zap className="h-2.5 w-2.5 text-accent fill-accent" />
        <span className="text-[9px] text-white font-bold">{talent.age}a</span>
      </div>

      {/* Nationality */}
      <div className="absolute bottom-2 left-2 text-sm">{talent.nationality}</div>

      {/* Hover arrow */}
      <div className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded-full bg-black/60 backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
        <ArrowUpRight className="h-3 w-3 text-accent" />
      </div>
    </div>

    {/* Content */}
    <div className="p-3.5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">
            {talent.position}
          </div>
          <h3 className="font-display text-base leading-tight group-hover:text-accent transition-colors truncate">
            {talent.name}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-lg text-accent leading-none">{talent.rating}</div>
          <div className="text-[8px] text-muted-foreground uppercase">Rating</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ClubBadge club={talent.club} size={12} />
        <span className="text-[10px] text-muted-foreground truncate">{talent.club.name}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 border-t border-b border-border/30 py-2">
        <div className="text-center">
          <div className="font-display text-sm text-accent">{talent.goals}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Buts</div>
        </div>
        <div className="h-5 w-px bg-border" />
        <div className="text-center">
          <div className="font-display text-sm text-accent">{talent.assists}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Passes</div>
        </div>
      </div>

      {/* Potential bar */}
      <PotentialBar value={talent.potential} inView={inView} />
    </div>
  </motion.article>
);

// ─── Main YoungTalents ────────────────────────────────────────────────────────
export const YoungTalents = () => {
  const ref    = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' });
  };

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <SectionHeader eyebrow="Young Talent Watch" title="Étoiles Montantes" size="compact" />
        <div className="flex items-center gap-1.5">
          <CarouselArrow dir="left"  onClick={() => scroll('left')}  />
          <CarouselArrow dir="right" onClick={() => scroll('right')} />
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {youngTalents.map((talent, i) => (
          <TalentCard key={talent.id} talent={talent} i={i} inView={inView} />
        ))}
      </div>

      <div className="mt-4">
        <Link
          to="/talents"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group"
        >
          Voir tous les talents
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};