import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useFixtures } from "@/hooks/useFootball";
import { useFeatured } from "@/hooks/useNews";
import { CATEGORY_META } from "@/types/news.types";
import { statusLabel, formatKickoffDate } from "@/utils/football.utils";
import type { Match, MatchDay } from "@/types/football.types";

import chapterThesis from "@/assets/images/actions/img8.png";
import chapterMatch from "@/assets/hero-stadium.jpg";
import chapterStoryFallback from "@/assets/news-1.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// Hero — three editorial "chapters", not a dashboard carousel.
// Chapter I is the evergreen thesis of the platform. Chapters II–III pull real
// live data (today's match, today's lead story) so the front door always
// reflects what is actually happening in the league.
// ─────────────────────────────────────────────────────────────────────────────

interface Chapter {
  key: string;
  roman: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  sub: string;
  cta: { label: string; to: string };
  secondary?: { label: string; to: string };
  image: string;
  focus?: string; // object-position
}

function pickHeadlineMatch(days: MatchDay[] | undefined): Match | undefined {
  if (!days || days.length === 0) return undefined;
  const all = days.flatMap((d) => d.matches);
  const live = all.find((m) => m.status === "LIVE" || m.status === "HT");
  if (live) return live;
  const upcoming = all
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => +new Date(a.kickoffUtc) - +new Date(b.kickoffUtc));
  if (upcoming[0]) return upcoming[0];
  return all[all.length - 1];
}

export const Hero = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { data: fixtureDays } = useFixtures();
  const { data: featured } = useFeatured();

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ["0%", "12%"]);

  const headlineMatch = useMemo(() => pickHeadlineMatch(fixtureDays as MatchDay[] | undefined), [fixtureDays]);
  const leadStory = featured?.[0];

  const chapters: Chapter[] = useMemo(() => {
    const list: Chapter[] = [
      {
        key: "thesis",
        roman: "I",
        eyebrow: "MTN Élite One · Saison 2025 / 26",
        title: "Chaque parcours",
        titleAccent: "écrit une légende.",
        sub: "Le foyer numérique du football camerounais — académies, clubs, Lions Indomptables. Une seule histoire, racontée en continu.",
        cta: { label: "Découvrir la ligue", to: "/clubs" },
        secondary: { label: "Voir le classement", to: "/standings" },
        image: chapterThesis,
        focus: "center 30%",
      },
    ];

    if (headlineMatch) {
      const { text, isLive } = statusLabel(headlineMatch.status, headlineMatch.liveMinute);
      const scoreKnown = headlineMatch.homeScore !== null && headlineMatch.awayScore !== null;
      list.push({
        key: "match",
        roman: "II",
        eyebrow: isLive ? `En direct · ${text}` : `${formatKickoffDate(headlineMatch.kickoffUtc)}`,
        title: headlineMatch.homeClub.name,
        titleAccent: `— ${headlineMatch.awayClub.name}`,
        sub: scoreKnown
          ? `${headlineMatch.homeScore} – ${headlineMatch.awayScore} · Journée ${headlineMatch.round}${headlineMatch.venue ? ` · ${headlineMatch.venue.name}` : ""}`
          : `Journée ${headlineMatch.round}${headlineMatch.venue ? ` · ${headlineMatch.venue.name}` : ""}`,
        cta: { label: isLive ? "Suivre le match" : "Voir le calendrier", to: "/fixtures" },
        secondary: { label: "Classement", to: "/standings" },
        image: chapterMatch,
        focus: "center 60%",
      });
    }

    if (leadStory) {
      const catLabel = CATEGORY_META[leadStory.category]?.label ?? "À la une";
      list.push({
        key: "story",
        roman: list.length === 2 ? "III" : "II",
        eyebrow: catLabel,
        title: leadStory.title,
        sub: leadStory.excerpt,
        cta: { label: "Lire l'histoire", to: `/news/${leadStory.slug}` },
        secondary: { label: "Toute l'actualité", to: "/news" },
        image: leadStory.imageUrl || chapterStoryFallback,
        focus: "center 25%",
      });
    }

    return list;
  }, [headlineMatch, leadStory]);

  const active = chapters[Math.min(idx, chapters.length - 1)];

  const next = useCallback(() => setIdx((p) => (p + 1) % chapters.length), [chapters.length]);

  useEffect(() => {
    if (paused || chapters.length <= 1) return;
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [paused, next, chapters.length]);

  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && chapters.length > 1) {
      setIdx((p) => (diff > 0 ? (p + 1) % chapters.length : (p - 1 + chapters.length) % chapters.length));
    }
  };

  if (!active) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[hsl(168,50%,5%)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Photography layer — full bleed, slow Ken Burns drift ── */}
      <div className="relative min-h-[86svh] lg:min-h-[92svh] max-h-[980px] w-full">
        <AnimatePresence mode="sync">
          <motion.div
            key={active.key}
            className="absolute inset-0"
            style={{ y: bgY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={active.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: active.focus ?? "center" }}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1.12 }}
              transition={{ duration: 9, ease: "linear" }}
            />
            {/* Editorial gradient — legible text, not a heavy wash */}
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(168,50%,4%)] via-[hsl(168,50%,4%)/0.35] to-[hsl(168,50%,4%)/0.15]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(168,50%,4%)/0.75] via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* ── Content ── */}
        <div className="relative z-10 flex h-full min-h-[86svh] lg:min-h-[92svh] max-h-[980px] items-end">
          <div className="container pb-16 pt-32 lg:pb-24 lg:pt-40">
            <div className="max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.key}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-px w-10 bg-accent" />
                    <span className="text-[11px] font-semibold uppercase tracking-[.3em] text-accent">
                      {active.eyebrow}
                    </span>
                  </div>

                  <h1 className="font-display text-[13vw] leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-[5.2rem]">
                    {active.title}
                    {active.titleAccent && (
                      <>
                        <br />
                        <span className="italic text-white/55">{active.titleAccent}</span>
                      </>
                    )}
                  </h1>

                  <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/60 lg:text-base">
                    {active.sub}
                  </p>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <Link
                      to={active.cta.to}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wider text-[hsl(168,50%,7%)] transition-opacity hover:opacity-90"
                    >
                      {active.cta.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    {active.secondary && (
                      <Link
                        to={active.secondary.to}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                      >
                        {active.secondary.label}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Chapter index — vertical, minimal, right edge (desktop) ── */}
        {chapters.length > 1 && (
          <div className="absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex">
            {chapters.map((c, i) => (
              <button
                key={c.key}
                onClick={() => setIdx(i)}
                className="group flex items-center gap-3"
                aria-label={`Chapitre ${c.roman}`}
              >
                <span
                  className={`font-display text-sm transition-colors ${
                    i === idx ? "text-accent" : "text-white/25 group-hover:text-white/50"
                  }`}
                >
                  {c.roman}
                </span>
                <span
                  className={`h-px transition-all duration-500 ${
                    i === idx ? "w-8 bg-accent" : "w-4 bg-white/25 group-hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* ── Chapter index — mobile dots ── */}
        {chapters.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:hidden">
            {chapters.map((c, i) => (
              <button
                key={c.key}
                onClick={() => setIdx(i)}
                aria-label={`Chapitre ${c.roman}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === idx ? "w-6 bg-accent" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
