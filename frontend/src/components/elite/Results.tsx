import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { results } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const rowVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const Results = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="container py-6 lg:py-8">
      <SectionHeader eyebrow="J18" title="Derniers Résultats" cta="Tous les résultats" size="compact" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid sm:grid-cols-2 gap-2"
      >
        {results.map((r, idx) => {
          const homeWin = r.hs > r.as;
          const awayWin = r.as > r.hs;
          const draw    = r.hs === r.as;

          return (
            <motion.div
              key={idx}
              variants={rowVariants}
              className="group relative bg-surface/60 border border-border rounded-lg px-3 py-2.5 flex items-center gap-2.5 hover:bg-surface hover:border-white/15 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Win indicator line */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-opacity ${
                  draw ? "bg-draw opacity-40" : homeWin ? "bg-win opacity-60" : "bg-loss opacity-60"
                }`}
              />

              <div className="text-[10px] text-muted-foreground uppercase tracking-wider w-10 shrink-0 pl-1">
                {r.date}
              </div>

              <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
                {/* Home */}
                <div
                  className={`flex items-center gap-1.5 justify-end min-w-0 ${
                    homeWin ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="font-medium text-xs truncate">{r.home.short}</span>
                  <ClubBadge club={r.home} size={22} />
                </div>

                {/* Score */}
                <div className="flex items-center gap-1 font-display text-base tabular-nums px-1 shrink-0">
                  <span className={homeWin ? "text-accent" : draw ? "text-draw" : ""}>{r.hs}</span>
                  <span className="text-muted-foreground/30 text-sm">-</span>
                  <span className={awayWin ? "text-accent" : draw ? "text-draw" : ""}>{r.as}</span>
                </div>

                {/* Away */}
                <div
                  className={`flex items-center gap-1.5 min-w-0 ${
                    awayWin ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <ClubBadge club={r.away} size={22} />
                  <span className="font-medium text-xs truncate">{r.away.short}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};