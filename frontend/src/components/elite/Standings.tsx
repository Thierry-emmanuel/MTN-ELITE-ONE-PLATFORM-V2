import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, TrendingUp } from "lucide-react";
import { standings, matchInsights } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import { Link } from "react-router-dom";

type FormResult = "W" | "D" | "L";

const FormDot = ({ r }: { r: FormResult }) => {
  const colors: Record<FormResult, string> = { W: "bg-win", D: "bg-draw", L: "bg-loss" };
  return <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${colors[r]}`} title={r} />;
};

const StatBar = ({
  label, homeVal, awayVal, homeClub, awayClub,
}: {
  label: string; homeVal: number; awayVal: number;
  homeClub: typeof standings[0]["club"]; awayClub: typeof standings[0]["club"];
}) => {
  const total = homeVal + awayVal || 1;
  const homePct = (homeVal / total) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display text-sm tabular-nums">{homeVal}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-display text-sm tabular-nums">{awayVal}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-l-full"
          style={{ background: homeClub.color }}
          initial={{ width: "50%" }}
          animate={{ width: `${homePct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="h-full rounded-r-full flex-1" style={{ background: awayClub.color, opacity: 0.7 }} />
      </div>
    </div>
  );
};

const ClubCard = ({ row, inView, delay }: { row: typeof standings[0]; inView: boolean; delay: number }) => {
  const isTop     = row.pos <= 2;
  const isEuro    = row.pos === 3;
  const isRelZone = row.pos >= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`snap-start shrink-0 w-[130px] sm:w-[145px] cursor-pointer group relative rounded-xl border p-3.5 flex flex-col items-center gap-2.5 transition-all duration-300 ${
        isTop
          ? "border-primary/40 bg-primary/5 hover:border-primary/70 hover:shadow-[0_8px_30px_rgba(0,135,81,0.25)]"
          : isEuro
          ? "border-accent/30 bg-accent/5 hover:border-accent/60 hover:shadow-gold"
          : isRelZone
          ? "border-loss/30 bg-loss/5 hover:border-loss/50"
          : "border-border bg-gradient-card hover:border-white/20 hover:shadow-elegant"
      }`}
    >
      {/* Position badge */}
      <div
        className={`absolute top-2 left-2 h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold ${
          isTop
            ? "bg-primary text-primary-foreground"
            : isEuro
            ? "bg-accent text-accent-foreground"
            : isRelZone
            ? "bg-loss/20 text-loss"
            : "bg-surface-elevated text-muted-foreground"
        }`}
      >
        {row.pos}
      </div>

      {isTop && <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none" />}

      {/* Badge */}
      <div className="mt-2 relative">
        <ClubBadge club={row.club} size={44} />
        {isTop && (
          <div
            className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
            style={{ background: row.club.color }}
          />
        )}
      </div>

      {/* Name */}
      <div className="text-center min-w-0 w-full">
        <div className="font-display text-xs leading-tight truncate">{row.club.name}</div>
        <div className="text-[9px] text-muted-foreground mt-0.5">{row.club.city}</div>
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-1 text-center">
        <div className="bg-surface-elevated/60 rounded-lg py-1">
          <div className="font-display text-sm text-accent">{row.pts}</div>
          <div className="text-[8px] text-muted-foreground uppercase">pts</div>
        </div>
        <div className="bg-surface-elevated/60 rounded-lg py-1">
          <div
            className={`font-display text-xs ${
              row.gd > 0 ? "text-win" : row.gd < 0 ? "text-loss" : "text-muted-foreground"
            }`}
          >
            {row.gd > 0 ? `+${row.gd}` : row.gd}
          </div>
          <div className="text-[8px] text-muted-foreground uppercase">GD</div>
        </div>
      </div>

      {/* Form dots */}
      <div className="flex items-center gap-1 justify-center">
        {row.form.map((f, fi) => <FormDot key={fi} r={f as FormResult} />)}
      </div>
    </motion.div>
  );
};

export const Standings = () => {
  const ref = useRef(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const insights = Object.values(matchInsights);

  const scroll = (dir: "left" | "right") =>
    carouselRef.current?.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });

  return (
    <section ref={ref} className="container py-8 lg:py-10">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">

        {/* ── Carousel ── */}
        <div>
          <div className="flex items-end justify-between gap-4 mb-4">
            <SectionHeader eyebrow="Classement" title="Top Clubs" size="compact" />
            <div className="flex items-center gap-2 shrink-0">
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
              <Link
                to="/standings"
                className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors group ml-1"
              >
                Tableau complet
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
          >
            {standings.map((row, i) => (
              <ClubCard key={row.pos} row={row} inView={inView} delay={i * 0.04} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
            {[
              { color: "bg-primary", label: "Champions League" },
              { color: "bg-accent",  label: "Coupe CAF" },
              { color: "bg-loss",    label: "Zone relégation" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Match Insights ── */}
        <div>
          <SectionHeader eyebrow="Analyse" title="Stats Match" size="compact" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="bg-gradient-card border border-border rounded-xl p-4 space-y-3.5"
          >
            {/* Match header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
              <div className="flex flex-col items-center gap-1 flex-1">
                <ClubBadge club={insights[0].home} size={32} />
                <span className="text-xs font-medium">{insights[0].home.short}</span>
              </div>
              <div className="text-center shrink-0">
                <div className="font-display text-lg text-accent">2 - 1</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">J18 · Final</div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <ClubBadge club={insights[0].away} size={32} />
                <span className="text-xs font-medium">{insights[0].away.short}</span>
              </div>
            </div>

            {/* Stat bars */}
            <div className="space-y-2.5">
              {insights.map((ins) => (
                <StatBar
                  key={ins.label}
                  label={ins.label}
                  homeVal={ins.homeStat}
                  awayVal={ins.awayStat}
                  homeClub={ins.home}
                  awayClub={ins.away}
                />
              ))}
            </div>

            {/* Key moments */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                <TrendingUp className="h-3 w-3" /> Moments clés
              </div>
              {[
                { min: "23'", event: "⚽ Mbarga (COT)" },
                { min: "47'", event: "⚽ Bassogog (CNK)" },
                { min: "71'", event: "⚽ Mbarga ×2 (COT)" },
                { min: "84'", event: "🟥 Fouda (CNK)" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-border/20 last:border-0">
                  <span className="text-[10px] tabular-nums text-muted-foreground/50 w-6 shrink-0">{e.min}</span>
                  <span className="text-xs text-muted-foreground">{e.event}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};