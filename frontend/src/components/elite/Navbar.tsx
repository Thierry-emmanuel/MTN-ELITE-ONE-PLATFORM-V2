import { Search, User, Menu, X, ChevronDown, Trophy, Users, BookOpen, ArrowLeftRight, Activity, Archive, History, Gamepad2, Star, Calendar, BarChart2, Layers, Shield, Vote } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type DropdownItem = { label: string; href: string; icon?: React.ReactNode; desc?: string };
type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: string; dropdown: DropdownItem[] };

// ─── Nav structure ────────────────────────────────────────────────────────────
const AWARDS_ITEMS: DropdownItem[] = [
  { label: "Ballon d'Or", href: "#awards/ballon-dor", icon: <Trophy className="h-3.5 w-3.5" />, desc: "Joueur de l'année" },
  { label: "Player of the Month", href: "#awards/potm", icon: <Star className="h-3.5 w-3.5" />, desc: "POTM" },
  { label: "Player of the Season", href: "#awards/pots", icon: <Star className="h-3.5 w-3.5" />, desc: "POTS" },
  { label: "Player of the Week", href: "#awards/potw", icon: <Star className="h-3.5 w-3.5" />, desc: "POTW" },
  { label: "Team of the Week", href: "#awards/totw", icon: <Layers className="h-3.5 w-3.5" />, desc: "TOTW" },
  { label: "Team of the Season", href: "#awards/tots", icon: <Layers className="h-3.5 w-3.5" />, desc: "TOTS" },
  { label: "Vote des Fans", href: "#awards/vote", icon: <Vote className="h-3.5 w-3.5" />, desc: "Votez maintenant" },
];

const COMMUNITY_ITEMS: DropdownItem[] = [
  { label: "Hall of Fame", href: "#community/hall-of-fame", icon: <Trophy className="h-3.5 w-3.5" />, desc: "Légendes du foot camerounais" },
  { label: "Actualités", href: "#community/news", icon: <BookOpen className="h-3.5 w-3.5" />, desc: "News & analyses" },
  { label: "Transferts", href: "#community/transfers", icon: <ArrowLeftRight className="h-3.5 w-3.5" />, desc: "Mercato Elite One" },
  { label: "Blessures", href: "#community/injuries", icon: <Activity className="h-3.5 w-3.5" />, desc: "Suivi médical" },
  { label: "Archives", href: "#community/archives", icon: <Archive className="h-3.5 w-3.5" />, desc: "Saisons précédentes" },
  { label: "Histoire", href: "#community/history", icon: <History className="h-3.5 w-3.5" />, desc: "Histoire du championnat" },
  { label: "Jeux", href: "#community/games", icon: <Gamepad2 className="h-3.5 w-3.5" />, desc: "Fantasy & pronostics" },
];

const NAV: NavItem[] = [
  { label: "Matchs", href: "#matches" },
  { label: "Classement", href: "#standings" },
  { label: "Stats", href: "#stats" },
  { label: "Joueurs", href: "#players" },
  { label: "Awards", dropdown: AWARDS_ITEMS },
  { label: "Clubs", href: "#clubs" },
  { label: "Communauté", dropdown: COMMUNITY_ITEMS },
];

// ─── Dropdown Panel ───────────────────────────────────────────────────────────
const DropdownPanel = ({
  items,
  onClose,
}: {
  items: DropdownItem[];
  onClose: () => void;
}) => (
  <div className="dropdown-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-[hsl(var(--background-deep))] shadow-[0_20px_60px_-10px_hsl(168_80%_5%/0.8)] z-50 overflow-hidden animate-fade-in">
    <div className="p-1.5 grid gap-0.5">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-elevated group transition-colors"
        >
          {item.icon && (
            <span className="text-muted-foreground group-hover:text-accent transition-colors shrink-0">
              {item.icon}
            </span>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground leading-none mb-0.5">
              {item.label}
            </div>
            {item.desc && (
              <div className="text-[11px] text-muted-foreground leading-none truncate">
                {item.desc}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  </div>
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
      <a
        href={item.href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-accent hover:bg-surface-elevated/50 ${
          active ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {item.label}
      </a>
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
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <DropdownPanel items={item.dropdown} onClose={() => setOpen(false)} />}
    </div>
  );
};

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <nav className="xl:hidden border-t border-border bg-[hsl(var(--background-deep))] px-4 py-3 flex flex-col gap-0.5 animate-fade-in">
      {NAV.map((item, i) => (
        <div key={item.label}>
          {item.dropdown ? (
            <>
              <button
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-surface-elevated transition-colors"
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedIdx === i ? "rotate-180 text-accent" : ""}`}
                />
              </button>
              {expandedIdx === i && (
                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3 pb-1">
                  {item.dropdown.map((sub) => (
                    <a
                      key={sub.label}
                      href={sub.href}
                      onClick={onClose}
                      className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {sub.icon && <span className="opacity-60">{sub.icon}</span>}
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <a
              href={item.href}
              onClick={onClose}
              className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-surface-elevated transition-colors"
            >
              {item.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <a href="#" className="flex items-center gap-3 group shrink-0">
    {/* Logo image — swap src to your actual MTN Elite One logo asset */}
    <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-surface-elevated border border-border flex items-center justify-center shadow-[var(--shadow-glow)]">
      <img
        src="/assets/images/logo/logo.png"
        alt="MTN Elite One"
        className="h-9 w-9 object-contain"
        onError={(e) => {
          // Fallback monogram if image fails to load
          const el = e.currentTarget;
          el.style.display = "none";
          const parent = el.parentElement!;
          const fallback = document.createElement("span");
          fallback.className = "font-display font-bold text-accent text-lg";
          fallback.textContent = "M1";
          parent.appendChild(fallback);
        }}
      />
      {/* Live dot — shown e.g. when a match is in progress */}
      {/* <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[hsl(var(--live))] border-2 border-background" /> */}
    </div>

    <div className="hidden sm:flex flex-col leading-none gap-0.5">
      <span className="font-display text-sm tracking-widest text-foreground">MTN ELITE ONE</span>
      {/* Season placeholder — replace with dynamic season from API */}
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Cameroon · <span className="text-accent/80">Saison 24/25</span>
      </span>
    </div>
  </a>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on resize to xl+
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1280) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass">
      {/* Cameroon flag colour bar */}
      <div className="h-[3px] flag-bar" aria-hidden />

      <div className="container flex h-16 items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Logo />

        {/* ── Desktop Nav ── */}
        <nav className="hidden xl:flex items-center gap-0.5 text-sm" aria-label="Navigation principale">
          {NAV.map((item, i) => (
            <NavItem key={item.label} item={item} active={i === 0} />
          ))}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Recherche"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            className="h-9 w-9 grid place-items-center rounded-full bg-surface-elevated hover:bg-secondary transition-colors text-foreground border border-border/50"
            aria-label="Mon compte"
          >
            <User className="h-4 w-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="xl:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-surface-elevated transition-colors text-foreground"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
};