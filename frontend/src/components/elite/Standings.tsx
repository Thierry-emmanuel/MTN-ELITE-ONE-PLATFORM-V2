import { standings } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";

const FormBadge = ({ r }: { r: string }) => {
  const map: Record<string, string> = {
    W: "bg-win/20 text-win",
    D: "bg-draw/20 text-draw",
    L: "bg-loss/20 text-loss",
  };
  return (
    <span className={`h-5 w-5 grid place-items-center rounded text-[10px] font-bold ${map[r]}`}>{r}</span>
  );
};

export const Standings = () => {
  return (
    <section className="container py-10 lg:py-14">
      <SectionHeader eyebrow="Classement" title="Top 8 du Championnat" cta="Classement complet" />
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="grid grid-cols-[40px_1fr_50px_60px_60px_140px] md:grid-cols-[60px_1fr_60px_70px_80px_180px] items-center gap-2 px-4 md:px-6 py-3 text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-background-deep/50">
          <div>#</div>
          <div>Club</div>
          <div className="text-center">J</div>
          <div className="text-center">+/-</div>
          <div className="text-center">Pts</div>
          <div className="text-right hidden md:block">Forme</div>
          <div className="text-right md:hidden">Forme</div>
        </div>
        {standings.map((row) => (
          <div
            key={row.pos}
            className={`grid grid-cols-[40px_1fr_50px_60px_60px_140px] md:grid-cols-[60px_1fr_60px_70px_80px_180px] items-center gap-2 px-4 md:px-6 py-3.5 border-b border-border last:border-0 hover:bg-surface-elevated/40 transition-colors ${
              row.pos <= 2 ? "bg-primary/5" : row.pos === 3 ? "bg-accent/5" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {row.pos <= 2 && <span className="h-5 w-1 rounded-full bg-primary" />}
              {row.pos === 3 && <span className="h-5 w-1 rounded-full bg-accent" />}
              <span className="font-display text-base tabular-nums">{row.pos}</span>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <ClubBadge club={row.club} size={28} />
              <span className="font-medium text-sm truncate">{row.club.name}</span>
            </div>
            <div className="text-center text-sm tabular-nums text-muted-foreground">{row.p}</div>
            <div className={`text-center text-sm tabular-nums font-medium ${row.gd > 0 ? "text-win" : row.gd < 0 ? "text-loss" : "text-muted-foreground"}`}>
              {row.gd > 0 ? "+" : ""}{row.gd}
            </div>
            <div className="text-center font-display text-lg text-accent tabular-nums">{row.pts}</div>
            <div className="flex items-center gap-1 justify-end">
              {row.form.map((f, i) => <FormBadge key={i} r={f} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
