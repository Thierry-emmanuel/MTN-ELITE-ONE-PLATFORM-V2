import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Shirt, Award, Trophy, Footprints, Medal, CircleDot } from 'lucide-react';
import type { MemoryObject } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';

interface Props {
  items: MemoryObject[];
}

const ICON_MAP: Record<MemoryObject['icon'], any> = {
  shirt: Shirt, armband: Award, trophy: Trophy, boot: Footprints, medal: Medal, ball: CircleDot,
};

export function MemoryBoxSection({ items }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="souvenirs" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Archive} title="Boîte à Souvenirs" subtitle="Les objets qui racontent une carrière" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon];
            const open = openId === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setOpenId(open ? null : item.id)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="text-left group relative overflow-hidden bg-gradient-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all duration-300"
              >
                <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-2xl opacity-15 bg-accent group-hover:opacity-25 transition-opacity" />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/25 grid place-items-center mb-4">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-1">
                    {new Date(item.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  <motion.p
                    initial={false}
                    animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                    className="text-xs text-muted-foreground leading-relaxed mt-3 overflow-hidden"
                  >
                    {item.story}
                  </motion.p>
                  {!open && (
                    <p className="text-[10px] text-accent/70 mt-3 uppercase tracking-widest font-bold">Toucher pour découvrir l'histoire</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
