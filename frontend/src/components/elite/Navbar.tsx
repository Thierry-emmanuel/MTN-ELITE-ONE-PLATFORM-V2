import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LogIn, Menu, X, ChevronDown, Radio,
  Trophy, Calendar, Users, Newspaper,
} from "lucide-react";
import { extendedTickerItems } from "./data";
import { Link, useLocation } from "react-router-dom";

// ─── Season progress (matchday 19 of 34) ─────────────────────────────────────
const CURRENT_MATCHDAY = 19;
const TOTAL_MATCHDAYS = 34;
const SEASON_PROGRESS = (CURRENT_MATCHDAY / TOTAL_MATCHDAYS) * 100;

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    label: "Championnat",
    icon: <Trophy className="h-3.5 w-3.5" />,
    children: [
      { label: "Classement", href: "/standings" },
      { label: "Résultats",  href: "/results" },
      { label: "Calendrier", href: "/fixtures" },
      { label: "Statistiques", href: "/stats" },
    ],
  },
  {
    label: "Clubs & Joueurs",
    icon: <Users className="h-3.5 w-3.5" />,
    children: [
      { label: "Tous les clubs", href: "/clubs" },
      { label: "Joueurs",       href: "/players" },
      { label: "Transferts",    href: "/transfers" },
      { label: "Road to Lions", href: "/lions" },
    ],
  },
  {
    label: "Matchs",
    icon: <Calendar className="h-3.5 w-3.5" />,
    href: "/matches",
  },
  {
    label: "Actualités",
    icon: <Newspaper className="h-3.5 w-3.5" />,
    href: "/news",
  },
];

// ─── Live Ticker ──────────────────────────────────────────────────────────────
const LiveTicker = () => {
  // Duplicate items for seamless loop
  const doubled = [...extendedTickerItems, ...extendedTickerItems];
  return (
    <div className="flex-1 overflow-hidden min-w-0 flex items-center gap-3 relative">
      {/* Live badge */}
      <div className="shrink-0 flex items-center gap-1.5 pr-3 border-r border-white/10">
        <Radio className="h-3 w-3 text-[#CE1126] animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#CE1126]">Live</span>
      </div>
      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
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

// ─── Dropdown menu ────────────────────────────────────────────────────────────
const NavDropdown = ({ link }: { link: typeof NAV_LINKS[0] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!link.children) {
    return (
      <Link
        to={link.href!}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/55 hover:text-white hover:bg-white/6 transition-all"
      >
        {link.icon}
        {link.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
          open ? "text-white bg-white/8" : "text-white/55 hover:text-white hover:bg-white/6"
        }`}
      >
        {link.icon}
        {link.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 mt-2 min-w-[160px] bg-[hsl(168,50%,8%)] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {link.children.map((child, i) => (
              <Link
                key={i}
                to={child.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2.5 text-[12px] text-white/55 hover:text-white hover:bg-white/6 transition-all border-b border-white/5 last:border-0"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mobile menu ──────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed top-0 right-0 bottom-0 w-[280px] bg-[hsl(168,50%,7%)] border-l border-white/10 z-50 lg:hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <span className="font-display text-sm tracking-widest">MENU</span>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/8 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV_LINKS.map((link, i) => (
              <div key={i}>
                {link.children ? (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-widest text-accent font-bold mt-3 mb-1">
                      {link.icon}{link.label}
                    </div>
                    {link.children.map((child, j) => (
                      <Link key={j} to={child.href} onClick={onClose}
                        className="flex items-center px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link to={link.href!} onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    {link.icon}{link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-white/8 space-y-2">
            <Link to="/login" onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/15 text-sm text-white/70 hover:bg-white/5 transition-all">
              <LogIn className="h-4 w-4" /> Connexion
            </Link>
            <Link to="/register" onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity">
              S'inscrire
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      {/* ── Season progress bar (very top, 2px) ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]"
          initial={{ width: "0%" }}
          animate={{ width: `${SEASON_PROGRESS}%` }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        />
      </div>

      <header
        className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-[0_2px_40px_rgba(0,0,0,0.4)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* ── Main nav row ── */}
        <div className="container flex items-center gap-4 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow shrink-0 group-hover:scale-105 transition-transform">
              <span className="font-display font-bold text-white text-sm">M1</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xs tracking-widest leading-none">MTN ELITE ONE</div>
              <div className="text-[9px] uppercase tracking-[.18em] text-muted-foreground/60 mt-0.5">Saison 24/25</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {NAV_LINKS.map((link, i) => (
              <NavDropdown key={i} link={link} />
            ))}
          </nav>

          {/* Live ticker — fills remaining space */}
          <div className="flex-1 hidden md:flex items-center min-w-0 mx-4 bg-white/4 border border-white/6 rounded-full px-3 py-1.5 overflow-hidden">
            <LiveTicker />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
            {/* Search ⌘K */}
            <button
              onClick={onSearchOpen}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all text-[11px] group"
              title="Rechercher (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Rechercher</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-white/8 text-[9px] font-mono text-white/30 group-hover:text-white/50 transition-colors">⌘K</kbd>
            </button>

            {/* Auth buttons */}
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[11px] font-medium text-white/55 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              Connexion
            </Link>
            <Link
              to="/register"
              className="hidden sm:flex items-center h-8 px-4 rounded-lg bg-accent text-accent-foreground text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              S'inscrire
            </Link>

            {/* Mobile search */}
            <button
              onClick={onSearchOpen}
              className="sm:hidden h-8 w-8 grid place-items-center rounded-lg bg-white/5 border border-white/8 text-white/50 hover:text-white transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden h-8 w-8 grid place-items-center rounded-lg bg-white/5 border border-white/8 text-white/50 hover:text-white transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Ticker row on mobile ── */}
        <div className="md:hidden flex items-center overflow-hidden border-t border-white/5 bg-white/3 px-4 py-1.5">
          <LiveTicker />
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-[58px]" />

      {/* Mobile menu drawer */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};