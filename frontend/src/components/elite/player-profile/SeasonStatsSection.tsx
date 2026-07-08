import { BarChart2, Target, Footprints, Crosshair, Clock, Send, KeyRound, ShieldCheck, Square } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import { per90 } from '@/lib/statsRating';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="group bg-gradient-card border border-border rounded-2xl p-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5">
      <div
        className="h-8 w-8 rounded-xl grid place-items-center mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${accent ?? '#FCD116'}18`, color: accent ?? '#FCD116' }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="font-display text-2xl lg:text-3xl text-foreground tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

export function SeasonStatsSection({ player }: Props) {
  const mins = player.minutesPlayed;
  const cards = [
    { icon: BarChart2, label: 'Matchs joués', value: player.appearances, accent: '#FCD116' },
    { icon: Target, label: 'Buts', value: player.goals, sub: `${per90(Number(player.goals), mins).toFixed(2)} / 90`, accent: '#EF4444' },
    { icon: Footprints, label: 'Passes décisives', value: player.assists, sub: `${per90(Number(player.assists), mins).toFixed(2)} / 90`, accent: '#22C55E' },
    { icon: Crosshair, label: 'Tirs cadrés', value: player.shotsOnTarget, sub: `${player.shots} tentés`, accent: '#3B82F6' },
    { icon: Send, label: 'xG', value: Number(player.xG ?? 0).toFixed(1), sub: 'Buts attendus', accent: '#A78BFA' },
    { icon: KeyRound, label: 'Passes clés', value: player.keyPasses, accent: '#F472B6' },
    { icon: ShieldCheck, label: 'Précision passes', value: `${Number(player.passAccuracy ?? 78).toFixed(0)}%`, accent: '#14B8A6' },
    { icon: Clock, label: 'Minutes jouées', value: Number(mins ?? 0).toLocaleString('fr-FR'), accent: '#FB923C' },
  ];

  const discipline = [
    { label: 'Cartons jaunes', value: player.yellowCards, color: '#FCD116' },
    { label: 'Cartons rouges', value: player.redCards, color: '#EF4444' },
    { label: 'Pénaltys marqués', value: player.penaltiesScored, color: '#22C55E' },
    { label: 'Pénaltys manqués', value: player.penaltiesMissed, color: '#94A3B8' },
  ];

  return (
    <section id="statistiques" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={BarChart2} title="Statistiques de la saison" subtitle="MTN Elite One · Saison 2025-26" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5 bg-gradient-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
            <Square className="h-3 w-3" /> Discipline
          </div>
          {discipline.map(d => (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-bold text-foreground tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
