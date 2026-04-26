import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";
import { legends } from "./data";
import { SectionHeader } from "./SectionHeader";

import l1 from "@/assets/images/halloffame/JeanMangaOnguene.png";
import l2 from "@/assets/images/players/EdouardSombang.png";
import l3 from "@/assets/images/halloffame/Thomas_Nkono.png";

const imgMap: Record<string, string> = { l1, l2, l3 };

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const HallOfFame = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="container py-8 lg:py-12">
      <SectionHeader eyebrow="Hall of Fame" title="Légendes du Football" cta="Voir toutes les légendes" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid md:grid-cols-3 gap-3 lg:gap-4"
      >
        {legends.map((legend) => (
          <motion.article
            key={legend.id}
            variants={cardVariants}
            className="group relative rounded-xl overflow-hidden border border-accent/15 hover:border-accent/50 transition-all duration-500 cursor-pointer"
            style={{ aspectRatio: "3/4" }}
          >
            {/* Player image */}
            <img
              src={imgMap[legend.imgKey]}
              alt={legend.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-[hsl(168,50%,5%)/0.5] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top row */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur border border-accent/20 px-2.5 py-1">
                <span className="text-[10px] text-accent/70 uppercase tracking-widest font-medium">
                  N° {String(legend.number).padStart(2, "0")}
                </span>
              </div>
              <div className="h-7 w-7 grid place-items-center rounded-full bg-black/50 backdrop-blur border border-accent/20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-5">
              {/* Stats strip (revealed on hover) */}
              <div className="flex gap-4 mb-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <div className="text-center">
                  <div className="font-display text-lg text-white">{legend.caps}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest">Sélections</div>
                </div>
                {legend.goals > 0 && (
                  <div className="text-center">
                    <div className="font-display text-lg text-white">{legend.goals}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest">Buts</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="font-display text-xs text-white/60">{legend.position}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest">Poste</div>
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-widest text-accent/70 mb-1">{legend.era}</div>
              <h3 className="font-display text-2xl uppercase leading-[0.95] text-white mb-1.5">{legend.name}</h3>
              <p className="text-xs text-white/50">{legend.achievement}</p>

              {/* Gold divider */}
              <div className="mt-3 h-px w-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent via-accent/60 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </div>
              <div className="h-px bg-white/10 -mt-px" />
            </div>

            {/* Corner star */}
            <Star className="absolute top-3 right-12 h-3.5 w-3.5 text-accent fill-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};