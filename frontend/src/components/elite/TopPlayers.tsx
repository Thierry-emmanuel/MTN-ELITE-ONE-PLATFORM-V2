import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Goal, HandHeart, ArrowRight } from "lucide-react";
import { scorers, assistLeaders } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";

const imgMap: Record<string, string> = { p1, p2, p3 };

type StatType = "scorers" | "assists";

const MAX: Record<StatType, number> = { scorers: 14, assists: 9 };

const PlayerRow = ({ player, idx, type, inView }: { player: any; idx: number; type: StatType; inView: boolean }) => {
  const max = MAX[type];
  const pct = (player.val / max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated/50 transition-colors cursor-default"
    >
      {/* Rank */}
      <div className={`font-display text-xl tabular-nums shrink-0 w-6 text-center transition-colors ${
        idx === 0 ? "text-accent" : "text-muted-foreground/40"
      }`}>
        {idx + 1}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={imgMap[player.imgKey]}
          alt={player.name}
          loading="lazy"
          className={`h-11 w-11 rounded-xl object-cover transition-all ${
            idx === 0 ? "ring-2 ring-accent/60" : "ring-1 ring-border"
          }`}
        />
        {idx === 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full grid place-items-center">
            <span className="text-[7px] font-bold text-accent-foreground">1</span>
          </div>
        )}
      </div>

      {/* Info + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-medium text-sm truncate">{player.name}</span>
          <span className={`font-display text-lg tabular-nums ml-2 ${idx === 0 ? "text-accent" : "text-foreground"}`}>
            {player.val}
            <span className="text-[11px] text-muted-foreground font-sans ml-0.5">{type === "scorers" ? "b" : "p"}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ClubBadge club={player.club} size={14} />
          <span className="text-[11px] text-muted-foreground truncate">{player.club.name}</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${idx === 0 ? "bg-accent" : "bg-primary/60"}`}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : { width: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.07 + 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const TopPlayers = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [tab, setTab] = useState<StatType>("scorers");

  const data = tab === "scorers" ? scorers : assistLeaders;

  return (
    <section ref={ref} className="container py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <SectionHeader eyebrow="Statistiques" title="Meilleurs Joueurs" />
        <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 shrink-0">
          {([
            { id: "scorers" as const,  label: "Buteurs",  icon: <Goal className="h-3.5 w-3.5" /> },
            { id: "assists" as const,  label: "Passeurs", icon: <HandHeart className="h-3.5 w-3.5" /> },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                tab === t.id
                  ? "bg-accent text-accent-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-card border border-border rounded-2xl divide-y divide-border/50 overflow-hidden"
        >
          {/* Header row */}
          <div className="grid grid-cols-2 px-4 pt-4 pb-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {tab === "scorers"
                  ? <Goal className="h-4 w-4 text-accent" />
                  : <HandHeart className="h-4 w-4 text-accent" />}
                <span className="font-display text-base uppercase">
                  {tab === "scorers" ? "Meilleurs Buteurs" : "Meilleurs Passeurs"}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Saison 24/25 · J18
              </div>
            </div>
          </div>

          <div className="p-3">
            {data.map((p, i) => (
              <PlayerRow key={p.name} player={p} idx={i} type={tab} inView={inView} />
            ))}
          </div>

          <div className="px-5 py-3">
            <a href="#" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group">
              Voir toutes les statistiques
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};