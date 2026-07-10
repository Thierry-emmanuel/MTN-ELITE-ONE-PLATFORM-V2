import { motion } from 'framer-motion';
import { Compass, GraduationCap, Rocket, TrendingUp, Eye, Flag, Trophy, Globe2, Crown, Star } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type { PassportStamp } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';

interface Props {
  player: PlayerProfile;
  stamps: PassportStamp[];
}

interface JourneyStep { label: string; icon: any; done: boolean; note: string; }

export function JourneyIndexSection({ player, stamps }: Props) {
  const has = (cat: string) => stamps.some(s => s.category === cat && s.unlocked);

  const steps: JourneyStep[] = [
    { label: 'Académie', icon: GraduationCap, done: true, note: `Formé à ${player.birthPlace ?? '—'}` },
    { label: 'Débuts Professionnels', icon: Rocket, done: has('debut'), note: player.formerClubs?.[0] ?? player.clubName },
    { label: 'Perçée', icon: TrendingUp, done: (player.age ?? 25) <= 24, note: 'Confirmation en Elite One' },
    { label: 'Jeune Talent à Suivre', icon: Eye, done: stamps.some(s => s.title.includes('Jeune Talent') && s.unlocked), note: 'Radar des recruteurs' },
    { label: 'Route vers les Lions', icon: Compass, done: stamps.some(s => s.title.includes('Route vers les Lions') && s.unlocked), note: 'Suivi par le staff national' },
    { label: 'Équipe Nationale', icon: Flag, done: has('national'), note: 'Lions Indomptables' },
    { label: 'CAN', icon: Globe2, done: stamps.some(s => s.title.includes('CAN') && s.unlocked), note: 'Coupe d\'Afrique des Nations' },
    { label: 'Coupe du Monde', icon: Trophy, done: false, note: 'Prochain objectif' },
    { label: 'Hall of Fame', icon: Star, done: false, note: 'Statut à construire' },
    { label: 'Légende', icon: Crown, done: stamps.some(s => s.category === 'legacy' && s.unlocked), note: 'Réservé aux plus grands' },
  ];

  return (
    <section id="parcours" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Compass} title="Index du Voyage" subtitle="Le carnet de route, étape par étape" />

        <div className="relative">
          {/* connecting line */}
          <div className="absolute left-[19px] sm:left-1/2 top-2 bottom-2 w-px bg-white/10 sm:-translate-x-1/2" />

          <div className="space-y-1">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-center gap-4 sm:gap-0 py-4 sm:w-1/2 ${isLeft ? 'sm:pr-10' : 'sm:ml-[50%] sm:pl-10'}`}
                >
                  <div
                    className={`absolute left-0 sm:left-auto ${isLeft ? 'sm:right-[-19px]' : 'sm:left-[-19px]'} h-10 w-10 rounded-full grid place-items-center ring-4 ring-background shrink-0`}
                    style={{
                      background: step.done ? 'hsl(153 100% 27% / 0.18)' : 'hsl(168 20% 15%)',
                      color: step.done ? '#22C55E' : 'hsl(168 15% 45%)',
                      border: step.done ? '1px solid #22C55E55' : '1px dashed hsl(168 20% 30%)',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className={`pl-16 sm:pl-0 ${isLeft ? '' : ''}`}>
                    <div className={`text-sm font-bold ${step.done ? 'text-foreground' : 'text-muted-foreground/50'}`}>{step.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{step.note}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
