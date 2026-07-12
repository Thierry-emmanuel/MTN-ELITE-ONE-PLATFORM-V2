import { User, Shield, Award as AwardIcon } from 'lucide-react';
import type { Coach } from '../configs/coaches.config';
import type { SelectOption } from '../engine/entityConfig.types';

export function CoachPreviewCard({ data, clubOptions = [] }: { data: Partial<Coach>; clubOptions?: SelectOption[] }) {
  const clubLabel = clubOptions.find((c) => c.value === data.clubId)?.label;
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Nouvel entraîneur';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-[#111820] to-[#0B0F16]">
        <div className="h-24 bg-gradient-to-br from-[#0B2B26] to-[#0A1512] flex items-end justify-center">
          <div className="h-24 w-24 rounded-full border-4 border-[#111820] bg-white/5 overflow-hidden translate-y-6 grid place-items-center">
            {data.photoUrl ? (
              <img src={data.photoUrl} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-white/20" />
            )}
          </div>
        </div>
        <div className="pt-9 pb-5 px-5 text-center">
          <p className="text-base font-display font-bold text-white leading-tight">{fullName}</p>
          {data.qualification && <p className="text-[11px] text-accent/80 font-semibold mt-1">{data.qualification}</p>}
          <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap">
            {clubLabel && (
              <span className="px-2 py-0.5 rounded-full bg-white/8 text-[9px] font-semibold text-white/60 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> {clubLabel}
              </span>
            )}
            {data.nationality && (
              <span className="px-2 py-0.5 rounded-full bg-white/8 text-[9px] font-semibold text-white/60">
                {data.nationality}
              </span>
            )}
          </div>
        </div>
      </div>

      {(data.trophies?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 mb-1.5 flex items-center gap-1.5">
            <AwardIcon className="h-3 w-3" /> Palmarès
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.trophies!.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] text-accent">{t}</span>
            ))}
          </div>
        </div>
      )}

      {data.biography && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 mb-1.5">Biographie</p>
          <p className="text-[11px] text-white/55 leading-relaxed line-clamp-4">{data.biography}</p>
        </div>
      )}
    </div>
  );
}
