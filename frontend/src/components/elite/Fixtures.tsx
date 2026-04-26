import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Clock, Radio } from "lucide-react";
import { fixtures } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export const Fixtures = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="container py-10 lg:py-14">
      <SectionHeader eyebrow="J19" title="Prochains Matchs" cta="Calendrier complet" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2 snap-x snap-mandatory"
      >
        {fixtures.map((f, idx) => {
          const live = f.status === "Live";
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              className={`snap-start shrink-0 w-[280px] sm:w-[310px] group relative bg-gradient-card border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden ${
                live ? "border-live/40 hover:border-live/70" : "border-border hover:border-primary/40 hover:shadow-elegant"
              }`}
            >
              {/* Live top bar */}
              {live && <div className="absolute top-0 left-0 right-0 h-[2px] bg-live" />}

              {/* Header */}
              <div className="flex items-center justify-between text-[11px] mb-5">
                <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />
                  {f.date}
                </div>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 text-live px-2.5 py-1 font-semibold uppercase tracking-wider">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                    <Clock className="h-3 w-3" />
                    {f.countdown}
                  </span>
                )}
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex-1 flex flex-col items-center gap-2 text-center">
                  <div className="relative">
                    <ClubBadge club={f.home} size={56} />
                    <div className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
                      style={{ background: f.home.color }} />
                  </div>
                  <div className="font-display text-sm leading-tight">{f.home.name}</div>
                </div>

                <div className="font-display text-xl text-muted-foreground/50 shrink-0">vs</div>

                <div className="flex-1 flex flex-col items-center gap-2 text-center">
                  <div className="relative">
                    <ClubBadge club={f.away} size={56} />
                    <div className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity"
                      style={{ background: f.away.color }} />
                  </div>
                  <div className="font-display text-sm leading-tight">{f.away.name}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-border/50">
                <div className={`font-display text-2xl ${live ? "text-live" : "text-accent"}`}>{f.time}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  {live ? "En cours" : "Coup d'envoi"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};