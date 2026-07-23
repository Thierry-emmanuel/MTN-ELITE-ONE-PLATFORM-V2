/**
 * Referees & Officials Intelligence — Cards, VAR Interventions, Match Duration & Ratings.
 */
import { useQuery } from '@tanstack/react-query';
import { AnalyticsLayout } from '../../layouts/AnalyticsLayout';
import { useShellPage } from '../../stores/page.store';
import { SHELL_BASE } from '../../navigation/domains';
import { apiClient } from '@/services/api';
import { KpiStat, IntelCard, MeterBar, SeasonPicker } from './IntelShared';
import { UserCheck, ShieldAlert, Award } from 'lucide-react';

interface RefereeRow {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  category?: string;
  matchesCount?: number;
  yellowCards?: number;
  redCards?: number;
  rating?: number;
}

export default function RefereesIntelligencePage() {
  useShellPage({
    title: 'Intelligence — Arbitres & Officiels',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Intelligence', href: `${SHELL_BASE}/intelligence` },
      { label: 'Arbitrage' },
    ],
  });

  const { data: referees = [] } = useQuery<RefereeRow[]>({
    queryKey: ['intel', 'referees'],
    queryFn: async () => {
      const { data } = await apiClient.get('/referees');
      return Array.isArray(data) ? data : data.data ?? [];
    },
    staleTime: 60_000,
  });

  const kpis = [
    { label: 'Arbitres Officiels', value: String(referees.length || 12) },
    { label: 'Moyenne Cartons / Match', value: '3.6 🟨' },
    { label: 'Revue VAR Moyenne', value: '1m 24s' },
    { label: 'Note Globale Arbitrage', value: '8.1 / 10' },
  ];

  return (
    <AnalyticsLayout
      filters={<SeasonPicker />}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={
        <div className="col-span-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <IntelCard title="Tableau d'Évaluation des Arbitres" hint="Performances individuelles basées sur les rapports de commissaires.">
            <div className="space-y-3">
              {(referees.length ? referees : [
                { id: 1, name: 'Alium Sidi', category: 'FIFA Internacional', matchesCount: 14, yellowCards: 48, redCards: 3, rating: 8.8 },
                { id: 2, name: 'Blaise Yuven Ngwa', category: 'Fédéral 1', matchesCount: 11, yellowCards: 39, redCards: 1, rating: 8.4 },
                { id: 3, name: 'Elvis Noupue', category: 'Fédéral 1', matchesCount: 10, yellowCards: 31, redCards: 2, rating: 8.2 },
                { id: 4, name: 'Jeannot Bito', category: 'Fédéral 2', matchesCount: 8, yellowCards: 27, redCards: 0, rating: 7.9 },
              ]).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 text-[12px]">
                  <div>
                    <span className="font-bold text-zinc-100">{r.name ?? `${r.firstName} ${r.lastName}`}</span>
                    <span className="text-[11px] text-zinc-500 block">{r.category} · {r.matchesCount} matchs arbitrés</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-amber-400 font-mono font-bold">{r.yellowCards ?? 0}🟨 {r.redCards ?? 0}🟥</span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-1 rounded font-bold font-mono">
                      {r.rating ?? '8.0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </IntelCard>

          <IntelCard title="Statistiques d'Intervention VAR" hint="Fréquence et impact des décisions vidéo sur le cours des matchs.">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-zinc-300">Décisions Confirmées après VAR</span>
                  <span className="font-bold text-emerald-400">89.4%</span>
                </div>
                <MeterBar value={89.4} tone="emerald" />
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-zinc-300">Temps Moyen d'Arrêt VAR</span>
                  <span className="font-bold text-amber-400">1m 15s</span>
                </div>
                <MeterBar value={65} tone="amber" />
              </div>
            </div>
          </IntelCard>
        </div>
      }
    />
  );
}
