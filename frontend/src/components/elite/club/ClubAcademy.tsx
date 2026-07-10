import { memo } from 'react';
import { GraduationCap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { PlayerAvatar } from '@/components/elite/stats/MediaAvatar';
import type { Club, AcademyProspect } from '@/types/football.types';

interface ClubAcademyProps {
  club: Club;
  prospects: AcademyProspect[];
}

/**
 * Academy & Rising Stars — the club's next generation: current prospects
 * being groomed, and graduates who made the jump to the first team.
 */
export const ClubAcademy = memo(({ club, prospects }: ClubAcademyProps) => {
  const primary = club.color || '#FCD116';

  return (
    <>
      <SectionHeading
        icon={GraduationCap}
        room="Salle 10"
        title="Académie & Étoiles Montantes"
        subtitle="Les futurs Lions formés par le club — prospects suivis de près et jeunes diplômés du centre de formation."
        accentColor={primary}
      />

      {prospects.length === 0 ? (
        <p className="text-sm text-white/40">Aucun prospect répertorié pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prospects.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <div className="border border-white/10 bg-white/[0.02] hover:border-white/25 transition-colors p-5 text-center space-y-3">
                <PlayerAvatar photoUrl={p.photoUrl} name={p.name} size={72} className="mx-auto ring-2 ring-white/10" />
                <div>
                  <h4 className="font-display text-sm font-black text-white">{p.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">{p.position} · {p.age} ans</p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border"
                  style={p.status === 'graduate'
                    ? { background: '#00875115', color: '#008751', borderColor: '#00875140' }
                    : { background: `${primary}14`, color: primary, borderColor: `${primary}40` }}
                >
                  {p.status === 'graduate' ? <CheckCircle2 className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {p.status === 'graduate' ? "Diplômé de l'académie" : 'Prospect suivi'}
                </span>
                <p className="text-xs text-white/55 leading-relaxed text-left">{p.note}</p>
                {p.destinationClub && (
                  <p className="text-[10px] text-white/40 text-left pt-2 border-t border-white/10">→ {p.destinationClub}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
});
ClubAcademy.displayName = 'ClubAcademy';
