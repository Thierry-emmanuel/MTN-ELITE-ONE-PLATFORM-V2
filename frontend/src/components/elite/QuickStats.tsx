import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Flame, Target, TrendingUp, Trophy, Crown } from "lucide-react";
import { clubs } from "./data";
import { ClubBadge } from "./ClubBadge";
import player2 from "@/assets/images/youngtalents/SergeDaura.png";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stats = [
  { icon: Flame,      label: "Matchs joués",  value: "136",  sub: "/ 240 cette saison",  color: "#FCD116" },
  { icon: Target,     label: "Buts marqués",  value: "327",  sub: "2.4 par match",        color: "#008751" },
  { icon: TrendingUp, label: "Buts / match",  value: "2.4",  sub: "+0.3 vs saison N-1",   color: "#CE1126" },
];

export const QuickStats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="container py-10 lg:py-14">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
      >
        {/* Stat cards */}
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            className="group bg-gradient-card border border-border rounded-2xl p-5 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant cursor-default"
          >
            <div className="h-9 w-9 rounded-xl grid place-items-center mb-4 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${s.color}18`, color: s.color }}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="font-display text-3xl lg:text-4xl text-foreground tabular-nums">{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="text-[11px] text-muted-foreground/50 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}

        {/* Top scorer */}
        <motion.div
          variants={itemVariants}
          className="col-span-2 md:col-span-1 lg:col-span-1 group relative bg-gradient-card border border-accent/30 rounded-2xl p-5 overflow-hidden hover:border-accent/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-gold opacity-[0.05] group-hover:opacity-[0.08] transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-[10px] uppercase tracking-[.2em] text-accent font-semibold">Top Buteur</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={player2} alt="Top scorer" loading="lazy"
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-accent/40 group-hover:ring-accent/70 transition-all" />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-accent rounded-full grid place-items-center text-[9px] font-bold text-accent-foreground">14</div>
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg leading-tight truncate">S. Mbarga</div>
                <div className="text-xs text-muted-foreground">Coton Sport</div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-3xl text-accent">14</span>
              <span className="text-xs text-muted-foreground">buts</span>
            </div>
          </div>
        </motion.div>

        {/* League leader */}
        <motion.div
          variants={itemVariants}
          className="col-span-2 md:col-span-3 lg:col-span-1 group relative bg-gradient-card border border-primary/30 rounded-2xl p-5 overflow-hidden hover:border-primary/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.07] group-hover:opacity-[0.11] transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-primary-glow" />
              <span className="text-[10px] uppercase tracking-[.2em] text-primary-glow font-semibold">Leader</span>
            </div>
            <div className="flex items-center gap-3">
              <ClubBadge club={clubs.cot} size={48} />
              <div>
                <div className="font-display text-lg leading-tight">{clubs.cot.name}</div>
                <div className="text-xs text-muted-foreground">38 pts · GD +22</div>
              </div>
            </div>
            {/* Mini form bar */}
            <div className="mt-3 flex gap-1">
              {["W","W","D","W","W"].map((r, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${r === "W" ? "bg-win" : r === "D" ? "bg-draw" : "bg-loss"}`} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};