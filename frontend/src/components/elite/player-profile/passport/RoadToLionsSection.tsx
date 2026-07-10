import { motion } from 'framer-motion';
import { Flag, PhoneCall, PlayCircle, Target, Trophy, ShieldCheck } from 'lucide-react';
import type { RoadToLionsEvent, RoadToLionsEventType } from '@/types/passport.types';
import { SectionHeading } from '../SectionHeading';

interface Props {
  events: RoadToLionsEvent[];
}

const TYPE_META: Record<RoadToLionsEventType, { icon: any; label: string }> = {
  callup: { icon: PhoneCall, label: 'Convocation' },
  debut: { icon: PlayCircle, label: 'Première Cape' },
  goal: { icon: Target, label: 'But International' },
  tournament: { icon: Trophy, label: 'Tournoi' },
  captain: { icon: ShieldCheck, label: 'Capitanat' },
};

export function RoadToLionsSection({ events }: Props) {
  const totalCaps = Math.max(0, ...events.map(e => e.caps ?? 0));
  const totalGoals = events.filter(e => e.type === 'goal').length;

  return (
    <section id="lions" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: 'var(--gradient-flag)' }}
      />
      <div className="container relative z-10">
        <SectionHeading icon={Flag} title="Route vers les Lions" subtitle="La progression vers le maillot national" />

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Sélections', value: totalCaps || '—' },
            { label: 'Buts Internationaux', value: totalGoals || 0 },
            { label: 'Statut', value: events.some(e => e.type === 'tournament') ? 'International Confirmé' : events.length > 1 ? 'International' : 'En Observation' },
          ].map(s => (
            <div key={s.label} className="bg-gradient-card border border-border rounded-2xl p-5 text-center">
              <div className="font-display text-3xl font-black text-accent tabular-nums">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="relative pl-8">
            <div className="absolute left-[13px] top-1 bottom-1 w-px bg-white/10" />
            <div className="space-y-7">
              {events.map((e, i) => {
                const meta = TYPE_META[e.type];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="relative"
                  >
                    <div
                      className="absolute -left-8 top-0 h-7 w-7 rounded-full grid place-items-center ring-4 ring-background"
                      style={{ background: '#22C55E22', color: '#22C55E' }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-0.5">
                      {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} · {e.competition}
                    </div>
                    <div className="text-sm font-bold text-foreground leading-tight">{e.title}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">{e.description}</p>
                    {e.opponent && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-foreground/70">
                        vs {e.opponent}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
