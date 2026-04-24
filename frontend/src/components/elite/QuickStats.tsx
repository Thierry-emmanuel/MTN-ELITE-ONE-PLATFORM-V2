import { Trophy, Goal, Target, TrendingUp, Crown } from "lucide-react";
import { clubs } from "./data";
import { ClubBadge } from "./ClubBadge";
import player2 from "@/assets/images/youngtalents/SergeDaura.png";

const stats = [
  { icon: Goal, label: "Matchs joués", value: "136", sub: "/ 240 saison" },
  { icon: Target, label: "Buts marqués", value: "327", sub: "2.4 / match" },
  { icon: TrendingUp, label: "Buts/match", value: "2.4", sub: "+0.3 vs N-1" },
];

export const QuickStats = () => {
  return (
    <section className="container py-10 lg:py-14">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center text-primary group-hover:bg-primary/25 transition-colors">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="font-display text-3xl lg:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">{s.sub}</div>
          </div>
        ))}

        {/* Top scorer */}
        <div className="col-span-2 md:col-span-1 lg:col-span-1 bg-gradient-card border border-accent/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-gold opacity-[0.06]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium">Buteur</span>
            </div>
            <div className="flex items-center gap-3">
              <img src={player2} alt="Top scorer" loading="lazy" className="h-12 w-12 rounded-xl object-cover ring-2 ring-accent/40" />
              <div className="min-w-0">
                <div className="font-display text-lg leading-tight truncate">S. Mbarga</div>
                <div className="text-xs text-muted-foreground">Coton Sport</div>
              </div>
            </div>
            <div className="mt-3 font-display text-2xl text-accent">14 <span className="text-xs text-muted-foreground font-sans normal-case">buts</span></div>
          </div>
        </div>

        {/* League leader */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1 bg-gradient-card border border-primary/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.08]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-primary-glow" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary-glow font-medium">Leader</span>
            </div>
            <div className="flex items-center gap-3">
              <ClubBadge club={clubs.cot} size={48} />
              <div>
                <div className="font-display text-lg leading-tight">{clubs.cot.name}</div>
                <div className="text-xs text-muted-foreground">38 pts · GD +22</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
