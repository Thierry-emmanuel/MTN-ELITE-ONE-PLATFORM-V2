import { Trophy, Medal, Star, Award, Shield, Crown } from 'lucide-react';
import type { PlayerProfile, AchievementEntry } from '@/types/playerProfile.types';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

const ICON_MAP: Record<AchievementEntry['icon'], any> = { trophy: Trophy, medal: Medal, star: Star, award: Award, shield: Shield, crown: Crown };
const LEVEL_LABEL: Record<AchievementEntry['level'], string> = {
  club: 'Club', national: 'National', continental: 'Continental', international: 'International',
};
const LEVEL_COLOR: Record<AchievementEntry['level'], string> = {
  club: '#94A3B8', national: '#FCD116', continental: '#3B82F6', international: '#22C55E',
};

export function AchievementsSection({ player }: Props) {
  return (
    <section id="palmares" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Trophy} title="Palmarès & Distinctions" subtitle="Titres collectifs et récompenses individuelles" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {player.achievements.map(a => {
            const Icon = ICON_MAP[a.icon];
            const color = LEVEL_COLOR[a.level];
            return (
              <div
                key={a.id}
                className="group relative overflow-hidden bg-gradient-card border border-border rounded-2xl p-5 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div
                  className="absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ background: color }}
                />
                <div className="flex items-start gap-3 relative z-10">
                  <div className="h-11 w-11 rounded-xl grid place-items-center shrink-0" style={{ background: `${color}18`, color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground leading-tight">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{a.competition}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                    {LEVEL_LABEL[a.level]}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 font-semibold">{a.season}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
