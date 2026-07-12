import { motion } from 'framer-motion';
import { Crown, Quote } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type { LegacyData } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';

interface Props {
  player: PlayerProfile;
  legacy: LegacyData;
}

const ROLE_COLOR: Record<string, string> = {
  'Coéquipier': '#f59e0b',
  'Entraîneur': '#38BDF8',
  'Supporter': '#22C55E',
  'Journaliste': '#A78BFA',
};

export function LegacySection({ player, legacy }: Props) {
  return (
    <section id="heritage" className="scroll-mt-32 py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="container relative z-10">
        <SectionHeading icon={Crown} title="Héritage" subtitle={`Comment ${player.playerName} marque le football camerounais`} />

        {/* Statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-10"
        >
          <p className="font-serif italic text-xl sm:text-2xl text-foreground/90 leading-relaxed">
            "{legacy.statement}"
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {legacy.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-gradient-card border border-border rounded-2xl p-6"
            >
              <div className="font-display text-3xl font-black text-accent tabular-nums">{s.value}</div>
              <div className="text-xs font-bold text-foreground/85 mt-1">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {legacy.testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="relative bg-gradient-card border border-border rounded-2xl p-6"
            >
              <Quote className="h-5 w-5 mb-3 opacity-40" style={{ color: ROLE_COLOR[t.role] }} />
              <p className="text-sm text-foreground/85 leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${ROLE_COLOR[t.role]}18`, color: ROLE_COLOR[t.role] }}>
                  {t.role}
                </span>
                <span className="text-xs text-muted-foreground">{t.author}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center py-8 border-t border-white/[0.06]"
        >
          <p className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-foreground/90">
            {legacy.closingLine}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
