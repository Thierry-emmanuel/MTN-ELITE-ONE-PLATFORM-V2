/**
 * Operations Matchday — Live & Synthesized Matchday Operations View.
 * Real-time operational dashboard for managing an active matchday.
 */
import { useQuery } from '@tanstack/react-query';
import { AnalyticsLayout } from '../layouts/AnalyticsLayout';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { apiClient } from '@/services/api';
import { KpiStat } from './intelligence/IntelShared';
import { Calendar, Play, CheckCircle2, Clock, AlertTriangle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MatchItem {
  id: number;
  round: number;
  status: string;
  scheduledAt: string;
  homeClubId: number;
  awayClubId: number;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string;
  city?: string;
  referee?: string;
  homeClub?: { name?: string };
  awayClub?: { name?: string };
}

export default function OperationsMatchdayPage() {
  useShellPage({
    title: 'Opérations — Jour de Match',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Opérations', href: `${SHELL_BASE}/operations` },
      { label: 'Jour de Match' },
    ],
  });

  const { data: matches = [] } = useQuery<MatchItem[]>({
    queryKey: ['operations', 'matchday-matches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/matches', { params: { limit: 50 } });
      return Array.isArray(data) ? data : data.data ?? [];
    },
    staleTime: 15_000,
  });

  const live = matches.filter((m) => m.status === 'LIVE' || m.status === 'IN_PROGRESS');
  const scheduled = matches.filter((m) => m.status === 'SCHEDULED');
  const finished = matches.filter((m) => m.status === 'FINISHED');

  const kpis = [
    { label: 'Matchs en direct', value: String(live.length) },
    { label: 'Matchs programmés', value: String(scheduled.length) },
    { label: 'Matchs terminés', value: String(finished.length) },
    { label: 'Total aujourd’hui', value: String(matches.length) },
  ];

  return (
    <AnalyticsLayout
      filters={
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-900 bg-emerald-950/40 px-3 py-1 text-[12px] text-emerald-400 font-medium">
          <Clock className="size-3.5 animate-pulse" /> Suivi opérationnel en direct
        </span>
      }
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={
        <div className="col-span-12 space-y-6">
          {/* Matches in Progress */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h3 className="text-[14px] font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <Play className="size-4 text-emerald-500 fill-emerald-500" /> Matchs en Direct ({live.length})
            </h3>
            {live.length === 0 ? (
              <p className="text-[12px] text-zinc-500 italic">Aucun match en cours actuellement.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {live.map((m) => (
                  <div key={m.id} className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-4">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
                      <span>Journée {m.round}</span>
                      <span className="flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> EN DIRECT
                      </span>
                    </div>
                    <div className="flex items-center justify-between my-3 text-[15px] font-bold text-zinc-100">
                      <span>{m.homeClub?.name ?? `Club ${m.homeClubId}`}</span>
                      <span className="text-[20px] font-mono text-emerald-400 px-3 py-1 bg-zinc-900 rounded">{m.homeScore ?? 0} - {m.awayScore ?? 0}</span>
                      <span>{m.awayClub?.name ?? `Club ${m.awayClubId}`}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2 mt-2">
                      <span>Stade : {m.venue ?? 'N/A'}</span>
                      <span>Arbitre : {m.referee ?? 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled & Finished */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scheduled */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h3 className="text-[14px] font-bold text-zinc-100 flex items-center gap-2 mb-4">
                <Calendar className="size-4 text-sky-500" /> Prochains Matchs Programmés
              </h3>
              {scheduled.length === 0 ? (
                <p className="text-[12px] text-zinc-500 italic">Aucun match programmé.</p>
              ) : (
                <div className="space-y-2.5">
                  {scheduled.slice(0, 8).map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 text-[12px]">
                      <div>
                        <span className="font-bold text-sky-400 mr-2">J{m.round}</span>
                        <span className="text-zinc-200">{m.homeClub?.name ?? `Club ${m.homeClubId}`} vs {m.awayClub?.name ?? `Club ${m.awayClubId}`}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(m.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Finished */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h3 className="text-[14px] font-bold text-zinc-100 flex items-center gap-2 mb-4">
                <CheckCircle2 className="size-4 text-zinc-400" /> Derniers Résultats
              </h3>
              {finished.length === 0 ? (
                <p className="text-[12px] text-zinc-500 italic">Aucun match terminé récent.</p>
              ) : (
                <div className="space-y-2.5">
                  {finished.slice(0, 8).map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 text-[12px]">
                      <div>
                        <span className="font-bold text-zinc-500 mr-2">J{m.round}</span>
                        <span className="text-zinc-200">{m.homeClub?.name ?? `Club ${m.homeClubId}`} vs {m.awayClub?.name ?? `Club ${m.awayClubId}`}</span>
                      </div>
                      <span className="font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                        {m.homeScore ?? 0} - {m.awayScore ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}
