import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Flame, Target, TrendingUp, Trophy, Crown } from "lucide-react";
import { clubs } from "./data";
import { ClubBadge } from "./ClubBadge";
import player2 from "@/assets/images/youngtalents/SergeDaura.png";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any } },
};

const stats = [
  { icon: Flame,       label: "Matchs joués", value: "136", sub: "/ 240 cette saison", color: "#FCD116" },
  { icon: Target,      label: "Buts marqués", value: "327", sub: "2.4 par match",       color: "#008751" },
  { icon: TrendingUp,  label: "Buts / match", value: "2.4", sub: "+0.3 vs N-1",         color: "#CE1126" },
];

// ─── QuickStats ───────────────────────────────────────────────────────────────
// NOTE: This component renders INSIDE the container — no extra padding needed here.
export const QuickStats = () => {
  const ref   = useRef(null);
  const inView= useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {/* Stat cards */}
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            className="group bg-gradient-card border border-border rounded-2xl p-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant cursor-default"
          >
            <div
              className="h-8 w-8 rounded-xl grid place-items-center mb-3 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${s.color}18`, color: s.color }}
            >
              <s.icon className="h-3.5 w-3.5" />
            </div>
            <div className="font-display text-2xl lg:text-3xl text-foreground tabular-nums">
              {s.value}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}

        {/* Top scorer */}
        <motion.div
          variants={itemVariants}
          className="col-span-2 sm:col-span-1 group relative bg-gradient-card border border-accent/30 rounded-2xl p-4 overflow-hidden hover:border-accent/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-gold opacity-[0.05] group-hover:opacity-[0.09] transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Trophy className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] uppercase tracking-[.2em] text-accent font-semibold">
                Top Buteur
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={player2}
                  alt="Top scorer"
                  loading="lazy"
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-accent/40 group-hover:ring-accent/70 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-accent rounded-full grid place-items-center text-[8px] font-bold text-accent-foreground">
                  14
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-display text-base leading-tight truncate">S. Mbarga</div>
                <div className="text-[10px] text-muted-foreground">Coton Sport</div>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-2xl text-accent">14</span>
              <span className="text-xs text-muted-foreground">buts</span>
            </div>
          </div>
        </motion.div>

        {/* League leader */}
        <motion.div
          variants={itemVariants}
          className="col-span-2 sm:col-span-3 lg:col-span-1 group relative bg-gradient-card border border-primary/30 rounded-2xl p-4 overflow-hidden hover:border-primary/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.07] group-hover:opacity-[0.11] transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Crown className="h-3.5 w-3.5 text-primary-glow" />
              <span className="text-[10px] uppercase tracking-[.2em] text-primary-glow font-semibold">
                Leader
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ClubBadge club={clubs.cot} size={40} />
              <div>
                <div className="font-display text-base leading-tight">{clubs.cot.name}</div>
                <div className="text-[10px] text-muted-foreground">38 pts · GD +22</div>
              </div>
            </div>
            {/* Mini form bar */}
            <div className="mt-2.5 flex gap-1">
              {["W", "W", "D", "W", "W"].map((r, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full ${
                    r === "W" ? "bg-win" : r === "D" ? "bg-draw" : "bg-loss"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};