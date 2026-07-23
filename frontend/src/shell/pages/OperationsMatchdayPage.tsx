/**
 * Operations Matchday Page — Live matchday operational hub.
 * Visual control over today's / active round matches, kickoff status, referee assignments,
 * and quick access to Match Builder.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Shield, Trophy, User, ArrowRight, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { DocumentLayout } from '../layouts/DocumentLayout';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { SeasonPicker, useSeasonParam } from './intelligence/IntelShared';

interface MatchRow {
  id: number;
  round: number;
  status: 'SCHEDULED' | 'LIVE' | 'POSTPONED' | 'FINISHED' | 'CANCELLED';
  scheduledAt: string;
  venue?: string;
  referee?: string;
  homeClubId: number;
  awayClubId: number;
  homeScore?: number | null;
  awayScore?: number | null;
  homeClub?: { id: number; name: string; logoUrl?: string };
  awayClub?: { id: number; name: string; logoUrl?: string };
}

export default function OperationsMatchdayPage() {
  const navigate = useNavigate();
  const { seasonId } = useSeasonParam();
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');

  useShellPage({
    title: 'Jour de Match',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Opérations', href: `${SHELL_BASE}/operations` },
      { label: 'Jour de Match' },
    ],
  });

  const { data: matches = [], isLoading } = useQuery<MatchRow[]>({
    queryKey: ['operations', 'matchday', seasonId],
    queryFn: async () => {
      const res = await apiClient.get('/matches', { params: { seasonId, limit: 300 } });
      const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      return raw;
    },
    staleTime: 15_000,
  });

  const rounds = useMemo(() => {
    const set = new Set<number>();
    matches.forEach((m) => { if (m.round) set.add(m.round); });
    return Array.from(set).sort((a, b) => a - b);
  }, [matches]);

  const activeRound = useMemo(() => {
    if (selectedRound !== 'ALL') return selectedRound;
    // Auto detect current round (first round with live or scheduled matches)
    const liveMatch = matches.find((m) => m.status === 'LIVE');
    if (liveMatch) return liveMatch.round;
    const scheduled = matches.find((m) => m.status === 'SCHEDULED');
    if (scheduled) return scheduled.round;
    return rounds[rounds.length - 1] ?? 1;
  }, [matches, selectedRound, rounds]);

  const filteredMatches = useMemo(() => {
    if (selectedRound === 'ALL') return matches.filter((m) => m.round === activeRound);
    return matches.filter((m) => m.round === selectedRound);
  }, [matches, activeRound, selectedRound]);

  const stats = useMemo(() => {
    const roundMatches = matches.filter((m) => m.round === activeRound);
    return {
      total: roundMatches.length,
      finished: roundMatches.filter((m) => m.status === 'FINISHED').length,
      live: roundMatches.filter((m) => m.status === 'LIVE').length,
      scheduled: roundMatches.filter((m) => m.status === 'SCHEDULED').length,
      postponed: roundMatches.filter((m) => m.status === 'POSTPONED').length,
    };
  }, [matches, activeRound]);

  return (
    <DocumentLayout
      hero={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-sans text-xl font-bold tracking-tight text-zinc-100">Supervision Jour de Match</h1>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
              Pilotage en direct des rencontres, feuilles de match, officiels et accès instantané au Match Builder.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SeasonPicker />
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="h-8 rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[12px] font-semibold text-zinc-200 outline-none focus:border-emerald-700"
            >
              <option value="ALL">Journée active (J{activeRound})</option>
              {rounds.map((r) => (
                <option key={r} value={r}>Journée {r}</option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Rencontres J{activeRound}</p>
          <p className="mt-1 font-sans text-2xl font-black text-zinc-100">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">En direct / Terminés</p>
          <p className="mt-1 font-sans text-2xl font-black text-emerald-400">{stats.live + stats.finished} / {stats.total}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Programmés</p>
          <p className="mt-1 font-sans text-2xl font-black text-amber-400">{stats.scheduled}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Reports / Incomplets</p>
          <p className="mt-1 font-sans text-2xl font-black text-red-400">{stats.postponed}</p>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-zinc-200">Matchs de la Journée {activeRound}</h2>
          <span className="text-[12px] text-zinc-500">{filteredMatches.length} affiches</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[13px] text-zinc-500 animate-pulse">Chargement des rencontres en direct…</div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-[13px] text-zinc-500">
            Aucun match trouvé pour cette journée.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredMatches.map((m) => {
              const homeName = m.homeClub?.name ?? `Club ${m.homeClubId}`;
              const awayName = m.awayClub?.name ?? `Club ${m.awayClubId}`;
              const isLive = m.status === 'LIVE';
              const isFinished = m.status === 'FINISHED';
              const isPostponed = m.status === 'POSTPONED';
              const dateStr = m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Date non définie';

              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`${SHELL_BASE}/builders/admin/matches/${m.id}`)}
                  className={`group relative flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-all cursor-pointer ${
                    isLive
                      ? 'border-emerald-600/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/40'
                      : isFinished
                      ? 'border-zinc-800 bg-zinc-950/40 opacity-80 hover:opacity-100 hover:border-zinc-700'
                      : isPostponed
                      ? 'border-red-900/40 bg-red-950/10'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-600/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-600/40 animate-pulse">
                        <Play className="size-3 fill-current" /> EN DIRECT
                      </span>
                    ) : isFinished ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
                        <CheckCircle2 className="size-3 text-emerald-400" /> TERMINÉ
                      </span>
                    ) : isPostponed ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-red-950 px-2.5 py-1 text-[11px] font-bold text-red-400 border border-red-900/40">
                        <AlertCircle className="size-3" /> REPORTÉ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-400 border border-zinc-800">
                        <Clock className="size-3 text-amber-400" /> {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Teams & Score */}
                  <div className="flex flex-1 items-center justify-center gap-4 min-w-[280px]">
                    {/* Home */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
                      <span className="text-[14px] font-bold text-zinc-100">{homeName}</span>
                      <div className="size-8 shrink-0 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center p-0.5">
                        {m.homeClub?.logoUrl ? (
                          <img src={m.homeClub.logoUrl} alt="" className="size-full object-contain" />
                        ) : (
                          <Shield className="size-4 text-zinc-600" />
                        )}
                      </div>
                    </div>

                    {/* Score / VS */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-center font-sans text-base font-black tabular-nums min-w-[70px]">
                      {isFinished || isLive ? (
                        <span className={isLive ? 'text-emerald-400' : 'text-zinc-100'}>
                          {m.homeScore ?? 0} − {m.awayScore ?? 0}
                        </span>
                      ) : (
                        <span className="text-[12px] font-bold text-zinc-500">VS</span>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex items-center gap-2.5 flex-1 text-left">
                      <div className="size-8 shrink-0 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center p-0.5">
                        {m.awayClub?.logoUrl ? (
                          <img src={m.awayClub.logoUrl} alt="" className="size-full object-contain" />
                        ) : (
                          <Shield className="size-4 text-zinc-600" />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-zinc-100">{awayName}</span>
                    </div>
                  </div>

                  {/* Meta & Action */}
                  <div className="flex items-center gap-4 text-[12px] text-zinc-500 min-w-[160px] justify-end">
                    {m.venue && (
                      <span className="hidden sm:flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="size-3 text-zinc-600" /> {m.venue}
                      </span>
                    )}
                    <span className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-300 group-hover:border-emerald-600 group-hover:text-emerald-400 transition-colors">
                      Ouvrir Match Builder <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DocumentLayout>
  );
}
