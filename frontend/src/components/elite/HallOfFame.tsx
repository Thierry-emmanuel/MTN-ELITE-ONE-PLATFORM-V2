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
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const HallOfFame = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="container py-10 lg:py-16">
      <SectionHeader eyebrow="Hall of Fame" title="Légendes du Football" cta="Voir toutes les légendes" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid md:grid-cols-3 gap-4 lg:gap-6"
      >
        {legends.map((legend) => (
          <motion.article
            key={legend.id}
            variants={cardVariants}
            className="group relative rounded-2xl overflow-hidden border border-accent/15 hover:border-accent/50 transition-all duration-500 cursor-pointer"
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
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur border border-accent/20 px-3 py-1">
                <span className="text-[10px] text-accent/70 uppercase tracking-widest font-medium">N° {String(legend.number).padStart(2, "0")}</span>
              </div>
              <div className="h-8 w-8 grid place-items-center rounded-full bg-black/50 backdrop-blur border border-accent/20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight className="h-4 w-4 text-accent" />
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              {/* Stats strip (revealed on hover) */}
              <motion.div
                className="flex items-center gap-4 mb-4 overflow-hidden"
                initial={false}
              >
                <div className="flex gap-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                  <div className="text-center">
                    <div className="font-display text-xl text-white">{legend.caps}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest">Sélections</div>
                  </div>
                  {legend.goals > 0 && (
                    <div className="text-center">
                      <div className="font-display text-xl text-white">{legend.goals}</div>
                      <div className="text-[9px] text-white/40 uppercase tracking-widest">Buts</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-display text-xs text-white/60">{legend.position}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest">Poste</div>
                  </div>
                </div>
              </motion.div>

              <div className="text-[10px] uppercase tracking-widest text-accent/70 mb-1.5">{legend.era}</div>
              <h3 className="font-display text-3xl uppercase leading-[0.95] text-white mb-2">{legend.name}</h3>
              <p className="text-sm text-white/50">{legend.achievement}</p>

              {/* Gold divider */}
              <div className="mt-4 h-px w-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent via-accent/60 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </div>
              <div className="h-px bg-white/10 -mt-px" />
            </div>

            {/* Corner star */}
            <Star className="absolute top-4 right-14 h-4 w-4 text-accent fill-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};