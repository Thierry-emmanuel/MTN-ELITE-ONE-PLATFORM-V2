import { Star } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import l1 from "@/assets/images/halloffame/JeanMangaOnguene.png";
import l2 from "@/assets/images/players/EdouardSombang.png";
import l3 from "@/assets/images/halloffame/Thomas_Nkono.png";

const legends = [
  { name: "Roger Milla", era: "1976 — 1996", achievement: "Pionnier · Coupe du Monde 1990", img: l2 },
  { name: "Samuel Eto'o", era: "1996 — 2014", achievement: "Triple Ballon d'Or Africain", img: l1 },
  { name: "Thomas N'Kono", era: "1976 — 1990", achievement: "Légende du gardien africain", img: l3 },
];

export const HallOfFame = () => {
  return (
    <section className="container py-10 lg:py-14">
      <SectionHeader eyebrow="Hall of Fame" title="Légendes du Football" cta="Voir tous les légendes" />
      <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
        {legends.map((l, i) => (
          <article key={l.name} className="group relative rounded-2xl overflow-hidden border border-accent/20 hover:border-accent/60 transition-all aspect-[3/4] shadow-card hover:shadow-gold">
            <img src={l.img} alt={l.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-background-deep/40 to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-medium">N°{String(i + 1).padStart(2, "0")}</span>
              <Star className="h-4 w-4 text-accent fill-accent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="text-[10px] uppercase tracking-widest text-accent/80 mb-1.5">{l.era}</div>
              <h3 className="font-display text-3xl uppercase leading-[0.95] mb-2">{l.name}</h3>
              <p className="text-sm text-muted-foreground">{l.achievement}</p>
              <div className="mt-4 h-px bg-gradient-gold opacity-60" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
