import { Vote, Trophy } from "lucide-react";
import { clubs } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";

const nominees = [
  { name: "Salomon Mbarga", club: clubs.cot, votes: 48, img: p2 },
  { name: "Idrissou Yaya", club: clubs.vict, votes: 27, img: p3 },
  { name: "J.P. Etame", club: clubs.uds, votes: 18, img: p1 },
  { name: "A. Souaibou", club: clubs.pwd, votes: 7, img: p3 },
];

export const Awards = () => {
  return (
    <section className="container py-10 lg:py-14">
      <div className="bg-gradient-card border border-accent/30 rounded-2xl overflow-hidden relative shadow-gold">
        <div className="absolute inset-0 bg-gradient-gold opacity-[0.04]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold" />

        <div className="relative grid lg:grid-cols-[1fr_1.4fr] gap-0">
          <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-accent font-medium">Awards</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl uppercase leading-[0.95] mb-3">
              Joueur de la <span className="text-gradient-gold">Semaine</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Votez pour le joueur qui vous a le plus marqué lors de la dernière journée du championnat.</p>
            <button className="inline-flex items-center gap-2 bg-gradient-gold text-accent-foreground px-6 py-3 rounded-full font-medium shadow-gold hover:scale-[1.02] transition-transform">
              <Vote className="h-4 w-4" />
              Voter maintenant
            </button>
            <div className="mt-6 text-xs text-muted-foreground">12 482 votes · clôture dimanche</div>
          </div>

          <div className="p-6 lg:p-8 space-y-3">
            {nominees.map((n, i) => (
              <div key={n.name} className="flex items-center gap-4 p-3 rounded-xl bg-surface/60 hover:bg-surface transition-colors">
                <img src={n.img} alt={n.name} loading="lazy" className={`h-12 w-12 rounded-xl object-cover ${i === 0 ? "ring-2 ring-accent" : ""}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="font-medium truncate">{n.name}</div>
                    <div className="font-display text-sm text-accent tabular-nums">{n.votes}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClubBadge club={n.club} size={14} />
                    <div className="flex-1 h-1.5 bg-background-deep rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? "bg-gradient-gold" : "bg-primary"}`}
                        style={{ width: `${n.votes}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
