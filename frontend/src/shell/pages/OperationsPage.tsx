import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Workflow, Presentation, Zap, Calendar, Play, Building2, UserCheck, Shield, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { DocumentLayout } from '../layouts/DocumentLayout';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

interface MatchRow {
  id: number;
  round: number;
  status: string;
  scheduledAt: string;
  homeClubId: number;
  awayClubId: number;
  homeClub?: { name?: string; logoUrl?: string };
  awayClub?: { name?: string; logoUrl?: string };
}

export default function OperationsPage() {
  const navigate = useNavigate();

  useShellPage({
    title: 'Opérations',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Opérations' }],
  });

  const { data: matches = [] } = useQuery<MatchRow[]>({
    queryKey: ['operations', 'matches'],
    queryFn: async () => {
      const res = await apiClient.get('/matches', { params: { limit: 100 } });
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 30_000,
  });

  const { data: stadiums = [] } = useQuery({
    queryKey: ['operations', 'stadiums'],
    queryFn: async () => {
      const res = await apiClient.get('/stadiums', { params: { limit: 100 } });
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  const { data: referees = [] } = useQuery({
    queryKey: ['operations', 'referees'],
    queryFn: async () => {
      const res = await apiClient.get('/referees');
      return Array.isArray(res.data) ? res.data : res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  const upcomingMatches = useMemo(() => {
    return matches
      .filter((m) => m.status === 'SCHEDULED' || m.status === 'LIVE')
      .slice(0, 5);
  }, [matches]);

  const stats = useMemo(() => {
    return {
      scheduled: matches.filter((m) => m.status === 'SCHEDULED').length,
      live: matches.filter((m) => m.status === 'LIVE').length,
      stadiumsCount: stadiums.length,
      refereesCount: referees.length,
    };
  }, [matches, stadiums, referees]);

  return (
    <DocumentLayout
      hero={
        <div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-zinc-100">Centre d'Opérations Ligues</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
            Supervision des processus opérationnels — jour de match, diffusion, automatisation et studio de présentation.
          </p>
        </div>
      }
    >
      {/* Live Operational KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <Play className="size-3.5 text-emerald-400" /> Matchs en direct
          </div>
          <p className="mt-1 font-sans text-2xl font-black text-emerald-400">{stats.live}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <Calendar className="size-3.5 text-amber-400" /> Avenir programmé
          </div>
          <p className="mt-1 font-sans text-2xl font-black text-zinc-100">{stats.scheduled} matchs</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <Building2 className="size-3.5 text-sky-400" /> Stades homologués
          </div>
          <p className="mt-1 font-sans text-2xl font-black text-zinc-100">{stats.stadiumsCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <UserCheck className="size-3.5 text-purple-400" /> Officiels inscrits
          </div>
          <p className="mt-1 font-sans text-2xl font-black text-zinc-100">{stats.refereesCount}</p>
        </div>
      </div>

      {/* Main Operational Modules Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="matchday"
          className="group rounded-xl border border-emerald-900/50 bg-emerald-950/10 p-5 transition-all hover:border-emerald-700 hover:bg-emerald-950/20"
        >
          <Calendar className="size-6 text-emerald-500 transition-transform group-hover:scale-110" />
          <h3 className="mt-3 font-sans text-[15px] font-bold text-zinc-100 flex items-center justify-between">
            Jour de Match <ChevronRight className="size-4 text-zinc-600 group-hover:text-emerald-400" />
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
            Supervision en direct de la journée de championnat, affectation des officiels, scores en temps réel et accès Match Builder.
          </p>
        </Link>

        <Link
          to="presentation"
          className="group rounded-xl border border-blue-900/50 bg-blue-950/10 p-5 transition-all hover:border-blue-700 hover:bg-blue-950/20"
        >
          <Presentation className="size-6 text-blue-500 transition-transform group-hover:scale-110" />
          <h3 className="mt-3 font-sans text-[15px] font-bold text-zinc-100 flex items-center justify-between">
            Studio de présentation <ChevronRight className="size-4 text-zinc-600 group-hover:text-blue-400" />
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
            Génération de documents haute qualité (A4/A3), cartes réseaux sociaux, classements imprimables, exports PDF & Excel.
          </p>
        </Link>

        <Link
          to="automation"
          className="group rounded-xl border border-amber-900/50 bg-amber-950/10 p-5 transition-all hover:border-amber-700 hover:bg-amber-950/20"
        >
          <Zap className="size-6 text-amber-500 transition-transform group-hover:scale-110" />
          <h3 className="mt-3 font-sans text-[15px] font-bold text-zinc-100 flex items-center justify-between">
            Automation Studio <ChevronRight className="size-4 text-zinc-600 group-hover:text-amber-400" />
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
            Pipelines visuels de fin de match : mise à jour automatique des classements, rafraîchissement d'Intelligence et alertes.
          </p>
        </Link>
      </div>

      {/* Upcoming Agenda Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-sans text-[14px] font-bold text-zinc-100">Prochaines Rencontres au Programme</h3>
            <p className="text-[11px] text-zinc-500">Les 5 prochains matchs configurés dans le calendrier de saison</p>
          </div>
          <Link
            to="matchday"
            className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Voir tous les matchs <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {upcomingMatches.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-zinc-500 italic">
            Aucune rencontre programmée prochainement.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`${SHELL_BASE}/builders/admin/matches/${m.id}`)}
                className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5 hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                    J{m.round}
                  </span>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-200">
                    <span>{m.homeClub?.name ?? `Club ${m.homeClubId}`}</span>
                    <span className="text-zinc-500 text-[11px]">vs</span>
                    <span>{m.awayClub?.name ?? `Club ${m.awayClubId}`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-zinc-400">
                  <span>
                    {m.scheduledAt
                      ? new Date(m.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'Date non fixée'}
                  </span>
                  <ChevronRight className="size-3.5 text-zinc-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DocumentLayout>
  );
}

