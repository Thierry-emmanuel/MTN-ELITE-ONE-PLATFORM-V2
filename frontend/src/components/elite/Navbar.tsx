import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LogIn, Menu, X, ChevronDown, Radio,
  Trophy, Calendar, Users, ArrowLeftRight,
  Activity, Star, Award, BarChart2, Newspaper, Edit3,
  Vote, Circle, Shield,
} from "lucide-react";
import { tickerItems } from "./data";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/images/logo/logo.png";

// ─── Season progress ──────────────────────────────────────────────────────────
const CURRENT_MATCHDAY = 19;
const TOTAL_MATCHDAYS  = 34;
const SEASON_PROGRESS  = (CURRENT_MATCHDAY / TOTAL_MATCHDAYS) * 100;

// ─── Nav definition ───────────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    label: "Championnat",
    icon: <Trophy className="h-3.5 w-3.5" />,
    children: [
      { label: "Matchs",     href: "/matches",   icon: <Radio     className="h-3.5 w-3.5 text-live" /> },
      { label: "Classement", href: "/standings", icon: <Trophy    className="h-3.5 w-3.5 text-accent" /> },
      { label: "Résultats",  href: "/results",   icon: <Star      className="h-3.5 w-3.5 text-accent" /> },
      { label: "Calendrier", href: "/fixtures",  icon: <Calendar  className="h-3.5 w-3.5 text-accent" /> },
    ],
  },
  {
    label: "Statistiques",
    icon: <BarChart2 className="h-3.5 w-3.5" />,
    href: "/stats",
  },
  {
    label: "Clubs",
    icon: <Shield className="h-3.5 w-3.5" />,
    children: [
      { label: "Tous les clubs", href: "/clubs",     icon: <Shield        className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Joueurs",        href: "/players",   icon: <Star          className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Transferts",     href: "/transfers", icon: <ArrowLeftRight className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Blessures",      href: "/injuries",  icon: <Activity      className="h-3.5 w-3.5 text-[#008751]" /> },
      { label: "Road to Lions",  href: "/lions",     icon: <Award         className="h-3.5 w-3.5 text-[#008751]" /> },
    ],
  },
  {
    label: "Actualités",
    icon: <Newspaper className="h-3.5 w-3.5" />,
    accent: true,
    children: [
      { label: "The League Journal", href: "/journal",        icon: <Newspaper className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Toutes les actus",   href: "/news",            icon: <Newspaper className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Espace éditeur",     href: "/editor",          icon: <Edit3     className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Story Builder (CMS)",href: "/journal/studio",  icon: <Edit3     className="h-3.5 w-3.5 text-[#FCD116]" /> },
    ],
  },
  {
    label: "Récompenses",
    icon: <Award className="h-3.5 w-3.5" />,
    children: [
      { label: "Palmarès",          href: "/awards",              icon: <Award   className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Ballon d'Or",       href: "/awards/ballon-dor",   icon: <Trophy  className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Équipe de la sem.", href: "/awards/team-of-week", icon: <Circle  className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Voter maintenant",  href: "/awards/vote",         icon: <Vote    className="h-3.5 w-3.5 text-[#FCD116]" /> },
    ],
  },
  {
    label: "Communauté",
    icon: <Users className="h-3.5 w-3.5" />,
    children: [
      { label: "Young Talents",  href: "/talents",    icon: <Star          className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Musée & Archives", href: "/history",  icon: <Trophy        className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Hall of Fame",   href: "/halloffame", icon: <Award         className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Transferts",     href: "/transfers",  icon: <ArrowLeftRight className="h-3.5 w-3.5 text-[#FCD116]" /> },
      { label: "Blessures",      href: "/injuries",   icon: <Activity      className="h-3.5 w-3.5 text-[#FCD116]" /> },
    ],
  },
] as const;

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

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────
const NavDropdown = ({ link }: { link: (typeof NAV_LINKS)[number] }) => {
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

  // Direct link (no children)
  if (!("children" in link)) {
    const isActive = location.pathname === link.href;
    return (
      <Link
        to={link.href}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
          isActive
            ? "text-accent bg-accent/10"
            : "text-white/60 hover:text-white hover:bg-white/6"
        }`}
      >
        {link.icon}
        {link.label}
        {isActive && <span className="h-1 w-1 rounded-full bg-accent ml-0.5" />}
      </Link>
    );
  }

  const isAccent = "accent" in link && link.accent;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
          open
            ? "text-white bg-white/8"
            : isAccent
            ? "text-[#FCD116]/80 hover:text-[#FCD116] hover:bg-[#FCD116]/8"
            : "text-white/60 hover:text-white hover:bg-white/6"
        }`}
      >
        {link.icon}
        {link.label}
        {isAccent && !open && (
          <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#FCD116] shrink-0" />
        )}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 mt-2 min-w-[200px] bg-[#07190e]/96 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {isAccent && (
              <div className="h-[2px] bg-gradient-to-r from-[#FCD116] via-[#FCD116]/60 to-transparent" />
            )}
            {link.children.map((child, i) => (
              <Link
                key={i}
                to={child.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-white/55 hover:text-white hover:bg-white/6 transition-all border-b border-white/5 last:border-0"
              >
                <span className="shrink-0 h-6 w-6 grid place-items-center rounded-lg bg-white/5">
                  {child.icon}
                </span>
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mobile accordion item ────────────────────────────────────────────────────
const MobileNavItem = ({
  link, onClose,
}: { link: (typeof NAV_LINKS)[number]; onClose: () => void }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (!("children" in link)) {
    const isActive = location.pathname === link.href;
    return (
      <Link
        to={link.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
          isActive
            ? "bg-accent/10 text-accent"
            : "text-white/65 hover:text-white hover:bg-white/5"
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

  const isAccent = "accent" in link && link.accent;

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          open ? "bg-white/6 text-white" : "text-white/65 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className={`h-7 w-7 grid place-items-center rounded-lg shrink-0 ${isAccent ? "bg-[#FCD116]/15" : "bg-white/5"}`}>
          {link.icon}
        </span>
        <span className={`flex-1 text-sm text-left ${isAccent ? "text-[#FCD116]" : ""}`}>
          {link.label}
        </span>
        {isAccent && !open && <span className="h-1.5 w-1.5 rounded-full bg-[#FCD116]" />}
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
              {link.children.map((child, i) => (
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

// ─── Mobile drawer ────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
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
              <img src={logo} alt="Elite One" className="h-8 w-8 object-contain" />
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
              <MobileNavItem key={i} link={link} onClose={onClose} />
            ))}
          </nav>

          {/* Auth */}
          <div className="px-4 pb-6 pt-3 border-t border-white/8 space-y-2.5">
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
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── Main Navbar ──────────────────────────────────────────────────────────────
interface NavbarProps {
  onSearchOpen?: () => void;
}

export const Navbar = ({ onSearchOpen }: NavbarProps) => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

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

            {/* Connexion — hidden xs */}
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-medium text-white/55 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Connexion</span>
            </Link>

            {/* Admin */}
            <Link
              to="/admin"
              title="Administration CMS"
              className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-[11px] font-medium text-accent/70 hover:text-accent border border-accent/10 hover:border-accent/30 hover:bg-accent/5 transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Admin</span>
            </Link>

            {/* S'inscrire */}
            <Link
              to="/register"
              className="hidden sm:flex items-center h-8 px-3.5 rounded-xl bg-accent text-accent-foreground text-[11px] font-bold hover:bg-accent/90 transition-colors shadow-[0_2px_12px_rgba(252,209,22,0.2)]"
            >
              S'inscrire
            </Link>

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
                <NavDropdown key={i} link={link} />
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

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};