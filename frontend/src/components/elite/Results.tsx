import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ClubLogo } from "@/components/ui/football";
import { SectionHeader } from "./SectionHeader";
import { Link } from "react-router-dom";
import { useResults } from "@/hooks/useFootball";
import { useMemo } from "react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const rowVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as any } },
};
const ResultRow = ({ match }: { match: any }) => {
  const hs      = match.homeScore ?? 0;
  const as_     = match.awayScore ?? 0;
  const homeWin = hs > as_;
  const awayWin = as_ > hs;
  const draw    = hs === as_;
  const dt      = new Date(match.scheduledAt ?? match.kickoffUtc);
  const date    = dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <motion.div
      variants={rowVariants}
      whileHover={{ x: 2 }}
      className="group relative bg-surface/60 border border-border rounded-xl px-4 py-3 cursor-pointer hover:bg-surface hover:border-white/15 transition-all duration-200 overflow-hidden"
    >
      {/* Result color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${
        draw ? "bg-draw/50" : homeWin ? "bg-win/60" : "bg-loss/60"
      }`} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pl-2">
        {/* Home */}
        <div className={`flex items-center gap-2 justify-end min-w-0 ${homeWin ? "text-foreground" : "text-muted-foreground"}`}>
          <div className="text-right min-w-0">
            <div className="font-display text-xs truncate">{match.homeClub.name}</div>
          </div>
          <ClubLogo club={match.homeClub as any} size={26} />
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 font-mono font-bold text-amber-500 text-xs flex items-center gap-1 shadow-inner">
            <span>{hs}</span>
            <span className="text-stone-600">:</span>
            <span>{as_}</span>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-stone-500">FT · {date}</span>
        </div>

        {/* Away */}
        <div className={`flex items-center gap-2 min-w-0 ${awayWin ? "text-foreground" : "text-muted-foreground"}`}>
          <ClubLogo club={match.awayClub as any} size={26} />
          <div className="min-w-0">
            <div className="font-display text-xs truncate">{match.awayClub.name}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonRow = () => (
  <div className="bg-surface/60 border border-border rounded-xl px-4 py-3 animate-pulse">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex items-center justify-end gap-2">
        <div className="h-3 w-20 rounded bg-white/6" />
        <div className="h-6 w-6 rounded-full bg-white/6" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-5 w-14 rounded bg-white/6" />
        <div className="h-2 w-10 rounded bg-white/4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-white/6" />
        <div className="h-3 w-20 rounded bg-white/6" />
      </div>
    </div>
  </div>
);

export const Results = () => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { data: daysData, isLoading: loading } = useResults();

  const matches = useMemo(() => {
    const days = daysData ?? [];
    const allMatches = days.flatMap(d => d.matches)
      .filter(m => m.status === "FT" || m.status === "FINISHED")
      .slice(-8)
      .reverse();
    return allMatches;
  }, [daysData]);

  const round = matches[0]?.round ?? 1;


  return (
    <section ref={ref}>
      <div className="flex items-center justify-between mb-5">
        <SectionHeader eyebrow={`J${round}`} title="Derniers Résultats" size="compact" />
        <Link
          to="/results"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors group"
        >
          Tout voir
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex flex-col gap-2"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : matches.map(m => <ResultRow key={m.id} match={m} />)
        }
      </motion.div>
    </section>
  );
};