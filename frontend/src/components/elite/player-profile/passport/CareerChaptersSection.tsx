import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type { CareerChapter } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';

interface Props {
  player: PlayerProfile;
  chapters: CareerChapter[];
}

export function CareerChaptersSection({ chapters }: Props) {
  return (
    <section id="chapitres" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={BookOpen} title="Chapitres de Carrière" subtitle="Une histoire racontée en quatre actes" />

        <div className="space-y-6">
          {chapters.map((chapter, i) => {
            const reverse = i % 2 === 1;
            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl border border-border bg-gradient-card"
              >
                <div className={`grid lg:grid-cols-5 ${reverse ? 'lg:[direction:rtl]' : ''}`}>
                  <div className="lg:col-span-2 relative min-h-[220px] lg:min-h-[340px] [direction:ltr]">
                    <img src={chapter.image} alt={chapter.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-background/40" />
                    <div className="absolute top-5 left-5 font-display text-6xl font-black text-white/25 leading-none select-none">
                      {chapter.numeral}
                    </div>
                  </div>

                  <div className="lg:col-span-3 p-6 sm:p-10 [direction:ltr]">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold mb-2">
                      Chapitre {chapter.numeral} · {chapter.years}
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-wide leading-tight">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 italic">{chapter.theme}</p>

                    <p className="text-sm text-foreground/80 leading-relaxed mt-5">{chapter.narrative}</p>

                    <blockquote className="mt-5 pl-4 border-l-2 border-accent/50">
                      <p className="font-serif italic text-foreground/90 text-base leading-relaxed">"{chapter.quote}"</p>
                      <cite className="text-[10px] uppercase tracking-widest text-muted-foreground not-italic block mt-1.5">— {chapter.quoteAuthor}</cite>
                    </blockquote>

                    <div className="flex flex-wrap gap-6 mt-6 pt-5 border-t border-white/[0.06]">
                      {chapter.stats.map(s => (
                        <div key={s.label}>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{s.label}</div>
                          <div className="text-sm font-bold text-foreground mt-0.5">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
