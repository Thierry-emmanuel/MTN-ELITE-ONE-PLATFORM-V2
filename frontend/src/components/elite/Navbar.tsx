import {
  Search, Menu, X, ChevronDown,
  Trophy, BookOpen, ArrowLeftRight, Activity,
  Archive, History, Gamepad2, Star, Layers, Vote,
  LogIn, LogOut, User, ChevronRight, Radio,
  Users, Newspaper, Calendar, Command,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { tickerItems, fixtures, scorers, news, clubs } from "./data";

// ─── Types ────────────────────────────────────────────────────────────────────
type DropdownItem = { label: string; href: string; icon?: React.ReactNode; desc?: string };
type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: string; dropdown: DropdownItem[] };

// ─── Nav data ─────────────────────────────────────────────────────────────────
const AWARDS_ITEMS: DropdownItem[] = [
  { label: "Ballon d'Or",         href: "/awards/ballon-dor", icon: <Trophy className="h-3.5 w-3.5" />,  desc: "Joueur de l'année" },
  { label: "Player of the Month", href: "/awards/potm",       icon: <Star className="h-3.5 w-3.5" />,   desc: "POTM" },
  { label: "Player of the Season",href: "/awards/pots",       icon: <Star className="h-3.5 w-3.5" />,   desc: "POTS" },
  { label: "Player of the Week",  href: "/awards/potw",       icon: <Star className="h-3.5 w-3.5" />,   desc: "POTW" },
  { label: "Team of the Week",    href: "/awards/totw",       icon: <Layers className="h-3.5 w-3.5" />, desc: "TOTW" },
  { label: "Team of the Season",  href: "/awards/tots",       icon: <Layers className="h-3.5 w-3.5" />, desc: "TOTS" },
  { label: "Vote des Fans",       href: "/awards/vote",       icon: <Vote className="h-3.5 w-3.5" />,   desc: "Votez maintenant" },
];

const COMMUNITY_ITEMS: DropdownItem[] = [
  { label: "Hall of Fame", href: "/community/hall-of-fame", icon: <Trophy className="h-3.5 w-3.5" />,       desc: "Légendes du foot camerounais" },
  { label: "Actualités",  href: "/community/news",          icon: <BookOpen className="h-3.5 w-3.5" />,     desc: "News & analyses" },
  { label: "Transferts",  href: "/community/transfers",     icon: <ArrowLeftRight className="h-3.5 w-3.5" />,desc: "Mercato Elite One" },
  { label: "Blessures",   href: "/community/injuries",      icon: <Activity className="h-3.5 w-3.5" />,     desc: "Suivi médical" },
  { label: "Archives",    href: "/community/archives",      icon: <Archive className="h-3.5 w-3.5" />,      desc: "Saisons précédentes" },
  { label: "Histoire",    href: "/community/history",       icon: <History className="h-3.5 w-3.5" />,      desc: "Histoire du championnat" },
  { label: "Jeux",        href: "/community/games",         icon: <Gamepad2 className="h-3.5 w-3.5" />,     desc: "Fantasy & pronostics" },
];

const NAV: NavItem[] = [
  { label: "Matchs",     href: "/matches" },
  { label: "Classement", href: "/standings" },
  { label: "Stats",      href: "/stats" },
  { label: "Joueurs",    href: "/players" },
  { label: "Awards",     dropdown: AWARDS_ITEMS },
  { label: "Clubs",      href: "/clubs" },
  { label: "Communauté", dropdown: COMMUNITY_ITEMS },
];

// ─── Season progress (matchday 18 / 34) ──────────────────────────────────────
const CURRENT_MD = 18;
const TOTAL_MD   = 34;
const SEASON_PCT = (CURRENT_MD / TOTAL_MD) * 100;

// ─── Search data ──────────────────────────────────────────────────────────────
const SEARCH_DATA = [
  // players
  ...scorers.map(p => ({ id: `p-${p.name}`, cat: "Joueurs" as const, label: p.name, sub: p.club.name, href: "/players" })),
  // clubs
  ...Object.values(clubs).map(c => ({ id: `c-${c.id}`, cat: "Clubs" as const, label: c.name, sub: c.city, href: "/clubs" })),
  // matches
  ...fixtures.map((f, i) => ({ id: `m-${i}`, cat: "Matchs" as const, label: `${f.home.name} vs ${f.away.name}`, sub: f.date, href: "/matches" })),
  // news
  { id: "n1", cat: "Actualités" as const, label: "Coton Sport — Canon : duel de titans", sub: "22 Avr", href: "/community/news" },
  { id: "n2", cat: "Actualités" as const, label: "Comment PWD a réinventé son jeu", sub: "21 Avr", href: "/community/news" },
];

