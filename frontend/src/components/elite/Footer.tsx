import { Globe, MessageSquare, Send, Mail } from "lucide-react";

const cols = [
  { title: "Championnat", links: ["Calendrier", "Résultats", "Classement", "Statistiques", "Awards"] },
  { title: "Clubs & Joueurs", links: ["Tous les clubs", "Joueurs", "Transferts", "Blessures", "Road to Lions"] },
  { title: "À propos", links: ["FECAFOOT", "MTN Cameroun", "Contact", "Carrières", "Presse"] },
  { title: "Légal", links: ["Conditions", "Confidentialité", "Cookies", "Mentions légales"] },
];

export const Footer = () => {
  return (
    <footer className="mt-10 border-t border-border bg-background-deep relative">
      <div className="absolute top-0 left-0 right-0 h-px flag-bar" />
      <div className="container py-14">
        <div className="grid lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                <span className="font-display font-bold text-primary-foreground">M1</span>
              </div>
              <div>
                <div className="font-display text-lg">MTN ELITE ONE</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cameroon · Saison 24/25</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              La plateforme officielle du championnat professionnel de football du Cameroun. Faire du football camerounais une expérience digitale de niveau mondial.
            </p>
            <div className="flex gap-2 mt-5">
              {[Globe, MessageSquare, Send, Mail].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-full bg-surface-elevated hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm uppercase tracking-wider text-accent mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© 2025 MTN Elite One · FECAFOOT. Tous droits réservés.</div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-win animate-pulse" />
            Plateforme opérationnelle · v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};
