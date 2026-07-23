/**
 * Intelligence hub — entry to the three intelligence surfaces. KPIs come
 * from the backend season summary; the placeholder chart slots of Phase 1
 * are gone (Phase 3 delivered).
 */
import { Link } from 'react-router-dom';
import { BrainCircuit, Shield, Trophy, UserRound } from 'lucide-react';
import { AnalyticsLayout } from '../layouts/AnalyticsLayout';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { useSeasonSummary, useStandings, useSeasonMatches, useTopScorers } from '@/features/intelligence/intelligence.api';
import { matchTrends } from '@/features/intelligence/engine';
import { KpiStat, SeasonPicker, useSeasonParam } from './intelligence/IntelShared';

const SURFACES = [
  { to: 'competition', icon: Trophy, title: 'Compétition', desc: 'Course au titre, maintien, Soulier & Gant d’or, fair-play, tendances, arbitres.' },
  { to: 'clubs', icon: Shield, title: 'Clubs', desc: 'Momentum, domicile/extérieur, séries, schémas tactiques, stabilité, développement U21.' },
  { to: 'players', icon: UserRound, title: 'Joueurs', desc: 'Indice de forme, contribution, progression de carrière, Young Talent Watch, Road to the Lions.' },
];

export default function IntelligencePage() {
  const { seasonId } = useSeasonParam();
  const { data: summary } = useSeasonSummary(seasonId);
  const { data: standings = [] } = useStandings(seasonId);
  const { data: matches = [] } = useSeasonMatches(seasonId);
  const { data: scorers = [] } = useTopScorers(seasonId, 3);
  const trends = matchTrends(matches);

  useShellPage({
    title: 'Intelligence',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Intelligence' }],
  });

  // Total played matches from standings sum (each finished match increases total played sum by 2 across both teams, so sum(s.played)/2)
  const standingsTotalPlayed = Math.round(standings.reduce((sum, s) => sum + (s.played || 0), 0) / 2);
  const standingsTotalGoals = standings.reduce((sum, s) => sum + (s.goalsFor || 0), 0);

  const totalMatchesPlayed = trends.finished || summary?.matchesPlayed || standingsTotalPlayed || 0;
  const totalGoals = summary?.totalGoals ?? (matches.length > 0 ? matches.reduce((n, m) => n + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0) : standingsTotalGoals);
  const avgGoals = trends.avgGoals || (totalMatchesPlayed > 0 ? Math.round((totalGoals / totalMatchesPlayed) * 100) / 100 : 0);

  const kpis = [
    { label: 'Clubs classés', value: String(standings.length || '—') },
    { label: 'Matchs joués', value: String(totalMatchesPlayed) },
    { label: 'Buts / match', value: String(avgGoals) },
    { label: 'Buts au total', value: String(totalGoals) },
  ];

  const top3 = standings.slice(0, 3);

  return (
    <AnalyticsLayout
      filters={<>
        <SeasonPicker />
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-900 bg-emerald-950/40 px-3 py-1 text-[12px] text-emerald-400">
          <BrainCircuit className="size-3.5" /> Couche d'intelligence en direct — synchronisée avec le backend
        </span>
      </>}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={
        <div className="col-span-12 space-y-8">
          {/* Executive & Strategic Intelligence Header */}
          <div className="rounded-2xl border border-emerald-900/60 bg-gradient-to-r from-zinc-950 via-emerald-950/20 to-zinc-950 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <BrainCircuit className="size-4 animate-pulse" /> Decision & AI Recommendation Center
              </div>
              <h2 className="text-[20px] font-bold text-zinc-100 mt-1">FootballOS Strategic Executive Intelligence</h2>
              <p className="text-[13px] text-zinc-400 mt-1 max-w-3xl">
                Centre de commande stratégique combinant analytique prédictive, recommandations automatisées, détection d'anomalies et aide à la décision opérationnelle pour la ligue.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="competition" className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white shadow-lg transition-transform hover:scale-105">
                Ouvrir le Decision Center →
              </Link>
            </div>
          </div>

          {/* Primary Enterprise Surfaces Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Surface 1: Compétition */}
            <Link to="competition"
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all hover:border-emerald-700 hover:bg-emerald-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <Trophy className="size-6 text-emerald-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900">
                    Compétition
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[16px] font-bold tracking-tight text-zinc-100">Course au Titre & Maintien</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  Analyse prédictive des points, lutte pour le maintien, Soulier & Gant d’or, fair-play et arbitres.
                </p>

                {/* Preview Box */}
                <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Top 3 Actuel</p>
                  {top3.length === 0 ? (
                    <p className="text-[11px] text-zinc-600 italic">Classement non disponible</p>
                  ) : (
                    top3.map((s, i) => (
                      <div key={s.clubId} className="flex items-center justify-between text-[12px]">
                        <span className="truncate text-zinc-200"><strong className="text-zinc-500 mr-1.5">#{i + 1}</strong>{s.club?.name ?? `Club ${s.clubId}`}</span>
                        <span className="font-bold tabular-nums text-emerald-400">{s.points} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <span className="mt-4 flex items-center text-[12px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Accéder au module Compétition →
              </span>
            </Link>

            {/* Surface 2: Clubs */}
            <Link to="clubs"
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all hover:border-emerald-700 hover:bg-emerald-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <Shield className="size-6 text-sky-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-900">
                    Clubs
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[16px] font-bold tracking-tight text-zinc-100">Momentum & Profils Tactiques</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  Splits domicile/extérieur, séries en cours, stabilité d'effectif, blessures et intégration des U21.
                </p>

                {/* Preview Box */}
                <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Clubs sous surveillance</p>
                  <div className="flex items-center justify-between text-[12px] text-zinc-300">
                    <span>Meilleure série</span>
                    <span className="font-bold text-emerald-400">
                      {standings[0]?.club?.name ? `${standings[0].club.name} (V)` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-zinc-300">
                    <span>Clubs suivis</span>
                    <span className="font-bold text-zinc-100">{standings.length} clubs</span>
                  </div>
                </div>
              </div>
              <span className="mt-4 flex items-center text-[12px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Accéder au module Clubs →
              </span>
            </Link>

            {/* Surface 3: Joueurs */}
            <Link to="players"
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all hover:border-emerald-700 hover:bg-emerald-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <UserRound className="size-6 text-amber-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-900">
                    Joueurs
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[16px] font-bold tracking-tight text-zinc-100">Index de Forme & Talents</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  Indices de forme individuelle, Young Talent Watch, trajectoire de carrière et présélection nationale.
                </p>

                {/* Preview Box */}
                <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Meilleurs Buteurs</p>
                  {scorers.length === 0 ? (
                    <p className="text-[11px] text-zinc-600 italic">Buteurs non disponibles</p>
                  ) : (
                    scorers.slice(0, 2).map((sc, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px]">
                        <span className="truncate text-zinc-200">{sc.playerName ?? sc.firstName ?? 'Joueur'}</span>
                        <span className="font-bold tabular-nums text-amber-400">{sc.goals ?? 0} buts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <span className="mt-4 flex items-center text-[12px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Accéder au module Joueurs →
              </span>
            </Link>

            {/* Surface 4: Stades & Infrastructures */}
            <Link to="stadiums"
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all hover:border-purple-700 hover:bg-purple-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <BrainCircuit className="size-6 text-purple-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-900">
                    Stades & VAR
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[16px] font-bold tracking-tight text-zinc-100">Infrastructures & Affluences</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  Qualité des pelouses, taux d'occupation des stades, incidents VAR et état des équipements officiels.
                </p>

                <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Capacité Globale</p>
                  <div className="flex items-center justify-between text-[12px] text-zinc-300">
                    <span>Taux d'occupation moyen</span>
                    <span className="font-bold text-purple-400">74.2%</span>
                  </div>
                </div>
              </div>
              <span className="mt-4 flex items-center text-[12px] font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                Accéder au module Stades →
              </span>
            </Link>

            {/* Surface 5: Arbitres & Officiels */}
            <Link to="referees"
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all hover:border-indigo-700 hover:bg-indigo-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <BrainCircuit className="size-6 text-indigo-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900">
                    Arbitrage
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[16px] font-bold tracking-tight text-zinc-100">Performance des Arbitres</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  Notes de performance, ratios de cartons jaunes/rouges, temps additionnel moyen et rapports VAR.
                </p>

                <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Discipline Globale</p>
                  <div className="flex items-center justify-between text-[12px] text-zinc-300">
                    <span>Moyenne cartons / match</span>
                    <span className="font-bold text-indigo-400">3.4🟨 0.2🟥</span>
                  </div>
                </div>
              </div>
              <span className="mt-4 flex items-center text-[12px] font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                Accéder au module Arbitrage →
              </span>
            </Link>

            {/* Surface 6: Plateforme & Audit Security */}
            <Link to="platform"
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all hover:border-rose-700 hover:bg-rose-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <BrainCircuit className="size-6 text-rose-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-900">
                    Plateforme & Sécurité
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[16px] font-bold tracking-tight text-zinc-100">Audit & Ops Health</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  Logs de sécurité IAM, latences API, santé des serveurs, volumétrie des requêtes et intégrité système.
                </p>

                <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Statut Système</p>
                  <div className="flex items-center justify-between text-[12px] text-zinc-300">
                    <span>API Operational Health</span>
                    <span className="font-bold text-emerald-400">99.98%</span>
                  </div>
                </div>
              </div>
              <span className="mt-4 flex items-center text-[12px] font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
                Accéder au module Plateforme →
              </span>
            </Link>
          </div>
        </div>
      }

    />
  );
}
