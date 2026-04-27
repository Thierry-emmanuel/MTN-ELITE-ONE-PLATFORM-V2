import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, ArrowUpRight, Quote } from "lucide-react";
import { legends } from "./data";
import { SectionHeader } from "./SectionHeader";

import l1 from "@/assets/images/halloffame/JeanMangaOnguene.png";
import l2 from "@/assets/images/players/EdouardSombang.png";
import l3 from "@/assets/images/halloffame/Thomas_Nkono.png";

const imgMap: Record<string, string> = { l1, l2, l3 };

// ─── Era tabs + legend era mapping ───────────────────────────────────────────
type Era = "Tous" | "60s-70s" | "80s" | "90s" | "2000s" | "2010s+";

const ERAS: Era[] = ["Tous", "60s-70s", "80s", "90s", "2000s", "2010s+"];

// Map legend IDs to eras
const LEGEND_ERAS: Record<string, Era[]> = {
  milla:  ["80s", "90s"],
  etoo:   ["2000s", "2010s+"],
  nkono:  ["80s", "90s"],
};

// Famous quotes per legend
const LEGEND_QUOTES: Record<string, string> = {
  milla:  "\"On ne m'arrête pas avec de l'argent. On m'arrête seulement avec un terrain de football.\"",
  etoo:   "\"Je suis le meilleur joueur africain de l'histoire.\"",
  nkono:  "\"Le but du gardien, c'est de ne laisser entrer personne.\"",
};

const matchesEra = (legendId: string, era: Era): boolean => {
  if (era === "Tous") return true;
  return (LEGEND_ERAS[legendId] ?? []).includes(era);
};

// ─── Variants ─────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Legend Card ──────────────────────────────────────────────────────────────
const LegendCard = ({ legend }: { legend: typeof legends[0] }) => {
  const [hovered, setHovered] = useState(false);
  const quote = LEGEND_QUOTES[legend.id];

  return (
    <motion.article
      variants={cardVariants}
      layout
      className="group relative rounded-xl overflow-hidden border border-accent/15 hover:border-accent/50 transition-all duration-500 cursor-pointer"
      style={{ aspectRatio: "3/4" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Player image */}
      <img
        src={imgMap[legend.imgKey]}
        alt={legend.name}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
          hovered ? "grayscale-0 scale-105" : "grayscale scale-100"
        }`}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-[hsl(168,50%,5%)/0.5] to-transparent" />
      <div
        className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/10 transition-opacity duration-500 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Quote overlay (on hover) ── */}
      <AnimatePresence>
        {hovered && quote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[hsl(168,50%,5%)/0.82] backdrop-blur-sm z-10"
          >
            <Quote className="h-8 w-8 text-accent/60 mb-4" />
            <p className="font-display text-lg md:text-xl text-white text-center leading-snug uppercase">
              {quote}
            </p>
            <div className="mt-6 h-px w-12 bg-accent/60" />
            <p className="mt-3 text-[11px] uppercase tracking-widest text-accent/70">{legend.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top row */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur border border-accent/20 px-2.5 py-1">
          <span className="text-[10px] text-accent/70 uppercase tracking-widest font-medium">
            N° {String(legend.number).padStart(2, "0")}
          </span>
        </div>
        <div
          className={`h-7 w-7 grid place-items-center rounded-full bg-black/50 backdrop-blur border border-accent/20 transition-all duration-300 ${
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-20">
        {/* Stats strip (revealed on hover) */}
        <div
          className={`flex gap-4 mb-3 transition-all duration-400 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
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
          <div
            className={`h-full bg-gradient-to-r from-accent via-accent/60 to-transparent origin-left transition-transform duration-500 ${
              hovered ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </div>
        <div className="h-px bg-white/10 -mt-px" />
      </div>

      {/* Corner star */}
      <Star
        className={`absolute top-3 right-12 h-3.5 w-3.5 text-accent fill-accent transition-opacity duration-300 z-20 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </motion.article>
  );
};

// ─── Main HallOfFame ──────────────────────────────────────────────────────────
export const HallOfFame = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeEra, setActiveEra] = useState<Era>("Tous");

  const filtered = legends.filter(l => matchesEra(l.id, activeEra));

  return (
    <section ref={ref} className="container py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <SectionHeader eyebrow="Hall of Fame" title="Légendes du Football" cta="Voir toutes les légendes" />

        {/* Era filter tabs */}
        <div className="flex items-center gap-1 bg-surface-elevated rounded-xl p-1 shrink-0 overflow-x-auto scrollbar-hide">
          {ERAS.map(era => (
            <button
              key={era}
              onClick={() => setActiveEra(era)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                activeEra === era
                  ? "bg-accent text-accent-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEra}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          exit={{ opacity: 0 }}
          className="grid md:grid-cols-3 gap-3 lg:gap-4"
        >
          {filtered.length > 0 ? (
            filtered.map(legend => <LegendCard key={legend.id} legend={legend} />)
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-3 py-16 text-center text-muted-foreground"
            >
              <Star className="h-8 w-8 mx-auto mb-3 text-accent/30" />
              <p className="text-sm">Aucune légende pour cette période.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};