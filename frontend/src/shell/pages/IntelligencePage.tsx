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
import { useSeasonSummary, useStandings } from '@/features/intelligence/intelligence.api';
import { matchTrends } from '@/features/intelligence/engine';
import { useSeasonMatches } from '@/features/intelligence/intelligence.api';
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
  const trends = matchTrends(matches);

  useShellPage({
    title: 'Intelligence',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Intelligence' }],
  });

  const kpis = [
    { label: 'Clubs classés', value: String(standings.length || '—') },
    { label: 'Matchs joués', value: String(trends.finished || summary?.matchesPlayed || 0) },
    { label: 'Buts / match', value: String(trends.avgGoals || 0) },
    { label: 'Buts au total', value: String(summary?.totalGoals ?? matches.reduce((n, m) => n + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0)) },
  ];

  return (
    <AnalyticsLayout
      filters={<><SeasonPicker />
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-900 bg-emerald-950/40 px-3 py-1 text-[12px] text-emerald-400">
          <BrainCircuit className="size-3.5" /> Couche d'intelligence — lit le backend, ne possède aucune donnée
        </span></>}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={
        <div className="col-span-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {SURFACES.map((s) => (
            <Link key={s.to} to={s.to}
              className="group rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-emerald-900 hover:bg-emerald-950/20">
              <s.icon className="size-6 text-zinc-500 transition-colors group-hover:text-emerald-400" />
              <h3 className="mt-3 font-sans text-[15px] font-bold tracking-tight text-zinc-100">{s.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{s.desc}</p>
            </Link>
          ))}
        </div>
      }
    />
  );
}
