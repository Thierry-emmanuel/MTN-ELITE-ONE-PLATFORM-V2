import { Users2, MapPin } from 'lucide-react';
import type { Stadium } from '../configs/stadiums.config';
import type { SelectOption } from '../engine/entityConfig.types';

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Disponible', MAINTENANCE: 'En maintenance', CLOSED: 'Fermé' };
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  MAINTENANCE: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  CLOSED: 'text-red-400 bg-red-500/10 border-red-500/25',
};

export function StadiumPreviewCard({ data, clubOptions = [] }: { data: Partial<Stadium>; clubOptions?: SelectOption[] }) {
  const clubLabel = clubOptions.find((c) => c.value === data.clubId)?.label;
  const status = data.status || 'ACTIVE';

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-[#111820] to-[#0B0F16]">
      <div className="h-32 bg-white/[0.03] relative">
        {data.photoUrl ? (
          <img src={data.photoUrl} alt={data.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full grid place-items-center"><Users2 className="h-8 w-8 text-white/15" /></div>
        )}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="p-5">
        <p className="text-base font-display font-bold text-white leading-tight">{data.name || 'Nouveau stade'}</p>
        {data.city && (
          <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {data.city}</p>
        )}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
          {data.capacity != null && (
            <div>
              <p className="text-sm font-display font-bold text-white">{Number(data.capacity).toLocaleString('fr-FR')}</p>
              <p className="text-[8px] uppercase tracking-wide text-white/25 mt-0.5">Places</p>
            </div>
          )}
          {clubLabel && (
            <div>
              <p className="text-sm font-display font-bold text-white truncate max-w-[140px]">{clubLabel}</p>
              <p className="text-[8px] uppercase tracking-wide text-white/25 mt-0.5">Club résident</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
