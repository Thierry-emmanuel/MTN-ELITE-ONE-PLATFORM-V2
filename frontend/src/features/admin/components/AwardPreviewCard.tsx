import { Trophy, Calendar } from 'lucide-react';
import type { Award } from '../configs/awards.config';
import type { SelectOption } from '../engine/entityConfig.types';

const STATUS_LABEL: Record<string, string> = { CLOSED: 'Votes fermés', OPEN: 'Votes ouverts', ANNOUNCED: 'Vainqueur annoncé' };
const STATUS_COLOR: Record<string, string> = {
  CLOSED: 'text-white/40 bg-white/5 border-white/10',
  OPEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  ANNOUNCED: 'text-accent bg-accent/10 border-accent/25',
};

export function AwardPreviewCard({ data, seasonOptions = [] }: { data: Partial<Award>; seasonOptions?: SelectOption[] }) {
  const status = data.status || 'CLOSED';
  const seasonLabel = seasonOptions.find((s) => s.value === data.seasonId)?.label;

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-[#111820] to-[#0B0F16] p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-accent/70 mb-1 flex items-center gap-1.5">
            <Trophy className="h-3 w-3" /> {seasonLabel || 'MTN Elite One'}
          </p>
          <p className="text-lg font-display font-bold text-white leading-tight">
            {data.category || 'Nouvel Award'}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wide ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {(data.periodStart || data.periodEnd) && (
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <Calendar className="h-3.5 w-3.5 text-white/25 shrink-0" />
          <span>
            {data.periodStart ? new Date(data.periodStart).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
            {' → '}
            {data.periodEnd ? new Date(data.periodEnd).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
      )}

      <p className="text-[10px] text-white/25 italic border-t border-white/[0.06] pt-4">
        Une fois créé, ajoutez les joueurs nommés depuis le panneau Awards.
      </p>
    </div>
  );
}
