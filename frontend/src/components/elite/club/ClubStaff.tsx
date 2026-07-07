import { memo } from 'react';
import { ClipboardList, Award } from 'lucide-react';
import { SectionHeading, Reveal, VitrinePanel } from './ClubSectionShell';
import { PlayerAvatar } from '@/components/elite/stats/MediaAvatar';
import type { Club, CoachStaff } from '@/types/football.types';

interface ClubStaffProps {
  club: Club;
  coaches?: CoachStaff[];
  isLoading: boolean;
}

export const ClubStaff = memo(({ club, coaches, isLoading }: ClubStaffProps) => {
  const primary = club.color || '#FCD116';
  const head = coaches?.[0];

  const staffLines = head ? [
    { role: 'Entraîneur adjoint',    name: head.assistantCoachName },
    { role: 'Préparateur physique',  name: head.fitnessCoachName },
    { role: 'Entraîneur des gardiens', name: head.goalkeeperCoachName },
    { role: 'Analyste vidéo',        name: head.analystName },
  ].filter(l => l.name) : [];

  return (
    <>
      <SectionHeading icon={ClipboardList} room="Salle 04" title="Encadrement Technique" accentColor={primary} />

      {isLoading ? (
        <div className="h-40 bg-white/5 animate-pulse" />
      ) : !head ? (
        <p className="text-sm text-white/40">Encadrement technique non communiqué.</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Head coach spotlight */}
          <Reveal>
            <VitrinePanel className="lg:col-span-2 p-7 flex flex-col sm:flex-row gap-6" accentColor={primary}>
              <PlayerAvatar
                photoUrl={head.photoUrl}
                name={`${head.firstName} ${head.lastName}`}
                size={96}
                className="ring-2 ring-white/10"
              />
              <div className="min-w-0 space-y-2.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block border"
                  style={{ background: `${primary}14`, color: primary, borderColor: `${primary}40` }}
                >
                  Entraîneur principal
                </span>
                <h3 className="font-display text-2xl font-black text-white leading-tight">
                  {head.firstName} {head.lastName}
                </h3>
                <p className="text-xs text-white/45 flex flex-wrap gap-x-4 gap-y-1">
                  <span>{head.nationality}</span>
                  {head.qualification && <span>{head.qualification}</span>}
                  {head.specialization && <span>{head.specialization}</span>}
                </p>
                {head.biography && (
                  <p className="text-sm text-white/70 leading-relaxed font-serif">{head.biography}</p>
                )}
              </div>
            </VitrinePanel>
          </Reveal>

          {/* Trophies + staff list */}
          <Reveal delay={0.08}>
            <VitrinePanel className="p-6 space-y-5">
              {head.trophies && head.trophies.length > 0 && (
                <div>
                  <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <Award className="h-3.5 w-3.5" style={{ color: primary }} />
                    Trophées obtenus
                  </h4>
                  <ul className="space-y-1.5">
                    {head.trophies.map((t, i) => (
                      <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                        <span className="h-1 w-1 shrink-0" style={{ backgroundColor: primary }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {staffLines.length > 0 && (
                <div className={head.trophies?.length ? 'pt-4 border-t border-white/10' : ''}>
                  <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-2.5">Staff technique</h4>
                  <div className="space-y-2.5">
                    {staffLines.map(line => (
                      <div key={line.role} className="flex justify-between gap-2 text-xs">
                        <span className="text-white/45">{line.role}</span>
                        <span className="font-semibold text-white text-right">{line.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </VitrinePanel>
          </Reveal>
        </div>
      )}
    </>
  );
});
ClubStaff.displayName = 'ClubStaff';
