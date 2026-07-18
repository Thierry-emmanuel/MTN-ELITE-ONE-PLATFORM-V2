import { AnalyticsLayout } from '../layouts/AnalyticsLayout';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

/** Intelligence — Analytics Layout demo surface. Space is reserved before data (CLS). */
export default function IntelligencePage() {
  useShellPage({
    title: 'Intelligence',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Intelligence' }],
  });
  const kpis = [
    { label: 'Modules enregistrés', value: '—' },
    { label: 'Objets suivis', value: '—' },
    { label: 'Brouillons actifs', value: '—' },
    { label: 'Publications / sem.', value: '—' },
  ];
  return (
    <AnalyticsLayout
      filters={
        <>
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[12px] text-zinc-300">Saison 2025/26</span>
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-[12px] text-zinc-500">MTN Elite One</span>
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-[12px] text-zinc-500">30 derniers jours</span>
        </>
      }
      kpis={kpis.map((k) => (
        <div key={k.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{k.label}</p>
          <p className="mt-1 font-sans text-2xl font-bold tracking-tight text-zinc-100">{k.value}</p>
        </div>
      ))}
      charts={
        <>
          <div className="col-span-12 flex h-[260px] items-center justify-center rounded-xl border border-dashed border-zinc-800 lg:col-span-8">
            <p className="text-[12px] text-zinc-600">Emplacement graphique — les modules Intelligence brancheront recharts ici (Phase 3).</p>
          </div>
          <div className="col-span-12 flex h-[260px] items-center justify-center rounded-xl border border-dashed border-zinc-800 lg:col-span-4">
            <p className="text-[12px] text-zinc-600">Emplacement graphique</p>
          </div>
        </>
      }
    />
  );
}
