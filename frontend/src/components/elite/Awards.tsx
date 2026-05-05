import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Vote, ChevronLeft, ChevronRight,
  Check, Users, UserCheck, Clock, BarChart2,
} from "lucide-react";
import { awards, teamOfTheWeek, coachOfTheWeek, type AwardCategory } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";

const imgMap: Record<string, string> = { p1, p2, p3, yt1, coach1: p2, coach2: p3 };

// ─── Vote close deadline: 2 days 14 h from "now" ─────────────────────────────
const VOTE_DEADLINE = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000);

// ─── Mock vote distributions (name → %) — must sum to 100 ───────────────────
const VOTE_DIST: Record<string, { name: string; pct: number; color: string }[]> = {
  "Salomon Mbarga": [
    { name: "Mbarga",    pct: 62, color: "#FCD116" },
    { name: "Bassogog", pct: 24, color: "#008751" },
    { name: "Autres",   pct: 14, color: "rgba(255,255,255,0.2)" },
  ],
  default: [
    { name: "Choix 1", pct: 45, color: "#FCD116" },
    { name: "Choix 2", pct: 35, color: "#008751" },
    { name: "Autres",  pct: 20, color: "rgba(255,255,255,0.2)" },
  ],
};

// ─── Voting Countdown ─────────────────────────────────────────────────────────
const useCountdown = (deadline: Date) => {
  const calc = useCallback(() => {
    const diff = Math.max(0, deadline.getTime() - Date.now());
    return {
      d: Math.floor(diff / 86_400_000),
      h: Math.floor((diff % 86_400_000) / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  }, [deadline]);

  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
};

const VoteCountdown = () => {
  const { d, h, m, s } = useCountdown(VOTE_DEADLINE);
  const units = [
    { v: d, l: "j" },
    { v: h, l: "h" },
    { v: m, l: "m" },
    { v: s, l: "s" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-3 w-3 text-accent shrink-0" />
      <span className="text-[10px] text-muted-foreground">Vote clôt dans</span>
      <div className="flex items-center gap-1">
        {units.map(({ v, l }) => (
          <span key={l} className="inline-flex items-baseline gap-0.5">
            <span className="font-display text-xs text-accent tabular-nums">
              {String(v).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-muted-foreground/60">{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Vote Share Bar ───────────────────────────────────────────────────────────
const VoteShareBar = ({ awardName, userChoice }: { awardName: string; userChoice: string }) => {
  const dist = VOTE_DIST[awardName] ?? VOTE_DIST.default;
  const userSlice = dist.find(d => d.name === userChoice) ?? dist[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-2 pt-1"
    >
      {/* Segmented bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {dist.map((seg, i) => (
          <motion.div
            key={seg.name}
            className="h-full rounded-full"
            style={{ background: seg.color }}
            initial={{ width: "0%" }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex gap-3 flex-wrap">
        {dist.map(seg => (
          <div key={seg.name} className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className={`text-[9px] ${seg.name === userSlice.name ? "text-accent font-bold" : "text-muted-foreground/50"}`}>
              {seg.name} {seg.pct}%
            </span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-[#1F8A4C] font-semibold">
        ✓ Vous avez voté pour {userSlice.name} · {userSlice.pct}%
      </div>
    </motion.div>
  );
};

// ─── Rating Ring ──────────────────────────────────────────────────────────────
const RatingRing = ({ value, size = 52 }: { value: number; size?: number }) => {
  const r = size * 0.38, c = 2 * Math.PI * r;
  const pct = (value / 10) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke="#FCD116" strokeWidth="2.5"
          strokeDasharray={`0 ${c}`}
          animate={{ strokeDasharray: `${pct} ${c}` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-xs text-white">{value.toFixed(1)}</span>
      </div>
    </div>
  );
};

// ─── Award Card ───────────────────────────────────────────────────────────────
const AwardCard = ({
  award, votedFor, onVote,
}: {
  award: typeof awards[0];
  votedFor: string | null;
  onVote: (name: string) => void;
}) => {
  const hasVoted = votedFor !== null;
  const isMyVote = votedFor === award.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex-shrink-0 w-[220px] bg-gradient-to-b from-white/6 to-transparent border border-white/10 rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(0,0,0,0.45)] cursor-pointer"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-gold" />

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imgMap[award.imgKey] ?? imgMap.p2}
          alt={award.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-[hsl(168,50%,5%)/0.3] to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <div className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur border border-accent/25 px-2.5 py-1">
            <Star className="h-2.5 w-2.5 text-accent fill-accent" />
            <span className="text-[9px] uppercase tracking-widest text-accent font-bold">{award.label}</span>
          </div>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <RatingRing value={award.rating} size={44} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 -mt-10 relative">
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
              {award.position} · {award.period}
            </div>
            <h3 className="font-display text-lg leading-tight truncate">{award.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <ClubBadge club={award.club} size={14} />
              <span className="text-[11px] text-muted-foreground truncate">{award.club.name}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-2xl text-accent">{award.stat}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{award.statLabel}</div>
          </div>
        </div>

        {/* Countdown */}
        {award.isVotingOpen && !hasVoted && (
          <div className="mb-2">
            <VoteCountdown />
          </div>
        )}

        {/* Vote button or share bar */}
        {award.isVotingOpen && (
          <>
            {hasVoted ? (
              <VoteShareBar awardName={award.name} userChoice={isMyVote ? award.name : VOTE_DIST[award.name]?.[0]?.name ?? award.name} />
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onVote(award.name)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold bg-accent text-accent-foreground hover:opacity-90 transition-all"
              >
                <Vote className="h-3.5 w-3.5" />
                Voter · {(award.votes ?? 0).toLocaleString()} votes
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Carousel Row ─────────────────────────────────────────────────────────────
const CarouselRow = ({
  items, votedFor, onVote,
}: {
  items: typeof awards;
  votedFor: string | null;
  onVote: (name: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: "left" | "right") =>
    ref.current?.scrollBy({ left: d === "right" ? 260 : -260, behavior: "smooth" });

  return (
    <div className="relative">
      <button onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-8 w-8 grid place-items-center rounded-full bg-surface-elevated border border-border hover:bg-secondary transition-colors shadow-card">
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-8 w-8 grid place-items-center rounded-full bg-surface-elevated border border-border hover:bg-secondary transition-colors shadow-card">
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-1">
        {items.map(a => (
          <div key={`${a.type}-${a.name}`} className="snap-start shrink-0">
            <AwardCard award={a} votedFor={votedFor} onVote={onVote} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── TOTW Player with tooltip ─────────────────────────────────────────────────
const PitchPlayer = ({ player }: { player: typeof teamOfTheWeek[0] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="flex flex-col items-center gap-1 group cursor-pointer relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-accent/60 transition-all">
          <img
            src={imgMap[player.imgKey] ?? imgMap.p2}
            alt={player.name}
            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-full w-5 h-5 grid place-items-center leading-none">
          {player.rating.toFixed(1).replace(".", "")}
        </div>
      </div>

      {/* Player label */}
      <div className="text-center">
        <div className="text-[10px] bg-black/50 backdrop-blur text-white px-1.5 py-0.5 rounded font-bold leading-none">{player.posCode}</div>
        <div className="text-[10px] text-white font-semibold mt-0.5 drop-shadow leading-tight max-w-[64px] text-center">{player.shortName}</div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-44 bg-[hsl(168,45%,9%)] border border-border rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-3 pointer-events-none"
          >
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />

            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <div className="h-7 w-7 rounded-full overflow-hidden ring-1 ring-accent/40 shrink-0">
                <img src={imgMap[player.imgKey] ?? imgMap.p2} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-none truncate">{player.shortName}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{player.posCode} · J18</div>
              </div>
              <div className="ml-auto font-display text-base text-accent shrink-0">{player.rating}</div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { l: "Note", v: player.rating.toString() },
                { l: "Buts", v: String(Math.floor(player.rating - 7)) },
                { l: "Passes", v: String(Math.floor((player.rating - 7) * 1.2)) },
                { l: "Duels", v: "74%" },
                { l: "Km", v: "10.2" },
                { l: "Tirs", v: String(Math.ceil(player.rating - 6)) },
              ].map(s => (
                <div key={s.l} className="text-center bg-surface-elevated rounded-lg py-1.5">
                  <div className="font-display text-xs text-accent">{s.v}</div>
                  <div className="text-[8px] text-muted-foreground uppercase leading-none mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Formation 4-3-3 ──────────────────────────────────────────────────────────
const Formation433 = () => {
  const rows = teamOfTheWeek.reduce<(typeof teamOfTheWeek)[]>((acc, p) => {
    const rowMap: Record<string, number> = { ATT: 0, MIL: 1, DEF: 2, GK: 3 };
    const r = rowMap[p.row ?? "ATT"] ?? 0;
    (acc[r] ??= []).push(p);
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden border border-[#008751]/20"
      style={{ background: "linear-gradient(180deg, hsl(153,60%,14%) 0%, hsl(153,55%,10%) 100%)" }}
    >
      {/* Pitch SVG markings */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 520" preserveAspectRatio="none">
        <rect x="20" y="20" width="360" height="480" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        <line x1="20" y1="260" x2="380" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="200" cy="260" r="55" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="200" cy="260" r="4" fill="rgba(255,255,255,0.3)" />
        <rect x="100" y="20" width="200" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="100" y="410" width="200" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="155" y="20" width="90" height="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="155" y="460" width="90" height="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="200" cy="90" r="3" fill="rgba(255,255,255,0.25)" />
        <circle cx="200" cy="430" r="3" fill="rgba(255,255,255,0.25)" />
        {[[20,20],[380,20],[20,500],[380,500]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="20" y={20 + i * 60} width="360" height="30" fill={i % 2 === 0 ? "rgba(0,0,0,0.06)" : "transparent"} />
        ))}
      </svg>

      {/* Players */}
      <div className="relative z-10 flex flex-col gap-8 py-8 px-4">
        {[0, 1, 2, 3].map(rowIdx => {
          const rowPlayers = rows[rowIdx] ?? [];
          return (
            <div key={rowIdx} className="flex justify-around items-center">
              {rowPlayers.map(p => <PitchPlayer key={p.name} player={p} />)}
            </div>
          );
        })}

        {/* Coach */}
        <div className="flex justify-center pt-2 border-t border-white/10 mt-2">
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-accent/30 group-hover:ring-accent/60 transition-all">
              <img src={imgMap[coachOfTheWeek.imgKey]} alt={coachOfTheWeek.name}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-center">
              <div className="text-[10px] bg-accent/80 text-accent-foreground px-2 py-0.5 rounded font-bold">COACH</div>
              <div className="text-[10px] text-white font-semibold mt-0.5 drop-shadow">{coachOfTheWeek.name}</div>
              <div className="text-[9px] text-white/50">{coachOfTheWeek.formation}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Category tabs ────────────────────────────────────────────────────────────
const CATS: { id: AwardCategory | "totw"; label: string; icon: React.ReactNode }[] = [
  { id: "player", label: "Joueurs", icon: <Star className="h-3.5 w-3.5" /> },
  { id: "coach",  label: "Coaches", icon: <UserCheck className="h-3.5 w-3.5" /> },
  { id: "totw",   label: "Équipe",  icon: <Users className="h-3.5 w-3.5" /> },
];

// ─── Awards main ──────────────────────────────────────────────────────────────
export const Awards = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [cat, setCat] = useState<AwardCategory | "totw">("player");
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const playerAwards = awards.filter(a => a.category === "player");
  const coachAwards  = awards.filter(a => a.category === "coach");

  return (
    <section ref={ref} className="container py-10 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <SectionHeader eyebrow="Récompenses" title="Awards de la Saison" />
            {/* Global countdown */}
            <div className="mt-2">
              <VoteCountdown />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 shrink-0">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  cat === c.id ? "bg-accent text-accent-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"
                }`}>
                {c.icon}<span className="hidden sm:inline">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voted summary banner */}
        <AnimatePresence>
          {votedFor && cat !== "totw" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center gap-3 bg-[#1F8A4C]/10 border border-[#1F8A4C]/25 rounded-xl px-4 py-3">
                <Check className="h-4 w-4 text-[#1F8A4C] shrink-0" />
                <span className="text-sm text-[#1F8A4C] font-medium">
                  Vote enregistré pour <strong>{votedFor}</strong>
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Voir la distribution ci-dessous</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {cat === "player" && (
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CarouselRow items={playerAwards} votedFor={votedFor} onVote={setVotedFor} />
            </motion.div>
          )}

          {cat === "coach" && (
            <motion.div key="coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CarouselRow items={coachAwards} votedFor={votedFor} onVote={setVotedFor} />
            </motion.div>
          )}

          {cat === "totw" && (
            <motion.div key="totw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="grid lg:grid-cols-[1fr_320px] gap-6">
              <Formation433 />
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Composition · J18
                </div>
                {teamOfTheWeek.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-surface/60 border border-border hover:bg-surface-elevated/60 hover:border-accent/25 transition-all group cursor-pointer">
                    <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border group-hover:ring-accent/40 transition-all shrink-0">
                      <img src={imgMap[p.imgKey] ?? imgMap.p2} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">{p.posCode}</span>
                        <span className="text-sm font-medium truncate">{p.shortName}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ClubBadge club={p.club} size={12} />
                        <span className="text-[11px] text-muted-foreground truncate">{p.club.short}</span>
                      </div>
                    </div>
                    <div className="font-display text-base text-accent shrink-0">{p.rating}</div>
                  </div>
                ))}
                {/* Coach */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-accent/8 border border-accent/20 mt-1">
                  <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-accent/40 shrink-0">
                    <img src={imgMap[coachOfTheWeek.imgKey]} alt={coachOfTheWeek.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-accent bg-accent/15 px-1.5 py-0.5 rounded">COACH</span>
                      <span className="text-sm font-medium truncate">{coachOfTheWeek.name}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ClubBadge club={coachOfTheWeek.club} size={12} />
                      <span className="text-[11px] text-muted-foreground">{coachOfTheWeek.formation}</span>
                    </div>
                  </div>
                  <div className="font-display text-base text-accent shrink-0">8.8</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};