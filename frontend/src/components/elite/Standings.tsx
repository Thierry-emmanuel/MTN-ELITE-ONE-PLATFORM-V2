import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Trophy, AlertTriangle, ArrowRight } from "lucide-react";
import { footballApi as api } from "@/services/api";
import { MOCK_STANDINGS, DEV_SEASON_ID } from "@/services/mockData";
import { ClubLogo, FormIndicator, PositionChange, StandingRowSkeleton } from "@/components/ui/football";
import { SectionHeader } from "./SectionHeader";
import { Link } from "react-router-dom";
import type { ApiStanding } from "@/types/football.types";

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

const getZone = (pos: number, total: number) => {
  if (pos === 1)        return "champion";
  if (pos <= 3)         return "caf";
  if (pos >= total - 1) return "relegation";
  return "none";
};

const ZONE_BORDER: Record<string, string> = {
  champion:   "border-l-accent",
  caf:        "border-l-primary",
  relegation: "border-l-destructive",
  none:       "border-l-transparent",
};

const ZoneLegend = () => (
  <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-muted-foreground">
    {[
      { color: "bg-accent",      label: "Champion" },
      { color: "bg-primary",     label: "Zone CAF" },
      { color: "bg-destructive", label: "Relégation" },
    ].map(z => (
      <span key={z.label} className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-sm ${z.color}`} />
        {z.label}
      </span>
    ))}
  </div>
);

export const Standings = () => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [standings, setStandings] = useState<ApiStanding[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [hovered,   setHovered]   = useState<string | null>(null);

  useEffect(() => {
    api.getStandings(SEASON_ID)
      .then(data => setStandings(data.length > 0 ? data : MOCK_STANDINGS))
      .catch(() => setStandings(MOCK_STANDINGS))
      .finally(() => setLoading(false));
  }, []);

  const total      = standings.length;
  // Show top 8 on homepage
  const displayed  = standings.slice(0, 8);
  const currentRound = standings[0]?.played ?? 1;

  return (
    <section ref={ref} className="py-8 lg:py-10">
      <SectionHeader
        eyebrow={`J${currentRound} · En cours`}
        title="Classement"
        cta="Classement complet"
        ctaHref="/standings"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-border overflow-hidden bg-gradient-card"
      >
        {/* Table header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-surface/40">
          <div className="w-6 text-[10px] text-muted-foreground uppercase tracking-wider text-center">#</div>
          <div className="w-5" />
          <div className="w-7" />
          <div className="flex-1 text-[10px] text-muted-foreground uppercase tracking-wider">Club</div>
          <div className="hidden sm:flex text-[10px] text-muted-foreground uppercase tracking-wider">
            {["J","V","N","D"].map(h => (
              <span key={h} className="w-7 text-center">{h}</span>
            ))}
          </div>
          <div className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-wider w-[116px] text-center">
            Forme
          </div>
          <div className="w-10 text-right text-[10px] text-muted-foreground uppercase tracking-wider">Pts</div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 8 }).map((_, i) => <StandingRowSkeleton key={i} i={i} />)}
            </motion.div>
          ) : (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {displayed.map((row, idx) => {
                const zone  = getZone(row.position, total);
                const isHov = hovered === row.id;
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={() => setHovered(row.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`relative flex items-center gap-2 px-4 py-3 border-b border-border/25 last:border-0 cursor-pointer transition-colors duration-150 border-l-2 ${ZONE_BORDER[zone]} ${isHov ? "bg-white/[0.03]" : ""}`}
                  >
                    {/* Position */}
                    <div className={`w-6 shrink-0 font-display text-sm tabular-nums text-center ${zone === "champion" ? "text-accent" : "text-muted-foreground"}`}>
                      {row.position === 1
                        ? <Trophy className="h-3.5 w-3.5 text-accent mx-auto" />
                        : row.position}
                    </div>

                    <div className="w-5 shrink-0 flex items-center justify-center">
                      <PositionChange delta={0} />
                    </div>

                    <ClubLogo club={row.club} size={26} className="shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate transition-colors ${isHov ? "text-accent" : "text-foreground"}`}>
                        {row.club.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate hidden sm:block">{row.club.city}</div>
                    </div>

                    <div className="hidden sm:flex text-xs tabular-nums">
                      {[
                        { val: row.played, color: "text-muted-foreground" },
                        { val: row.won,    color: "text-win" },
                        { val: row.drawn,  color: "text-draw" },
                        { val: row.lost,   color: "text-loss" },
                      ].map((s, i) => (
                        <span key={i} className={`w-7 text-center ${s.color}`}>{s.val}</span>
                      ))}
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                      {(row.formGuide ?? []).slice(-5).map((r, i) => (
                        <FormIndicator key={i} result={r.toUpperCase()} />
                      ))}
                    </div>

                    <div className={`w-10 text-right font-display text-base tabular-nums shrink-0 ${zone === "champion" ? "text-accent" : "text-foreground"}`}>
                      {row.points}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Relegation warning */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-destructive/20 bg-destructive/[0.04]">
          <AlertTriangle className="h-3 w-3 text-destructive/60 shrink-0" />
          <span className="text-[10px] text-destructive/50">Les 2 derniers clubs sont relégués en Elite Two.</span>
        </div>
      </motion.div>

      <div className="flex items-center justify-between mt-3">
        <ZoneLegend />
        <Link
          to="/standings"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group"
        >
          Voir tout
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
};