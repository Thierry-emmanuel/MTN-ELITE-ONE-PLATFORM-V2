import { Search, User, Menu } from "lucide-react";
import { useState } from "react";

const NAV = ["Accueil", "Calendrier", "Résultats", "Classement", "Stats", "Clubs", "Joueurs", "Transferts", "Blessures", "Awards", "Road to Lions"];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="h-1 flag-bar" aria-hidden />
      <div className="container flex h-16 items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <span className="font-display font-bold text-primary-foreground text-lg">M1</span>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent border-2 border-background" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-base tracking-wide text-foreground">MTN ELITE ONE</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cameroon · Saison 24/25</span>
          </div>
        </a>

        <nav className="hidden xl:flex items-center gap-1 text-sm">
          {NAV.map((item, i) => (
            <a
              key={item}
              href="#"
              className={`px-3 py-2 rounded-md transition-colors hover:text-accent hover:bg-surface-elevated/50 ${i === 0 ? "text-accent" : "text-muted-foreground"}`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground" aria-label="Recherche">
            <Search className="h-4 w-4" />
          </button>
          <button className="h-10 w-10 grid place-items-center rounded-full bg-surface-elevated hover:bg-secondary transition-colors text-foreground" aria-label="Profil">
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="xl:hidden h-10 w-10 grid place-items-center rounded-full hover:bg-surface-elevated transition-colors text-foreground"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="xl:hidden border-t border-border bg-background-deep px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {NAV.map((item) => (
            <a key={item} href="#" className="px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-accent hover:bg-surface-elevated">
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
