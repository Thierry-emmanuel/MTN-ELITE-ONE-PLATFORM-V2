import { Globe, MessageSquare, Send, Mail, ArrowRight } from "lucide-react";

const cols = [
  { title: "Championnat",    links: ["Calendrier", "Résultats", "Classement", "Statistiques", "Awards"] },
  { title: "Clubs & Joueurs", links: ["Tous les clubs", "Joueurs", "Road to Lions", "Transferts", "Blessures"] },
  { title: "Communauté",     links: ["Hall of Fame", "Actualités", "Archives", "Histoire", "Jeux"] },
  { title: "À propos",       links: ["FECAFOOT", "MTN Cameroun", "Contact", "Mentions légales", "Confidentialité"] },
];

export const Footer = () => (
  <footer className="mt-10 border-t border-border bg-background-deep relative overflow-hidden">
    {/* Top flag bar */}
    <div className="absolute top-0 left-0 right-0 h-[3px] flag-bar" />

    {/* Background glow */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

    <div className="container relative py-16">
      <div className="grid lg:grid-cols-[1.6fr_repeat(4,1fr)] gap-10 lg:gap-8">

        {/* Brand column */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <span className="font-display font-bold text-primary-foreground text-lg">M1</span>
            </div>
            <div>
              <div className="font-display text-base tracking-widest">MTN ELITE ONE</div>
              <div className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Cameroon · Saison 24/25</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
            La plateforme officielle du championnat professionnel de football du Cameroun. Vivre le football camerounais au niveau mondial.
          </p>

          {/* Newsletter */}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">Newsletter</div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 min-w-0 bg-surface-elevated border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/50 transition-colors"
              />
              <button className="h-9 w-9 grid place-items-center rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity shrink-0">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Socials */}
          <div className="flex gap-2">
            {[Globe, MessageSquare, Send, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 grid place-items-center rounded-full bg-surface-elevated border border-border hover:bg-primary hover:border-primary text-muted-foreground hover:text-primary-foreground transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-xs uppercase tracking-[.2em] text-accent mb-4">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 inline-flex transition-all duration-150">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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