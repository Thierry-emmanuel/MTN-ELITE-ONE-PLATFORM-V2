import { motion } from 'framer-motion';
import { Dna, Footprints } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type { CareerDna } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';

interface Props {
  player: PlayerProfile;
  dna: CareerDna;
}

export function CareerDnaSection({ player, dna }: Props) {
  return (
    <section id="dna" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Dna} title="ADN de Carrière" subtitle="Au-delà des statistiques — le profil du footballeur" />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-gradient-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="space-y-5">
              {dna.attributes.map((attr, i) => (
                <div key={attr.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground/85">{attr.label}</span>
                    <span className="text-xs font-bold text-accent tabular-nums">{attr.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${attr.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--gradient-primary)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-card border border-border rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Style de Jeu</div>
              <p className="text-sm font-bold text-foreground mt-1.5 leading-snug">{dna.playingStyle}</p>
            </div>
            <div className="bg-gradient-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">
                <Footprints className="h-3.5 w-3.5" /> Pied Fort
              </div>
              <p className="text-sm font-bold text-foreground mt-1.5">{player.preferredFoot}</p>
            </div>
            <div className="bg-gradient-card border border-accent/25 rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-widest text-accent/80">Potentiel</div>
              <p className="text-sm font-bold text-foreground mt-1.5">{dna.potential}</p>
            </div>
            <div className="bg-gradient-card border border-border rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1.5">Analyse</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{dna.development}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
