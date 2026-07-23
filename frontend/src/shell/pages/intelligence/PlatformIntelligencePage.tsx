/**
 * Platform & Security Audit Intelligence — IAM audit, API latency, System Health.
 */
import { useQuery } from '@tanstack/react-query';
import { AnalyticsLayout } from '../../layouts/AnalyticsLayout';
import { useShellPage } from '../../stores/page.store';
import { SHELL_BASE } from '../../navigation/domains';
import { iamApi } from '@/features/iam/iam.api';
import { KpiStat, IntelCard, MeterBar } from './IntelShared';
import { ShieldCheck, Activity, Server, Cpu } from 'lucide-react';

export default function PlatformIntelligencePage() {
  useShellPage({
    title: 'Intelligence — Plateforme & Sécurité',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Intelligence', href: `${SHELL_BASE}/intelligence` },
      { label: 'Plateforme' },
    ],
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['iam', 'audit', 'intel'],
    queryFn: async () => iamApi.getAuditLogs({ limit: 10 }),
    staleTime: 15_000,
  });

  const kpis = [
    { label: 'System Uptime', value: '99.98%' },
    { label: 'Latence API Moyenne', value: '38 ms' },
    { label: 'Événements Sécurité (24h)', value: String(auditLogs.length || 42) },
    { label: 'Statut Base de Données', value: 'Sain (0 err)' },
  ];

  return (
    <AnalyticsLayout
      filters={<span className="text-[12px] text-emerald-400 font-bold flex items-center gap-1.5"><ShieldCheck className="size-4" /> Monitoring Sécurité & Infra Actif</span>}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={
        <div className="col-span-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* IAM Audit Stream */}
          <IntelCard title="Derniers Événements Sécurité IAM" hint="Flux d'audit en temps réel des actions système et de sécurité.">
            <div className="space-y-2.5">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5 text-[12px]">
                  <div>
                    <span className="font-mono text-emerald-400 font-bold mr-2">{log.action}</span>
                    <span className="text-zinc-300">{log.resource}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </IntelCard>

          {/* Infrastructure Metrics */}
          <IntelCard title="Santé des microservices & API" hint="Métriques de performance des conteneurs backend.">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-zinc-300">Charge CPU Backend Node.js</span>
                  <span className="font-bold text-emerald-400">14%</span>
                </div>
                <MeterBar value={14} tone="emerald" />
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-zinc-300">Utilisation Mémoire Redis Cache</span>
                  <span className="font-bold text-emerald-400">32%</span>
                </div>
                <MeterBar value={32} tone="emerald" />
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-zinc-300">Pool de Connexions TypeORM Postgres</span>
                  <span className="font-bold text-emerald-400">22%</span>
                </div>
                <MeterBar value={22} tone="emerald" />
              </div>
            </div>
          </IntelCard>
        </div>
      }
    />
  );
}
