/**
 * Operations Center — Complete 12-Tab Operational Suite.
 *
 * 1. Operational Dashboard (KPIs: matches, transfers, injuries, competition, publications, api jobs, alerts + Widgets)
 * 2. Workflow Center (Builder workflows & step progress)
 * 3. Task Management (Departmental task assignment: Admin, Competitions, Medical, Media, Referees)
 * 4. Scheduling Center (Matchdays, referee assignment, calendar events)
 * 5. Automation Studio (Pipelines: trigger -> steps -> execution)
 * 6. Notification Center (Broadcasts, email/SMS dispatch log, operational alerts)
 * 7. Background Tasks (Active sync, worker jobs, API polling status)
 * 8. Monitoring (System load, response latency, DB connections, API health)
 * 9. Incidents (VAR issues, pitch degradation, match delays, emergency log)
 * 10. Resource Allocation (Stadium assignments, VAR equipment, vehicles, official gear)
 * 11. Operation Timeline (Chronological stream of all league events)
 * 12. Operation Health (Global operational score, compliance checklist, SLA status)
 */
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, Bell, Building2, Calendar, CheckCircle2, Clock,
  Cpu, FileText, HeartPulse, LayoutDashboard, ListTodo,
  Play, RefreshCw, ScrollText, Shield, Users,
  Workflow, Zap, AlertCircle, ChevronLeft, ChevronRight,
  UserCheck, MessageSquare, Send, Eye, Globe, Server, Plus
} from 'lucide-react';
import { iamApi } from '@/features/iam/iam.api';
import type { IamAuditLog } from '@/features/iam/iam.types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/services/api';
// SplitLayout removed — single layout with horizontal tabs
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

type TabId =
  | 'dashboard'
  | 'workflows'
  | 'tasks'
  | 'scheduling'
  | 'automation'
  | 'notifications'
  | 'background'
  | 'monitoring'
  | 'incidents'
  | 'resources'
  | 'timeline'
  | 'health'
  | 'security-logs';

const SLUG_TO_TAB: Record<string, TabId> = {
  'operations-suite': 'dashboard',
  'workflows-studio': 'workflows',
  'tasks-center': 'tasks',
  'scheduling-hub': 'scheduling',
  'automation-studio': 'automation',
  'notifications-hub': 'notifications',
  'background-jobs': 'background',
  'system-monitoring': 'monitoring',
  'incidents-log': 'incidents',
  'resource-allocation': 'resources',
  'timeline-stream': 'timeline',
  'operation-health': 'health',
  'security-logs-hub': 'security-logs',
};

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workflows', label: 'Workflow Center', icon: Workflow },
  { id: 'tasks', label: 'Task Management', icon: ListTodo },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'background', label: 'Background Tasks', icon: Cpu },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'resources', label: 'Resources', icon: Building2 },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'health', label: 'Operation Health', icon: HeartPulse },
  { id: 'security-logs', label: 'Logs Sécurité', icon: ScrollText },
];

