import { memo } from 'react';
import { Info, Palette, MapPinned, UserRound } from 'lucide-react';
import type { Club } from '@/types/football.types';
import { SectionHeading, Reveal, VitrinePanel } from './ClubSectionShell';
import { STADIUM_FALLBACK_IMAGE } from './clubAssets';

interface ClubOverviewProps {
  club: Club;
}

export const ClubOverview = memo(({ club }: ClubOverviewProps) => {
  const primary = club.color || '#FCD116';
  const secondary = club.secondaryColor || '#022c22';

  return (
    <>
      <SectionHeading
        icon={Info}
        room="Salle 01"
        title="Aperçu du club"
        subtitle="La carte d'identité de l'institution — couleurs, terre d'ancrage et repères."
        accentColor={primary}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Editorial description */}
        <Reveal>
          <VitrinePanel className="lg:col-span-2 h-full p-7 space-y-5" accentColor={primary}>
            <p className="font-serif text-lg lg:text-xl text-white/85 leading-relaxed">
              {club.description ?? `${club.name} est l'une des institutions du football camerounais, portée par une histoire riche et un public passionné.`}
            </p>
            <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10 text-xs">
              {club.presidentName && (
                <div className="flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 text-white/40" />
                  <div>
                    <div className="text-white/40 uppercase tracking-wide text-[9px]">Président</div>
                    <div className="font-semibold text-white">{club.presidentName}</div>
                  </div>
                </div>
              )}
              {club.city && (
                <div className="flex items-center gap-2">
                  <MapPinned className="h-3.5 w-3.5 text-white/40" />
                  <div>
                    <div className="text-white/40 uppercase tracking-wide text-[9px]">Ville</div>
                    <div className="font-semibold text-white">{club.city}{club.region ? `, ${club.region}` : ''}</div>
                  </div>
                </div>
              )}
            </div>
          </VitrinePanel>
        </Reveal>

        {/* Colours swatch */}
        <Reveal delay={0.08}>
          <VitrinePanel className="h-full p-6 space-y-4">
            <h3 className="font-display text-[11px] font-bold text-white/80 uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" style={{ color: primary }} />
              Couleurs du club
            </h3>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-14 border border-white/10" style={{ backgroundColor: primary }} />
                <p className="text-[10px] text-center text-white/40 uppercase tracking-wider font-mono">{primary}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="h-14 border border-white/10" style={{ backgroundColor: secondary }} />
                <p className="text-[10px] text-center text-white/40 uppercase tracking-wider font-mono">{secondary}</p>
              </div>
            </div>
            {club.foundedYear && (
              <div className="pt-3 border-t border-white/10 flex justify-between text-xs">
                <span className="text-white/50">Année de fondation</span>
                <span className="font-semibold text-white">{club.foundedYear}</span>
              </div>
            )}
          </VitrinePanel>
        </Reveal>
      </div>

      {/* Stadium spotlight — a panoramic window of its own */}
      <Reveal delay={0.12}>
        <div className="mt-5 relative overflow-hidden border border-white/10 group">
          <img
            src={club.stadiumPhotoUrl || STADIUM_FALLBACK_IMAGE}
            alt={club.stadium || 'Stade du club'}
            className="h-52 lg:h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-[#06090a]/45 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: primary }}>Antre du club</span>
              <h3 className="font-serif italic text-2xl lg:text-3xl text-white">{club.stadium || 'Stade Municipal'}</h3>
            </div>
            {club.stadiumCapacity && (
              <div className="text-right">
                <div className="font-display text-2xl font-black text-white">{club.stadiumCapacity.toLocaleString('fr-FR')}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Places assises</div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </>
  );
});
ClubOverview.displayName = 'ClubOverview';
