import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import { footballApi as api } from "@/services/api";
import type { ApiMatch } from "@/types/football.types";
import { MOCK_FIXTURES, DEV_SEASON_ID } from "@/services/mockData";
import { ClubLogo } from "@/components/elite/FootballUI";
import { SectionHeader } from "./SectionHeader";
import { Link } from "react-router-dom";

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const FixtureCard = ({ match }: { match: ApiMatch }) => {
  const live = match.status === "LIVE";
  const dt   = new Date(match.scheduledAt);
  const time = dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = dt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`snap-start shrink-0 w-[230px] sm:w-[255px] group relative bg-gradient-card border rounded-xl p-4 cursor-pointer overflow-hidden transition-all duration-300 ${
        live
          ? "border-live/40 hover:border-live/70 shadow-[0_0_20px_hsl(354_85%_50%/0.08)]"
          : "border-border hover:border-primary/40 hover:shadow-elegant"
      }`}
    >
      {live && <div className="absolute top-0 left-0 right-0 h-[2px] bg-live" />}

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] mb-3">
        <span className="text-muted-foreground uppercase tracking-wider">{date}</span>
        {live ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-live/15 text-live px-2 py-0.5 font-semibold uppercase tracking-wider">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider bg-surface-elevated px-2 py-0.5 rounded-full">
            J{match.round}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <ClubLogo club={match.homeClub} size={44} />
            {match.homeClub.primaryColor && (
              <div className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ background: match.homeClub.primaryColor }} />
            )}
          </div>
          <span className="font-display text-[11px] leading-tight line-clamp-2">{match.homeClub.name}</span>
        </div>

        {live && match.homeScore !== null ? (
          <div className="font-display text-2xl text-live shrink-0 tabular-nums px-1">
            {match.homeScore}–{match.awayScore}
          </div>
        ) : (
          <div className="font-display text-base text-muted-foreground/30 shrink-0">vs</div>
        )}

        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <ClubLogo club={match.awayClub} size={44} />
            {match.awayClub.primaryColor && (
              <div className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ background: match.awayClub.primaryColor }} />
            )}
          </div>
          <span className="font-display text-[11px] leading-tight line-clamp-2">{match.awayClub.name}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2.5 border-t border-border/40">
        <div className={`font-display text-lg ${live ? "text-live" : "text-accent"}`}>{time}</div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-0.5 truncate">
          {match.venue ?? match.city ?? "Stade à confirmer"}
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="snap-start shrink-0 w-[230px] sm:w-[255px] bg-gradient-card border border-border rounded-xl p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-3 w-16 rounded bg-white/6" />
      <div className="h-3 w-10 rounded bg-white/6" />
    </div>
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="h-11 w-11 rounded-full bg-white/6" />
        <div className="h-3 w-14 rounded bg-white/6" />
      </div>
      <div className="h-5 w-6 rounded bg-white/4" />
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="h-11 w-11 rounded-full bg-white/6" />
        <div className="h-3 w-14 rounded bg-white/6" />
      </div>
    </div>
    <div className="border-t border-border/30 pt-2.5 flex flex-col items-center gap-1">
      <div className="h-4 w-10 rounded bg-white/6" />
      <div className="h-2.5 w-20 rounded bg-white/4" />
    </div>
  </div>
);

export const Fixtures = () => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [matches,  setMatches]  = useState<ApiMatch[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [round,    setRound]    = useState<number>(1);

  useEffect(() => {
  api.getFixtures(SEASON_ID, { limit: 50 })
      .then(days => {
        // Get upcoming + live matches, flatten, take first 8
        const allMatches = days.flatMap(d => d.matches);
        const upcoming = allMatches.filter(m => m.status === "SCHEDULED" || m.status === "LIVE");
        const display  = upcoming.slice(0, 8);
        if (display.length > 0) setRound(display[0].round);
        setMatches(display.length > 0 ? display : MOCK_FIXTURES.flatMap(d => d.matches).slice(0, 6));
      })
      .catch(() => setMatches(MOCK_FIXTURES.flatMap(d => d.matches).slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  const liveCount = matches.filter(m => m.status === "LIVE").length;

  return (
    <section ref={ref}>
      <div className="flex items-center justify-between mb-5">
        <SectionHeader
          eyebrow={`J${round}`}
          title="Prochains Matchs"
          size="compact"
        />
        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-live font-semibold uppercase tracking-wider animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-live" />
              {liveCount} live
            </span>
          )}
          <Link
            to="/fixtures"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors group"
          >
            Tout voir
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2 snap-x snap-mandatory"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : matches.map(m => <FixtureCard key={m.id} match={m} />)
        }
      </motion.div>
    </section>
  );
};