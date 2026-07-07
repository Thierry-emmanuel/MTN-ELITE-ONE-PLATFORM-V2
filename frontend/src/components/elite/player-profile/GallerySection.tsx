import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

export function GallerySection({ player }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const images = player.gallery;

  const go = (dir: 1 | -1) => {
    if (active === null) return;
    setActive((active + dir + images.length) % images.length);
  };

  return (
    <section id="galerie" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Images} title="Galerie" subtitle={`${images.length} clichés en action et hors terrain`} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/25 transition-all ${i === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-auto' : 'aspect-square'}`}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-[11px] text-white/90 leading-snug line-clamp-2">{img.caption}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <button
              onClick={() => setActive(null)}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); go(-1); }}
              className="absolute left-4 sm:left-8 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); go(1); }}
              className="absolute right-4 sm:right-8 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-3xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={images[active].url}
                alt={images[active].caption}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
              <p className="text-center text-sm text-white/70 mt-4">{images[active].caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
