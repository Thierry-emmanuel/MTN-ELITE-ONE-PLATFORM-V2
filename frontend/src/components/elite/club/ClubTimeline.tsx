import { memo } from 'react';
import { History, Flag as FoundIcon, Trophy, Users2, Sparkles } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import type { Club, ClubTimelineEvent, TimelineEventType } from '@/types/football.types';

interface ClubTimelineProps {
  club: Club;
  events: ClubTimelineEvent[];
}

const TYPE_META: Record<TimelineEventType, { label: string; icon: typeof Trophy }> = {
  foundation: { label: 'Fondation', icon: FoundIcon },
  title: { label: 'Titre majeur', icon: Trophy },
  'golden-generation': { label: 'Génération dorée', icon: Users2 },
  moment: { label: 'Moment historique', icon: Sparkles },
};

/**
 * Club Timeline — an interactive spine of the club's history, from
 * foundation through golden generations to the modern era.
 */
export const ClubTimeline = memo(({ club, events }: ClubTimelineProps) => {
  const primary = club.color || '#FCD116';

  return (
    <>
      <SectionHeading
        icon={History}
        room="Salle 07"
        title="Chronologie du Club"
        subtitle="De la fondation aux générations dorées, les jalons qui ont écrit l'histoire de l'institution."
        accentColor={primary}
      />

      <div className="relative">
        <div className="absolute left-[27px] sm:left-1/2 top-2 bottom-2 w-px bg-white/10 sm:-translate-x-1/2" />
        <div className="space-y-6">
          {events.map((e, i) => {
            const meta = TYPE_META[e.type];
            const isRight = i % 2 === 1;
            return (
              <Reveal key={`${e.year}-${i}`} delay={i * 0.05}>
                <div className={`relative flex items-start gap-5 sm:gap-8 ${isRight ? 'sm:flex-row-reverse' : ''}`}>
                  <div
                    className="absolute left-[15px] sm:left-1/2 top-1 h-6 w-6 rounded-full grid place-items-center border-2 sm:-translate-x-1/2 z-10 shrink-0"
                    style={{ background: '#06090a', borderColor: e.type === 'title' ? primary : 'rgba(255,255,255,0.25)' }}
                  >
                    <meta.icon className="h-3 w-3" style={{ color: e.type === 'title' ? primary : 'rgba(255,255,255,0.5)' }} />
                  </div>

                  <div className="pl-12 sm:pl-0 sm:w-1/2" />

                  <div className={`pl-12 sm:pl-0 sm:w-1/2 ${isRight ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
                    <div className="border border-white/10 bg-white/[0.02] hover:border-white/25 transition-colors p-5">
                      <div className={`flex items-center gap-2 mb-2 ${isRight ? 'sm:justify-end' : ''}`}>
                        <span className="font-display text-lg font-black" style={{ color: primary }}>{e.year}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/35 font-bold">{meta.label}</span>
                      </div>
                      <h4 className="font-serif italic text-base text-white mb-1.5">{e.title}</h4>
                      <p className="text-xs text-white/55 leading-relaxed">{e.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </>
  );
});
ClubTimeline.displayName = 'ClubTimeline';
