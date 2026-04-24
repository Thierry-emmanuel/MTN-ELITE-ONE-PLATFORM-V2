import { Calendar, Clock } from "lucide-react";
import { fixtures } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

export const Fixtures = () => {
  return (
    <section className="container py-10 lg:py-14">
      <SectionHeader eyebrow="J19" title="Prochains Matchs" cta="Calendrier complet" />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2 snap-x snap-mandatory">
        {fixtures.map((f, idx) => {
          const live = f.status === "Live";
          return (
            <div key={idx} className="snap-start shrink-0 w-[300px] md:w-[320px] bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex items-center justify-between text-[11px] mb-5">
                <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />{f.date}
                </div>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 text-live px-2.5 py-1 font-medium uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                    <Clock className="h-3 w-3" />{f.countdown}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex-1 flex flex-col items-center gap-2 text-center">
                  <ClubBadge club={f.home} size={52} />
                  <div className="font-display text-sm">{f.home.short}</div>
                </div>
                <div className="font-display text-lg text-muted-foreground">vs</div>
                <div className="flex-1 flex flex-col items-center gap-2 text-center">
                  <ClubBadge club={f.away} size={52} />
                  <div className="font-display text-sm">{f.away.short}</div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <div className="font-display text-2xl text-accent">{f.time}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Coup d’envoi</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
