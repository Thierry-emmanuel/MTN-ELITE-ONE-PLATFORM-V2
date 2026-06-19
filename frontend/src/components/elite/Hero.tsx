import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Play, ArrowRight, Radio, Zap } from "lucide-react";
import { heroSlides } from "./data";
import { ClubBadge } from "./ClubBadge";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-stadium.jpg";
import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";
import l3 from "@/assets/images/halloffame/Thomas_Nkono.png";
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";
import n1 from "@/assets/news-1.jpg";

const imgMap: Record<string, string> = { p1, p2, p3, l3, yt1, coach1: p2, coach2: p3 };

// ─── Reduce hero to 3 high-impact slides ─────────────────────────────────────
// Slide 1 = match/live, Slide 2 = player, Slide 3 = news
const HERO_SLIDES = [
  heroSlides[1], // Live match (PWD vs Union Douala)
  heroSlides[2], // Player (Salomon Mbarga)
  heroSlides[4], // News (5 Élite One aux Lions)
];

// ─── Tab labels for the 3 slides ─────────────────────────────────────────────
const TAB_LABELS = ["Match en direct", "Joueur du mois", "Actualités"];

// ─── Per-slide background images ─────────────────────────────────────────────
const SLIDE_BACKGROUNDS: Record<number, string> = {
  0: heroImg,  // stadium
  1: p2,       // player full-bleed
  2: n1,       // editorial news image
};

