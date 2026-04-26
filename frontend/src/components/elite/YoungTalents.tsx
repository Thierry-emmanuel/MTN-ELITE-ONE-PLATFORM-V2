import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, TrendingUp, ArrowUpRight } from "lucide-react";
import { youngTalents, clubStories } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";
import yt2 from "@/assets/images/youngtalents/SergeDaura.png";
import p3  from "@/assets/images/players/EdouardSombang.png";

const imgMap: Record<string, string> = { yt1, yt2, p3 };

const tagColors: Record<string, string> = {
  gold:  "bg-accent/20 text-accent border-accent/30",
  green: "bg-[#008751]/20 text-[#008751] border-[#008751]/30",
  red:   "bg-[#CE1126]/20 text-[#CE1126] border-[#CE1126]/30",
};

// ─── Potential Bar ────────────────────────────────────────────────────────────
const PotentialBar = ({ value, inView }: { value: number; inView: boolean }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
      <span className="uppercase tracking-wider">Potentiel</span>
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

// ─── YoungTalents ─────────────────────────────────────────────────────────────
export const YoungTalents = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="container py-10 lg:py-14">
      <SectionHeader eyebrow="Young Talent Watch" title="Étoiles Montantes" cta="Voir tous les talents" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        className="grid md:grid-cols-3 gap-4 lg:gap-5"
      >
        {youngTalents.map((talent, i) => (
          <motion.article
            key={talent.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-accent/35 transition-all duration-400 hover:-translate-y-1 hover:shadow-elegant cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-[3/2] overflow-hidden">
              <img
                src={imgMap[talent.imgKey] ?? imgMap.yt1}
                alt={talent.name}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

              {/* Age badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur border border-accent/20 px-2.5 py-1">
                <Zap className="h-3 w-3 text-accent fill-accent" />
                <span className="text-[10px] text-white/80 font-bold">{talent.age} ans</span>
              </div>

              {/* Arrow */}
              <div className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-black/55 backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
              </div>

              {/* Nationality */}
              <div className="absolute bottom-3 right-3 text-xl">{talent.nationality}</div>
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-end justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">{talent.position}</div>
                  <h3 className="font-display text-xl leading-tight truncate">{talent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ClubBadge club={talent.club} size={14} />
                    <span className="text-xs text-muted-foreground">{talent.club.name}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-2xl text-accent">{talent.rating}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">Rating</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "Buts",   val: talent.goals },
                  { label: "Passes", val: talent.assists },
                ].map(s => (
                  <div key={s.label} className="bg-surface-elevated/60 rounded-lg px-3 py-2 text-center">
                    <div className="font-display text-lg text-accent">{s.val}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>

              <PotentialBar value={talent.potential} inView={inView} />

              <p className="text-[11px] text-muted-foreground/70 mt-3 leading-relaxed line-clamp-2">{talent.story}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

// ─── ClubStories ──────────────────────────────────────────────────────────────
export const ClubStories = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="container py-10 lg:py-14">
      <SectionHeader eyebrow="Club Stories" title="Histoires du Championnat" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        className="grid md:grid-cols-3 gap-4"
      >
        {clubStories.map((story, i) => (
          <motion.article
            key={story.id}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="group flex gap-4 bg-surface/60 border border-border rounded-2xl p-5 hover:bg-surface hover:border-white/15 transition-all cursor-pointer"
          >
            <ClubBadge club={story.club} size={48} className="shrink-0 mt-1" />
            <div className="min-w-0">
              <div className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border mb-2 ${tagColors[story.tagColor]}`}>
                <TrendingUp className="h-2.5 w-2.5" />
                {story.tag}
              </div>
              <h3 className="font-display text-base leading-snug group-hover:text-accent transition-colors mb-1.5">{story.headline}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{story.body}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};