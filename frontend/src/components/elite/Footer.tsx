import { Globe, MessageSquare, Send, Mail, ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { standings } from "./data";
import { useState, useEffect } from "react";
import { layoutApi } from "@/services/layoutApi";
import fallbackLogo from "@/assets/images/logo/logo.png";

// ─── System settings hook ─────────────────────────────────────────────────────
function useSystemSettings() {
  const [settings, setSettings] = useState<{
    logo_url: string;
    contact_email: string;
    contact_phone: string;
  } | null>(null);

  useEffect(() => {
    layoutApi.getSystemSettings().then(setSettings).catch(() => null);
  }, []);

  return settings;
}

// ─── Club badge strip data — pull from standings for logos ────────────────────
const STRIP_CLUBS = standings.map((r) => r.club);

// ─── Club Badge Strip ─────────────────────────────────────────────────────────
const ClubBadgeStrip = () => (
  <div className="border-b border-border/60 bg-[hsl(168,50%,8%)] py-4 overflow-hidden">
    <div className="container">
      <div className="text-[9px] uppercase tracking-[.22em] text-muted-foreground/40 mb-3 text-center">
        Clubs · Elite One 2024/25
      </div>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {STRIP_CLUBS.map((club, i) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <Link
              to={`/clubs/${club.id}`}
              title={club.name}
              className="group flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="h-10 w-10 rounded-full border border-border/60 bg-surface-elevated grid place-items-center group-hover:border-accent/40 group-hover:shadow-[0_0_12px_rgba(252,209,22,0.2)] transition-all duration-200 overflow-hidden">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center font-display text-[10px] font-bold"
                  style={{ background: `${club.color}30`, color: club.color }}
                >
                  {club.short?.slice(0, 2) ?? club.name?.slice(0, 2)}
                </div>
              </div>
              <span className="text-[8px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors uppercase tracking-wide max-w-[52px] text-center leading-tight truncate">
                {club.short}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Footer columns definition ────────────────────────────────────────────────
const NAV_COLS = [
  {
    title: "Championnat",
    links: [
      { label: "Calendrier",    href: "/fixtures"  },
      { label: "Résultats",     href: "/results"   },
      { label: "Classement",    href: "/standings" },
      { label: "Statistiques",  href: "/stats"     },
      { label: "Awards",        href: "/awards"    },
    ],
  },
  {
    title: "Clubs & Joueurs",
    links: [
      { label: "Tous les clubs",  href: "/clubs"     },
      { label: "Joueurs",         href: "/players"   },
      { label: "Road to Lions",   href: "/lions"     },
      { label: "Transferts",      href: "/transfers" },
      { label: "Blessures",       href: "/injuries"  },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Hall of Fame",  href: "/halloffame" },
      { label: "Actualités",   href: "/news"        },
      { label: "Archives",     href: "/history"     },
      { label: "Talents",      href: "/talents"     },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "FECAFOOT",           href: "#"         },
      { label: "MTN Cameroun",       href: "#"         },
      { label: "Contact",            href: "/contact"  },
      { label: "Mentions légales",   href: "#"         },
      { label: "Confidentialité",    href: "#"         },
    ],
  },
];

// ─── Footer ───────────────────────────────────────────────────────────────────
export const Footer = () => {
  const settings = useSystemSettings();
  const logoSrc = settings?.logo_url ?? fallbackLogo;
  const contactEmail = settings?.contact_email ?? "contact@mtneliteone.cm";
  const contactPhone = settings?.contact_phone ?? "+237 6XX XXX XXX";

  return (
    <footer className="border-t border-border bg-background-deep relative overflow-hidden">
      {/* Top flag bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flag-bar" />

      {/* Club badges strip */}
      <ClubBadgeStrip />

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full bg-primary/5 blur-[70px] pointer-events-none" />

      <div className="container relative py-10 lg:py-12">
        <div className="grid lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-8 lg:gap-6">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* Logo fetched from backend (falls back to local asset) */}
              <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 bg-surface-elevated border border-border flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt="MTN Elite One"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackLogo;
                  }}
                />
              </div>
              <div>
                <div className="font-display text-sm tracking-widest">MTN ELITE ONE</div>
                <div className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Cameroon · Saison 25/26</div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mb-5">
              La plateforme officielle du championnat professionnel de football du Cameroun.
            </p>

            {/* Contact info */}
            <div className="mb-5 space-y-2">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-accent/60 shrink-0" />
                {contactEmail}
              </a>
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-accent/60 shrink-0" />
                  {contactPhone}
                </a>
              )}
            </div>

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
          {NAV_COLS.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-[10px] uppercase tracking-[.2em] text-accent mb-3">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link
                        to={l.href}
                        className="text-xs text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-flex transition-all duration-150"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-xs text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-flex transition-all duration-150"
                      >
                        {l.label}
                      </a>
                    )}
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
            <span>v2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};