import { Star, ArrowUpRight } from "lucide-react";
import { clubs } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import p1 from "@/assets/images/youngtalents/SergeDaura.png";
import p2 from "@/assets/images/players/RichardNjoh.png";
import p3 from "@/assets/images/players/DavidNgondo.png";

const lions = [
  { name: "Salomon Mbarga", club: clubs.cot, caps: 12, pos: "Attaquant", img: p2 },
  { name: "Idrissou Yaya", club: clubs.vict, caps: 8, pos: "Milieu", img: p3 },
  { name: "Jean-Pierre Etame", club: clubs.uds, caps: 4, pos: "Défenseur", img: p1 },
];

export const RoadToLions = () => {
  return (
    <section className="relative py-14 lg:py-20 border-y border-border overflow-hidden">
      <div className="absolute inset-0 field-pattern opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-px flag-bar" />
      <div className="absolute bottom-0 left-0 right-0 h-px flag-bar" />

      <div className="container relative">
        <div className="max-w-2xl mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-accent font-medium">🇨🇲 Road to Lions</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.95]">
            Du championnat <span className="text-gradient-gold">aux Lions Indomptables</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl">
            Trois talents de la MTN Elite One ont gagné leurs galons en sélection nationale cette saison. Suivez leur progression du championnat local jusqu'au plus haut niveau.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {lions.map((p) => (
            <article key={p.name} className="group relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all hover:-translate-y-1 shadow-card hover:shadow-elegant">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={p.img} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background-deep/80 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {p.caps} sélections
                </div>
                <div className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-background-deep/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-accent" />
                </div>
              </div>
              <div className="p-5 -mt-16 relative">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{p.pos}</div>
                    <h3 className="font-display text-2xl leading-tight truncate">{p.name}</h3>
                  </div>
                  <ClubBadge club={p.club} size={36} />
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{p.club.short}</span>
                  <div className="flex-1 h-px bg-border relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-flag" />
                  </div>
                  <span className="text-accent font-medium">🇨🇲 Lions</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
