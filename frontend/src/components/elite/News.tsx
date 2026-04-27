import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { news, type NewsItem } from "./data";
import { SectionHeader } from "./SectionHeader";
import n1 from "@/assets/news-1.jpg";
import n2 from "@/assets/news-2.jpg";
import n3 from "@/assets/news-3.jpg";

const imgs: Record<string, string> = { "news-1": n1, "news-2": n2, "news-3": n3 };

const tagColors: Record<string, string> = {
  gold:  "bg-accent text-accent-foreground",
  green: "bg-[#008751]/80 text-white",
  red:   "bg-[#CE1126]/80 text-white",
  blue:  "bg-blue-600/80 text-white",
};

// ─── Filter pill categories ────────────────────────────────────────────────────
type FilterCat = "Tout" | "Transferts" | "Résultats" | "FECAFOOT" | "Interviews" | "Tactique" | "Préview";

const FILTERS: FilterCat[] = ["Tout", "Préview", "Tactique", "Transferts", "Résultats", "FECAFOOT", "Interviews"];

const matchesFilter = (item: NewsItem, cat: FilterCat): boolean => {
  if (cat === "Tout") return true;
  return item.tag.toLowerCase().includes(cat.toLowerCase());
};

// ─── Reading Progress Ring ────────────────────────────────────────────────────
const ReadingRing = ({
  readTime, size = 36,
}: { readTime: string; size?: number }) => {
  const minutes = parseInt(readTime.replace(/\D/g, "")) || 3;
  // Map 1–10 min to 25–100%
  const pct = Math.min((minutes / 10) * 100, 100);
  const r = (size / 2) - 3;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`${minutes} min de lecture`}
    >
      <svg
        className="-rotate-90 absolute inset-0"
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="hsl(49,97%,53%)" strokeWidth="2"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="relative text-[9px] font-bold text-accent tabular-nums">{minutes}m</span>
    </div>
  );
};

// ─── Animation variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Featured card ────────────────────────────────────────────────────────────
const FeaturedCard = ({ item }: { item: NewsItem }) => (
  <motion.article
    variants={itemVariants}
    layout
    className="group relative rounded-xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-500 cursor-pointer"
    style={{ minHeight: 360 }}
  >
    <img
      src={imgs[item.img] ?? n1}
      alt={item.title}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,6%)] via-[hsl(168,50%,6%)/0.6] to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full ${tagColors[item.tagColor]}`}>
          {item.tag}
        </span>
        <ReadingRing readTime={item.readTime} size={34} />
        <span className="text-[10px] text-white/40">{item.date}</span>
      </div>
      <h2 className="font-display text-2xl lg:text-3xl uppercase leading-tight text-white group-hover:text-accent transition-colors duration-300 mb-2">
        {item.title}
      </h2>
      <p className="text-sm text-white/55 line-clamp-2 max-w-xl mb-4">{item.desc}</p>
      <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider">
        <span className="flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          Lire l'article <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  </motion.article>
);

// ─── Side card ────────────────────────────────────────────────────────────────
const SideCard = ({ item }: { item: NewsItem }) => (
  <motion.article
    variants={itemVariants}
    layout
    className="group flex gap-3 bg-gradient-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card cursor-pointer"
  >
    <div className="relative w-28 shrink-0 overflow-hidden">
      <img
        src={imgs[item.img] ?? n1}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/40" />
    </div>
    <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${tagColors[item.tagColor]}`}>
          {item.tag}
        </span>
        <span className="text-[10px] text-muted-foreground">{item.date}</span>
      </div>
      <h3 className="font-display text-sm uppercase leading-snug group-hover:text-accent transition-colors line-clamp-2">
        {item.title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.desc}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <ReadingRing readTime={item.readTime} size={28} />
        <span className="text-[10px] text-muted-foreground/50">lecture</span>
      </div>
    </div>
  </motion.article>
);

// ─── Main News ────────────────────────────────────────────────────────────────
export const News = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeFilter, setActiveFilter] = useState<FilterCat>("Tout");

  const filtered = news.filter(n => matchesFilter(n, activeFilter));
  const [featured, ...rest] = filtered.length > 0 ? filtered : news;

  return (
    <section ref={ref} className="container py-8 lg:py-10">
      <SectionHeader eyebrow="Magazine" title="Actualités & Préviews" cta="Voir tout" />

      {/* ── Filter pills ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {FILTERS.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all duration-200 ${
              activeFilter === cat
                ? "bg-accent text-accent-foreground border-accent shadow-gold"
                : "bg-transparent border-border text-muted-foreground hover:border-white/20 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          exit={{ opacity: 0 }}
          className="grid lg:grid-cols-[1.5fr_1fr] gap-4"
        >
          {/* Featured */}
          {featured && <FeaturedCard item={featured} />}

          {/* Side cards */}
          <div className="flex flex-col gap-3">
            {rest.slice(0, 2).map(n => (
              <SideCard key={n.id} item={n} />
            ))}

            {/* CTA */}
            <motion.a
              variants={itemVariants}
              href="#"
              className="group flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-4 text-xs text-muted-foreground hover:text-accent hover:border-accent/40 transition-all"
            >
              Toutes les actualités
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};