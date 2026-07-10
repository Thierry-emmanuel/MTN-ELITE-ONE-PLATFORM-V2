import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { PlayerAvatar } from '@/components/elite/stats/MediaAvatar';
import type { Club, LionsCallUp } from '@/types/football.types';

interface ClubRoadToLionsProps {
  club: Club;
  callUps: LionsCallUp[];
}

/**
 * "Route vers les Lions" — every player the club has sent to the national
 * team, laid out as a vertical timeline of call-ups, from the current squad
 * back through the club's international lineage.
 */
export const ClubRoadToLions = memo(({ club, callUps }: ClubRoadToLionsProps) => {
  const primary = club.color || '#FCD116';

  return (
    <>
      <SectionHeading
        icon={Flag}
        room="Salle 04"
        title="Route vers les Lions"
        subtitle="Chaque joueur formé ou révélé par le club qui a porté le maillot des Lions Indomptables."
        accentColor={primary}
      />

      {callUps.length === 0 ? (
        <p className="text-sm text-white/40">Aucune sélection en équipe nationale répertoriée pour ce club.</p>
      ) : (
        <div className="relative pl-8 sm:pl-10">
          <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <div className="space-y-5">
            {callUps.map((c, i) => (
              <Reveal key={c.playerName} delay={i * 0.05}>
                <div className="relative">
                  <span
                    className="absolute -left-8 sm:-left-10 top-5 h-3 w-3 rounded-full border-2"
                    style={{ backgroundColor: c.active ? '#008751' : '#06090a', borderColor: c.active ? '#008751' : primary }}
                  />
                  <div className="flex items-center gap-4 p-4 sm:p-5 bg-white/[0.02] border border-white/10 hover:border-white/25 transition-colors">
                    <PlayerAvatar photoUrl={c.photoUrl} name={c.playerName} size={52} className="ring-2 ring-white/10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display text-sm font-black text-white">{c.playerName}</h4>
                        {c.active && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-[#008751]/15 text-[#008751] border border-[#008751]/40">
                            En sélection actuellement
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">
                        {c.position ? `${c.position} · ` : ''}{c.period} · {c.caps} sélection{c.caps > 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.competitions.map(comp => (
                          <span key={comp} className="text-[9px] font-semibold px-2 py-0.5 border" style={{ borderColor: `${primary}40`, color: primary, background: `${primary}0d` }}>
                            {comp}
                          </span>
                        ))}
                      </div>
                      {c.note && <p className="text-xs text-white/55 leading-relaxed mt-2 font-serif italic">{c.note}</p>}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/players" className="text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors">
          Explorer tous les Passeports Football →
        </Link>
      </div>
    </>
  );
});
ClubRoadToLions.displayName = 'ClubRoadToLions';
