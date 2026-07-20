import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LogIn, Menu, X, ChevronDown, Radio,
  Trophy, Calendar, Users, ArrowLeftRight,
  Activity, Star, Award, BarChart2, Newspaper, Edit3,
  Circle, Shield, Home as HomeIcon, Compass, Landmark,
  Film, BookOpen, Sparkles, Crown, Images, ArrowRight,
} from "lucide-react";
import { tickerItems } from "./data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import fallbackLogo from "@/assets/images/logo/logo.png";
import { layoutApi } from "@/services/layoutApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClubLogo } from "./FootballPrimitives";
import { useFixtures, useStandings, useTopPerformers, useLegends } from "@/hooks/useFootball";
import { useFeatured, useArticles } from "@/hooks/useNews";
import { statusLabel } from "@/utils/football.utils";
import type { Match } from "@/types/football.types";

// ─── Fetch logo URL from backend system-settings ───────────────────────────────
function useDynamicLogo(): string {
  const [logoSrc, setLogoSrc] = useState(fallbackLogo);
  useEffect(() => {
    layoutApi
      .getSystemSettings()
      .then((s) => { if (s?.logo_url) setLogoSrc(s.logo_url); })
      .catch(() => {});
  }, []);
  return logoSrc;
}

// ─── Season progress ──────────────────────────────────────────────────────────
const CURRENT_MATCHDAY = 19;
const TOTAL_MATCHDAYS  = 34;
const SEASON_PROGRESS  = (CURRENT_MATCHDAY / TOTAL_MATCHDAYS) * 100;

// ─── Nav definition ───────────────────────────────────────────────────────────
// Seven pillars of the institution — Home stands alone; everything else opens
// an editorial mega-panel: a curated quick-nav rail + a live "spotlight" drawn
// from real data, never a generic dropdown list.
type NavChild = { label: string; href: string; icon: ReactNode; roles?: string[] };
type NavItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  tagline?: string;
  spotlight?: "competitions" | "clubs" | "players" | "discover" | "legacy" | "media";
  children?: NavChild[];
  accent?: boolean;
};

