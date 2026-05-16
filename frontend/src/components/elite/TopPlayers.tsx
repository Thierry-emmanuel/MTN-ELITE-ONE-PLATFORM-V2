import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Goal, HandHeart, ArrowRight, ChevronLeft, ChevronRight, Star, TrendingUp } from "lucide-react";
import { scorers, assistLeaders } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import { Link } from "react-router-dom";

import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";

const imgMap: Record<string, string> = { p1, p2, p3 };

type StatType = "scorers" | "assists";

const RANK_COLORS = [
  "from-accent/20 border-accent/40",
  "from-primary/15 border-primary/30",
  "from-white/5 border-white/10",
];

// ─── Sparkline data per player (5 recent matches, goals/impact 0–4) ───────────
const SPARKLINES: Record<string, number[]> = {
  default: [1, 2, 1, 3, 2],
  p1: [2, 1, 3, 2, 4],   // Nathan Douala — hot streak
  p2: [1, 0, 2, 1, 3],   // David Ngondo — building form
  p3: [0, 2, 1, 2, 1],   // Edouard Sombang — consistent
};

// ─── Pure SVG Sparkline ───────────────────────────────────────────────────────
const Sparkline = ({
  data,
  width = 80,
  height = 28,
  color = "#FCD116",
  animated = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  animated?: boolean;
}) => {
  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;
  const pad = 3;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return { x, y, v };
  });

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Area fill path
  const areaD =
    pathD +
    ` L${pts[pts.length - 1].x.toFixed(1)},${height - pad} L${pts[0].x.toFixed(1)},${height - pad} Z`;

  const lastPt = pts[pts.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaD} fill={`url(#sg-${color.replace("#", "")})`} />

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />

      {/* Data point dots */}
      {pts.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={i === pts.length - 1 ? 3 : 1.5}
          fill={i === pts.length - 1 ? color : `${color}80`}
          className="drop-shadow"
        />
      ))}

      {/* Last point value label */}
      {lastPt.v > 0 && (
        <text
          x={lastPt.x + 5}
          y={lastPt.y + 1}
          fontSize="7"
          fill={color}
          fontWeight="bold"
          fontFamily="monospace"
          dominantBaseline="middle"
        >
          {lastPt.v}
        </text>
      )}
    </svg>
  );
};

