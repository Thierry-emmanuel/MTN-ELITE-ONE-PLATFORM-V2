import { Globe, MessageSquare, Send, Mail, ArrowRight } from "lucide-react";
import { clubs } from "./data";

// ─── All 16 clubs with logos (using club color as fallback badge) ──────────────
import canonLogo    from "@/assets/images/logo/Canon_logo.png";
import colombeLogo  from "@/assets/images/logo/colombe_logo.png";
import cotonLogo    from "@/assets/images/logo/Cotonsport_logo.png";
import victoriaLogo from "@/assets/images/logo/victoria_logo.png";
import aigleLogo    from "@/assets/images/logo/Aigle_Moungo_logo.png";
import fauveLogo    from "@/assets/images/logo/fauve_logo.png";
import fortunaLogo  from "@/assets/images/logo/fortuna_logo.png";
import gazelleLogo  from "@/assets/images/logo/gazelle.png";
import menouaLogo   from "@/assets/images/logo/Menoua_logo.png";
import panthereLogo from "@/assets/images/logo/panthere_logo.png";
import pwdLogo      from "@/assets/images/logo/Pwd_logo.png";
import renardLogo   from "@/assets/images/logo/renard_logo.png";
import uniLogo      from "@/assets/images/logo/Uniisport_bafang_logo.png";
import dynamoLogo   from "@/assets/images/logo/dynamo_douala.png";

// ─── Club badge strip data ─────────────────────────────────────────────────────
const CLUB_BADGES = [
  { name: "Canon Yaoundé",    logo: canonLogo,    color: "#CE1126", href: "/clubs/cnk" },
  { name: "Colombe FC",       logo: colombeLogo,   color: "#FB923C", href: "/clubs/cof" },
  { name: "Coton Sport",      logo: cotonLogo,     color: "#FFD400", href: "/clubs/cot" },
  { name: "Victoria United",  logo: victoriaLogo,  color: "#10B981", href: "/clubs/vict" },
  { name: "Aigle Moungo",     logo: aigleLogo,     color: "#6366F1", href: "/clubs/aim" },
  { name: "Les Fauves",       logo: fauveLogo,     color: "#F59E0B", href: "/clubs/fov" },
  { name: "Fortuna",          logo: fortunaLogo,   color: "#3B82F6", href: "/clubs/for" },
  { name: "La Gazelle",       logo: gazelleLogo,   color: "#EF4444", href: "/clubs/gaz" },
  { name: "AS Menoua",        logo: menouaLogo,    color: "#8B5CF6", href: "/clubs/men" },
  { name: "Panthère",         logo: panthereLogo,  color: "#F97316", href: "/clubs/pan" },
  { name: "PWD Bamenda",      logo: pwdLogo,       color: "#1F8A4C", href: "/clubs/pwd" },
  { name: "Les Renards",      logo: renardLogo,    color: "#EC4899", href: "/clubs/ren" },
  { name: "Unisport Bafang",  logo: uniLogo,       color: "#14B8A6", href: "/clubs/uni" },
  { name: "Dynamo Douala",    logo: dynamoLogo,    color: "#0EA5E9", href: "/clubs/dyn" },
  { name: "Union Douala",     logo: canonLogo,     color: "#1E3A8A", href: "/clubs/uds" },
  { name: "Young Sports",     logo: victoriaLogo,  color: "#0EA5E9", href: "/clubs/ymb" },
];

// ─── Footer nav columns ────────────────────────────────────────────────────────
const cols = [
  { title: "Championnat",     links: ["Calendrier", "Résultats", "Classement", "Statistiques", "Awards"] },
  { title: "Clubs & Joueurs", links: ["Tous les clubs", "Joueurs", "Road to Lions", "Transferts", "Blessures"] },
  { title: "Communauté",      links: ["Hall of Fame", "Actualités", "Archives", "Histoire", "Jeux"] },
  { title: "À propos",        links: ["FECAFOOT", "MTN Cameroun", "Contact", "Mentions légales", "Confidentialité"] },
];

// ─── Club Badges Strip ────────────────────────────────────────────────────────
const ClubBadgesStrip = () => (
  <div className="border-b border-border/50 bg-surface/40 py-5 overflow-hidden">
    <div className="container">
      <div className="text-[9px] uppercase tracking-[.3em] text-muted-foreground/40 mb-4 text-center">
        Les 16 clubs de la MTN Elite One
      </div>

      {/* Scrollable strip on mobile, wrapped grid on desktop */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide sm:flex-wrap sm:justify-center items-center pb-1">
        {CLUB_BADGES.map((club) => (
          <a
            key={club.name}
            href={club.href}
            title={club.name}
            className="group shrink-0 flex flex-col items-center gap-1.5 transition-all hover:-translate-y-1 duration-200"
          >
            <div
              className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-white/20 transition-all duration-200 bg-surface-elevated flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
              style={{ boxShadow: `0 0 0 1px ${club.color}20` }}
            >
              <img
                src={club.logo}
                alt={club.name}
                className="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                loading="lazy"
                onError={(e) => {
                  // Fallback: show club color circle with initial
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = club.color + "20";
                    parent.innerHTML = `<span style="color:${club.color};font-size:12px;font-weight:bold;">${club.name.charAt(0)}</span>`;
                  }
                }}
              />
            </div>
            <span className="text-[8px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors whitespace-nowrap hidden sm:block">
              {club.name.split(" ")[0]}
            </span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Footer ──────────────────────────────────────────────────────────────
export const Footer = () => (
  <footer className="border-t border-border bg-background-deep relative overflow-hidden">
    {/* Top flag bar */}
    <div className="absolute top-0 left-0 right-0 h-[3px] flag-bar" />

    {/* Background glow */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full bg-primary/5 blur-[70px] pointer-events-none" />

    {/* Club badges strip — ABOVE footer content */}
    <ClubBadgesStrip />

    <div className="container relative py-10 lg:py-12">
      <div className="grid lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-8 lg:gap-6">

        {/* Brand column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
              <span className="font-display font-bold text-primary-foreground text-base">M1</span>
            </div>
            <div>
              <div className="font-display text-sm tracking-widest">MTN ELITE ONE</div>
              <div className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Cameroon · Saison 24/25</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mb-5">
            La plateforme officielle du championnat professionnel de football du Cameroun.
          </p>

          {/* Newsletter */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground mb-2">Newsletter</div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 min-w-0 bg-surface-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/50 transition-colors"
              />
              <button className="h-8 w-8 grid place-items-center rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity shrink-0">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Socials */}
          <div className="flex gap-2">
            {[Globe, MessageSquare, Send, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-8 w-8 grid place-items-center rounded-full bg-surface-elevated border border-border hover:bg-primary hover:border-primary text-muted-foreground hover:text-primary-foreground transition-all duration-200"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-[10px] uppercase tracking-[.2em] text-accent mb-3">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-xs text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-flex transition-all duration-150"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-10 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div>© 2025 MTN Elite One · FECAFOOT. Tous droits réservés.</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-win animate-pulse" />
            <span>Plateforme opérationnelle</span>
          </div>
          <span className="opacity-30">·</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  </footer>
);