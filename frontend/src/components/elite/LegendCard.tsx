import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import type { Legend } from "./data";

import abega from "@/assets/images/halloffame/TheophileAbega.png";
import nkono from "@/assets/images/halloffame/Thomas_Nkono.png";
import manga from "@/assets/images/halloffame/JeanMangaOnguene.png";
import idrissou from "@/assets/images/halloffame/MohammedIdrissou.png";
import toube from "@/assets/images/halloffame/Toube Charles.png";

export const legendImgMap: Record<string, string> = { abega, nkono, manga, idrissou, toube };

interface Props {
  legend: Legend;
  index: number;
}

// ─── Vitrine corner bracket — museum display-case motif ───────────────────────
const Bracket = ({ className }: { className: string }) => (
  <svg viewBox="0 0 20 20" className={`absolute h-4 w-4 text-[#FCD116]/70 ${className}`} fill="none">
    <path d="M1 1H19M1 1V19" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const LegendCard = ({ legend, index }: Props) => {
  const [hover, setHover] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative select-none"
    >
      {/* Spotlight glow — FIFA Museum vitrine lighting */}
      <div
        className="absolute -inset-6 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 20%, rgba(252,209,22,0.16), transparent 65%)" }}
      />

      <div className="relative overflow-hidden border border-white/10 group-hover:border-[#FCD116]/40 bg-[#0b0f0d] transition-colors duration-500" style={{ aspectRatio: "3/4" }}>
        <img
          src={legendImgMap[legend.imgKey]}
          alt={legend.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-[900ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

        {/* Vitrine brackets */}
        <Bracket className="top-3 left-3" />
        <Bracket className="top-3 right-3 rotate-90" />
        <Bracket className="bottom-3 left-3 -rotate-90" />
        <Bracket className="bottom-3 right-3 rotate-180" />

        {/* Exhibit number tag */}
        <div className="absolute top-4 left-4 z-10 font-serif italic text-[11px] text-[#FCD116]/90 tracking-wide">
          N˚ {String(legend.number).padStart(2, "0")}
        </div>
        <div className="absolute top-4 right-4 z-10 text-[9px] uppercase tracking-[0.2em] text-white/50 font-medium">
          {legend.era}
        </div>

        {/* Quote plaque — reveals on hover */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-3 z-10 flex flex-col items-center justify-center text-center p-5 border border-[#FCD116]/25"
              style={{ background: "rgba(6,10,8,0.92)" }}
            >
              <Quote className="h-6 w-6 text-[#FCD116]/60 mb-3" strokeWidth={1.2} />
              <p className="font-serif italic text-[15px] leading-snug text-white/90 mb-4">
                “{legend.quote}”
              </p>
              <div className="h-px w-10 bg-[#FCD116]/50 mb-3" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#FCD116]/80">{legend.quoteBy}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Base caption bar */}
        <motion.div
          animate={{ opacity: hover ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 bottom-0 p-4 z-[5]"
        >
          <p className="font-serif italic text-[11px] text-white/45 mb-1">{legend.position} · {legend.club}</p>
          <h3 className="font-display text-xl uppercase leading-[0.95] text-white mb-2 tracking-tight">
            {legend.name}
          </h3>
          <div className="h-px w-full bg-white/10 mb-2" />
          <p className="text-[11px] text-white/55">{legend.achievement}</p>
        </motion.div>
      </div>

      {/* Stat strip beneath the vitrine — 207 Ouest style minimal metadata row */}
      <div className="flex items-center justify-between mt-3 px-0.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          {legend.caps} sélections{legend.goals > 0 ? ` · ${legend.goals} buts` : ""}
        </span>
        <span className="h-1 w-1 rounded-full bg-[#FCD116]/60" />
      </div>
    </motion.article>
  );
};
