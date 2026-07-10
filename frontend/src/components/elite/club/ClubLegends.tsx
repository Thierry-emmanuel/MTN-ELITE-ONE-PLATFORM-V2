import { memo } from 'react';
import { Star } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import type { Club, ClubLegend } from '@/types/football.types';

interface ClubLegendsProps {
  club: Club;
  legends: ClubLegend[];
}

/**
 * Club Legends — the players, captains and coaches who defined the
 * institution, presented as portrait plaques with their story and legacy.
 */
export const ClubLegends = memo(({ club, legends }: ClubLegendsProps) => {
  const primary = club.color || '#FCD116';

  return (
    <>
      <SectionHeading
        icon={Star}
        room="Salle 06"
        title="Légendes du Club"
        subtitle="Joueurs, capitaines et entraîneurs dont l'empreinte dépasse les statistiques."
        accentColor={primary}
      />

      {legends.length === 0 ? (
        <p className="text-sm text-white/40">Panthéon en cours de constitution.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {legends.map((l, i) => (
            <Reveal key={l.id} delay={i * 0.06}>
              <div className="group border border-white/10 bg-white/[0.02] hover:border-white/25 transition-all overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
                  {l.photoUrl ? (
                    <img
                      src={l.photoUrl}
                      alt={l.name}
                      className="h-full w-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center">
                      <span className="font-display text-4xl font-black text-white/10">{l.name.slice(0, 1)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-transparent to-transparent" />
                  <span
                    className="absolute top-3 left-3 text-[9px] font-bold px-2 py-1 uppercase tracking-wider border"
                    style={{ background: `${primary}1c`, color: primary, borderColor: `${primary}45`, backdropFilter: 'blur(4px)' }}
                  >
                    {l.role}
                  </span>
                </div>
                <div className="p-5 space-y-2.5 flex-1 flex flex-col">
                  <div>
                    <h4 className="font-serif italic text-xl text-white leading-tight">{l.name}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">
                      {l.position ? `${l.position} · ` : ''}{l.years}
                    </p>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed flex-1">{l.bio}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-white/10" style={{ color: primary }}>
                    {l.highlight}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
});
ClubLegends.displayName = 'ClubLegends';
