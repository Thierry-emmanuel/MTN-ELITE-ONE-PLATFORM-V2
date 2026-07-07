import { memo, useMemo } from 'react';
import { Video as VideoIcon, Play } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { buildClubVideos } from '@/services/clubProfileData';
import { buildClubGallery } from './clubAssets';
import type { Club } from '@/types/football.types';

interface ClubVideosProps {
  club: Club;
}

export const ClubVideos = memo(({ club }: ClubVideosProps) => {
  const primary = club.color || '#FCD116';
  const videos = useMemo(() => buildClubVideos(club), [club]);
  const thumbs = useMemo(() => buildClubGallery(club.id), [club.id]);

  return (
    <>
      <SectionHeading icon={VideoIcon} room="Salle 09" title="Vidéos" subtitle="Résumés, coulisses et interviews du club." accentColor={primary} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {videos.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.06}>
            <div className="group cursor-pointer">
              <div className="relative aspect-video overflow-hidden border border-white/10 group-hover:border-white/25 transition-colors">
                <img
                  src={thumbs[i % thumbs.length]}
                  alt={v.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className="h-12 w-12 rounded-full grid place-items-center shadow-lg transition-transform group-hover:scale-110 border-2 border-white/20"
                    style={{ backgroundColor: primary }}
                  >
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
                <span
                  className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${primary}cc`, color: '#000' }}
                >
                  {v.category}
                </span>
              </div>
              <h4 className="mt-2.5 text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {v.title}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{v.date}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
});
ClubVideos.displayName = 'ClubVideos';
