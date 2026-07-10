import { Calendar, CircleDot } from 'lucide-react';
import type { Season } from '../configs/seasons.config';

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'À venir', ONGOING: 'En cours', COMPLETED: 'Terminée',
};
const STATUS_COLOR: Record<string, string> = {
  UPCOMING: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  ONGOING: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  COMPLETED: 'text-white/40 bg-white/5 border-white/10',
};

export function SeasonPreviewCard({ data }: { data: Partial<Season> }) {
  const status = data.status || 'UPCOMING';
  const days = data.startDate && data.endDate
    ? Math.max(0, Math.round((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86_400_000))
    : null;

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-[#111820] to-[#0B0F16] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-accent/70 mb-1">MTN Elite One</p>
          <p className="text-lg font-display font-bold text-white leading-tight truncate">
            {data.name || 'Nouvelle saison'}
          </p>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wide ${STATUS_COLOR[status]}`}>
          <CircleDot className="h-2.5 w-2.5" /> {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-white/50">
        <Calendar className="h-3.5 w-3.5 text-white/25 shrink-0" />
        <span>
          {data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '—'}
          {' → '}
          {data.endDate ? new Date(data.endDate).toLocaleDateString('fr-FR') : '—'}
        </span>
      </div>

      {days !== null && (
        <div className="grid grid-cols-3 border-t border-white/[0.06] pt-4">
          <div>
            <p className="text-sm font-display font-bold text-white">{days}</p>
            <p className="text-[8px] uppercase tracking-wide text-white/25 mt-0.5">Jours</p>
          </div>
          <div>
            <p className="text-sm font-display font-bold text-white">18</p>
            <p className="text-[8px] uppercase tracking-wide text-white/25 mt-0.5">Clubs (par défaut)</p>
          </div>
          <div>
            <p className="text-sm font-display font-bold text-white">34</p>
            <p className="text-[8px] uppercase tracking-wide text-white/25 mt-0.5">Journées (par défaut)</p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-white/25 italic">
        Une fois créée, activez cette saison depuis la liste des Saisons pour l'ouvrir aux matchs et classements.
      </p>
    </div>
  );
}
