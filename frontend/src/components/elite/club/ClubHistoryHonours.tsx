import { memo } from 'react';
import { BookOpen, Trophy, Star, ShieldCheck, Landmark } from 'lucide-react';
import type { Club } from '@/types/football.types';
import { SectionHeading, Reveal, VitrinePanel } from './ClubSectionShell';

interface ClubHistoryHonoursProps {
  club: Club;
}

const TROPHY_TILES = (achievements: Club['achievements']) => [
  { key: 'league',   label: 'Titres de Champion', value: achievements?.league ?? 0,   icon: Trophy,      color: '#FCD116' },
  { key: 'cup',       label: 'Coupes du Cameroun', value: achievements?.cup ?? 0,      icon: ShieldCheck, color: '#10B981' },
  { key: 'regional',  label: 'Trophées Régionaux', value: achievements?.regional ?? 0, icon: Star,        color: '#60A5FA' },
  { key: 'african',   label: 'Titres Continentaux',value: achievements?.african ?? 0,  icon: Landmark,    color: '#CE1126' },
];

export const ClubHistoryHonours = memo(({ club }: ClubHistoryHonoursProps) => {
  const primary = club.color || '#FCD116';

  return (
    <>
      <SectionHeading icon={BookOpen} room="Salle 02" title="Histoire & Palmarès" accentColor={primary}
        subtitle="Des origines du club à ses plus grandes heures de gloire." />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Editorial history */}
        <Reveal>
          <VitrinePanel className="lg:col-span-2 p-7" accentColor={primary}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8" style={{ backgroundColor: primary }} />
              <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-white/40">Notre histoire</span>
            </div>
            <p className="font-serif text-base lg:text-lg text-white/80 leading-loose whitespace-pre-line">
              {club.history ?? "Le club est né de la passion locale pour le football camerounais et a grandi pour devenir un emblème de son peuple, enrichissant au fil des décennies les sélections nationales de joueurs mythiques."}
            </p>
          </VitrinePanel>
        </Reveal>

        {/* Roll of honour */}
        <Reveal delay={0.08}>
          <VitrinePanel className="p-6">
            <h3 className="font-display text-[11px] font-bold text-white/80 uppercase tracking-wider border-b border-white/10 pb-2.5 mb-4 flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5" style={{ color: primary }} />
              Tableau d'honneur
            </h3>
            <ol className="space-y-3">
              {(club.palmares ?? []).map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-white/75">
                  <span
                    className="mt-0.5 h-4 w-4 shrink-0 grid place-items-center text-[9px] font-black border"
                    style={{ background: `${primary}18`, color: primary, borderColor: `${primary}40` }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
              {(!club.palmares || club.palmares.length === 0) && (
                <li className="text-xs text-white/40">Palmarès en cours de constitution.</li>
              )}
            </ol>
          </VitrinePanel>
        </Reveal>
      </div>

      {/* Trophy cabinet tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {TROPHY_TILES(club.achievements).map((t, i) => (
          <Reveal key={t.key} delay={0.05 * i}>
            <div className="border border-white/10 bg-white/[0.02] p-5 text-center space-y-2.5 hover:border-white/25 transition-colors">
              <div
                className="h-10 w-10 mx-auto grid place-items-center border"
                style={{ background: `${t.color}14`, borderColor: `${t.color}40` }}
              >
                <t.icon className="h-5 w-5" style={{ color: t.color }} />
              </div>
              <div className="font-display text-3xl font-black text-white tabular-nums">{t.value}</div>
              <div className="text-[10px] text-white/45 uppercase tracking-wider leading-tight">{t.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
});
ClubHistoryHonours.displayName = 'ClubHistoryHonours';
