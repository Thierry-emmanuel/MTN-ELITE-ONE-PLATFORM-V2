import { ArrowRight, Activity } from "lucide-react";
import { transfers, injuries } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

export const TransfersInjuries = () => {
  return (
    <section className="container py-10 lg:py-14 grid lg:grid-cols-2 gap-6 lg:gap-8">
      <div>
        <SectionHeader eyebrow="Mercato" title="Derniers Transferts" />
        <div className="bg-gradient-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {transfers.map((t, i) => (
            <div key={i} className="p-4 flex items-center gap-3 hover:bg-surface-elevated/40 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{t.player}</div>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ClubBadge club={t.from} size={18} />
                    <span>{t.from.short}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-accent" />
                  <div className="flex items-center gap-1.5 text-foreground">
                    <ClubBadge club={t.to} size={18} />
                    <span className="font-medium">{t.to.short}</span>
                  </div>
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${t.type === "Permanent" ? "bg-primary/15 text-primary-glow" : "bg-accent/15 text-accent"}`}>
                {t.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader eyebrow="Infirmerie" title="Blessures & Statuts" />
        <div className="bg-gradient-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {injuries.map((p, i) => {
            const dot: any = { destructive: "bg-destructive", draw: "bg-draw", primary: "bg-primary-glow" };
            return (
              <div key={i} className="p-4 flex items-center gap-3 hover:bg-surface-elevated/40 transition-colors">
                <div className="h-9 w-9 grid place-items-center rounded-lg bg-destructive/10 text-destructive">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.player}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <ClubBadge club={p.club} size={14} />
                    <span>{p.club.short}</span>
                    <span>·</span>
                    <span>{p.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`h-2 w-2 rounded-full ${dot[p.color]}`} />
                  <span className="text-muted-foreground">{p.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
