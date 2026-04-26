import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, ArrowRight, Radio, User, LogIn } from "lucide-react";
import { heroSlides, tickerItems } from "./data";
import { ClubBadge } from "./ClubBadge";
import heroImg from "@/assets/hero-stadium.jpg";
import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";
import l3 from "@/assets/images/halloffame/Thomas_Nkono.png";
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";

const imgMap: Record<string, string> = { p1, p2, p3, l3, yt1, coach1: p2, coach2: p3 };

const DURATION = 7500;

// ─── Live Ticker ──────────────────────────────────────────────────────────────
const LiveTicker = () => {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="bg-[#008751]/90 backdrop-blur border-y border-[#008751] overflow-hidden h-8 flex items-center">
      <div className="shrink-0 flex items-center gap-2 px-4 bg-[#CE1126] h-full z-10">
        <Radio className="h-3 w-3 text-white animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">Live</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex gap-12 animate-[ticker_35s_linear_infinite] whitespace-nowrap">
          {items.map((item, i) => (
            <span key={i} className="text-[11px] text-white/90 font-medium shrink-0">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Progress dot ─────────────────────────────────────────────────────────────
const ProgressDot = ({ active, duration, onClick }: { active: boolean; duration: number; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center h-5" aria-label="Slide">
    <div className={`rounded-full transition-all duration-300 overflow-hidden ${active ? "w-8 h-1.5 bg-white/30" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}>
      {active && (
        <motion.div
          className="h-full bg-white rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </div>
  </button>
);

// ─── Match Card ───────────────────────────────────────────────────────────────
const MatchCard = ({ slide }: { slide: typeof heroSlides[0] }) => {
  if (!slide.home || !slide.away) return null;
  return (
    <motion.div
      key="match-card"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#008751,#CE1126,#FCD116)" }} />
      <div className="text-[10px] uppercase tracking-[.22em] text-white/40 mb-5">{slide.venue}</div>
      <div className="flex items-center justify-between gap-4">
        {[slide.home, slide.away].map((club, ci) => (
          <div key={club.id} className="flex-1 flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <ClubBadge club={club} size={68} />
              <div className="absolute -inset-2 rounded-full blur-xl opacity-35 pointer-events-none" style={{ background: club.color }} />
            </div>
            <div>
              <div className="font-display text-sm text-white leading-tight">{club.name}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{ci === 0 ? "Domicile" : "Extérieur"}</div>
            </div>
          </div>
        ))}
        {/* Center */}
        <div className="shrink-0 text-center absolute left-1/2 -translate-x-1/2">
          {slide.live && slide.score ? (
            <div>
              <div className="font-display text-4xl text-white leading-none">{slide.score}</div>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">{slide.time}</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-display text-2xl text-white/30">VS</div>
              <div className="text-[10px] text-white/40 tracking-widest mt-1">{slide.time}</div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-white/30 uppercase tracking-wider">Elite One · J18</span>
        <button className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
          <Play className="h-3 w-3 fill-current" /> Suivre en direct
        </button>
      </div>
    </motion.div>
  );
};

// ─── Info Card (player / coach / news / hof / young) ──────────────────────────
const InfoCard = ({ slide }: { slide: typeof heroSlides[0] }) => {
  const img = slide.imgKey ? imgMap[slide.imgKey] : null;
  return (
    <motion.div
      key="info-card"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      style={{ minHeight: 280 }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${slide.accent ?? "#FCD116"}, transparent)` }} />
      {img && (
        <>
          <img src={img} alt={slide.title} className="absolute inset-0 w-full h-full object-cover object-top opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        </>
      )}
      <div className="relative p-7 flex flex-col justify-end h-full" style={{ minHeight: 280 }}>
        {slide.tag && (
          <div className="inline-flex items-center gap-2 mb-3 self-start">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: slide.accent ?? "#FCD116" }} />
            <span className="text-[10px] uppercase tracking-[.22em] text-white/50 font-semibold">{slide.tag}</span>
          </div>
        )}
        <div className="font-display text-3xl text-white uppercase leading-tight mb-2">{slide.title}</div>
        <div className="text-sm text-white/50 line-clamp-2 leading-relaxed">{slide.subtitle}</div>
        <button className="mt-5 self-start flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">
          En savoir plus <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Hero ────────────────────────────────────────────────────────────────
export const Hero = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slide = heroSlides[idx];

  // Parallax
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ["0%", "18%"]);

  const next = useCallback(() => setIdx(p => (p + 1) % heroSlides.length), []);
  const prev = useCallback(() => setIdx(p => (p - 1 + heroSlides.length) % heroSlides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, DURATION);
    return () => clearInterval(t);
  }, [paused, next]);

  const isMatch = slide.type === "match";

  return (
    <div>
      {/* ── Ticker ── */}
      <LiveTicker />

      <section
        ref={sectionRef}
        className="relative overflow-hidden border-b border-white/5"
        style={{ minHeight: "calc(100svh - 96px)", maxHeight: 920 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background with parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ y: bgY }}>
            <img src={heroImg} alt="" className="w-full h-full object-cover scale-110" />
          </motion.div>
          {/* Base dark overlay */}
          <div className="absolute inset-0 bg-[hsl(168,50%,5%)/0.72]" />
          {/* Per-slide color wash */}
          <AnimatePresence>
            <motion.div
              key={`wash-${idx}`}
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 80% 55% at 65% 35%, ${slide.accent ?? "#008751"}28, transparent 65%)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4 }}
            />
          </AnimatePresence>
          {/* Cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-transparent to-transparent" />
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)",
            backgroundSize: "64px 64px"
          }} />
        </div>

        {/* Content */}
        <div
          className="relative container flex flex-col justify-between h-full py-12 lg:py-16"
          style={{ minHeight: "calc(100svh - 96px)", maxHeight: 920 }}
        >
          <div className="flex-1 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">

            {/* ── Left — headline ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${idx}`}
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 28 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-5"
              >
                {/* Kicker */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 backdrop-blur px-4 py-1.5">
                    {slide.live && <Radio className="h-3 w-3 text-red-400 animate-pulse" />}
                    <span className="text-[11px] uppercase tracking-[.22em] font-bold" style={{ color: slide.accent ?? "#FCD116" }}>
                      {slide.kicker}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-display text-[clamp(2.6rem,5.8vw,5.2rem)] leading-[0.92] uppercase tracking-tight text-white">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-base md:text-lg text-white/55 max-w-lg leading-relaxed">{slide.subtitle}</p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-[hsl(168,50%,7%)] shadow-lg"
                    style={{ background: slide.accent ?? "#FCD116" }}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {slide.type === "match" ? "Voir le match" : slide.type === "player" || slide.type === "coach" ? "Profil complet" : "Lire l'article"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 backdrop-blur px-6 py-3.5 text-sm font-medium text-white hover:bg-white/15 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </motion.button>
                </div>

                {/* Match stats strip */}
                {slide.type === "match" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-8 pt-2"
                  >
                    {[{ l: "Journée", v: "18 / 34" }, { l: "Buts J18", v: "12" }, { l: "Affluence", v: "22 000" }].map(s => (
                      <div key={s.l}>
                        <div className="font-display text-2xl text-white">{s.v}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/35 mt-0.5">{s.l}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Right — card ── */}
            <div className="hidden lg:block">
              <AnimatePresence mode="wait">
                {isMatch ? <MatchCard key={`mc-${idx}`} slide={slide} /> : <InfoCard key={`ic-${idx}`} slide={slide} />}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Bottom controls ── */}
          <div className="flex items-center gap-4 pt-8">
            <div className="flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <ProgressDot key={i} active={i === idx} duration={DURATION} onClick={() => setIdx(i)} />
              ))}
            </div>
            <span className="text-[11px] text-white/25 tabular-nums font-mono">
              {String(idx + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5 ml-auto">
              {[{ fn: prev, Icon: ChevronLeft }, { fn: next, Icon: ChevronRight }].map(({ fn, Icon }, i) => (
                <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={fn}
                  className="h-10 w-10 grid place-items-center rounded-full border border-white/15 bg-white/8 backdrop-blur text-white hover:bg-white/18 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};