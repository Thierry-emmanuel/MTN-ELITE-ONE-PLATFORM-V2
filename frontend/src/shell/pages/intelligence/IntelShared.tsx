/** Shared Intelligence UI — thin design-system wrappers, no data logic. */
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSeasons } from '@/features/intelligence/intelligence.api';

/** Season context from ?season=, defaulting to the ONGOING season. */
export function useSeasonParam() {
  const [params, setParams] = useSearchParams();
  const { data: seasons = [] } = useSeasons();
  const fromUrl = Number(params.get('season'));
  const seasonId = Number.isFinite(fromUrl) && fromUrl > 0
    ? fromUrl
    : (seasons.find((s) => s.status === 'ONGOING') ?? seasons[0])?.id;
  return {
    seasonId,
    seasons,
    setSeasonId: (id: number) => setParams((p) => { p.set('season', String(id)); return p; }, { replace: true }),
  };
}

export function SeasonPicker() {
  const { seasonId, seasons, setSeasonId } = useSeasonParam();
  return (
    <select
      value={seasonId ?? ''}
      onChange={(e) => setSeasonId(Number(e.target.value))}
      className="h-8 rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[12px] text-zinc-200 outline-none focus:border-emerald-700"
      aria-label="Saison"
    >
      {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}

export function IntelCard({ title, hint, children, className = '' }: {
  title: string; hint?: string; children: ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 ${className}`}>
      <header className="mb-3">
        <h3 className="font-sans text-[13px] font-bold tracking-tight text-zinc-100">{title}</h3>
        {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

export function MeterBar({ value, label, tone = 'emerald' }: { value: number; label?: string; tone?: 'emerald' | 'amber' | 'red' }) {
  const bg = tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {label && <span className="w-12 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-200">{label}</span>}
    </div>
  );
}

export function FormChips({ guide = [] }: { guide?: string[] }) {
  return (
    <span className="flex gap-1">
      {guide.slice(-5).map((r, i) => (
        <span key={i} className={`grid size-5 place-items-center rounded text-[10px] font-bold text-white ${
          r === 'W' ? 'bg-emerald-600' : r === 'D' ? 'bg-zinc-600' : 'bg-red-600'}`}>{r === 'W' ? 'V' : r === 'D' ? 'N' : 'D'}</span>
      ))}
      {guide.length === 0 && <span className="text-[11px] text-zinc-600">—</span>}
    </span>
  );
}

export function EmptyIntel({ what }: { what: string }) {
  return (
    <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center text-[12px] text-zinc-600">
      Pas encore de données pour {what} — jouez des matchs dans le Match Builder et revenez.
    </p>
  );
}

export function ClubLogo({ url, name, size = 'sm' }: { url?: string; name?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'size-6 text-[10px]' : size === 'md' ? 'size-8 text-[11px]' : 'size-10 text-[13px]';
  const initials = String(name ?? '?').slice(0, 2).toUpperCase();
  return (
    <div className={`${dim} shrink-0 rounded-lg border border-emerald-900/60 bg-gradient-to-br from-emerald-950 to-zinc-900 overflow-hidden flex items-center justify-center p-0.5 shadow-sm text-emerald-400 font-black tracking-tight`}>
      {url ? (
        <img src={url} alt="" className="size-full object-contain" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function PlayerAvatar({ url, name, size = 'sm' }: { url?: string; name?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'size-6 text-[10px]' : size === 'md' ? 'size-8 text-[11px]' : 'size-10 text-[13px]';
  const initials = String(name ?? '?').slice(0, 2).toUpperCase();
  return (
    <div className={`${dim} shrink-0 rounded-full border border-amber-900/60 bg-gradient-to-br from-amber-950 to-zinc-900 overflow-hidden flex items-center justify-center p-0.5 shadow-sm text-amber-400 font-black tracking-tight`}>
      {url ? (
        <img src={url} alt="" className="size-full object-cover rounded-full" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function KpiStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-1 font-sans text-2xl font-bold tracking-tight text-zinc-100">{value}</p>
    </div>
  );
}
