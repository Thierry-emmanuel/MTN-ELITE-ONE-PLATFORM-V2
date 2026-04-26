import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { standings, matchInsights } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

type FormResult = "W" | "D" | "L";

const FormBadge = ({ r }: { r: FormResult }) => {
  const map: Record<FormResult, string> = {
    W: "bg-win/20 text-win border-win/20",
    D: "bg-draw/20 text-draw border-draw/20",
    L: "bg-loss/20 text-loss border-loss/20",
  };
  return (
    <span className={`h-5 w-5 grid place-items-center rounded text-[9px] font-bold border ${map[r]}`}>{r}</span>
  );
};

const StatBar = ({ label, homeVal, awayVal, homeClub, awayClub }: {
  label: string; homeVal: number; awayVal: number;
  homeClub: typeof standings[0]["club"]; awayClub: typeof standings[0]["club"];
}) => {
  const total = homeVal + awayVal || 1;
  const homePct = (homeVal / total) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display text-sm text-foreground tabular-nums">{homeVal}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-display text-sm text-foreground tabular-nums">{awayVal}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        <motion.div
          className="h-full rounded-l-full"
          style={{ background: homeClub.color }}
          initial={{ width: "50%" }}
          animate={{ width: `${homePct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="h-full rounded-r-full flex-1"
          style={{ background: awayClub.color, opacity: 0.7 }}
        />
      </div>
    </div>
  );
};

export const Standings = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const insights = Object.values(matchInsights);

  return (
    <section ref={ref} className="container py-10 lg:py-14">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* ── Table ── */}
        <div>
          <SectionHeader eyebrow="Classement" title="Top 8 du Championnat" cta="Classement complet" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="bg-gradient-card border border-border rounded-2xl overflow-hidden shadow-card"
          >
            {/* Header */}
            <div className="grid grid-cols-[36px_1fr_36px_36px_36px_36px_120px] items-center gap-1 px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-background-deep/50">
              <div>#</div><div>Club</div>
              <div className="text-center">J</div>
              <div className="text-center">V</div>
              <div className="text-center">+/-</div>
              <div className="text-center font-bold text-accent">Pts</div>
              <div className="text-right">Forme</div>
            </div>

            {standings.map((row, i) => (
              <motion.div
                key={row.pos}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`grid grid-cols-[36px_1fr_36px_36px_36px_36px_120px] items-center gap-1 px-4 py-3.5 border-b border-border last:border-0 hover:bg-surface-elevated/40 transition-colors cursor-pointer ${
                  row.pos <= 2 ? "bg-primary/5 border-l-2 border-l-primary" : row.pos === 3 ? "bg-accent/5 border-l-2 border-l-accent" : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="font-display text-base tabular-nums text-muted-foreground/70">{row.pos}</div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <ClubBadge club={row.club} size={26} />
                  <span className="font-medium text-sm truncate">{row.club.name}</span>
                </div>
                <div className="text-center text-xs tabular-nums text-muted-foreground">{row.p}</div>
                <div className="text-center text-xs tabular-nums text-muted-foreground">{row.w}</div>
                <div className={`text-center text-xs tabular-nums font-medium ${row.gd > 0 ? "text-win" : row.gd < 0 ? "text-loss" : "text-muted-foreground"}`}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </div>
                <div className="text-center font-display text-base text-accent tabular-nums">{row.pts}</div>
                <div className="flex items-center gap-0.5 justify-end">
                  {row.form.map((f, fi) => <FormBadge key={fi} r={f as FormResult} />)}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-3 px-1">
            {[
              { color: "bg-primary", label: "Champions League" },
              { color: "bg-accent",  label: "Coupe CAF" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Match Insights ── */}
        <div>
          <SectionHeader eyebrow="Analyse" title="Stats du Match" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-gradient-card border border-border rounded-2xl p-5 space-y-5"
          >
            {/* Match header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
              <div className="flex flex-col items-center gap-1.5">
                <ClubBadge club={insights[0].home} size={40} />
                <span className="text-xs font-medium">{insights[0].home.short}</span>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl text-accent">2 - 1</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">J18 · Final</div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ClubBadge club={insights[0].away} size={40} />
                <span className="text-xs font-medium">{insights[0].away.short}</span>
              </div>
            </div>

            {/* Stat bars */}
            <div className="space-y-4">
              {insights.map(ins => (
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
            <div className="pt-3 border-t border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Moments clés</div>
              {[
                { min: "23'", event: "⚽ But — Mbarga (COT)", type: "goal" },
                { min: "47'", event: "⚽ But — Bassogog (CNK)", type: "goal" },
                { min: "71'", event: "⚽ But — Mbarga ×2 (COT)", type: "goal" },
                { min: "84'", event: "🟥 Expulsion — Fouda (CNK)", type: "red" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-[10px] tabular-nums text-muted-foreground/60 w-6">{e.min}</span>
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