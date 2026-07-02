import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import type { Legend } from "./data";
import { legendImgMap } from "./LegendCard";

interface Props {
  legend: Legend;
  index: number;
}

// ─── Magazine-cover style name — overlaps the portrait, per the 207 Ouest skill ─
const CoverName = ({ name, align }: { name: string; align: "left" | "right" }) => (
  <h3
    className={`absolute -bottom-4 sm:-bottom-6 ${align === "left" ? "left-4" : "right-4 text-right"} z-10 font-display uppercase leading-[0.82] text-4xl sm:text-6xl lg:text-7xl font-black pointer-events-none`}
    style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.85)", color: "transparent" }}
  >
    {name}
  </h3>
);

export const LegendFeature = ({ legend, index }: Props) => {
  const [hover, setHover] = useState(false);
  const imageFirst = index % 2 === 0; // alternate: photo-left/text-right, then text-left/photo-right
  const align = imageFirst ? "left" : "right";

  const Portrait = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative overflow-hidden border border-white/10"
      style={{ aspectRatio: "4/5" }}
    >
      <img
        src={legendImgMap[legend.imgKey]}
        alt={legend.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute top-4 left-4 font-serif italic text-[11px] text-[#FCD116]/90">
        N˚ {String(legend.number).padStart(2, "0")}
      </div>
      <CoverName name={legend.name.split(" ").pop() ?? legend.name} align={align} />

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-3 z-20 flex flex-col items-center justify-center text-center p-6 border border-[#FCD116]/25"
            style={{ background: "rgba(6,10,8,0.94)" }}
          >
            <Quote className="h-6 w-6 text-[#FCD116]/60 mb-3" strokeWidth={1.2} />
            <p className="font-serif italic text-[15px] leading-snug text-white/90 mb-4">“{legend.quote}”</p>
            <div className="h-px w-10 bg-[#FCD116]/50 mb-3" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FCD116]/80">{legend.quoteBy}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const TextBlock = (
    <div className={`flex flex-col justify-center h-full ${imageFirst ? "" : "sm:items-end sm:text-right"}`}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#FCD116] font-semibold mb-3">{legend.era}</p>
      <p className="font-serif italic text-sm text-white/45 mb-4">{legend.position} · {legend.club}</p>
      <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-sm mb-6">{legend.achievement}</p>
      <div className={`flex gap-6 ${imageFirst ? "" : "sm:flex-row-reverse"}`}>
        <div>
          <div className="font-display text-2xl text-white">{legend.caps}</div>
          <div className="text-[9px] text-white/40 uppercase tracking-widest">Sélections</div>
        </div>
        {legend.goals > 0 && (
          <div>
            <div className="font-display text-2xl text-white">{legend.goals}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-widest">Buts</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid sm:grid-cols-12 gap-8 sm:gap-10 items-stretch pb-16 sm:pb-20 mb-4 border-b border-white/[0.06] last:border-0"
    >
      {imageFirst ? (
        <>
          <div className="sm:col-span-7">{Portrait}</div>
          <div className="sm:col-span-5">{TextBlock}</div>
        </>
      ) : (
        <>
          <div className="sm:col-span-5 order-2 sm:order-1">{TextBlock}</div>
          <div className="sm:col-span-7 order-1 sm:order-2">{Portrait}</div>
        </>
      )}
    </motion.div>
  );
};