// ─── Match dots (W/D/L form) ──────────────────────────────────────────────────
const FormDots = ({ form }: { form?: string[] }) => {
  if (!form) return null;
  const colors: Record<string, string> = { W: "bg-[#1F8A4C]", D: "bg-[#FCD116]", L: "bg-[#CE1126]" };
  return (
    <div className="flex gap-0.5">
      {form.slice(-5).map((r, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${colors[r] ?? "bg-border"}`} title={r} />
      ))}
    </div>
  );
};

// ─── Player Card ──────────────────────────────────────────────────────────────
const PlayerCard = ({
  player,
  idx,
  type,
  inView,
}: {
  player: any;
  idx: number;
  type: StatType;
  inView: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const isFirst = idx === 0;
  const sparkData = SPARKLINES[player.imgKey ?? "default"] ?? SPARKLINES.default;
  const sparkColor = isFirst ? "#FCD116" : idx === 1 ? "#008751" : "rgba(255,255,255,0.45)";

  // Trend: last match vs average
  const avg = sparkData.slice(0, -1).reduce((s, v) => s + v, 0) / (sparkData.length - 1);
  const last = sparkData[sparkData.length - 1];
  const trending = last > avg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`snap-start shrink-0 w-[148px] sm:w-[160px] group relative rounded-xl border bg-gradient-to-b overflow-hidden cursor-pointer transition-all duration-300 ${
        RANK_COLORS[Math.min(idx, 2)]
      } ${isFirst ? "hover:shadow-[0_12px_40px_rgba(252,209,22,0.3)]" : "hover:shadow-elegant"}`}
    >
      {/* Rank badge */}
      <div
        className={`absolute top-2 right-2 z-10 h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold ${
          isFirst ? "bg-accent text-accent-foreground" : "bg-surface-elevated/80 backdrop-blur text-muted-foreground"
        }`}
      >
        {isFirst ? <Star className="h-2.5 w-2.5 fill-current" /> : idx + 1}
      </div>

      {/* Trending indicator */}
      <div className={`absolute top-2 left-2 z-10 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold backdrop-blur border ${
          trending
            ? "bg-[#1F8A4C]/20 border-[#1F8A4C]/40 text-[#1F8A4C]"
            : "bg-[#CE1126]/20 border-[#CE1126]/40 text-[#CE1126]"
        }`}>
          <TrendingUp className={`h-2.5 w-2.5 ${!trending ? "rotate-180" : ""}`} />
          {trending ? "↑" : "↓"}
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imgMap[player.imgKey] ?? imgMap.p2}
          alt={player.name}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,6%)] via-[hsl(168,50%,6%)/0.2] to-transparent" />

        {/* Stat badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full backdrop-blur border text-[10px] font-bold ${
              isFirst
                ? "bg-accent/20 border-accent/50 text-accent"
                : "bg-black/50 border-white/10 text-white"
            }`}
          >
            {type === "scorers" ? <Goal className="h-2.5 w-2.5" /> : <HandHeart className="h-2.5 w-2.5" />}
            {player.val} {type === "scorers" ? "buts" : "passes"}
          </div>
        </div>
      </div>

      {/* Info + Sparkline */}
      <div className="p-2.5 pt-2 space-y-2">
        <div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5 truncate">
            {type === "scorers" ? "Buteur" : "Passeur"}
          </div>
          <div className="font-display text-sm leading-tight truncate">{player.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <ClubBadge club={player.club} size={12} />
            <span className="text-[10px] text-muted-foreground truncate">{player.club.short}</span>
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="pt-1.5 border-t border-white/6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] uppercase tracking-widest text-muted-foreground/40">5 matchs</span>
            <span className={`text-[8px] font-bold ${trending ? "text-[#1F8A4C]" : "text-[#CE1126]"}`}>
              {trending ? "En forme ↑" : "En baisse ↓"}
            </span>
          </div>
          <AnimatePresence>
            {inView && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.08 + 0.4 }}
              >
                <Sparkline
                  data={sparkData}
                  width={120}
                  height={28}
                  color={sparkColor}
                  animated
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form dots */}
          <div className="mt-1.5">
            <FormDots form={["W", "W", "D", "W", "L"].slice(0, sparkData.length)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main TopPlayers ──────────────────────────────────────────────────────────
export const TopPlayers = () => {
  const ref = useRef(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [tab, setTab] = useState<StatType>("scorers");

  const data = tab === "scorers" ? scorers : assistLeaders;

  const scroll = (dir: "left" | "right") =>
    carouselRef.current?.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });

  return (
    <div ref={ref}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <SectionHeader eyebrow="Statistiques" title="Meilleurs Joueurs" size="compact" />
        <div className="flex items-center gap-2 shrink-0">
          {/* Tabs */}
          <div className="flex gap-0.5 bg-surface-elevated rounded-lg p-0.5">
            {([
              { id: "scorers" as const, label: "Buteurs",  icon: <Goal className="h-3 w-3" /> },
              { id: "assists" as const, label: "Passeurs", icon: <HandHeart className="h-3 w-3" /> },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                  tab === t.id
                    ? "bg-accent text-accent-foreground shadow-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => scroll("left")}
              className="h-7 w-7 grid place-items-center rounded-full bg-surface-elevated border border-border hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="h-7 w-7 grid place-items-center rounded-full bg-surface-elevated border border-border hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            ref={carouselRef}
            className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
          >
            {data.map((p, i) => (
              <PlayerCard key={p.name} player={p} idx={i} type={tab} inView={inView} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sparkline legend */}
      <div className="mt-2 flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <span className="h-[2px] w-6 rounded bg-accent/60 inline-block" />
          N°1 — Or
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <span className="h-[2px] w-6 rounded bg-primary/60 inline-block" />
          N°2 — Vert
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          Sparkline = performance / match
        </div>
      </div>

      {/* CTA */}
      <div className="mt-3">
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group"
        >
          Voir tous les joueurs
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};