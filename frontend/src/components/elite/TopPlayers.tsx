import { Goal, HandHeart } from "lucide-react";
import { clubs } from "./data";
import { ClubBadge } from "./ClubBadge";
import { SectionHeader } from "./SectionHeader";
import p1 from "@/assets/images/youngtalents/NathanDouala.png";
import p2 from "@/assets/images/players/DavidNgondo.png";
import p3 from "@/assets/images/players/EdouardSombang.png";

const scorers = [
  { name: "S. Mbarga", club: clubs.cot, val: 14, img: p2 },
  { name: "I. Yaya", club: clubs.vict, val: 11, img: p3 },
  { name: "J.P. Etame", club: clubs.uds, val: 9, img: p1 },
];
const assists = [
  { name: "A. Souaibou", club: clubs.pwd, val: 9, img: p1 },
  { name: "C. Bassogog", club: clubs.cnk, val: 7, img: p3 },
  { name: "V. Aboubakar", club: clubs.cot, val: 6, img: p2 },
];

const Card = ({ p, idx, suffix }: { p: any; idx: number; suffix: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated/60 transition-colors group">
    <span className="font-display text-2xl text-muted-foreground/50 w-6 tabular-nums">{idx + 1}</span>
    <img src={p.img} alt={p.name} loading="lazy" className="h-12 w-12 rounded-xl object-cover" />
    <div className="flex-1 min-w-0">
      <div className="font-medium truncate">{p.name}</div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ClubBadge club={p.club} size={14} />
        <span>{p.club.name}</span>
      </div>
    </div>
    <div className="font-display text-2xl text-accent tabular-nums">{p.val}<span className="text-xs text-muted-foreground font-sans ml-0.5">{suffix}</span></div>
  </div>
);

export const TopPlayers = () => {
  return (
    <section className="container py-10 lg:py-14">
      <SectionHeader eyebrow="Statistiques" title="Meilleurs Joueurs" cta="Toutes les stats" />
      <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 grid place-items-center rounded-lg bg-primary/15 text-primary"><Goal className="h-4 w-4" /></div>
            <h3 className="font-display text-lg uppercase tracking-wide">Meilleurs Buteurs</h3>
          </div>
          <div className="space-y-1">{scorers.map((p, i) => <Card key={p.name} p={p} idx={i} suffix="b" />)}</div>
        </div>
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 grid place-items-center rounded-lg bg-accent/15 text-accent"><HandHeart className="h-4 w-4" /></div>
            <h3 className="font-display text-lg uppercase tracking-wide">Meilleurs Passeurs</h3>
          </div>
          <div className="space-y-1">{assists.map((p, i) => <Card key={p.name} p={p} idx={i} suffix="p" />)}</div>
        </div>
      </div>
    </section>
  );
};
