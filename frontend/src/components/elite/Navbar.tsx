import {
  Search, Menu, X, ChevronDown,
  Trophy, BookOpen, ArrowLeftRight, Activity,
  Archive, History, Gamepad2, Star, Layers, Vote,
  LogIn, LogOut, User, ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
type DropdownItem = { label: string; href: string; icon?: React.ReactNode; desc?: string };
type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: string; dropdown: DropdownItem[] };

// ─── Nav data ─────────────────────────────────────────────────────────────────
const AWARDS_ITEMS: DropdownItem[] = [
  { label: "Ballon d'Or",        href: "/awards/ballon-dor", icon: <Trophy className="h-3.5 w-3.5" />,  desc: "Joueur de l'année" },
  { label: "Player of the Month",href: "/awards/potm",       icon: <Star className="h-3.5 w-3.5" />,   desc: "POTM" },
  { label: "Player of the Season",href:"/awards/pots",       icon: <Star className="h-3.5 w-3.5" />,   desc: "POTS" },
  { label: "Player of the Week", href: "/awards/potw",       icon: <Star className="h-3.5 w-3.5" />,   desc: "POTW" },
  { label: "Team of the Week",   href: "/awards/totw",       icon: <Layers className="h-3.5 w-3.5" />, desc: "TOTW" },
  { label: "Team of the Season", href: "/awards/tots",       icon: <Layers className="h-3.5 w-3.5" />, desc: "TOTS" },
  { label: "Vote des Fans",      href: "/awards/vote",       icon: <Vote className="h-3.5 w-3.5" />,   desc: "Votez maintenant" },
];

const COMMUNITY_ITEMS: DropdownItem[] = [
  { label: "Hall of Fame",  href: "/community/hall-of-fame", icon: <Trophy className="h-3.5 w-3.5" />,       desc: "Légendes du foot camerounais" },
  { label: "Actualités",   href: "/community/news",          icon: <BookOpen className="h-3.5 w-3.5" />,     desc: "News & analyses" },
  { label: "Transferts",   href: "/community/transfers",     icon: <ArrowLeftRight className="h-3.5 w-3.5" />,desc: "Mercato Elite One" },
  { label: "Blessures",    href: "/community/injuries",      icon: <Activity className="h-3.5 w-3.5" />,     desc: "Suivi médical" },
  { label: "Archives",     href: "/community/archives",      icon: <Archive className="h-3.5 w-3.5" />,      desc: "Saisons précédentes" },
  { label: "Histoire",     href: "/community/history",       icon: <History className="h-3.5 w-3.5" />,      desc: "Histoire du championnat" },
  { label: "Jeux",         href: "/community/games",         icon: <Gamepad2 className="h-3.5 w-3.5" />,     desc: "Fantasy & pronostics" },
];

const NAV: NavItem[] = [
  { label: "Matchs",      href: "/matches" },
  { label: "Classement",  href: "/standings" },
  { label: "Stats",       href: "/stats" },
  { label: "Joueurs",     href: "/players" },
  { label: "Awards",      dropdown: AWARDS_ITEMS },
  { label: "Clubs",       href: "/clubs" },
  { label: "Communauté",  dropdown: COMMUNITY_ITEMS },
];

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("mtn_user") ?? "null"); } catch { return null; }
};
const logout = () => { localStorage.removeItem("mtn_user"); window.location.href = "/"; };

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
const NavItem = ({ item, active }: { item: NavItem; active: boolean }) => {
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
              <div className={`inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                user.role === "editor" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary-glow"
              }`}>
                {user.role === "editor" ? "Éditeur" : "Supporter"}
              </div>
            </div>
            {[
              { label: "Mon profil",    href: "/profile" },
              { label: "Mes favoris",   href: "/favorites" },
              { label: "Paramètres",    href: "/settings" },
            ].map(l => (
              <Link key={l.label} to={l.href} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-loss hover:bg-loss/10 transition-colors">
                <LogOut className="h-3.5 w-3.5" /> Se déconnecter
              </button>
            </div>
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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="xl:hidden border-t border-border bg-[hsl(var(--background-deep))] px-4 py-3 flex flex-col gap-0.5 overflow-hidden"
    >
      {/* Auth row on mobile */}
      {!user && (
        <div className="flex gap-2 mb-3 pb-3 border-b border-border">
          <Link to="/login" onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <LogIn className="h-4 w-4" /> Connexion
          </Link>
          <Link to="/register" onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold">
            S'inscrire
          </Link>
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
    </motion.nav>
  );
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group shrink-0">
    <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-surface-elevated border border-border flex items-center justify-center shadow-[var(--shadow-glow)]">
      <img src="/assets/images/logo/logo.png" alt="MTN Elite One" className="h-8 w-8 object-contain"
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
        Cameroon · <span className="text-accent/80">Saison 24/25</span>
      </span>
    </div>
  </Link>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  // Scroll listener
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Watch localStorage for auth changes
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

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-[hsl(168,50%,6%)/0.97] backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        : "glass"
    }`}>
      <div className="h-[3px] flag-bar" aria-hidden />

      <div className="container flex h-14 items-center justify-between gap-3">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-0.5 text-sm flex-1 justify-center" aria-label="Navigation principale">
          {NAV.map((item, i) => (
            <NavItem key={item.label} item={item} active={i === 0} />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground" aria-label="Recherche">
            <Search className="h-4 w-4" />
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

      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} user={user} />}
      </AnimatePresence>
    </header>
  );
};