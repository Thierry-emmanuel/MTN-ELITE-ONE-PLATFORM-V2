import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, GraduationCap, Shield, Flag, Globe2, Plane } from 'lucide-react';
import type { CareerMapStop, MapStopKind } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';
import { ClubBadge } from '@/components/elite/ClubBadge';

interface Props {
  stops: CareerMapStop[];
}

const KIND_META: Record<MapStopKind, { icon: any; color: string }> = {
  formation:  { icon: GraduationCap, color: '#B08D57' },
  club:       { icon: Shield,        color: '#f59e0b' },
  national:   { icon: Flag,          color: '#22C55E' },
  continental:{ icon: Globe2,        color: '#38BDF8' },
  world:      { icon: Plane,         color: '#A78BFA' },
};

export function CareerMapSection({ stops }: Props) {
  const [active, setActive] = useState(0);
  const current = stops[active];
  const meta = KIND_META[current.kind];
  const Icon = meta.icon;

  return (
    <section id="carte" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Map} title="Carte de Carrière" subtitle="Le voyage, étape par étape, à travers le football" />

        {/* Route rail */}
        <div className="relative mb-10 overflow-x-auto pb-2 -mx-1 px-1">
          <div className="relative flex items-center min-w-max gap-0 pt-2">
            <div className="absolute left-6 right-6 top-[27px] h-px bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
            {stops.map((stop, i) => {
              const m = KIND_META[stop.kind];
              const StopIcon = m.icon;
              const isActive = i === active;
              return (
                <button
                  key={stop.id}
                  onClick={() => setActive(i)}
                  className="relative z-10 flex flex-col items-center gap-2 px-6 sm:px-9 group shrink-0"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    className="h-[27px] w-[27px] rounded-full grid place-items-center transition-all duration-300"
                    style={{
                      background: isActive ? `${m.color}25` : 'hsl(168 25% 13%)',
                      border: `2px solid ${isActive ? m.color : 'hsl(168 20% 30%)'}`,
                      boxShadow: isActive ? `0 0 16px ${m.color}55` : 'none',
                    }}
                  >
                    <StopIcon className="h-3 w-3" style={{ color: isActive ? m.color : 'hsl(168 15% 50%)' }} />
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground/50 group-hover:text-muted-foreground'}`}>
                    {stop.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail card for active stop */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-card border border-border rounded-3xl p-6 sm:p-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="h-14 w-14 rounded-2xl grid place-items-center shrink-0"
                style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}40` }}
              >
                {current.club ? <ClubBadge club={current.club} size={30} /> : <Icon className="h-6 w-6" style={{ color: meta.color }} />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: meta.color }}>{current.place}</div>
                <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-wide">{current.title}</h3>
                <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">{current.years}</div>
              </div>
            </div>
            {current.stats && (
              <div className="flex gap-5 shrink-0">
                {current.stats.map(s => (
                  <div key={s.label} className="text-center">
                    <div className="font-display text-xl font-black text-foreground tabular-nums">{s.value}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mt-6 max-w-2xl">{current.description}</p>
        </motion.div>
      </div>
    </section>
  );
}
