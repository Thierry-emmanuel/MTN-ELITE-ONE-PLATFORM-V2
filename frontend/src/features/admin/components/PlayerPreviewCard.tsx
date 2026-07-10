import { User, Shirt, MapPin, Calendar } from 'lucide-react';
import type { Player } from '../configs/players.config';
import type { SelectOption } from '../engine/entityConfig.types';

const POSITION_LABEL: Record<string, string> = {
  GK: 'Gardien', DEF: 'Défenseur', MID: 'Milieu', FWD: 'Attaquant',
};

export function PlayerPreviewCard({ data, clubOptions = [] }: { data: Partial<Player>; clubOptions?: SelectOption[] }) {
  const clubLabel = clubOptions.find((c) => c.value === data.clubId)?.label;
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Nouveau joueur';
  const isComplete = !!(data.firstName && data.lastName && data.position && data.nationality);

  return (
    <div className="space-y-4">
      {/* Public player card */}
      <div className="rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-[#111820] to-[#0B0F16] shadow-2xl">
        <div className="relative h-40 bg-gradient-to-br from-[#0B2B26] to-[#0A1512] flex items-end justify-center overflow-hidden">
          {data.jerseyNumber != null && (
            <span className="absolute top-3 right-4 text-5xl font-display font-black text-white/10">
              {String(data.jerseyNumber)}
            </span>
          )}
          <div className="h-28 w-28 rounded-full border-4 border-[#111820] bg-white/5 overflow-hidden translate-y-6 grid place-items-center">
            {data.photoUrl ? (
              <img src={data.photoUrl} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-white/20" />
            )}
          </div>
        </div>
        <div className="pt-9 pb-5 px-5 text-center">
          <p className="text-base font-display font-bold text-white leading-tight">{fullName}</p>
          {data.nickname && <p className="text-[11px] text-accent/80 font-semibold mt-0.5">« {data.nickname} »</p>}
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {data.position && (
              <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-[9px] font-bold uppercase tracking-wide text-accent">
                {POSITION_LABEL[data.position] ?? data.position}
              </span>
            )}
            {data.nationality && (
              <span className="px-2 py-0.5 rounded-full bg-white/8 text-[9px] font-semibold text-white/60">
                {data.nationality}
              </span>
            )}
          </div>
          {clubLabel && (
            <p className="text-[10px] text-white/35 mt-2 flex items-center justify-center gap-1">
              <Shirt className="h-3 w-3" /> {clubLabel}
            </p>
          )}
        </div>

        {(data.appearances || data.goals || data.assists) ? (
          <div className="grid grid-cols-3 border-t border-white/[0.06] divide-x divide-white/[0.06]">
            {[
              { label: 'Matchs', value: data.appearances },
              { label: 'Buts', value: data.goals },
              { label: 'Passes D.', value: data.assists },
            ].map((s) => (
              <div key={s.label} className="py-3 text-center">
                <p className="text-sm font-display font-bold text-white">{s.value ?? 0}</p>
                <p className="text-[8px] uppercase tracking-wide text-white/25 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {(data.birthDate || data.birthPlace) && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 space-y-1.5">
          {data.birthDate && (
            <p className="text-[10px] text-white/45 flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-white/25" /> Né(e) le {new Date(data.birthDate).toLocaleDateString('fr-FR')}
            </p>
          )}
          {data.birthPlace && (
            <p className="text-[10px] text-white/45 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-white/25" /> {data.birthPlace}
            </p>
          )}
        </div>
      )}

      {data.biography && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 mb-1.5">Biographie</p>
          <p className="text-[11px] text-white/55 leading-relaxed line-clamp-4">{data.biography}</p>
        </div>
      )}

      {!isComplete && (
        <p className="text-[10px] text-white/25 text-center italic">
          L'aperçu se complète au fil des étapes.
        </p>
      )}
    </div>
  );
}
