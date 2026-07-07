import {
  History, GraduationCap, PlayCircle, ArrowLeftRight, Repeat, RotateCcw,
  Trophy, Flame, Flag,
} from 'lucide-react';
import type { PlayerProfile, TimelineEventType } from '@/types/playerProfile.types';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

const TYPE_META: Record<TimelineEventType, { icon: any; color: string }> = {
  academy: { icon: GraduationCap, color: '#94A3B8' },
  debut: { icon: PlayCircle, color: '#3B82F6' },
  transfer: { icon: ArrowLeftRight, color: '#FCD116' },
  loan: { icon: Repeat, color: '#A78BFA' },
  return: { icon: RotateCcw, color: '#94A3B8' },
  honour: { icon: Trophy, color: '#22C55E' },
  milestone: { icon: Flame, color: '#EF4444' },
  international: { icon: Flag, color: '#008751' },
};

export function CareerSection({ player }: Props) {
  return (
    <section id="carriere" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={History} title="Carrière" subtitle="Statistiques saison par saison et grandes étapes" />

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Season-by-season table */}
          <div className="lg:col-span-3 bg-gradient-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="text-left px-4 py-3 font-semibold">Saison</th>
                    <th className="text-left px-4 py-3 font-semibold">Club</th>
                    <th className="text-center px-3 py-3 font-semibold">MJ</th>
                    <th className="text-center px-3 py-3 font-semibold">B</th>
                    <th className="text-center px-3 py-3 font-semibold">PD</th>
                    <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">Min</th>
                  </tr>
                </thead>
                <tbody>
                  {player.careerSeasons.map(row => (
                    <tr key={row.season} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{row.season}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <ClubBadge club={row.club} size={20} />
                          <span className="truncate text-foreground/85">{row.club.name}</span>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3 tabular-nums text-muted-foreground">{row.appearances}</td>
                      <td className="text-center px-3 py-3 tabular-nums font-bold text-foreground">{row.goals}</td>
                      <td className="text-center px-3 py-3 tabular-nums font-bold text-foreground">{row.assists}</td>
                      <td className="text-center px-3 py-3 tabular-nums text-muted-foreground hidden sm:table-cell">{row.minutes.toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vertical timeline */}
          <div className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">Parcours</h3>
            <div className="relative pl-8">
              <div className="absolute left-[13px] top-1 bottom-1 w-px bg-white/10" />
              <div className="space-y-6">
                {player.careerTimeline.map(entry => {
                  const meta = TYPE_META[entry.type];
                  const Icon = meta.icon;
                  return (
                    <div key={entry.id} className="relative">
                      <div
                        className="absolute -left-8 top-0 h-7 w-7 rounded-full grid place-items-center ring-4 ring-background"
                        style={{ background: `${meta.color}22`, color: meta.color }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-0.5">
                        {entry.season}
                      </div>
                      <div className="text-sm font-bold text-foreground leading-tight">{entry.title}</div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.description}</p>
                      {entry.statValue && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-foreground/70">
                          {entry.statLabel}: {entry.statValue}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