const NAV_LINKS: NavItem[] = [
  {
    label: "Accueil",
    icon: <HomeIcon className="h-3.5 w-3.5" />,
    href: "/",
  },
  {
    label: "Découvrir",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    href: "/discover",
  },
  {
    label: "Compétitions",
    icon: <Trophy className="h-3.5 w-3.5" />,
    tagline: "La saison, en direct",
    spotlight: "competitions",
    children: [
      { label: "Centre des matchs", href: "/matches",   icon: <Radio     className="h-3.5 w-3.5 text-live" /> },
      { label: "Calendrier",        href: "/fixtures",  icon: <Calendar  className="h-3.5 w-3.5 text-accent" /> },
      { label: "Résultats",         href: "/results",   icon: <Star      className="h-3.5 w-3.5 text-accent" /> },
      { label: "Classement",        href: "/standings", icon: <Trophy    className="h-3.5 w-3.5 text-accent" /> },
      { label: "Statistiques",      href: "/stats",     icon: <BarChart2 className="h-3.5 w-3.5 text-accent" /> },
      { label: "Archives de saison",href: "/history",   icon: <Landmark  className="h-3.5 w-3.5 text-accent" /> },
    ],
  },
  {
    label: "Clubs",
    icon: <Shield className="h-3.5 w-3.5" />,
    tagline: "17 institutions, un championnat",
    spotlight: "clubs",
    children: [
      { label: "Tous les clubs",       href: "/clubs",           icon: <Shield         className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Centre des transferts",href: "/transfers",       icon: <ArrowLeftRight className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Statistiques clubs",   href: "/stats?tab=clubs", icon: <BarChart2      className="h-3.5 w-3.5 text-[#008751]" /> },
    ],
  },
  {
    label: "Joueurs",
    icon: <Users className="h-3.5 w-3.5" />,
    tagline: "Chaque carrière, documentée",
    spotlight: "players",
    children: [
      { label: "Tous les joueurs",        href: "/players",           icon: <Users     className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Passeport Football",      href: "/players",           icon: <BookOpen  className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Road to the Lions",       href: "/lions",             icon: <Crown     className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Young Talent Watch",      href: "/talents",           icon: <Sparkles  className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Transferts",              href: "/transfers",         icon: <ArrowLeftRight className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Centre médical",          href: "/injuries",          icon: <Activity  className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Meilleurs performeurs",   href: "/stats?tab=players", icon: <BarChart2 className="h-3.5 w-3.5 text-[#008751]" /> },
    ],
  },
  {
    label: "Découvrir",
    icon: <Compass className="h-3.5 w-3.5" />,
    tagline: "Le football, raconté",
    accent: true,
    spotlight: "discover",
    children: [
      { label: "The League Journal", href: "/journal",       icon: <Newspaper className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Toutes les histoires", href: "/news",        icon: <Newspaper className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Story Builder (CMS)", href: "/journal/studio", icon: <Edit3   className="h-3.5 w-3.5 text-[#FCD116]" />, roles: ["admin", "editor"] },
    ],
  },
  {
    label: "Héritage",
    icon: <Landmark className="h-3.5 w-3.5" />,
    tagline: "Le musée du football camerounais",
    spotlight: "legacy",
    children: [
      { label: "Hall of Fame",          href: "/halloffame",         icon: <Award    className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Ballon d'Or Camerounais", href: "/awards/ballon-dor", icon: <Trophy   className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Palmarès & récompenses", href: "/awards",             icon: <Award    className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Équipe de la saison",    href: "/awards/team-of-week",icon: <Circle   className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Centre du patrimoine",   href: "/history",            icon: <Landmark className="h-3.5 w-3.5 text-[#FCD116]" /> },
    ],
  },
  {
    label: "Média",
    icon: <Film className="h-3.5 w-3.5" />,
    tagline: "Images, vidéos, archives visuelles",
    spotlight: "media",
    children: [
      { label: "Galerie photo",     href: "/media?tab=gallery", icon: <Images className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Vidéos",            href: "/media?tab=videos",  icon: <Film   className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Toutes les actus",  href: "/news",              icon: <Newspaper className="h-3.5 w-3.5 text-[#FCD116]" /> },
    ],
  },
];

// ─── Live Ticker ──────────────────────────────────────────────────────────────
const LiveTicker = () => {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="flex-1 overflow-hidden min-w-0 flex items-center gap-3">
      <div className="shrink-0 flex items-center gap-1.5 pr-3 border-r border-white/10">
        <Radio className="h-3 w-3 text-[#CE1126] animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#CE1126]">Live</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, ease: "linear", repeat: Infinity }}
        >
          {doubled.map((item, i) => (
            <span key={i} className="text-[11px] text-white/50 shrink-0">
              {item}
              <span className="mx-4 text-white/15">·</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ─── Spotlight skeleton ───────────────────────────────────────────────────────
const SpotlightSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-white/8 bg-white/[0.03] p-5 h-[168px]">
    <div className="h-2.5 w-24 rounded bg-white/10 mb-4" />
    <div className="h-4 w-4/5 rounded bg-white/10 mb-2" />
    <div className="h-4 w-3/5 rounded bg-white/8" />
  </div>
);

const SpotlightShell = ({
  eyebrow, to, onNavigate, children,
}: { eyebrow: string; to: string; onNavigate: () => void; children: ReactNode }) => (
  <Link
    to={to}
    onClick={onNavigate}
    className="group block rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 hover:border-accent/30 hover:from-white/[0.06] transition-all duration-200"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-[9.5px] font-bold uppercase tracking-[.2em] text-accent/80">{eyebrow}</span>
      <ArrowRight className="h-3.5 w-3.5 text-white/25 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
    </div>
    {children}
  </Link>
);

// ─── Spotlight: Compétitions (live / next match) ─────────────────────────────
const CompetitionsSpotlight = ({ onNavigate }: { onNavigate: () => void }) => {
  const { data: matchdays, isLoading } = useFixtures();
  const allMatches = useMemo<Match[]>(() => (matchdays ?? []).flatMap((d) => d.matches), [matchdays]);
  const live = allMatches.find((m) => m.status === "LIVE" || m.status === "HT");
  const upcoming = allMatches.find((m) => m.status === "SCHEDULED");
  const match = live ?? upcoming ?? allMatches[0];

  if (isLoading) return <SpotlightSkeleton />;
  if (!match) return null;

  const { text, isLive } = statusLabel(match.status, match.liveMinute);

  return (
    <SpotlightShell eyebrow={isLive ? "En ce moment" : "Prochain match"} to={live ? `/matches/${match.id}` : "/fixtures"} onNavigate={onNavigate}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ClubLogo club={match.homeClub} size={26} />
          <span className="text-[12px] font-semibold text-white/85 truncate">{match.homeClub.short}</span>
        </div>
        <div className="flex flex-col items-center shrink-0 px-1">
          {isLive ? (
            <span className="font-display text-sm text-white">{match.homeScore} – {match.awayScore}</span>
          ) : (
            <span className="text-[10px] text-white/40">VS</span>
          )}
          <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isLive ? "text-[#CE1126]" : "text-white/35"}`}>{text}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-[12px] font-semibold text-white/85 truncate">{match.awayClub.short}</span>
          <ClubLogo club={match.awayClub} size={26} />
        </div>
      </div>
      <p className="mt-3 text-[11px] text-white/40 font-serif italic">Journée {match.round} · MTN Elite One</p>
    </SpotlightShell>
  );
};

// ─── Spotlight: Clubs (league leader) ─────────────────────────────────────────
const ClubsSpotlight = ({ onNavigate }: { onNavigate: () => void }) => {
  const { data: standings, isLoading } = useStandings();
  const leader = useMemo(() => [...(standings ?? [])].sort((a, b) => a.position - b.position)[0], [standings]);

  if (isLoading) return <SpotlightSkeleton />;
  if (!leader) return null;

  return (
    <SpotlightShell eyebrow="Leader du championnat" to={`/clubs/${leader.club.id}`} onNavigate={onNavigate}>
      <div className="flex items-center gap-3">
        <ClubLogo club={leader.club} size={44} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{leader.club.name}</p>
          <p className="text-[11px] text-white/45">{leader.club.city} · {leader.points} pts · {leader.played} J</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-white/40 font-serif italic">1ʳᵉ place · {leader.won}V {leader.drawn}N {leader.lost}D</p>
    </SpotlightShell>
  );
};

// ─── Spotlight: Joueurs (top scorer) ──────────────────────────────────────────
const PlayersSpotlight = ({ onNavigate }: { onNavigate: () => void }) => {
  const { data, isLoading } = useTopPerformers("goals", 1);
  const top = data?.[0];

  if (isLoading) return <SpotlightSkeleton />;
  if (!top) return null;

  return (
    <SpotlightShell eyebrow="Meilleur buteur" to={`/players/${top.playerId}`} onNavigate={onNavigate}>
      <div className="flex items-center gap-3">
        {top.photoUrl ? (
          <img src={top.photoUrl} alt={top.playerName} className="h-11 w-11 rounded-full object-cover border border-white/10" />
        ) : (
          <div className="h-11 w-11 rounded-full bg-white/8 grid place-items-center text-white/40 text-[10px] font-bold border border-white/10">
            {top.playerName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{top.playerName}</p>
          <p className="text-[11px] text-white/45 truncate">{top.clubName}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-white/40 font-serif italic">{top.value} buts cette saison</p>
    </SpotlightShell>
  );
};

// ─── Spotlight: Découvrir (featured story) ────────────────────────────────────
const DiscoverSpotlight = ({ onNavigate }: { onNavigate: () => void }) => {
  const { data, isLoading } = useFeatured();
  const story = data?.[0];

  if (isLoading) return <SpotlightSkeleton />;
  if (!story) return null;

  return (
    <SpotlightShell eyebrow="À la une" to={`/news/${story.slug}`} onNavigate={onNavigate}>
      <div className="flex gap-3">
        {story.imageUrl && (
          <img src={story.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/10" />
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-serif italic font-semibold text-white leading-snug line-clamp-2">{story.title}</p>
          <p className="mt-1 text-[10.5px] text-white/40 uppercase tracking-wider">{story.category} · {story.readingTime} min</p>
        </div>
      </div>
    </SpotlightShell>
  );
};

// ─── Spotlight: Héritage (legend) ─────────────────────────────────────────────
const LegacySpotlight = ({ onNavigate }: { onNavigate: () => void }) => {
  const { data, isLoading } = useLegends();
  const legend = useMemo(() => {
    const list = (data ?? []) as Array<Record<string, unknown>>;
    if (list.length === 0) return null;
    // Deterministic pick derived from the dataset itself (pure — no Date/Math.random)
    const seed = list.reduce((acc, l, i) => acc + String(l.name ?? i).length, 0);
    return list[seed % list.length];
  }, [data]);

  if (isLoading) return <SpotlightSkeleton />;
  if (!legend) return null;

  const name = (legend.name as string) ?? "Légende";
  const era = (legend.era as string) ?? "";
  const summary = (legend.career_summary as string) ?? (legend.achievement as string) ?? "";
  const image = ((legend.images as string[])?.[0]) ?? (legend.imageUrl as string) ?? undefined;

  return (
    <SpotlightShell eyebrow="Légende du Hall of Fame" to="/halloffame" onNavigate={onNavigate}>
      <div className="flex gap-3">
        {image ? (
          <img src={image} alt={name} className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/10" />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-white/8 grid place-items-center shrink-0 border border-white/10">
            <Crown className="h-6 w-6 text-[#FCD116]/60" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{name}</p>
          {era && <p className="text-[10.5px] text-white/40 uppercase tracking-wider mb-1">{era}</p>}
          {summary && <p className="text-[11px] text-white/45 line-clamp-2 font-serif italic">{summary}</p>}
        </div>
      </div>
    </SpotlightShell>
  );
};

// ─── Spotlight: Média (video / gallery article) ───────────────────────────────
const MediaSpotlight = ({ onNavigate }: { onNavigate: () => void }) => {
  const { data, isLoading } = useArticles({ limit: 12 });
  const withMedia = useMemo(
    () => (data ?? []).find((a) => a.videoUrl || (a.gallery && a.gallery.length > 0)),
    [data],
  );

  if (isLoading) return <SpotlightSkeleton />;
  if (!withMedia) return null;

  const isVideo = !!withMedia.videoUrl;
  const thumb = withMedia.videoThumbnail ?? withMedia.imageUrl ?? withMedia.gallery?.[0];

  return (
    <SpotlightShell eyebrow={isVideo ? "Vidéo en vedette" : "Galerie en vedette"} to={`/news/${withMedia.slug}`} onNavigate={onNavigate}>
      <div className="relative rounded-xl overflow-hidden h-[104px] border border-white/10">
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-white/8" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {isVideo && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-9 w-9 rounded-full bg-black/50 border border-white/30 grid place-items-center">
              <Film className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
        <p className="absolute bottom-2 left-3 right-3 text-[11.5px] font-semibold text-white line-clamp-1">{withMedia.title}</p>
      </div>
    </SpotlightShell>
  );
};

const SPOTLIGHTS: Record<NonNullable<NavItem["spotlight"]>, (p: { onNavigate: () => void }) => ReactNode> = {
  competitions: CompetitionsSpotlight,
  clubs: ClubsSpotlight,
  players: PlayersSpotlight,
  discover: DiscoverSpotlight,
  legacy: LegacySpotlight,
  media: MediaSpotlight,
};

// ─── Desktop mega-menu item ───────────────────────────────────────────────────
const NavMegaItem = ({ link, user }: { link: NavItem; user: StoredUser }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Direct link — Home
  if (!link.children) {
    const isActive = location.pathname === link.href;
    return (
      <Link
        to={link.href!}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
          isActive ? "text-accent bg-accent/10" : "text-white/60 hover:text-white hover:bg-white/6"
        }`}
      >
        {link.icon}
        {link.label}
        {isActive && <span className="h-1 w-1 rounded-full bg-accent ml-0.5" />}
      </Link>
    );
  }

  const visibleChildren = link.children.filter(
    (c) => !c.roles || (user?.role && c.roles.includes(user.role)),
  );
  const Spotlight = link.spotlight ? SPOTLIGHTS[link.spotlight] : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
          open
            ? "text-white bg-white/8"
            : link.accent
            ? "text-[#FCD116]/80 hover:text-[#FCD116] hover:bg-[#FCD116]/8"
            : "text-white/60 hover:text-white hover:bg-white/6"
        }`}
      >
        {link.icon}
        {link.label}
        {link.accent && !open && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#FCD116] shrink-0" />}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 top-[90px] z-50 flex justify-center px-4"
          >
            <div className="w-full max-w-3xl bg-[#07190e]/98 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden">
              <div className="h-[2px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />
              <div className="grid md:grid-cols-[240px_1fr]">
                <nav className="p-5 space-y-0.5 border-b md:border-b-0 md:border-r border-white/8">
                  {link.tagline && (
                    <p className="px-3 pb-3 text-[10px] font-serif italic text-white/35 uppercase tracking-wider">
                      {link.tagline}
                    </p>
                  )}
                  {visibleChildren.map((child, i) => (
                    <Link
                      key={i}
                      to={child.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] text-white/60 hover:text-white hover:bg-white/6 transition-all"
                    >
                      <span className="shrink-0 h-7 w-7 grid place-items-center rounded-lg bg-white/5">{child.icon}</span>
                      {child.label}
                    </Link>
                  ))}
                </nav>
                {Spotlight && (
                  <div className="p-5">
                    <Spotlight onNavigate={() => setOpen(false)} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mobile accordion item ────────────────────────────────────────────────────
const MobileNavItem = ({
  link, onClose, user,
}: { link: NavItem; onClose: () => void; user: StoredUser }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (!link.children) {
    const isActive = location.pathname === link.href;
    return (
      <Link
        to={link.href!}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
          isActive ? "bg-accent/10 text-accent" : "text-white/65 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className={`h-7 w-7 grid place-items-center rounded-lg shrink-0 ${isActive ? "bg-accent/15" : "bg-white/5"}`}>
          {link.icon}
        </span>
        {link.label}
        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
      </Link>
    );
  }

  const visibleChildren = link.children.filter(
    (c) => !c.roles || (user?.role && c.roles.includes(user.role)),
  );

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          open ? "bg-white/6 text-white" : "text-white/65 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className={`h-7 w-7 grid place-items-center rounded-lg shrink-0 ${link.accent ? "bg-[#FCD116]/15" : "bg-white/5"}`}>
          {link.icon}
        </span>
        <span className={`flex-1 text-sm text-left ${link.accent ? "text-[#FCD116]" : ""}`}>{link.label}</span>
        {link.accent && !open && <span className="h-1.5 w-1.5 rounded-full bg-[#FCD116]" />}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-10 border-l border-white/8 pl-4 py-1 space-y-0.5">
              {visibleChildren.map((child, i) => (
                <Link
                  key={i}
                  to={child.href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  {child.icon}
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type StoredUser = { name?: string; role?: string; avatarUrl?: string } | null;

function getStoredUser(): StoredUser {
  try {
    const raw = localStorage.getItem('mtn_user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

const getUserInitials = (name?: string) => {
  if (!name) return "UI";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "UI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getUserDashboardPath = (role?: string) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'editor': return '/dashboard';
    default: return '/dashboard';
  }
};

const getDashboardLabel = (role?: string) => {
  switch (role) {
    case 'admin': return 'Tableau de bord';
    case 'editor': return "Espace éditeur";
    default: return 'Accueil';
  }
};

// ─── Mobile drawer ────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose, logo, user, onLogout }: { open: boolean; onClose: () => void; logo: string; user: StoredUser; onLogout: () => void }) => {
  const navigate = useNavigate();
  const onDashboard = () => {
    navigate(getUserDashboardPath(user?.role));
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 w-[300px] bg-[#05140B]/98 backdrop-blur-md border-l border-white/10 z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Elite One" className="h-8 w-8 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackLogo; }} />
                <div>
                  <div className="font-display text-xs tracking-widest leading-none">MTN ELITE ONE</div>
                  <div className="text-[9px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider">Saison 25/26</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Matchday pill */}
            <div className="mx-4 mt-4 flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
              <span className="text-[11px] text-muted-foreground">Journée en cours</span>
              <span className="font-display text-sm text-accent">J{CURRENT_MATCHDAY} / {TOTAL_MATCHDAYS}</span>
            </div>

            {/* Season progress bar */}
            <div className="mx-4 mt-2.5 h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]"
                initial={{ width: "0%" }}
                animate={{ width: `${SEASON_PROGRESS}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_LINKS.map((link, i) => (
                <MobileNavItem key={i} link={link} onClose={onClose} user={user} />
              ))}
            </nav>

            {/* Auth */}
            <div className="px-4 pb-6 pt-3 border-t border-white/8 space-y-2.5">
              {user ? (
                <>
                  <button
                    onClick={onDashboard}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-accent/30 bg-accent/5 text-sm text-accent font-bold hover:bg-accent/10 transition-all"
                  >
                    🏟️ Mon espace personnel
                  </button>
                  {user?.role === 'editor' && (
                    <Link
                      to="/editor" onClick={onClose}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-white/12 text-sm text-white/70 hover:bg-white/5 transition-all"
                    >
                      ✍️ Console éditeur
                    </Link>
                  )}
                  <button
                    onClick={() => { onLogout(); onClose(); }}
                    className="flex items-center justify-center w-full py-3 rounded-2xl bg-red-500/10 text-red-300 text-sm font-bold hover:bg-red-500/15 transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login" onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-white/12 text-sm text-white/70 hover:bg-white/5 transition-all"
                  >
                    <LogIn className="h-4 w-4" /> Connexion
                  </Link>
                  <Link
                    to="/register" onClick={onClose}
                    className="flex items-center justify-center w-full py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    S'inscrire — C'est gratuit
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
interface NavbarProps {
  onSearchOpen?: () => void;
}

export const Navbar = ({ onSearchOpen }: NavbarProps) => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser]             = useState<StoredUser>(() => getStoredUser());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const logo = useDynamicLogo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('mtn_token');
    localStorage.removeItem('mtn_user');
    window.dispatchEvent(new Event('storage'));
    setUser(null);
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleDashboard = () => {
    const path = getUserDashboardPath(user?.role);
    setUserMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Season progress bar — top of viewport */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-white/4">
        <motion.div
          className="h-full bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]"
          initial={{ width: "0%" }}
          animate={{ width: `${SEASON_PROGRESS}%` }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        />
      </div>

      <header
        className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#05140B]/92 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.45)]"
            : "bg-[#05140B]/70 backdrop-blur-md border-b border-white/5"
        }`}
      >
        {/* ── Row 1: Brand + Ticker + Actions ────────────────────────────────── */}
        <div className="container mx-auto px-4 flex items-center gap-3 h-12">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-8 w-8 shrink-0">
              <img
                src={logo}
                alt="MTN Elite One"
                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[12px] tracking-[.1em] text-white">
                MTN ELITE ONE
              </span>
              <span className="text-[8.5px] uppercase tracking-[.2em] text-white/35 mt-0.5">
                Saison 25/26
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-4 w-px bg-white/10 mx-0.5" />

          {/* Live ticker — only on md+ */}
          <div className="hidden md:flex flex-1 items-center min-w-0 overflow-hidden">
            <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 overflow-hidden">
              <LiveTicker />
            </div>
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white hover:bg-white/8 transition-all text-[11px] group"
              aria-label="Rechercher"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-white/40 group-hover:text-white/70 transition-colors">
                Rechercher
              </span>
              <kbd className="hidden xl:inline px-1.5 py-0.5 rounded bg-white/8 text-[9px] font-mono text-white/25 border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Connexion / user menu */}
            {user ? (
              <div ref={userMenuRef} className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 h-8 px-3 rounded-xl text-[11px] font-medium text-white/70 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
                  aria-expanded={userMenuOpen}
                >
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name ?? 'Avatar'} />
                    ) : (
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="truncate max-w-[110px] text-left text-[11px] font-medium">
                    {user.name || 'Mon compte'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-[#07190e]/96 backdrop-blur-md shadow-2xl overflow-hidden z-50"
                    >
                      <button
                        onClick={handleDashboard}
                        className="w-full text-left px-4 py-3 text-[12px] text-white/80 hover:bg-white/5 transition-colors"
                      >
                        {getDashboardLabel(user.role)}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-[12px] text-red-300 hover:bg-white/5 transition-colors"
                      >
                        Se déconnecter
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-medium text-white/55 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Connexion</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex items-center h-8 px-3.5 rounded-xl bg-accent text-accent-foreground text-[11px] font-bold hover:bg-accent/90 transition-colors shadow-[0_2px_12px_rgba(252,209,22,0.2)]"
                >
                  S'inscrire
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/os"
                title="Administration CMS"
                className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-[11px] font-medium text-accent/70 hover:text-accent border border-accent/10 hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden h-8 w-8 grid place-items-center rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Row 2: Desktop nav links ─────────────────────────────────────── */}
        <div className="hidden lg:block border-t border-white/[0.06]">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-0.5 h-10">
              {NAV_LINKS.map((link, i) => (
                <NavMegaItem key={i} link={link} user={user} />
              ))}

              {/* Matchday info — pushed right */}
              <div className="ml-auto flex items-center gap-2 text-[11px] text-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#CE1126] animate-pulse" />
                <span>J{CURRENT_MATCHDAY}/{TOTAL_MATCHDAYS}</span>
                <div className="h-3 w-[60px] rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#008751] to-[#FCD116]"
                    style={{ width: `${SEASON_PROGRESS}%` }}
                  />
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* ── Mobile ticker row ───────────────────────────────────────────── */}
        <div className="md:hidden overflow-hidden border-t border-white/[0.04] bg-white/[0.02] px-4 py-1.5">
          <LiveTicker />
        </div>
      </header>

      {/* Spacer — accounts for 2-row header on desktop, 1-row on mobile */}
      <div className="h-[62px] lg:h-[90px]" />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        logo={logo}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};