// ─── Live Match Split Screen ──────────────────────────────────────────────────
const LiveMatchHero = ({ slide }: { slide: typeof HERO_SLIDES[0] }) => {
  if (!slide.home || !slide.away) return null;
  return (
    <div className="w-full h-full grid lg:grid-cols-2 min-h-[calc(100svh-96px)] max-h-[900px]">
      {/* Left — Match data */}
      <div className="relative flex flex-col justify-center px-8 lg:px-16 py-12 z-10">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 self-start mb-6 px-4 py-2 rounded-full bg-[#CE1126]/15 border border-[#CE1126]/30"
        >
          <span className="h-2 w-2 rounded-full bg-[#CE1126] animate-pulse" />
          <Radio className="h-3.5 w-3.5 text-[#CE1126]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#CE1126]">En direct · {slide.time}</span>
        </motion.div>

        {/* Venue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] uppercase tracking-[.22em] text-white/35 mb-6"
        >
          {slide.venue}
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-8 mb-10"
        >
          {/* Home */}
          <div className="flex flex-col items-center gap-3 text-center flex-1">
            <div className="relative">
              <ClubBadge club={slide.home} size={72} />
              <div className="absolute -inset-3 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ background: slide.home.color }} />
            </div>
            <div>
              <div className="font-display text-base text-white leading-tight">{slide.home.name}</div>
              <div className="text-[10px] text-white/30 uppercase mt-0.5">Domicile</div>
            </div>
          </div>

          {/* Score display */}
          <div className="flex flex-col items-center shrink-0">
            <div className="font-display text-6xl lg:text-7xl text-white leading-none tracking-tight">
              {slide.score ?? "0 - 0"}
            </div>
            <div className="mt-3 text-[11px] text-white/40 uppercase tracking-widest">Journée 18</div>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-3 text-center flex-1">
            <div className="relative">
              <ClubBadge club={slide.away} size={72} />
              <div className="absolute -inset-3 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ background: slide.away.color }} />
            </div>
            <div>
              <div className="font-display text-base text-white leading-tight">{slide.away.name}</div>
              <div className="text-[10px] text-white/30 uppercase mt-0.5">Extérieur</div>
            </div>
          </div>
        </motion.div>

        {/* Timeline events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-2"
        >
          <div className="text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-2 mb-3">
            <Zap className="h-3 w-3" /> Événements
          </div>
          {[
            { min: "23'", event: "But · Souaibou (PWD) — Pénalty",       type: 'goal'   },
            { min: "41'", event: "Carton jaune · Ngando (UDS)",           type: 'yellow' },
            { min: "58'", event: "But · Etame (UDS) — Contre-attaque",   type: 'goal'   },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
              <span className="text-[10px] tabular-nums text-accent font-bold w-7 shrink-0">{e.min}</span>
              <span className={`h-2 w-2 rounded-full shrink-0 ${
                e.type === 'goal' ? 'bg-[#10B981]' : 'bg-[#FCD116]'
              }`} />
              <span className="text-xs text-white/60">{e.event}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CE1126] text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <Play className="h-3.5 w-3.5 fill-current" /> Suivre en direct
          </button>
          <Link to="/matches" className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-colors">
            Stats complètes
          </Link>
        </motion.div>
      </div>

      {/* Right — Stadium image */}
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImg} alt="Stadium" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[hsl(168,50%,5%)/0.7]" />
        {/* Mock stream overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 text-center">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 grid place-items-center mx-auto mb-3">
              <Play className="h-5 w-5 text-white fill-current" />
            </div>
            <div className="text-sm font-display text-white/80">Streaming disponible</div>
            <div className="text-[11px] text-white/30 mt-1">Connexion requise</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Player Slide ─────────────────────────────────────────────────────────────
const PlayerSlide = ({ slide }: { slide: typeof HERO_SLIDES[0] }) => {
  const img = slide.imgKey ? imgMap[slide.imgKey] : null;
  return (
    <div className="relative w-full flex items-center min-h-[calc(100svh-96px)] max-h-[900px]">
      {/* Full-bleed player image */}
      {img && (
        <div className="absolute inset-0">
          <img src={img} alt={slide.title} className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(168,50%,5%)/0.92] via-[hsl(168,50%,5%)/0.55] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-transparent to-transparent opacity-80" />
        </div>
      )}

      {/* Content */}
      <div className="relative container py-16 flex flex-col max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-4 self-start"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: slide.accent ?? "#FCD116" }} />
          <span className="text-[10px] uppercase tracking-[.22em] text-white/40 font-semibold">{slide.kicker}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] uppercase tracking-tight text-white mb-4"
        >
          {slide.title}
        </motion.h1>

        {slide.tag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="inline-flex items-center gap-2 self-start mb-4 px-3 py-1 rounded-full border text-[11px] font-semibold"
            style={{ borderColor: `${slide.accent}40`, color: slide.accent, background: `${slide.accent}10` }}
          >
            {slide.tag}
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="text-base text-white/50 max-w-md leading-relaxed mb-8"
        >
          {slide.subtitle}
        </motion.p>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10"
        >
          {[{ l: "Buts", v: "14" }, { l: "Matchs", v: "17" }, { l: "Note moy.", v: "8.9" }].map(s => (
            <div key={s.l}>
              <div className="font-display text-3xl text-white">{s.v}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">{s.l}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 flex-wrap"
        >
          <button
            className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-[hsl(168,50%,7%)] shadow-lg"
            style={{ background: slide.accent ?? "#FCD116" }}
          >
            <Play className="h-4 w-4 fill-current" />
            Profil complet
          </button>
          <Link to="/players"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 backdrop-blur px-6 py-3.5 text-sm font-medium text-white hover:bg-white/15 transition-colors">
            Tous les joueurs <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

// ─── News Slide ───────────────────────────────────────────────────────────────
const NewsSlide = ({ slide }: { slide: typeof HERO_SLIDES[0] }) => (
  <div className="relative w-full flex items-center min-h-[calc(100svh-96px)] max-h-[900px]">
    {/* Editorial background */}
    <div className="absolute inset-0">
      <img src={n1} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(168,50%,4%)/0.96] via-[hsl(168,50%,4%)/0.75] to-[hsl(168,50%,4%)/0.45]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,5%)] via-transparent to-transparent opacity-60" />
    </div>

    {/* Content — editorial style */}
    <div className="relative container py-16">
      <div className="max-w-2xl">
        {/* Category tag */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-[#008751] text-white text-[10px] font-bold uppercase tracking-widest"
        >
          CMR · {slide.kicker}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.92] uppercase tracking-tight text-white mb-5"
        >
          {slide.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="text-lg text-white/55 max-w-xl leading-relaxed mb-8"
        >
          {slide.subtitle}
        </motion.p>

        {/* Article meta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-4 mb-8 text-xs text-white/30 uppercase tracking-wider"
        >
          <span>22 Avril 2025</span>
          <span className="opacity-40">·</span>
          <span>5 min de lecture</span>
          <span className="opacity-40">·</span>
          <span>Sélection nationale</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex gap-3"
        >
          <button className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold bg-[#FCD116] text-[hsl(168,50%,7%)] shadow-lg hover:opacity-90 transition-opacity">
            <ArrowRight className="h-4 w-4" />
            Lire l'article
          </button>
          <Link to="/community/news"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 backdrop-blur px-6 py-3.5 text-sm font-medium text-white hover:bg-white/15 transition-colors">
            Toutes les news
          </Link>
        </motion.div>
      </div>
    </div>
  </div>
);

// ─── Tab Navigation ───────────────────────────────────────────────────────────
const TabNav = ({
  idx, onChange,
}: { idx: number; onChange: (i: number) => void }) => (
  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[hsl(168,50%,5%)/0.7] to-transparent pt-8 pb-5">
    <div className="container flex items-end gap-3 flex-wrap">
      {TAB_LABELS.map((label, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            i === idx
              ? "bg-white/10 backdrop-blur text-white border border-white/20"
              : "text-white/35 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          {i === 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#CE1126] animate-pulse shrink-0" />
          )}
          {label}
          {/* Active tab progress bar */}
          {i === idx && (
            <motion.span
              key={`progress-${idx}`}
              className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-accent origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 7.5, ease: "linear" }}
            />
          )}
        </button>
      ))}

      <div className="ml-auto font-mono text-[11px] text-white/20 tabular-nums">
        {String(idx + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
      </div>
    </div>
  </div>
);

// ─── Main Hero ────────────────────────────────────────────────────────────────
export const Hero = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slide = HERO_SLIDES[idx];
  const isLive = slide.type === "match" && slide.live;

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ["0%", "14%"]);

  const next = useCallback(() => setIdx(p => (p + 1) % HERO_SLIDES.length), []);

  // Auto-advance — disabled when live match is showing
  useEffect(() => {
    if (paused || isLive) return;
    const t = setInterval(next, 7500);
    return () => clearInterval(t);
  }, [paused, isLive, next]);

  // Touch/swipe support
  const touchStart = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setIdx(p => diff > 0 ? (p + 1) % HERO_SLIDES.length : (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Shared background layer with parallax (only for non-player slides) ── */}
      {idx !== 1 && (
        <motion.div className="absolute inset-0 z-0 overflow-hidden" style={{ y: bgY }}>
          <div
            className="absolute inset-0 scale-110 transition-none"
            style={{
              backgroundImage: `url(${SLIDE_BACKGROUNDS[idx]})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[hsl(168,50%,5%)/0.72]" />
          {/* Per-slide color wash */}
          <AnimatePresence>
            <motion.div
              key={`wash-${idx}`}
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 80% 55% at 65% 35%, ${slide.accent ?? "#008751"}26, transparent 65%)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            />
          </AnimatePresence>
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.25) 1px,transparent 1px)",
            backgroundSize: "64px 64px"
          }} />
        </motion.div>
      )}

      {/* ── Per-slide content (full bleed) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`slide-${idx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10"
        >
          {isLive ? (
            // Live match: split-screen, no carousel
            <div className="relative">
              <div className="absolute inset-0 bg-[hsl(168,50%,5%)]" />
              <LiveMatchHero slide={slide} />
            </div>
          ) : idx === 1 ? (
            // Player: full-bleed player photo
            <PlayerSlide slide={slide} />
          ) : (
            // News: editorial style
            <NewsSlide slide={slide} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Tab navigation ── */}
      <TabNav
        idx={idx}
        onChange={setIdx}
      />
    </section>
  );
};