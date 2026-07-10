import { memo, useState } from 'react';
import { CalendarRange, Award } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import type { Club, ClubHistoricSeason } from '@/types/football.types';

interface ClubHistoricSeasonsProps {
  club: Club;
  seasons: ClubHistoricSeason[];
}

/**
 * Historic Seasons — every campaign on record: standings, results shape,
 * and the honours collected that year.
 */
export const ClubHistoricSeasons = memo(({ club, seasons }: ClubHistoricSeasonsProps) => {
  const primary = club.color || '#FCD116';
  const [expanded, setExpanded] = useState<string | null>(seasons[0]?.season ?? null);

  return (
    <>
      <SectionHeading
        icon={CalendarRange}
        room="Salle 08"
        title="Saisons Historiques"
        subtitle="Classements, résultats et distinctions, saison après saison."
        accentColor={primary}
      />

      {seasons.length === 0 ? (
        <p className="text-sm text-white/40">Archives de saisons en cours de constitution.</p>
      ) : (
        <div className="space-y-3">
          {seasons.map((s, i) => {
            const isOpen = expanded === s.season;
            return (
              <Reveal key={s.season} delay={i * 0.05}>
                <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.season)}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-display text-lg font-black text-white shrink-0">{s.season}</span>
                      <span className="text-xs text-white/45 hidden sm:inline">
                        {s.won}V · {s.drawn}N · {s.lost}D · {s.goalsFor}-{s.goalsAgainst}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider border"
                        style={{ background: s.position === 1 ? `${primary}18` : 'rgba(255,255,255,0.03)', color: s.position === 1 ? primary : 'rgba(255,255,255,0.6)', borderColor: s.position === 1 ? `${primary}45` : 'rgba(255,255,255,0.1)' }}
                      >
                        #{s.position}
                      </span>
                      <span className="font-display text-sm font-black text-white w-10 text-right">{s.points} pts</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/10 space-y-4">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4">
                        {[
                          { label: 'Joués', value: s.played },
                          { label: 'Victoires', value: s.won },
                          { label: 'Nuls', value: s.drawn },
                          { label: 'Défaites', value: s.lost },
                          { label: 'BP', value: s.goalsFor },
                          { label: 'BC', value: s.goalsAgainst },
                        ].map(stat => (
                          <div key={stat.label} className="text-center">
                            <div className="font-display text-lg font-black text-white">{stat.value}</div>
                            <div className="text-[9px] text-white/40 uppercase tracking-wide mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      {s.awards && s.awards.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {s.awards.map(a => (
                            <span key={a} className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 border" style={{ borderColor: `${primary}40`, color: primary, background: `${primary}0d` }}>
                              <Award className="h-3 w-3" /> {a}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.note && <p className="text-xs text-white/55 leading-relaxed font-serif italic">{s.note}</p>}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
});
ClubHistoricSeasons.displayName = 'ClubHistoricSeasons';
