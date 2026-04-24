import { results } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

export const Results = () => {
  return (
    <section className="container py-10 lg:py-14">
      <SectionHeader eyebrow="J18" title="Derniers Résultats" cta="Tous les résultats" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r, idx) => {
          const homeWin = r.hs > r.as;
          const awayWin = r.as > r.hs;
          return (
            <div key={idx} className="bg-surface/60 border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-surface transition-colors group">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider w-12 shrink-0">{r.date}</div>
              <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className={`flex items-center gap-2.5 justify-end ${homeWin ? "text-foreground" : "text-muted-foreground"}`}>
                  <span className="font-medium text-sm truncate">{r.home.short}</span>
                  <ClubBadge club={r.home} size={28} />
                </div>
                <div className="flex items-center gap-2 font-display text-lg tabular-nums px-2">
                  <span className={homeWin ? "text-accent" : ""}>{r.hs}</span>
                  <span className="text-muted-foreground/40">-</span>
                  <span className={awayWin ? "text-accent" : ""}>{r.as}</span>
                </div>
                <div className={`flex items-center gap-2.5 ${awayWin ? "text-foreground" : "text-muted-foreground"}`}>
                  <ClubBadge club={r.away} size={28} />
                  <span className="font-medium text-sm truncate">{r.away.short}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
