import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { AwardCategory, HistoricalWinner, PlayerNominee } from '@/types/awards.types';

// Categories the Archive knows how to label. Only ones actually present in the
// supplied data render as filter pills — no empty tabs.
const CATEGORY_LABEL: Partial<Record<AwardCategory, string>> = {
  BALLON_DOR:       "Ballon d'Or",
  PLAYER_OF_SEASON:  'Meilleur joueur',
  TOP_SCORER:        'Meilleur buteur',
  BEST_GOALKEEPER:   'Meilleur gardien',
  COACH_OF_SEASON:   'Meilleur entraîneur',
};

interface ArchiveRowProps {
  entry: HistoricalWinner;
  index: number;
}

function ArchiveRow({ entry, index }: ArchiveRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const winner = entry.winner as PlayerNominee & { description?: string };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="relative grid grid-cols-[3.5rem_auto_1fr] gap-5 py-8 sm:grid-cols-[5rem_auto_1fr] sm:gap-8 sm:py-10 lg:grid-cols-[7rem_auto_1fr]"
    >
      {/* Year numeral */}
      <div className="pt-1 text-right">
        <p className="font-display text-2xl font-black leading-none text-white/25 tabular-nums sm:text-3xl lg:text-4xl">
          {entry.year}
        </p>
      </div>

      {/* Timeline spine */}
      <div className="relative flex justify-center">
        <span className="absolute top-2 h-2.5 w-2.5 rounded-full border border-[#FCD116]/70 bg-black" />
        <span className="absolute top-2 h-full w-px bg-white/[0.08]" />
      </div>

      {/* Portrait + narrative */}
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-white/[0.03] sm:h-24 sm:w-20">
          {winner.photoUrl ? (
            <img src={winner.photoUrl} alt={winner.name} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/15">
              {winner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#FCD116]/60">
            {CATEGORY_LABEL[entry.category] ?? entry.category}
          </p>
          <h3 className="mt-1 font-serif italic text-xl font-medium text-white sm:text-2xl">
            {winner.name}
          </h3>
          <p className="text-xs text-white/35">{winner.clubName}</p>
          {winner.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-[15px]">
              {winner.description}
            </p>
          )}
          {winner.highlightStat && (
            <p className="mt-3 text-[11px] uppercase tracking-wider text-white/30">
              <span className="font-display font-bold text-[#FCD116]/80">{winner.highlightStat.value}</span>
              {' '}{winner.highlightStat.label}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface AwardsArchiveTimelineProps {
  entries: HistoricalWinner[];
}

export function AwardsArchiveTimeline({ entries }: AwardsArchiveTimelineProps) {
  const availableCategories = useMemo(
    () => Array.from(new Set(entries.map(e => e.category))),
    [entries],
  );
  const [active, setActive] = useState<AwardCategory | 'ALL'>('ALL');

  const visible = useMemo(
    () => (active === 'ALL' ? entries : entries.filter(e => e.category === active)),
    [entries, active],
  );

  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-60px' });

  if (entries.length === 0) return null;

  return (
    <section id="archive" className="relative bg-black py-20 sm:py-28">
      <div className="container">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 16 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[.35em] text-[#FCD116]/70">Les archives</p>
          <h2 className="mt-3 font-serif italic text-3xl font-medium text-white sm:text-4xl lg:text-5xl">
            Voyager à travers l'histoire
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/45 sm:text-base">
            Chaque saison a couronné un nom. Ensemble, ils racontent la mémoire du championnat.
          </p>
        </motion.div>

        {availableCategories.length > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActive('ALL')}
              className={`rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                active === 'ALL'
                  ? 'border-[#FCD116]/50 bg-[#FCD116]/10 text-[#FCD116]'
                  : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
              }`}
            >
              Tout
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  active === cat
                    ? 'border-[#FCD116]/50 bg-[#FCD116]/10 text-[#FCD116]'
                    : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                }`}
              >
                {CATEGORY_LABEL[cat] ?? cat}
              </button>
            ))}
          </div>
        )}

        <div className="mx-auto mt-6 max-w-3xl divide-y divide-white/[0.06]">
          {visible.map((entry, i) => (
            <ArchiveRow key={`${entry.category}-${entry.year}`} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}