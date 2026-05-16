import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { news } from "./data";
import { SectionHeader } from "./SectionHeader";
import n1 from "@/assets/news-1.jpg";
import n2 from "@/assets/news-2.jpg";
import n3 from "@/assets/news-3.jpg";

const imgs: Record<string, string> = { "news-1": n1, "news-2": n2, "news-3": n3 };
const tagColors: Record<string, string> = {
  gold: "bg-accent text-accent-foreground",
  green: "bg-[#008751]/80 text-white",
  red: "bg-[#CE1126]/80 text-white",
  blue: "bg-blue-600/80 text-white",
};

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "TRANSFERTS", label: "Transferts" },
  { id: "RÉSULTATS", label: "Résultats" },
  { id: "TACTIQUE", label: "Tactique" },
  { id: "FECAFOOT", label: "FECAFOOT" },
  { id: "PRÉVIEW", label: "Préviews" },
  { id: "INTERVIEW", label: "Interviews" },
];

const ReadingRing = ({ readTime, size = 32 }: { readTime: string; size?: number }) => {
  const minutes = parseInt(readTime) || 3;
  const pct = Math.min((minutes / 10) * 100, 100);
  const r = size * 0.37, c = 2 * Math.PI * r, dash = (pct / 100) * c;
  const color = minutes <= 3 ? "#008751" : minutes <= 6 ? "#FCD116" : "#CE1126";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`${readTime} de lecture`}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`} initial={{ strokeDasharray: `0 ${c}` }} animate={{ strokeDasharray: `${dash} ${c}` }} transition={{ duration: 0.9, delay: 0.2 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[10px] text-white leading-none">{minutes}</span>
        <span className="text-[7px] text-white/35 uppercase">min</span>
      </div>
    </div>
  );
};

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any } } };

export const News = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all" ? news : news.filter(n => n.tag.toUpperCase() === activeFilter.toUpperCase());
  const displayNews = filtered.length > 0 ? filtered : news;
  const [featured, ...sideItems] = displayNews;

  return (
    <section ref={ref} className="container py-8 lg:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <SectionHeader eyebrow="Magazine" title="Actualités & Préviews" />
        <a href="#" className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors group">
          Voir tout <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5 -mx-1 px-1">
        {FILTERS.map(f => (
          <motion.button key={f.id} onClick={() => setActiveFilter(f.id)} whileTap={{ scale: 0.95 }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all duration-200 ${
              activeFilter === f.id
                ? "bg-accent text-accent-foreground border-accent shadow-[0_0_16px_rgba(252,209,22,0.3)]"
                : "bg-surface-elevated text-muted-foreground border-border hover:border-white/20 hover:text-foreground"
            }`}>
            {f.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeFilter} variants={containerVariants} initial="hidden" animate={inView?"visible":"hidden"} exit={{ opacity: 0 }}
          className="grid lg:grid-cols-[1.5fr_1fr] gap-4">

          {/* Featured */}
          {featured && (
            <motion.article variants={itemVariants}
              className="group relative rounded-xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-500 cursor-pointer"
              style={{ minHeight: 360 }}>
              <img src={imgs[featured.img]} alt={featured.title} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,6%)] via-[hsl(168,50%,6%)/0.6] to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full ${tagColors[featured.tagColor]}`}>{featured.tag}</span>
                  <div className="flex items-center gap-1.5">
                    <ReadingRing readTime={featured.readTime} size={32} />
                    <span className="text-[10px] text-white/35">{featured.readTime}</span>
                  </div>
                </div>
                <h2 className="font-display text-2xl lg:text-3xl uppercase leading-tight text-white group-hover:text-accent transition-colors duration-300 mb-2">{featured.title}</h2>
                <p className="text-sm text-white/55 line-clamp-2 max-w-xl mb-4">{featured.desc}</p>
                <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider">
                  <span>{featured.date}</span><span className="opacity-40">·</span>
                  <span className="flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">Lire l'article <ArrowRight className="h-3 w-3" /></span>
                </div>
              </div>
            </motion.article>
          )}

          {/* Side cards */}
          <div className="flex flex-col gap-3">
            {sideItems.slice(0, 3).map((n) => (
              <motion.article key={n.id} variants={itemVariants}
                className="group flex gap-3 bg-gradient-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card cursor-pointer">
                <div className="relative w-28 shrink-0 overflow-hidden">
                  <img src={imgs[n.img]} alt={n.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/40" />
                </div>
                <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${tagColors[n.tagColor]}`}>{n.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="font-display text-sm uppercase leading-snug group-hover:text-accent transition-colors line-clamp-2">{n.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{n.desc}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <ReadingRing readTime={n.readTime} size={24} />
                    <span className="text-[10px] text-muted-foreground/50">{n.readTime} de lecture</span>
                  </div>
                </div>
              </motion.article>
            ))}

            {filtered.length === 0 && (
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-3xl mb-3">📰</div>
                <div className="text-sm text-muted-foreground">Aucun article dans cette catégorie</div>
                <button onClick={() => setActiveFilter("all")} className="mt-3 text-xs text-accent hover:underline">Voir tout</button>
              </motion.div>
            )}

            {filtered.length > 0 && (
              <motion.a variants={itemVariants} href="#"
                className="group flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-4 text-xs text-muted-foreground hover:text-accent hover:border-accent/40 transition-all">
                Toutes les actualités <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </motion.a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};