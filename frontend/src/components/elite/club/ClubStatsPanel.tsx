import { memo } from 'react';
import { BarChart2, Target, ShieldOff, Lock, Percent, Square } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import type { Club, ClubStat } from '@/types/football.types';

interface ClubStatsPanelProps {
  club: Club;
  clubStat?: ClubStat;
  isLoading: boolean;
}

export const ClubStatsPanel = memo(({ club, clubStat, isLoading }: ClubStatsPanelProps) => {
  const primary = club.color || '#FCD116';

  const tiles = clubStat ? [
    { label: 'Buts Marqués',   value: clubStat.goalsFor,      icon: Target,    color: '#10B981' },
    { label: 'Buts Encaissés', value: clubStat.goalsAgainst,  icon: ShieldOff, color: '#EF4444' },
    { label: 'Clean Sheets',   value: clubStat.cleanSheets,   icon: Lock,      color: '#60A5FA' },
    { label: 'Possession Moy.',value: clubStat.possession ? `${clubStat.possession}%` : '—', icon: Percent, color: primary },
  ] : [];

  const discipline = clubStat ? [
    { label: 'Cartons jaunes', value: clubStat.yellowCards, color: '#FCD116' },
    { label: 'Cartons rouges', value: clubStat.redCards,    color: '#DC2626' },
    { label: 'Penalties obtenus', value: clubStat.penaltiesFor, color: '#10B981' },
    { label: 'Penalties concédés', value: clubStat.penaltiesAgainst, color: '#EF4444' },
  ] : [];

  return (
    <>
      <SectionHeading icon={BarChart2} room="Salle 07" title="Statistiques de la Saison" accentColor={primary} />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white/5 animate-pulse" />)}
        </div>
      ) : !clubStat ? (
        <p className="text-sm text-white/40">Statistiques indisponibles pour le moment.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tiles.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div className="p-5 bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors text-center space-y-2.5">
                  <div className="h-9 w-9 mx-auto grid place-items-center border" style={{ background: `${s.color}14`, borderColor: `${s.color}40` }}>
                    <s.icon className="h-[18px] w-[18px]" style={{ color: s.color }} />
                  </div>
                  <div className="text-3xl font-display font-black text-white">{s.value}</div>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="border border-white/10 bg-white/[0.015] p-5">
              <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Square className="h-3.5 w-3.5 text-white/30" />
                Discipline & Coups de pied arrêtés
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {discipline.map(d => (
                  <div key={d.label} className="text-center">
                    <div className="font-display text-xl font-black" style={{ color: d.color }}>{d.value}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wide mt-0.5 leading-tight">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </>
  );
});
ClubStatsPanel.displayName = 'ClubStatsPanel';
