import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Goal, HandHeart, ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
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

const PlayerCard = ({
  player, idx, type, inView,
}: { player: any; idx: number; type: StatType; inView: boolean }) => {
  const isFirst = idx === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`snap-start shrink-0 w-[138px] sm:w-[150px] group relative rounded-xl border bg-gradient-to-b overflow-hidden cursor-pointer transition-all duration-300 ${
        RANK_COLORS[Math.min(idx, 2)]
      } ${isFirst ? "hover:shadow-[0_12px_40px_rgba(252,209,22,0.3)]" : "hover:shadow-elegant"}`}
    >
      {/* Rank */}
      <div
        className={`absolute top-2 right-2 z-10 h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold ${
          isFirst
            ? "bg-accent text-accent-foreground"
            : "bg-surface-elevated/80 backdrop-blur text-muted-foreground"
        }`}
      >
        {isFirst ? <Star className="h-2.5 w-2.5 fill-current" /> : idx + 1}
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

      {/* Info */}
      <div className="p-2.5 pt-2">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5 truncate">
          {type === "scorers" ? "Buteur" : "Passeur"}
        </div>
        <div className="font-display text-sm leading-tight truncate">{player.name}</div>
        <div className="flex items-center gap-1 mt-1">
          <ClubBadge club={player.club} size={12} />
          <span className="text-[10px] text-muted-foreground truncate">{player.club.short}</span>
        </div>
      </div>
    </motion.div>
  );
};

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