const CAT_ICONS: Record<string, React.ReactNode> = {
  Joueurs:    <Users className="h-3.5 w-3.5" />,
  Clubs:      <Trophy className="h-3.5 w-3.5" />,
  Matchs:     <Calendar className="h-3.5 w-3.5" />,
  Actualités: <Newspaper className="h-3.5 w-3.5" />,
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("mtn_user") ?? "null"); } catch { return null; }
};
const logout = () => { localStorage.removeItem("mtn_user"); window.location.href = "/"; };

// ─── Season Progress Bar ──────────────────────────────────────────────────────
const SeasonBar = () => (
  <div className="h-[2px] bg-white/5 relative overflow-hidden" title={`J${CURRENT_MD} / J${TOTAL_MD}`}>
    <motion.div
      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#008751]"
      initial={{ width: "0%" }}
      animate={{ width: `${SEASON_PCT}%` }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
    />
  </div>
);

// ─── Live Ticker Strip ────────────────────────────────────────────────────────
const TickerStrip = () => {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden flex-1 mx-3">
      <div className="flex gap-10 animate-[ticker_35s_linear_infinite] whitespace-nowrap">
        {doubled.map((item, i) => {
          const isLive = item.includes("62'") || item.includes("58'");
          return (
            <span key={i} className={`text-[10px] shrink-0 font-medium ${isLive ? "text-[#FCD116]" : "text-white/50"}`}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ─── Search Overlay ───────────────────────────────────────────────────────────
const SearchOverlay = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = query.trim().length > 0
    ? SEARCH_DATA.filter(d =>
        d.label.toLowerCase().includes(query.toLowerCase()) ||
        d.sub.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : SEARCH_DATA.slice(0, 6);

  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.cat] ??= []).push(r);
    return acc;
  }, {});
  const flat = Object.values(grouped).flat();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setCursor(0); }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && flat[cursor]) { navigate(flat[cursor].href); onClose(); }
    if (e.key === "Escape") onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[hsl(168,50%,5%)/0.88] backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-[hsl(168,45%,9%)] border border-border rounded-2xl shadow-[0_32px_80px_-10px_hsl(168_80%_5%/0.9)] overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher joueur, club, match..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/40 font-mono bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Aucun résultat pour « {query} »</div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  {CAT_ICONS[cat]}
                  {cat}
                </div>
                {items.map(item => {
                  const globalIdx = flat.indexOf(item);
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        globalIdx === cursor
                          ? "bg-accent/10 text-accent"
                          : "hover:bg-surface-elevated text-foreground"
                      }`}
                      onMouseEnter={() => setCursor(globalIdx)}
                    >
                      <div className="h-7 w-7 rounded-lg bg-surface-elevated border border-border grid place-items-center text-muted-foreground shrink-0">
                        {CAT_ICONS[cat]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium leading-none truncate">{item.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.sub}</div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/40">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-elevated border border-border px-1 rounded">↑↓</kbd> Naviguer</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-elevated border border-border px-1 rounded">↵</kbd> Sélectionner</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-elevated border border-border px-1 rounded">esc</kbd> Fermer</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Dropdown Panel ───────────────────────────────────────────────────────────
const DropdownPanel = ({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.97 }}
    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-[hsl(var(--background-deep))] shadow-[0_20px_60px_-10px_hsl(168_80%_5%/0.85)] z-50 overflow-hidden"
  >
    <div className="p-1.5 grid gap-0.5">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.href}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-elevated group transition-colors"
        >
          {item.icon && (
            <span className="text-muted-foreground group-hover:text-accent transition-colors shrink-0">{item.icon}</span>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground leading-none mb-0.5">{item.label}</div>
            {item.desc && <div className="text-[11px] text-muted-foreground leading-none truncate">{item.desc}</div>}
          </div>
        </Link>
      ))}
    </div>
  </motion.div>
);

// ─── Desktop Nav Item ─────────────────────────────────────────────────────────
const NavItemComp = ({ item, active }: { item: NavItem; active: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!item.dropdown) {
    return (
      <Link
        to={item.href!}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-accent hover:bg-surface-elevated/50 ${
          active ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-accent hover:bg-surface-elevated/50 ${
          open ? "text-accent bg-surface-elevated/50" : "text-muted-foreground"
        }`}
      >
        {item.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && <DropdownPanel items={item.dropdown} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

// ─── User Menu ────────────────────────────────────────────────────────────────
const UserMenu = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-9 px-3 rounded-full bg-surface-elevated border border-border hover:border-accent/50 transition-all"
      >
        <div className="h-5 w-5 rounded-full bg-accent/20 grid place-items-center">
          <User className="h-3 w-3 text-accent" />
        </div>
        <span className="text-sm font-medium text-foreground hidden sm:block max-w-[100px] truncate">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-[hsl(var(--background-deep))] shadow-[0_20px_60px_-10px_hsl(168_80%_5%/0.85)] z-50 overflow-hidden p-1.5"
          >
            <div className="px-3 py-2.5 border-b border-border mb-1">
              <div className="text-sm font-semibold text-foreground truncate">{user.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
              {user.role && (
                <span className="mt-1.5 inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                  {user.role}
                </span>
              )}
            </div>
            <Link to="/profile" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors">
              <User className="h-3.5 w-3.5" /> Mon profil
            </Link>
            <button onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
const MobileMenu = ({ onClose, user }: { onClose: () => void; user: any }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="xl:hidden border-t border-border bg-[hsl(168,50%,7%)/0.98] overflow-hidden"
    >
      <div className="container py-4 flex flex-col gap-1 max-h-[80svh] overflow-y-auto">
        {!user ? (
          <div className="flex gap-2 mb-3">
            <Link to="/login" onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <LogIn className="h-4 w-4" /> Connexion
            </Link>
            <Link to="/register" onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold">
              S'inscrire
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-3 p-3 bg-surface-elevated rounded-xl">
            <div className="h-8 w-8 rounded-full bg-accent/20 grid place-items-center">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        )}

        {NAV.map((item, i) => (
          <div key={item.label}>
            {item.dropdown ? (
              <>
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-surface-elevated transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedIdx === i ? "rotate-180 text-accent" : ""}`} />
                </button>
                <AnimatePresence>
                  {expandedIdx === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3 pb-1 overflow-hidden"
                    >
                      {item.dropdown.map((sub) => (
                        <Link key={sub.label} to={sub.href} onClick={onClose}
                          className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:text-accent transition-colors">
                          {sub.icon && <span className="opacity-60">{sub.icon}</span>}
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link to={item.href!} onClick={onClose}
                className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-surface-elevated transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </motion.nav>
  );
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group shrink-0">
    <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-surface-elevated border border-border flex items-center justify-center shadow-[var(--shadow-glow)]">
      <img src="/assets/images/logo/logo.png" alt="MTN Elite One" className="h-7 w-7 object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = document.createElement("span");
          fb.className = "font-display font-bold text-accent text-base";
          fb.textContent = "M1";
          e.currentTarget.parentElement?.appendChild(fb);
        }}
      />
    </div>
    <div className="hidden sm:flex flex-col leading-none gap-0.5">
      <span className="font-display text-sm tracking-widest text-foreground">MTN ELITE ONE</span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Cameroon · <span className="text-accent/80">J{CURRENT_MD}/{TOTAL_MD}</span>
      </span>
    </div>
  </Link>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(getUser());

  // Scroll listener
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Watch localStorage
  useEffect(() => {
    const handler = () => setUser(getUser());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1280) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(168,50%,6%)/0.97] backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "glass"
      }`}>
        {/* Season progress bar */}
        <SeasonBar />

        {/* ── Main nav row ── */}
        <div className="container flex h-13 items-center justify-between gap-3 py-1.5">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5 text-sm flex-1 justify-center" aria-label="Navigation principale">
            {NAV.map((item, i) => (
              <NavItemComp key={item.label} item={item} active={i === 0} />
            ))}
          </nav>

          {/* Live ticker — desktop only, between nav and actions */}
          <div className="hidden xl:flex items-center flex-1 max-w-xs overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] bg-[#CE1126]/15 border border-[#CE1126]/20 rounded-full px-2 py-1 shrink-0">
              <Radio className="h-2.5 w-2.5 text-[#CE1126] animate-pulse shrink-0" />
              <span className="text-[#CE1126] font-bold uppercase tracking-widest">Live</span>
            </div>
            <TickerStrip />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-8 px-2.5 rounded-full hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground group border border-transparent hover:border-border"
              aria-label="Recherche (⌘K)"
            >
              <Search className="h-4 w-4" />
              <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] text-muted-foreground/40 font-mono">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login"
                  className="h-8 px-3.5 flex items-center gap-1.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
                  <LogIn className="h-3.5 w-3.5" />
                  Connexion
                </Link>
                <Link to="/register"
                  className="h-8 px-3.5 flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-gold">
                  S'inscrire
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="xl:hidden h-8 w-8 grid place-items-center rounded-full hover:bg-surface-elevated transition-colors text-foreground"
              aria-expanded={menuOpen}
            >
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.span key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="h-5 w-5" /></motion.span>
                  : <motion.span key="men" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="h-5 w-5" /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile ticker */}
        <div className="xl:hidden h-7 flex items-center border-t border-border/30 bg-black/20 overflow-hidden">
          <div className="flex items-center gap-2 px-3 shrink-0">
            <Radio className="h-2.5 w-2.5 text-[#CE1126] animate-pulse" />
            <span className="text-[9px] text-[#CE1126] font-bold uppercase tracking-widest">Live</span>
          </div>
          <TickerStrip />
        </div>

        <AnimatePresence>
          {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} user={user} />}
        </AnimatePresence>
      </header>
    </>
  );
};