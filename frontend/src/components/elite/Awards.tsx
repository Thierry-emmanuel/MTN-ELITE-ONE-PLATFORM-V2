import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Trophy, Star, Vote, ChevronLeft, ChevronRight, Check, Users, UserCheck } from "lucide-react";
import { awards, teamOfTheWeek, coachOfTheWeek, type AwardCategory } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";

const imgMap: Record<string, string> = { p1, p2, p3, yt1, coach1: p2, coach2: p3 };

// ─── Rating Ring ──────────────────────────────────────────────────────────────
const RatingRing = ({ value, size = 52 }: { value: number; size?: number }) => {
  const r = size * 0.38, c = 2 * Math.PI * r;
  const pct = (value / 10) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#FCD116" strokeWidth="2.5"
          strokeDasharray={`${pct} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-xs text-white">{value.toFixed(1)}</span>
      </div>
    </div>
  );
};

// ─── Award Card ───────────────────────────────────────────────────────────────
const AwardCard = ({
  award, voted, onVote,
}: { award: typeof awards[0]; voted: boolean; onVote: () => void }) => (
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
      <div className="flex items-end justify-between gap-2 mb-3">
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

      {award.isVotingOpen && (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onVote}
          className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            voted ? "bg-win/15 border border-win/30 text-win" : "bg-accent text-accent-foreground hover:opacity-90"
          }`}
        >
          {voted ? <><Check className="h-3.5 w-3.5" /> Voté !</> : <><Vote className="h-3.5 w-3.5" /> {(award.votes ?? 0).toLocaleString()} votes</>}
        </motion.button>
      )}
    </div>
  </motion.div>
);

// ─── Carousel Row ─────────────────────────────────────────────────────────────
const CarouselRow = ({ items, voted, onVote }: { items: typeof awards; voted: boolean; onVote: () => void }) => {
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
            <AwardCard award={a} voted={voted} onVote={onVote} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Pitch Formation ──────────────────────────────────────────────────────────
const PitchPlayer = ({ player }: { player: typeof teamOfTheWeek[0] }) => (
  <div className="flex flex-col items-center gap-1 group cursor-pointer">
    <div className="relative">
      <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-accent/60 transition-all">
        <img
          src={imgMap[player.imgKey] ?? imgMap.p2}
          alt={player.name}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      {/* Rating badge */}
      <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-full w-5 h-5 grid place-items-center leading-none">
        {player.rating.toFixed(1).replace(".", "")}
      </div>
    </div>
    <div className="text-center">
      <div className="text-[10px] bg-black/50 backdrop-blur text-white px-1.5 py-0.5 rounded font-bold leading-none">{player.posCode}</div>
      <div className="text-[10px] text-white font-semibold mt-0.5 drop-shadow leading-tight max-w-[64px] text-center">{player.shortName}</div>
    </div>
  </div>
);

const Formation433 = () => {
  // Group by row
  const rows: Record<number, typeof teamOfTheWeek> = {};
  teamOfTheWeek.forEach(p => { if (!rows[p.row]) rows[p.row] = []; rows[p.row].push(p); });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-white/10"
      style={{ background: "linear-gradient(180deg, #1a5c2a 0%, #1e6b30 40%, #1a5c2a 100%)" }}
    >
      {/* Pitch markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 520" preserveAspectRatio="none">
        {/* Outer border */}
        <rect x="20" y="20" width="360" height="480" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" rx="4" />
        {/* Center circle */}
        <circle cx="200" cy="260" r="50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="200" cy="260" r="2" fill="rgba(255,255,255,0.25)" />
        {/* Halfway line */}
        <line x1="20" y1="260" x2="380" y2="260" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Penalty areas */}
        <rect x="100" y="20" width="200" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="100" y="410" width="200" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Goal areas */}
        <rect x="155" y="20" width="90" height="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="155" y="460" width="90" height="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Penalty spots */}
        <circle cx="200" cy="90" r="3" fill="rgba(255,255,255,0.25)" />
        <circle cx="200" cy="430" r="3" fill="rgba(255,255,255,0.25)" />
        {/* Corner arcs */}
        {[[20,20],[380,20],[20,500],[380,500]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {/* Grass stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="20" y={20 + i * 60} width="360" height="30" fill={i % 2 === 0 ? "rgba(0,0,0,0.06)" : "transparent"} />
        ))}
      </svg>

      {/* Players — 4 rows: ATT, MID, DEF, GK */}
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

// ─── Category tab config ──────────────────────────────────────────────────────
const CATS: { id: AwardCategory | "totw"; label: string; icon: React.ReactNode }[] = [
  { id: "player", label: "Joueurs",  icon: <Star className="h-3.5 w-3.5" /> },
  { id: "coach",  label: "Coaches",  icon: <UserCheck className="h-3.5 w-3.5" /> },
  { id: "totw",   label: "Équipe",   icon: <Users className="h-3.5 w-3.5" /> },
];

// ─── Main Awards ──────────────────────────────────────────────────────────────
export const Awards = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [cat, setCat] = useState<AwardCategory | "totw">("player");
  const [voted, setVoted] = useState(false);

  const playerAwards = awards.filter(a => a.category === "player");
  const coachAwards  = awards.filter(a => a.category === "coach");

  return (
    <section ref={ref} className="container py-10 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
        {/* Header + tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeader eyebrow="Récompenses" title="Awards de la Saison" />
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

        <AnimatePresence mode="wait">
          {cat === "player" && (
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CarouselRow items={playerAwards} voted={voted} onVote={() => setVoted(true)} />
            </motion.div>
          )}

          {cat === "coach" && (
            <motion.div key="coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CarouselRow items={coachAwards} voted={voted} onVote={() => setVoted(true)} />
            </motion.div>
          )}

          {cat === "totw" && (
            <motion.div key="totw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="grid lg:grid-cols-[1fr_320px] gap-6">
              {/* Left: formation */}
              <Formation433 />
              {/* Right: player list */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Composition · J18</div>
                {teamOfTheWeek.map(p => (
                  <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface/60 border border-border hover:bg-surface-elevated/60 hover:border-accent/25 transition-all group cursor-pointer">
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
                  <div className="font-display text-base text-accent shrink-0">{(8.8).toFixed(1)}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};