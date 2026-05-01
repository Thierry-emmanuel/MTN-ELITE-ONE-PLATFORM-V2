import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, ArrowUpRight, ArrowRight } from "lucide-react";
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

// ─── Talent card — compact horizontal layout ──────────────────────────────────
const TalentCard = ({
  talent, i, inView,
}: { talent: typeof youngTalents[0]; i: number; inView: boolean }) => (
  <motion.article
    initial={{ opacity: 0, y: 20, scale: 0.97 }}
    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
    transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
    className="group relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant cursor-pointer"
  >
    <div className="flex gap-0">
      {/* Image column */}
      <div className="relative w-24 sm:w-28 shrink-0 overflow-hidden">
        <img
          src={imgMap[talent.imgKey] ?? imgMap.yt1}
          alt={talent.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60" />

        {/* Age badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur border border-accent/20 px-1.5 py-0.5">
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
      <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
        {/* Name + club */}
        <div>
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

          <div className="flex items-center gap-1.5 mt-1.5">
            <ClubBadge club={talent.club} size={12} />
            <span className="text-[10px] text-muted-foreground truncate">{talent.club.name}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 my-2.5">
          <div className="text-center">
            <div className="font-display text-sm text-accent">{talent.goals}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Buts</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-center">
            <div className="font-display text-sm text-accent">{talent.assists}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Passes</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <p className="text-[10px] text-muted-foreground/60 line-clamp-2 flex-1">
            {talent.story}
          </p>
        </div>

        {/* Potential bar */}
        <PotentialBar value={talent.potential} inView={inView} />
      </div>
    </div>
  </motion.article>
);

// ─── Main YoungTalents ────────────────────────────────────────────────────────
export const YoungTalents = () => {
  const ref   = useRef(null);
  const inView= useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref}>
      <div className="flex items-end justify-between gap-3 mb-5">
        <SectionHeader eyebrow="Young Talent Watch" title="Étoiles Montantes" size="compact" />
      </div>

      <div className="flex flex-col gap-3">
        {youngTalents.map((talent, i) => (
          <TalentCard key={talent.id} talent={talent} i={i} inView={inView} />
        ))}
      </div>

      <div className="mt-3">
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