import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Quote } from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import { legends } from '@/components/elite/data';
import { LegendFeature } from '@/components/elite/LegendFeature';
import { MuseumTimeline } from '@/components/elite/MuseumTimeline';
import trophyArt from '@/assets/images/halloffame/ballon d\'or.png';

// ─── Era filter — mirrors the players' individual eras ─────────────────────────
const ERAS = [
  { id: 'all',  label: 'Toutes les légendes' },
  { id: '70',   label: '1970s' },
  { id: '80',   label: '1980s' },
  { id: '90',   label: '1990s' },
  { id: '2000', label: '2000s+' },
];

const eraToFilter = (era: string): string => {
  if (era.includes('197')) return '70';
  if (era.includes('198')) return '80';
  if (era.includes('199')) return '90';
  if (era.includes('200') || era.includes('201')) return '2000';
  return 'all';
};

export default function HallOfFamePage() {
  const [activeEra, setActiveEra] = useState('all');
  const filtered = activeEra === 'all' ? legends : legends.filter(l => eraToFilter(l.era) === activeEra);

  return (
    <PageLayout>
      {/* ── Hero — museum entrance hall ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10" style={{ background: '#06090a' }}>
        <div className="absolute inset-0 opacity-[0.14]">
          <img src={trophyArt} alt="" className="h-full w-full object-cover object-center grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#06090a] via-[#06090a]/85 to-[#06090a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(252,209,22,0.10),transparent_70%)]" />

        <div className="container relative py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <div className="h-px w-8 bg-[#FCD116]" />
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#FCD116] font-semibold">MTN Elite One · Musée des Légendes</p>
            <div className="h-px w-8 bg-[#FCD116]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-white leading-[0.98] mb-6"
          >
            Le Hall of Fame
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-xl mx-auto text-sm sm:text-base text-white/55 leading-relaxed"
          >
            Une galerie dédiée aux joueurs qui ont façonné l'histoire du football camerounais —
            des icônes des années 70 aux artisans de la modernité. Chaque vitrine raconte un héritage.
          </motion.p>

          <div className="flex justify-center gap-2 mt-8">
            {['#008751', '#FCD116', '#CE1126'].map(c => (
              <div key={c} className="h-1 w-10 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery — the vitrines ──────────────────────────────────────────── */}
      <section className="container py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#FCD116] font-semibold mb-2">Salle 01</p>
            <h2 className="font-display text-2xl lg:text-3xl uppercase tracking-tight text-white">Les Vitrines</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {ERAS.map(era => (
              <button
                key={era.id}
                onClick={() => setActiveEra(era.id)}
                className={`shrink-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                  activeEra === era.id
                    ? 'bg-[#FCD116] text-[#06090a] border-[#FCD116]'
                    : 'bg-white/[0.02] text-white/50 border-white/10 hover:border-[#FCD116]/40 hover:text-white'
                }`}
              >
                {era.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeEra}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.map((legend, i) => (
              <LegendFeature key={legend.id} legend={legend} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="text-[10px] text-white/25 text-center mt-2 uppercase tracking-widest">
          Survolez un portrait pour découvrir la citation de la légende
        </p>
      </section>

      {/* ── Timeline — the corridor of history ──────────────────────────────── */}
      <section className="border-t border-white/10" style={{ background: 'linear-gradient(180deg, #06090a, #0a0f0d)' }}>
        <div className="container py-16 lg:py-20">
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#FCD116] font-semibold mb-2">Salle 02</p>
            <h2 className="font-display text-2xl lg:text-3xl uppercase tracking-tight text-white mb-3">La Chronologie des Lions</h2>
            <p className="text-sm text-white/50 max-w-lg">Des origines du championnat à l'ère numérique — les moments qui ont défini le football camerounais.</p>
          </div>
          <MuseumTimeline />
        </div>
      </section>

      {/* ── Closing plaque ──────────────────────────────────────────────────── */}
      <section className="container py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto border border-[#FCD116]/20 p-10 lg:p-14 text-center space-y-5 relative"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <Quote className="h-7 w-7 text-[#FCD116] mx-auto opacity-60" />
          <p className="font-serif italic text-xl lg:text-2xl text-white/90 leading-relaxed">
            "Le football au Cameroun n'est pas seulement un sport, c'est une religion,
            un ciment social qui unit le pays tout entier sous le même drapeau."
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Trophy className="h-3.5 w-3.5 text-[#FCD116]/60" />
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Légende du football camerounais</span>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}