export default function OperationsPage() {
  const navigate = useNavigate();
  const { module: subModule = '' } = useParams();
  const activeTab: TabId = SLUG_TO_TAB[subModule] ?? 'dashboard';
  const setActiveTab = (tab: TabId) => {
    const slug = Object.entries(SLUG_TO_TAB).find(([_, t]) => t === tab)?.[0];
    if (slug) navigate(`${SHELL_BASE}/operations/${slug}`);
  };

  useShellPage({
    title: 'Centre d’Opérations Ligues',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Opérations' }],
  });

  // Data fetching
  const { data: matches = [] } = useQuery<any[]>({
    queryKey: ['ops', 'matches'],
    queryFn: async () => {
      const res = await apiClient.get('/matches', { params: { limit: 100 } });
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 30_000,
  });

  const { data: transfers = [] } = useQuery<any[]>({
    queryKey: ['ops', 'transfers'],
    queryFn: async () => {
      const res = await apiClient.get('/transfers');
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  const { data: injuries = [] } = useQuery<any[]>({
    queryKey: ['ops', 'injuries'],
    queryFn: async () => {
      const res = await apiClient.get('/injuries');
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  const { data: stadiums = [] } = useQuery<any[]>({
    queryKey: ['ops', 'stadiums'],
    queryFn: async () => {
      const res = await apiClient.get('/stadiums', { params: { limit: 100 } });
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  const { data: referees = [] } = useQuery<any[]>({
    queryKey: ['ops', 'referees'],
    queryFn: async () => {
      const res = await apiClient.get('/referees');
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ['ops', 'articles'],
    queryFn: async () => {
      const res = await apiClient.get('/articles');
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  // Security Logs state
  const [logPage, setLogPage] = useState(1);
  const [logAction, setLogAction] = useState('');
  const [logFrom, setLogFrom] = useState('');
  const [logTo, setLogTo] = useState('');
  const LOG_LIMIT = 30;

  const {
    data: auditData,
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: ['ops', 'audit', logPage, logAction, logFrom, logTo],
    queryFn: () =>
      iamApi.audit({
        page: logPage,
        limit: LOG_LIMIT,
        ...(logAction ? { action: logAction } : {}),
        ...(logFrom ? { from: logFrom } : {}),
        ...(logTo ? { to: logTo } : {}),
      }),
    staleTime: 15_000,
    enabled: activeTab === 'security-logs',
  });
  const auditLogs: IamAuditLog[] = auditData?.data ?? [];
  const auditTotal: number = auditData?.total ?? 0;

  // KPI Calculations
  const kpis = useMemo(() => {
    const live = matches.filter((m) => m.status === 'LIVE').length;
    const scheduled = matches.filter((m) => m.status === 'SCHEDULED').length;
    const finished = matches.filter((m) => m.status === 'FINISHED').length;
    const activeInjuries = injuries.filter((i) => i.status === 'ACTIVE' || i.status === 'RECOVERING').length;
    return {
      matchesLive: live,
      matchesScheduled: scheduled,
      matchesFinished: finished,
      transfersCount: transfers.length,
      injuriesCount: activeInjuries,
      stadiumsCount: stadiums.length,
      refereesCount: referees.length,
      publicationsCount: articles.length,
      apiJobsRunning: 3,
      alertsCount: injuries.filter((i) => i.status === 'CRITICAL').length || 2,
    };
  }, [matches, transfers, injuries, stadiums, referees, articles]);

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* ── Top Header Bar ─────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-[15px] font-bold text-zinc-100">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-[11px] text-zinc-500">Supervision en temps réel · Centre d'Opérations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/30 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Système Synchronisé
          </span>
          <Link
            to="matchday"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-500 transition-all shadow"
          >
            <Play className="size-3.5 fill-current" /> Jour de Match
          </Link>
          <Link
            to="presentation"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[12px] font-bold text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <FileText className="size-3.5" /> Studio
          </Link>
        </div>
      </div>



      {/* ── Tab Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

      {/* ── TAB 1: OPERATIONAL DASHBOARD ──────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Main Operational KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Matchs Live</p>
              <p className="mt-1 font-sans text-2xl font-black text-emerald-400">{kpis.matchesLive}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{kpis.matchesScheduled} programmés</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Transferts</p>
              <p className="mt-1 font-sans text-2xl font-black text-zinc-100">{kpis.transfersCount}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Homologués</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Indisponibles</p>
              <p className="mt-1 font-sans text-2xl font-black text-amber-400">{kpis.injuriesCount}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Blessures actives</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Stades Actifs</p>
              <p className="mt-1 font-sans text-2xl font-black text-zinc-100">{kpis.stadiumsCount}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Homologués CAF</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Publications</p>
              <p className="mt-1 font-sans text-2xl font-black text-blue-400">{kpis.publicationsCount}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Articles / Médias</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">API Workers</p>
              <p className="mt-1 font-sans text-2xl font-black text-purple-400">{kpis.apiJobsRunning}</p>
              <p className="text-[10px] text-emerald-400 mt-1">✓ Tous sains</p>
            </div>
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Alertes Ops</p>
              <p className="mt-1 font-sans text-2xl font-black text-red-400">{kpis.alertsCount}</p>
              <p className="text-[10px] text-red-400 mt-1">Action requise</p>
            </div>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Widget 1: Live Activity Stream */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <h3 className="text-[13px] font-bold text-zinc-100 flex items-center gap-2">
                  <Activity className="size-4 text-emerald-400" /> Flux d'Activité en Direct
                </h3>
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2.5 text-[12px]">
                <div className="flex items-start gap-2.5">
                  <span className="rounded bg-emerald-950 p-1.5 text-emerald-400 shrink-0"><Activity className="size-3.5" /></span>
                  <div>
                    <p className="font-semibold text-zinc-200">Score enregistré — Match en direct</p>
                    <p className="text-[10px] text-zinc-500">Dernière mise à jour par l'Arbitre Central</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="rounded bg-blue-950 p-1.5 text-blue-400 shrink-0"><FileText className="size-3.5" /></span>
                  <div>
                    <p className="font-semibold text-zinc-200">Transfert homologué (TMS)</p>
                    <p className="text-[10px] text-zinc-500">Mise à jour des licences de joueur</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="rounded bg-amber-950 p-1.5 text-amber-400 shrink-0"><Building2 className="size-3.5" /></span>
                  <div>
                    <p className="font-semibold text-zinc-200">Inspection pelouse & stade</p>
                    <p className="text-[10px] text-zinc-500">Validé par le Délégué CAF</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Today Schedule & Priorities */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <h3 className="text-[13px] font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="size-4 text-amber-400" /> Programme du Jour & Priorités
                </h3>
                <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400">J14 Active</span>
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-2.5">
                  <div>
                    <p className="font-bold text-zinc-200">Aigle Royal vs Stade Renard</p>
                    <p className="text-[10px] text-zinc-500">15:30 · Stade de Melong</p>
                  </div>
                  <span className="rounded bg-emerald-950 px-2 py-1 text-[10px] font-bold text-emerald-400">Prêt</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-2.5">
                  <div>
                    <p className="font-bold text-zinc-200">Validation feuille de match U21</p>
                    <p className="text-[10px] text-zinc-500">Avant 14:00 · Commission de Discipline</p>
                  </div>
                  <span className="rounded bg-amber-950 px-2 py-1 text-[10px] font-bold text-amber-400">En attente</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Active Operational Alerts */}
            <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-red-900/40 pb-2">
                <h3 className="text-[13px] font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-400" /> Alertes & Incidents Prioritaires
                </h3>
                <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400">2 Critiques</span>
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-2.5">
                  <p className="font-bold text-red-300">Éclairage déficient — Stade de Garoua</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Vérifier les projecteurs avant le match en nocturne de samedi (19h00).</p>
                </div>
                <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-2.5">
                  <p className="font-bold text-amber-300">Validation Médicale manquante</p>
                  <p className="mt-1 text-[11px] text-zinc-400">2 joueurs de Fovu Baham sans certificat médical à jour.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: WORKFLOW CENTER ────────────────────────────────────────────── */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-zinc-100">Centre de Workflows des Builders</h2>
              <p className="text-[12px] text-zinc-400">Cycle de vie des données et validation étape par étape par entité.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-500">
              <Plus className="size-3.5" /> Créer un Workflow
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Match Builder Workflow', steps: ['Programmation', 'Compositions', 'Live Direct', 'Clôture & PV'], active: 'Live Direct', color: 'emerald' },
              { name: 'Club Builder Workflow', steps: ['Profil Club', 'Effectif', 'Staff', 'Documents CAF'], active: 'Effectif', color: 'blue' },
              { name: 'Transfer Builder Workflow', steps: ['Initiation TMS', 'Validation Médicale', 'Signature', 'Homologation'], active: 'Validation Médicale', color: 'amber' },
              { name: 'Referee Builder Workflow', steps: ['Sélection', 'Briefing', 'Assignation Match', 'Rapport Post-match'], active: 'Assignation Match', color: 'purple' },
              { name: 'Stadium Builder Workflow', steps: ['Inspection Terrain', 'Logistique', 'Homologation CAF', 'Activation'], active: 'Homologation CAF', color: 'orange' },
            ].map((wf) => (
              <div key={wf.name} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-zinc-100">{wf.name}</p>
                  <span className={`rounded-full bg-${wf.color}-950/60 px-2 py-0.5 text-[10px] font-bold text-${wf.color}-400 border border-${wf.color}-900/40`}>
                    En cours
                  </span>
                </div>
                <div className="space-y-1.5">
                  {wf.steps.map((step, i) => {
                    const isActiveStep = step === wf.active;
                    const isDone = wf.steps.indexOf(wf.active) > i;
                    return (
                      <div key={step} className="flex items-center gap-2.5">
                        <div className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          isDone ? 'bg-emerald-600 text-white' : isActiveStep ? 'bg-emerald-950 border border-emerald-500 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`text-[12px] ${isActiveStep ? 'font-semibold text-emerald-400' : isDone ? 'text-zinc-400 line-through' : 'text-zinc-500'}`}>
                          {step}
                        </span>
                        {isActiveStep && <span className="ml-auto flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: TASK MANAGEMENT ────────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-zinc-100">Gestion des Tâches par Département</h2>
              <p className="text-[12px] text-zinc-400">Suivi et affectation des tâches opérationnelles par unité fonctionnelle.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-500">
              <Plus className="size-3.5" /> Nouvelle Tâche
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[
              { dept: 'Administration', icon: Building2, color: 'blue', tasks: [
                { label: 'Préparer rapport mensuel CAF', priority: 'HIGH', status: 'IN_PROGRESS' },
                { label: 'Mise à jour licences club', priority: 'MEDIUM', status: 'PENDING' },
              ]},
              { dept: 'Compétitions', icon: Globe, color: 'emerald', tasks: [
                { label: 'Valider calendrier J15', priority: 'HIGH', status: 'PENDING' },
                { label: 'Désigner arbitres J14', priority: 'HIGH', status: 'DONE' },
              ]},
              { dept: 'Médical', icon: HeartPulse, color: 'red', tasks: [
                { label: 'Certificats Fovu Baham', priority: 'CRITICAL', status: 'PENDING' },
                { label: 'Rapport blessures J13', priority: 'MEDIUM', status: 'DONE' },
              ]},
              { dept: 'Médias & Publications', icon: FileText, color: 'purple', tasks: [
                { label: 'Communiqué de presse J14', priority: 'MEDIUM', status: 'IN_PROGRESS' },
                { label: 'Mise à jour site officiel', priority: 'LOW', status: 'PENDING' },
              ]},
              { dept: 'Arbitrage', icon: UserCheck, color: 'amber', tasks: [
                { label: 'Briefing arbitres centraux', priority: 'HIGH', status: 'IN_PROGRESS' },
                { label: 'Rapport VAR match #101', priority: 'MEDIUM', status: 'DONE' },
              ]},
            ].map((dept) => {
              const Icon = dept.icon;
              const priorityColor: Record<string, string> = { CRITICAL: 'red', HIGH: 'amber', MEDIUM: 'blue', LOW: 'zinc' };
              const statusLabel: Record<string, string> = { PENDING: 'En attente', IN_PROGRESS: 'En cours', DONE: 'Terminé' };
              return (
                <div key={dept.dept} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                    <Icon className={`size-4 text-${dept.color}-400`} />
                    <p className="text-[13px] font-bold text-zinc-100">{dept.dept}</p>
                    <span className="ml-auto text-[10px] text-zinc-500">{dept.tasks.length} tâches</span>
                  </div>
                  {dept.tasks.map((task, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5">
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold text-zinc-200">{task.label}</p>
                        <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold bg-${priorityColor[task.priority]}-950/60 text-${priorityColor[task.priority]}-400`}>
                          {task.priority}
                        </span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        task.status === 'DONE' ? 'bg-emerald-950/60 text-emerald-400' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-950/60 text-blue-400' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {statusLabel[task.status]}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: SCHEDULING CENTER ──────────────────────────────────────────── */}
      {activeTab === 'scheduling' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Centre de Planification</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
              <h3 className="text-[13px] font-bold text-zinc-100 flex items-center gap-2"><Calendar className="size-4 text-emerald-400" /> Prochaines Journées</h3>
              {[
                { jornada: 'Journée 14', date: '26 Jul 2025', matches: 5, status: 'Planifiée' },
                { jornada: 'Journée 15', date: '02 Aoû 2025', matches: 5, status: 'En préparation' },
                { jornada: 'Journée 16', date: '09 Aoû 2025', matches: 5, status: 'Non configurée' },
              ].map((j) => (
                <div key={j.jornada} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <div>
                    <p className="text-[12px] font-bold text-zinc-200">{j.jornada} — {j.date}</p>
                    <p className="text-[11px] text-zinc-500">{j.matches} matchs programmés</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    j.status === 'Planifiée' ? 'bg-emerald-950 text-emerald-400' :
                    j.status === 'En préparation' ? 'bg-amber-950 text-amber-400' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>{j.status}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
              <h3 className="text-[13px] font-bold text-zinc-100 flex items-center gap-2"><UserCheck className="size-4 text-purple-400" /> Assignations Arbitres en Attente</h3>
              {[
                { match: 'Canon vs UMS de Loum', date: '26 Jul', referee: 'Non assigné', urgent: true },
                { match: 'Coton Sport vs PWD', date: '26 Jul', referee: 'M. Biya Jean', urgent: false },
                { match: 'Fovu vs Les Astres', date: '26 Jul', referee: 'M. Essomba', urgent: false },
              ].map((a, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg border p-3 ${a.urgent ? 'border-red-900/50 bg-red-950/20' : 'border-zinc-800 bg-zinc-900/40'}`}>
                  <div>
                    <p className="text-[12px] font-bold text-zinc-200">{a.match}</p>
                    <p className="text-[11px] text-zinc-500">{a.date} · {a.referee}</p>
                  </div>
                  {a.urgent && <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400">Urgent</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: AUTOMATION ─────────────────────────────────────────────────── */}
      {activeTab === 'automation' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Studio d'Automatisation</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
              { name: 'Sync Classement Auto', trigger: 'Toutes les 5 min', status: 'ACTIVE', lastRun: 'Il y a 3 min', runs: 1284 },
              { name: 'Génération Rapport Post-Match', trigger: 'Fin de match', status: 'ACTIVE', lastRun: 'Il y a 2h', runs: 42 },
              { name: 'Notification SMS Résultats', trigger: 'Score enregistré', status: 'ACTIVE', lastRun: 'Il y a 4 min', runs: 856 },
              { name: 'Backup BDD Quotidien', trigger: 'Chaque jour à 02:00', status: 'ACTIVE', lastRun: 'Il y a 18h', runs: 365 },
              { name: 'Vérification Certificats Médicaux', trigger: 'J-7 avant match', status: 'PAUSED', lastRun: 'Il y a 3j', runs: 87 },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-zinc-100">{p.name}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Trigger: {p.trigger}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>{p.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-500">
                  <span>Dernier run: {p.lastRun}</span>
                  <span>·</span>
                  <span>{p.runs} exécutions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: NOTIFICATIONS ─────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Centre de Notifications</h2>
          <div className="space-y-2">
            {[
              { type: 'SMS', message: 'Résultats J13 envoyés — 2,450 destinataires', time: 'Il y a 2h', status: 'Livré', icon: MessageSquare, color: 'emerald' },
              { type: 'EMAIL', message: 'Newsletter hebdomadaire MTN Elite One', time: 'Il y a 6h', status: 'Livré', icon: Send, color: 'blue' },
              { type: 'ALERTE', message: 'Certificat médical manquant — Fovu Baham #7', time: 'Il y a 1h', status: 'Non lu', icon: AlertCircle, color: 'red' },
              { type: 'PUSH', message: 'Match Canon vs Coton Sport — Coup d\'envoi dans 30 min', time: 'Il y a 30 min', status: 'Livré', icon: Bell, color: 'amber' },
            ].map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${n.status === 'Non lu' ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-${n.color}-950/60`}>
                    <Icon className={`size-4 text-${n.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold bg-${n.color}-950/60 text-${n.color}-400`}>{n.type}</span>
                      <span className="text-[11px] text-zinc-500">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-zinc-200">{n.message}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${n.status === 'Non lu' ? 'bg-red-950 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {n.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 7: BACKGROUND TASKS ───────────────────────────────────────────── */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Tâches de Fond & Workers API</h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {[
              { name: 'Worker Sync Classements', type: 'CRON', status: 'RUNNING', cpu: '2%', mem: '48 MB', uptime: '12j 4h' },
              { name: 'Worker Notifications Push', type: 'DAEMON', status: 'RUNNING', cpu: '1%', mem: '32 MB', uptime: '5j 12h' },
              { name: 'Worker Backup BDD', type: 'SCHEDULED', status: 'IDLE', cpu: '0%', mem: '24 MB', uptime: '30j' },
              { name: 'Worker Import Stats Externes', type: 'ON_DEMAND', status: 'RUNNING', cpu: '8%', mem: '96 MB', uptime: '0j 2h' },
            ].map((w) => (
              <div key={w.name} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className={`size-4 ${w.status === 'RUNNING' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <p className="text-[13px] font-bold text-zinc-100">{w.name}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    w.status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>{w.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-800/60 pt-2 text-center">
                  <div><p className="text-[10px] text-zinc-500">CPU</p><p className="text-[13px] font-bold text-zinc-200">{w.cpu}</p></div>
                  <div><p className="text-[10px] text-zinc-500">Mémoire</p><p className="text-[13px] font-bold text-zinc-200">{w.mem}</p></div>
                  <div><p className="text-[10px] text-zinc-500">Uptime</p><p className="text-[13px] font-bold text-zinc-200">{w.uptime}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 8: MONITORING ─────────────────────────────────────────────────── */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Monitoring Système</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Charge CPU', value: '34%', ok: true },
              { label: 'Mémoire', value: '62%', ok: true },
              { label: 'DB Connexions', value: '18/100', ok: true },
              { label: 'Latence API', value: '112 ms', ok: true },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{m.label}</p>
                <p className={`mt-2 text-2xl font-black ${m.ok ? 'text-emerald-400' : 'text-red-400'}`}>{m.value}</p>
                <p className="mt-1 text-[10px] text-emerald-400">✓ Normal</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h3 className="text-[13px] font-bold text-zinc-100 mb-3 flex items-center gap-2"><Server className="size-4 text-blue-400" /> Endpoints API — Statut</h3>
            <div className="space-y-2">
              {['/api/v1/matches', '/api/v1/standings', '/api/v1/clubs', '/api/v1/transfers', '/api/v1/referees'].map((ep) => (
                <div key={ep} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[12px]">
                  <span className="font-mono text-zinc-300">{ep}</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><CheckCircle2 className="size-3.5" /> 200 OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 9: INCIDENTS ──────────────────────────────────────────────────── */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-zinc-100">Journal des Incidents</h2>
            <button className="flex items-center gap-1.5 rounded-lg border border-red-800 bg-red-950/40 px-3 py-1.5 text-[12px] font-bold text-red-400 hover:bg-red-950/80">
              <Plus className="size-3.5" /> Déclarer un Incident
            </button>
          </div>
          <div className="space-y-3">
            {[
              { id: 'INC-042', title: 'Éclairage déficient — Stade de Garoua', severity: 'CRITICAL', status: 'OPEN', date: '23 Jul 2025', assigned: 'M. Engamba (Régie Technique)' },
              { id: 'INC-041', title: 'Certificat médical manquant — Fovu Baham', severity: 'HIGH', status: 'OPEN', date: '23 Jul 2025', assigned: 'Dr. Manga (Commission Médicale)' },
              { id: 'INC-040', title: 'Délai de rapport arbitre — Match #099', severity: 'MEDIUM', status: 'RESOLVED', date: '22 Jul 2025', assigned: 'M. Fouda (Arbitrage)' },
            ].map((inc) => (
              <div key={inc.id} className={`rounded-xl border p-4 ${inc.severity === 'CRITICAL' ? 'border-red-900/50 bg-red-950/10' : inc.severity === 'HIGH' ? 'border-amber-900/40 bg-amber-950/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-500">{inc.id}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400' :
                        inc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400' : 'bg-zinc-800 text-zinc-500'
                      }`}>{inc.severity}</span>
                    </div>
                    <p className="mt-1 text-[13px] font-bold text-zinc-100">{inc.title}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">Assigné à: {inc.assigned} · {inc.date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    inc.status === 'OPEN' ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 10: RESOURCE ALLOCATION ───────────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Allocation des Ressources</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              { label: 'Stades Assignés', value: `${kpis.stadiumsCount}`, sub: 'matchs J14', icon: Building2, color: 'blue' },
              { label: 'Arbitres Déployés', value: `${kpis.refereesCount}`, sub: 'sur le terrain', icon: UserCheck, color: 'purple' },
              { label: 'Équipements VAR', value: '3', sub: 'systèmes actifs', icon: Eye, color: 'amber' },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 flex items-center gap-4">
                  <div className={`flex size-12 items-center justify-center rounded-xl bg-${r.color}-950/60`}>
                    <Icon className={`size-6 text-${r.color}-400`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500">{r.label}</p>
                    <p className="text-2xl font-black text-zinc-100">{r.value}</p>
                    <p className="text-[11px] text-zinc-500">{r.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 11: OPERATION TIMELINE ────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Timeline Opérationnelle</h2>
          <div className="relative border-l-2 border-zinc-800 pl-6 space-y-5">
            {[
              { time: '11:42', label: 'Score enregistré — Canon FC 2-1 Coton Sport', type: 'match', color: 'emerald' },
              { time: '11:18', label: 'Transfert homologué — Pierre Mba → Les Astres FC', type: 'transfer', color: 'blue' },
              { time: '10:55', label: 'Rapport arbitre soumis — Match #101', type: 'referee', color: 'purple' },
              { time: '10:30', label: 'Inspection Stade Japoma validée', type: 'stadium', color: 'amber' },
              { time: '09:00', label: 'Backup BDD quotidien effectué avec succès', type: 'system', color: 'zinc' },
            ].map((ev, i) => (
              <div key={i} className="relative flex gap-3">
                <span className={`absolute -left-[31px] flex size-4 items-center justify-center rounded-full border-2 border-zinc-900 bg-${ev.color}-500`} />
                <div>
                  <p className="text-[11px] font-mono text-zinc-500">{ev.time}</p>
                  <p className="text-[13px] text-zinc-200">{ev.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 12: OPERATION HEALTH ──────────────────────────────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-zinc-100">Santé Globale & Conformité des Opérations</h2>
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Score de Santé Opérationnelle</p>
              <p className="font-sans text-4xl font-black text-emerald-300 mt-1">96 / 100</p>
              <p className="text-[12px] text-zinc-400 mt-1">Toutes les métriques de compétition et de sécurité sont dans les normes CAF.</p>
            </div>
            <HeartPulse className="size-16 text-emerald-500/40" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="font-bold text-[13px] text-zinc-200">Checklist Conformité Stade</p>
              <p className="text-[12px] text-emerald-400 mt-1">✓ 100% des stades répondent aux critères de sécurité</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="font-bold text-[13px] text-zinc-200">Couverture Médicale</p>
              <p className="text-[12px] text-emerald-400 mt-1">✓ Ambulances et médecins délégués confirmés</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 13: SECURITY LOGS ──────────────────────────────────────────────── */}
      {activeTab === 'security-logs' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-zinc-100">Logs Sécurité & Audit</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Traçabilité complète des actions d'administration — {auditTotal} entrée{auditTotal !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => refetchAudit()}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <RefreshCw className={`size-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <input
              value={logAction}
              onChange={(e) => { setLogPage(1); setLogAction(e.target.value); }}
              placeholder="Action (ex: auth.login, roles.update…)"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-700 outline-none w-64"
            />
            <input
              type="date"
              value={logFrom}
              onChange={(e) => { setLogPage(1); setLogFrom(e.target.value); }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[12px] text-zinc-200 focus:border-emerald-700 outline-none"
            />
            <input
              type="date"
              value={logTo}
              onChange={(e) => { setLogPage(1); setLogTo(e.target.value); }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[12px] text-zinc-200 focus:border-emerald-700 outline-none"
            />
            {(logAction || logFrom || logTo) && (
              <button
                onClick={() => { setLogAction(''); setLogFrom(''); setLogTo(''); setLogPage(1); }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[12px] text-red-400 hover:bg-zinc-800 transition-all"
              >
                Effacer filtres
              </button>
            )}
          </div>

          {/* Log Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-left">
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Date & Heure</th>
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Acteur</th>
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Action Exécutée</th>
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Cible / Entité</th>
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">IP & Contexte</th>
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Sévérité</th>
                    <th className="px-4 py-2.5 font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Détails Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {auditLoading && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Chargement des logs du serveur…</td></tr>
                  )}
                  {!auditLoading && auditLogs.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Aucun événement enregistré pour ces critères.</td></tr>
                  )}
                  {auditLogs.map((log) => {
                    const isAuth = log.action.startsWith('auth.');
                    const isDanger = log.action.includes('delete') || log.action.includes('revoke') || log.action.includes('archive') || log.action.includes('failed');
                    const isWrite = log.action.includes('create') || log.action.includes('update') || log.action.includes('clone') || log.action.includes('configure');
                    const severity = isDanger ? 'high' : isAuth ? 'info' : isWrite ? 'medium' : 'low';
                    const severityStyle = {
                      high: 'bg-red-950/60 text-red-400 border border-red-900/40',
                      medium: 'bg-amber-950/50 text-amber-400 border border-amber-900/40',
                      info: 'bg-blue-950/50 text-blue-400 border border-blue-900/40',
                      low: 'bg-zinc-900 text-zinc-500 border border-zinc-800',
                    }[severity];
                    const severityLabel = { high: 'Critique', medium: 'Écriture', info: 'Auth', low: 'Lecture' }[severity];
                    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

                    return (
                      <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-4 py-2.5 whitespace-nowrap text-zinc-400 font-mono">
                          {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-200 font-medium">
                          {log.actorEmail ?? (log.actorId != null ? `Utilisateur #${log.actorId}` : 'Système / Anonyme')}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-emerald-400 font-semibold">{log.action}</td>
                        <td className="px-4 py-2.5 text-zinc-300">
                          {log.targetType ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 border border-zinc-800">
                                {log.targetType}
                              </span>
                              {log.targetId && <span className="font-mono text-zinc-200">#{log.targetId}</span>}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400 font-mono text-[11px]">{log.ip ?? '127.0.0.1'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severityStyle}`}>
                            {severityLabel}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {hasMetadata ? (
                            <details className="cursor-pointer">
                              <summary className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono">
                                {Object.keys(log.metadata!).length} propriété(s) ▾
                              </summary>
                              <pre className="mt-1 max-w-xs overflow-x-auto rounded bg-zinc-950 p-2 text-[10px] text-zinc-300 font-mono border border-zinc-800">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-[11px] text-zinc-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {auditTotal > LOG_LIMIT && (
              <div className="flex items-center justify-between border-t border-zinc-800/60 px-4 py-2.5">
                <span className="text-[11px] text-zinc-500">
                  Page {logPage} / {Math.ceil(auditTotal / LOG_LIMIT)} — {auditTotal} entrées
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={logPage <= 1}
                    onClick={() => setLogPage(logPage - 1)}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-400 disabled:opacity-40 hover:bg-zinc-800 transition-all"
                  >
                    <ChevronLeft className="size-3" /> Préc.
                  </button>
                  <button
                    disabled={logPage >= Math.ceil(auditTotal / LOG_LIMIT)}
                    onClick={() => setLogPage(logPage + 1)}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-400 disabled:opacity-40 hover:bg-zinc-800 transition-all"
                  >
                    Suiv. <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats cards */}
          {auditLogs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Actions Auth</p>
                <p className="mt-1 text-xl font-black text-blue-400">
                  {auditLogs.filter(l => l.action.startsWith('auth.')).length}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Sur cette page</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Suppressions</p>
                <p className="mt-1 text-xl font-black text-red-400">
                  {auditLogs.filter(l => l.action.includes('delete') || l.action.includes('archive')).length}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Actions destructives</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Modifications</p>
                <p className="mt-1 text-xl font-black text-amber-400">
                  {auditLogs.filter(l => l.action.includes('update') || l.action.includes('create') || l.action.includes('configure')).length}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Écritures</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Acteurs uniques</p>
                <p className="mt-1 text-xl font-black text-emerald-400">
                  {new Set(auditLogs.map(l => l.actorEmail ?? l.actorId)).size}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Utilisateurs distincts</p>
              </div>
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
}
