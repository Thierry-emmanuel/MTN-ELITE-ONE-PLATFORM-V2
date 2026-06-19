import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, ArrowUpRight, Quote, Trophy } from "lucide-react";
import { legends } from "./data";
import { SectionHeader } from "./SectionHeader";

import l1 from "@/assets/images/halloffame/JeanMangaOnguene.png";
import l2 from "@/assets/images/players/EdouardSombang.png";
import l3 from "@/assets/images/halloffame/Thomas_Nkono.png";

const imgMap: Record<string, string> = { l1, l2, l3 };

// ─── Era filter config ────────────────────────────────────────────────────────
const ERAS = [
  { id: "all",   label: "Tous" },
  { id: "60-70", label: "60s–70s" },
  { id: "80",    label: "80s" },
  { id: "90",    label: "90s" },
  { id: "2000",  label: "2000s" },
  { id: "2010",  label: "2010s+" },
];

const eraToFilter = (era: string): string => {
  if (era.includes("196") || era.includes("197")) return "60-70";
  if (era.includes("198")) return "80";
  if (era.includes("199")) return "90";
  if (era.includes("200")) return "2000";
  if (era.includes("201") || era.includes("202")) return "2010";
  return "all";
};

// ─── Famous quotes per legend imgKey ─────────────────────────────────────────
const QUOTES: Record<string, { text: string; attribution: string }> = {
  default: {
    text: "Le football camerounais m'a tout donné. Je lui ai tout rendu.",
    attribution: "— Légende du football camerounais",
  },
  l1: {
    text: "Quand je portais ce maillot, je ne jouais pas pour moi. Je jouais pour tout un peuple.",
    attribution: "— Jean Manga Onguene",
  },
  l2: {
    text: "La discipline et le sacrifice sont les deux piliers du champion.",
    attribution: "— Légende nationale",
  },
  l3: {
    text: "Entre les poteaux, j'étais seul contre tous. Mais je n'avais jamais peur.",
    attribution: "— Thomas Nkono, Gardien légendaire",
  },
};

// ─── Legend Card ──────────────────────────────────────────────────────────────
const LegendCard = ({ legend }: { legend: typeof legends[0] }) => {
  const [quoteVisible, setQuoteVisible] = useState(false);
  const quote = QUOTES[legend.imgKey] ?? QUOTES.default;

  return (
    <motion.article
      variants={{
        hidden:  { opacity: 0, y: 24, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      className="group relative rounded-xl overflow-hidden border border-accent/15 hover:border-accent/50 transition-all duration-500 cursor-pointer select-none"
      style={{ aspectRatio: "3/4" }}
      onMouseEnter={() => setQuoteVisible(true)}
      onMouseLeave={() => setQuoteVisible(false)}
    >
      <img
        src={imgMap[legend.imgKey]}
        alt={legend.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-[hsl(168,50%,5%)/0.5] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* ── Quote overlay ── */}
      <AnimatePresence>
        {quoteVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 text-center"
            style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.62) 0%,rgba(0,0,0,0.88) 100%)", backdropFilter: "blur(6px)" }}
          >
            {/* Large decorative quote mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="absolute top-6 left-6 pointer-events-none"
            >
              <Quote className="h-14 w-14 text-accent" strokeWidth={1} />
            </motion.div>

            <motion.blockquote
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <p className="font-display text-xl lg:text-2xl uppercase leading-tight text-white mb-5 tracking-wide">
                {quote.text}
              </p>
              <footer className="text-[11px] text-accent/80 uppercase tracking-widest font-semibold">
                {quote.attribution}
              </footer>
            </motion.blockquote>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="absolute bottom-6 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
            />
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
        <div className="h-7 w-7 grid place-items-center rounded-full bg-black/50 backdrop-blur border border-accent/20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
        </div>
      </div>

      {/* Bottom info (fades out when quote shows) */}
      <motion.div
        animate={{ opacity: quoteVisible ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-x-0 bottom-0 p-5 z-20 pointer-events-none"
      >
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
        <div className="mt-3 h-px w-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent via-accent/60 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>
        <div className="h-px bg-white/10 -mt-px" />
      </motion.div>

      <Star className="absolute top-3 right-12 h-3.5 w-3.5 text-accent fill-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
    </motion.article>
  );
};

// ─── Hall of Fame ─────────────────────────────────────────────────────────────
export const HallOfFame = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeEra, setActiveEra] = useState("all");

  const filtered = activeEra === "all"
    ? legends
    : legends.filter(l => eraToFilter(l.era) === activeEra);

  return (
    <section ref={ref} className="container py-8 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <SectionHeader eyebrow="Hall of Fame" title="Légendes du Football" cta="Voir toutes les légendes" />
      </div>

      {/* Era filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6 -mx-1 px-1">
        {ERAS.map(era => (
          <motion.button
            key={era.id}
            onClick={() => setActiveEra(era.id)}
            whileTap={{ scale: 0.95 }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 ${
              activeEra === era.id
                ? "bg-accent text-accent-foreground border-accent shadow-[0_0_16px_rgba(252,209,22,0.3)]"
                : "bg-surface-elevated text-muted-foreground border-border hover:border-accent/30 hover:text-foreground"
            }`}
          >
            {era.label}
          </motion.button>
        ))}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEra}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {filtered.length > 0 ? (
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid md:grid-cols-3 gap-3 lg:gap-4"
            >
              {filtered.map(legend => (
                <LegendCard key={legend.id} legend={legend} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-4 opacity-30">
                <Trophy className="h-10 w-10 text-accent mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground">Aucune légende pour cette ère pour le moment</p>
              <button onClick={() => setActiveEra("all")} className="mt-3 text-xs text-accent hover:underline">
                Voir toutes les légendes
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-[10px] text-muted-foreground/30 text-center mt-5 uppercase tracking-widest">
        Survolez un joueur pour découvrir sa citation légendaire
      </p>
    </section>
  );
};