import { memo, useState } from 'react';
import { Trophy, X, Route, Users2, BarChart3 } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { TROPHY_ICON_IMAGE } from './clubAssets';
import type { Club, ClubTrophy, TrophyCategory } from '@/types/football.types';

interface ClubTrophyRoomProps {
  club: Club;
  trophies: ClubTrophy[];
}

const CATEGORY_LABEL: Record<TrophyCategory, string> = {
  league: 'Championnat',
  cup: 'Coupe nationale',
  african: 'Continental',
  regional: 'Régional',
};

/**
 * The Trophy Room — every major honour displayed like a museum artifact
 * behind glass. Selecting one opens its full story: the journey, the final,
 * the historic squad, the numbers.
 */
export const ClubTrophyRoom = memo(({ club, trophies }: ClubTrophyRoomProps) => {
  const primary = club.color || '#FCD116';
  const [openId, setOpenId] = useState<string | null>(null);
  const open = trophies.find(t => t.id === openId);

  return (
    <>
      <SectionHeading
        icon={Trophy}
        room="Salle 05"
        title="Salle des Trophées"
        subtitle="Chaque trophée raconte une saison, une génération, une finale. Sélectionnez une pièce pour découvrir son histoire."
        accentColor={primary}
      />

      {trophies.length === 0 ? (
        <p className="text-sm text-white/40">Palmarès en cours de constitution.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {trophies.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <button
                onClick={() => setOpenId(t.id)}
                className="group w-full text-left border border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] transition-all p-5 flex flex-col items-center text-center gap-3"
                style={{ borderTopColor: `${primary}55`, borderTopWidth: 2 }}
              >
                <div
                  className="h-16 w-16 grid place-items-center border relative"
                  style={{ background: `radial-gradient(circle, ${primary}1c, transparent 70%)`, borderColor: `${primary}35` }}
                >
                  <img src={t.imageUrl || TROPHY_ICON_IMAGE} alt={t.title} className="h-10 w-10 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: primary }}>{CATEGORY_LABEL[t.category]}</span>
                  <h4 className="font-display text-sm font-black text-white leading-tight mt-1 group-hover:text-accent transition-colors">{t.title}</h4>
                  <p className="text-[10px] text-white/40 mt-0.5 font-mono">{t.year}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {/* Story modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/15 bg-[#06090a]"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }} />
            <button
              onClick={() => setOpenId(null)}
              className="absolute top-4 right-4 h-9 w-9 border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="h-4 w-4 text-white" />
            </button>

            <div className="p-7 sm:p-9 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 grid place-items-center border" style={{ background: `${primary}14`, borderColor: `${primary}40` }}>
                  <img src={open.imageUrl || TROPHY_ICON_IMAGE} alt={open.title} className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: primary }}>{open.competition} · {open.year}</span>
                  <h3 className="font-serif italic text-2xl sm:text-3xl text-white leading-tight mt-1">{open.title}</h3>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Route className="h-4 w-4 shrink-0 mt-0.5" style={{ color: primary }} />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40 block mb-1.5">Le chemin vers le titre</span>
                  <p className="font-serif text-sm sm:text-base text-white/80 leading-relaxed">{open.story.journey}</p>
                </div>
              </div>

              {(open.story.finalOpponent || open.story.finalScore) && (
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {open.story.finalOpponent && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Finale / consécration</span>
                      <span className="text-sm font-semibold text-white">{open.story.finalOpponent}</span>
                    </div>
                  )}
                  {open.story.finalScore && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Résultat</span>
                      <span className="text-sm font-semibold text-white">{open.story.finalScore}</span>
                    </div>
                  )}
                </div>
              )}

              {open.story.historicSquad && (
                <div className="flex items-start gap-2.5 pt-4 border-t border-white/10">
                  <Users2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: primary }} />
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40 block mb-1.5">L'effectif historique</span>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{open.story.historicSquad}</p>
                  </div>
                </div>
              )}

              {open.story.stats && open.story.stats.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-white/40 flex items-center gap-2 mb-3">
                    <BarChart3 className="h-3.5 w-3.5" style={{ color: primary }} /> En chiffres
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {open.story.stats.map(s => (
                      <div key={s.label} className="border border-white/10 bg-white/[0.02] p-3 text-center">
                        <div className="font-display text-sm font-black text-white">{s.value}</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wide mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
ClubTrophyRoom.displayName = 'ClubTrophyRoom';
