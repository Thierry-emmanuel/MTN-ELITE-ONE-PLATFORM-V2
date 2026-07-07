import { memo, useMemo, useState } from 'react';
import { Images, X } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { buildClubGallery } from './clubAssets';
import type { Club } from '@/types/football.types';

interface ClubGalleryProps {
  club: Club;
}

export const ClubGallery = memo(({ club }: ClubGalleryProps) => {
  const primary = club.color || '#FCD116';
  const images = useMemo(() => buildClubGallery(club.id), [club.id]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <SectionHeading icon={Images} room="Salle 08" title="Galerie" subtitle="Moments forts capturés sur et en dehors du terrain." accentColor={primary} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {images.map((src, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <button
              onClick={() => setLightbox(i)}
              className="group block w-full text-left border border-white/10 hover:border-white/25 transition-colors"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={src}
                  alt={`${club.name} — photo ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Placard */}
              <div className="px-2 py-1.5 border-t border-white/10 bg-white/[0.02]">
                <span className="text-[8px] uppercase tracking-widest font-mono text-white/35">Pièce n°{String(i + 1).padStart(2, '0')}</span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex flex-col items-center justify-center p-6 gap-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 h-10 w-10 border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <img
            src={images[lightbox]}
            alt={`${club.name} — photo agrandie`}
            className="max-h-[75vh] max-w-full object-contain border border-white/10"
            onClick={e => e.stopPropagation()}
          />
          <div className="text-center" onClick={e => e.stopPropagation()}>
            <p className="text-[10px] uppercase tracking-[0.24em] font-mono" style={{ color: primary }}>
              Pièce n°{String(lightbox + 1).padStart(2, '0')} — {images.length}
            </p>
            <p className="text-xs text-white/40 mt-1">{club.name} · Collection photographique</p>
          </div>
        </div>
      )}
    </>
  );
});
ClubGallery.displayName = 'ClubGallery';
