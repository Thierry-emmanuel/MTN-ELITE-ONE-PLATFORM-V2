import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle } from "lucide-react";
import { standings, type FormResult } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

// ─── Position change data (simulate prev-week positions) ─────────────────────
// Positive = moved up, negative = moved down, 0 = no change
const POSITION_CHANGES: Record<string, number> = {
  cot:  0,   // stayed 1st
  cnk:  1,   // up from 3rd
  uds:  -1,  // down from 2nd
  pwd:  2,   // up from 6th
  vict: 0,   // stayed 5th
  apb:  -2,  // down from 4th
  cof:  1,   // up from 8th
  ymb:  -1,  // down from 7th
};

// ─── Zone config ──────────────────────────────────────────────────────────────
// pos 1 = Champion zone, 2-3 = CAF zone, 7-8 = relegation
const getZone = (pos: number) => {
  if (pos === 1) return "champion";
  if (pos <= 3)  return "caf";
  if (pos >= 7)  return "relegation";
  return "none";
};

const ZONE_COLORS = {
  champion:   "border-l-accent",
  caf:        "border-l-primary",
  relegation: "border-l-destructive",
  none:       "border-l-transparent",
};

// ─── Form badge ───────────────────────────────────────────────────────────────
const FormBadge = ({ r }: { r: FormResult }) => (
  <div
    className={`h-5 w-5 rounded-full grid place-items-center text-[9px] font-bold ${
      r === "W"
        ? "bg-win/20 text-win"
        : r === "D"
        ? "bg-draw/20 text-draw"
        : "bg-loss/20 text-[hsl(var(--destructive))]"
    }`}
  >
    {r}
  </div>
);

// ─── Position change indicator ────────────────────────────────────────────────
const PositionChange = ({ delta }: { delta: number }) => {
  if (delta === 0) return (
    <Minus className="h-3 w-3 text-muted-foreground/30" />
  );
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-win">
      <TrendingUp className="h-3 w-3" />
      {delta}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-[hsl(var(--destructive))]">
      <TrendingDown className="h-3 w-3" />
      {Math.abs(delta)}
    </span>
  );
};

// ─── Skeleton rows ────────────────────────────────────────────────────────────
const SkeletonRow = ({ i }: { i: number }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 border-b border-border/40 animate-pulse"
    style={{ animationDelay: `${i * 0.06}s` }}
  >
    <div className="h-4 w-4 rounded bg-white/6" />
    <div className="h-7 w-7 rounded-full bg-white/6" />
    <div className="h-4 w-28 rounded bg-white/6 flex-1" />
    <div className="flex gap-3">
      {[1,2,3,4].map(j => <div key={j} className="h-4 w-6 rounded bg-white/6" />)}
    </div>
    <div className="hidden md:flex gap-1">
      {[1,2,3,4,5].map(j => <div key={j} className="h-5 w-5 rounded-full bg-white/6" />)}
    </div>
    <div className="h-4 w-8 rounded bg-white/8" />
  </div>
);

// ─── Zone legend ──────────────────────────────────────────────────────────────
const ZoneLegend = () => (
  <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-muted-foreground">
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
      Champion
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
      Zone CAF
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm bg-destructive" />
      Zone relégation
    </span>
  </div>
);

// ─── Main Standings ───────────────────────────────────────────────────────────
export const Standings = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [loading] = useState(false); // flip to true to preview skeleton
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section ref={ref} className="container py-8 lg:py-10">
      <SectionHeader eyebrow="J19 · Journée en cours" title="Classement" cta="Classement complet" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-border overflow-hidden bg-gradient-card"
      >
        {/* ── Table header ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60 bg-surface/40">
          <div className="w-6 text-[10px] text-muted-foreground uppercase tracking-wider">#</div>
          <div className="w-5" /> {/* change indicator */}
          <div className="flex-1 text-[10px] text-muted-foreground uppercase tracking-wider">Club</div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wider">
            <span className="w-6 text-center">J</span>
            <span className="w-6 text-center">G</span>
            <span className="w-6 text-center">N</span>
            <span className="w-6 text-center">P</span>
          </div>
          <div className="hidden md:flex gap-1 items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-[116px] text-center">Forme</span>
          </div>
          <div className="w-10 text-right text-[10px] text-muted-foreground uppercase tracking-wider">Pts</div>
        </div>

        {/* ── Rows ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {standings.map((row, idx) => {
                const zone   = getZone(row.pos);
                const delta  = POSITION_CHANGES[row.club.id] ?? 0;
                const isHov  = hovered === idx;

                return (
                  <motion.div
                    key={row.club.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                    className={`relative flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 cursor-pointer transition-all duration-200 border-l-2 ${
                      ZONE_COLORS[zone]
                    } ${isHov ? "bg-white/4" : "bg-transparent"}`}
                  >
                    {/* Position */}
                    <div
                      className={`w-6 shrink-0 font-display text-sm tabular-nums text-center ${
                        zone === "champion" ? "text-accent" : zone === "caf" ? "text-primary-glow" : "text-muted-foreground"
                      }`}
                    >
                      {row.pos === 1 && (
                        <Trophy className="h-3.5 w-3.5 text-accent mx-auto" />
                      )}
                      {row.pos !== 1 && row.pos}
                    </div>

                    {/* Position change indicator */}
                    <div className="w-5 shrink-0 flex items-center justify-center">
                      <PositionChange delta={delta} />
                    </div>

                    {/* Club badge + name */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <ClubBadge club={row.club} size={28} />
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold truncate transition-colors ${isHov ? "text-accent" : "text-foreground"}`}>
                          {row.club.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{row.club.city}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-3 text-xs tabular-nums">
                      <span className="w-6 text-center text-muted-foreground">{row.p}</span>
                      <span className="w-6 text-center text-win">{row.w}</span>
                      <span className="w-6 text-center text-draw">{row.d}</span>
                      <span className="w-6 text-center text-[hsl(var(--loss))]">{row.l}</span>
                    </div>

                    {/* Form — last 5 */}
                    <div className="hidden md:flex items-center gap-1">
                      {row.form.map((r, i) => <FormBadge key={i} r={r} />)}
                    </div>

                    {/* Points */}
                    <div
                      className={`w-10 text-right font-display text-base tabular-nums shrink-0 ${
                        zone === "champion" ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {row.pts}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Relegation warning banner ── */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-3 w-3 text-destructive/70 shrink-0" />
          <span className="text-[10px] text-destructive/60">
            Les 2 derniers clubs à la fin de la saison sont relégués en Elite Two.
          </span>
        </div>
      </motion.div>

      {/* Legend */}
      <ZoneLegend />
    </section>
  );
};