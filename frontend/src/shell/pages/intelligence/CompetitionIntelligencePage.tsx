/**
 * Competition Intelligence — races, discipline, trends and officials.
 * Every number originates in the backend (standings computed with the
 * competition's configured points system; stats aggregates); this surface
 * derives INSIGHT: who can still win, who is in danger, at what pace.
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { AnalyticsLayout } from '../../layouts/AnalyticsLayout';
import { useShellPage } from '../../stores/page.store';
import { SHELL_BASE } from '../../navigation/domains';
import {
  useCompetitionMeta, usePlayerStats, useSeasonMatches, useSeasonMeta, useStandings, useTopScorers, useUpcomingMatches,
} from '@/features/intelligence/intelligence.api';
import {
  bootProjection, fairPlayTable, goalsByRound, matchTrends, nameOf,
  refereeInsights, relegationBattle, titleRace,
} from '@/features/intelligence/engine';
import { IntelCard, MeterBar, SeasonPicker, EmptyIntel, FormChips, useSeasonParam, KpiStat, ClubLogo, PlayerAvatar } from './IntelShared';

const chartConfig = { avg: { label: 'Buts / match', color: 'var(--chart-1, #10b981)' } } satisfies ChartConfig;

export default function CompetitionIntelligencePage() {
  const { seasonId } = useSeasonParam();
  const { data: season } = useSeasonMeta(seasonId);
  const { data: competition } = useCompetitionMeta(season?.competitionId);
  const { data: standings = [] } = useStandings(seasonId);
  const { data: scorers = [] } = useTopScorers(seasonId, 8);
  const { data: playerStats = [] } = usePlayerStats(seasonId);
  const { data: matches = [] } = useSeasonMatches(seasonId);
  const { data: upcomingMatches = [] } = useUpcomingMatches(seasonId, 5);

  useShellPage({
    title: 'Intelligence — Compétition',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Intelligence', href: `${SHELL_BASE}/intelligence` },
      { label: 'Compétition' },
    ],
  });

  // Configuration-aware parameters (Phase 5): points/win + matchdays
  const pointsPerWin = competition?.config?.regulations?.pointsSystem?.win ?? 3;
  const matchdays = season?.config?.matchConfig?.matchdays
    ?? (standings.length > 1 ? (standings.length - 1) * 2 : 34);

  const race = titleRace(standings, matchdays, pointsPerWin);
  const releg = relegationBattle(standings, 3, pointsPerWin);
  const gks = playerStats
    .filter((p) => (p.position ?? '').startsWith('G') && Number(p.cleanSheets ?? 0) > 0)
    .sort((a, b) => Number(b.cleanSheets ?? 0) - Number(a.cleanSheets ?? 0)).slice(0, 6);
  const fair = fairPlayTable(playerStats).slice(0, 8);
  const rounds = goalsByRound(matches);
  const trends = matchTrends(matches);
  const refs = refereeInsights(matches).slice(0, 8);

  const kpis = [
    { label: 'Matchs joués', value: String(trends.finished) },
    { label: 'Buts / match', value: String(trends.avgGoals) },
    { label: 'Victoires à domicile', value: `${trends.homePct}%` },
    { label: '+2,5 buts', value: `${trends.over25Pct}%` },
  ];

  return (
    <AnalyticsLayout
      filters={<><SeasonPicker />
        <span className="rounded-full border border-zinc-800 px-3 py-1 text-[12px] text-zinc-500">
          {pointsPerWin} pts / victoire · {matchdays} journées
        </span></>}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={<div className="col-span-12">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <IntelCard title="Course au titre"
          hint={`Encore en course : écart rattrapable sur ${matchdays} journées au barème configuré de la compétition.`}>
          {race.contenders.length === 0 ? <EmptyIntel what="la course au titre" /> : (
            <ul className="space-y-2">
              {race.contenders.slice(0, 6).map((c) => (
                <li key={c.clubId} className="flex items-center gap-3">
                  <span className="w-5 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-500">{c.position}</span>
                  <ClubLogo url={c.club?.logoUrl} name={c.club?.name} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{c.club?.name ?? `Club ${c.clubId}`}</span>
                  <FormChips guide={c.formGuide} />
                  <span className="w-14 text-right text-[12px] text-zinc-500">{c.gap === 0 ? 'leader' : `−${c.gap} pts`}</span>
                  <span className="w-16 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-300">max {c.maxPoints}</span>
                </li>
              ))}
            </ul>
          )}
        </IntelCard>

        <IntelCard title="Lutte pour le maintien"
          hint="Zone rouge (3 derniers) + clubs à une victoire de la zone.">
          {standings.length === 0 ? <EmptyIntel what="le maintien" /> : (
            <ul className="space-y-2">
              {[...(releg.threatened ?? []), ...releg.zone].map((c) => {
                const inZone = releg.zone.some((z) => z.clubId === c.clubId);
                return (
                  <li key={c.clubId} className="flex items-center gap-3">
                    <span className={`w-5 text-right font-sans text-[12px] font-bold tabular-nums ${inZone ? 'text-red-500' : 'text-amber-500'}`}>{c.position}</span>
                    <ClubLogo url={c.club?.logoUrl} name={c.club?.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{c.club?.name ?? `Club ${c.clubId}`}</span>
                    <FormChips guide={c.formGuide} />
                    <span className="w-14 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-300">{c.points} pts</span>
                  </li>
                );
              })}
            </ul>
          )}
        </IntelCard>

        <IntelCard title="Soulier d'or" hint="Projection = rythme actuel × journées totales.">
          {scorers.length === 0 ? <EmptyIntel what="les buteurs" /> : (
            <ul className="space-y-2">
              {scorers.map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-5 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-500">{i + 1}</span>
                  <PlayerAvatar name={nameOf(s)} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">
                    {nameOf(s)} <span className="text-zinc-600">· {s.clubName ?? s.club?.name ?? ''}</span>
                  </span>
                  <span className="font-sans text-[13px] font-bold tabular-nums text-emerald-400">{s.goals ?? 0}</span>
                  <span className="w-20 text-right text-[11px] text-zinc-500">proj. {bootProjection(s, matchdays)}</span>
                </li>
              ))}
            </ul>
          )}
        </IntelCard>

        <IntelCard title="Gant d'or" hint="Gardiens — clean sheets (agrégat backend).">
          {gks.length === 0 ? <EmptyIntel what="les gardiens" /> : (
            <ul className="space-y-2">
              {gks.map((g) => (
                <li key={g.playerId} className="flex items-center gap-3">
                  <PlayerAvatar name={nameOf(g)} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">
                    {nameOf(g)} <span className="text-zinc-600">· {g.clubName ?? ''}</span>
                  </span>
                  <span className="font-sans text-[13px] font-bold tabular-nums text-sky-400">{g.cleanSheets}</span>
                  <span className="text-[11px] text-zinc-600">clean sheets</span>
                </li>
              ))}
            </ul>
          )}
        </IntelCard>

        <IntelCard title="Tendance des buts par journée" className="xl:col-span-2"
          hint="Le pouls offensif de la saison — moyenne de buts par match, journée par journée.">
          {rounds.length < 2 ? <EmptyIntel what="les tendances" /> : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={rounds} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="round" tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis width={28} tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="avg" type="monotone" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </IntelCard>

        <IntelCard title="Fair-play" hint="Score = jaunes + 3 × rouges (composé des agrégats joueurs) — plus bas est meilleur.">
          {fair.length === 0 ? <EmptyIntel what="la discipline" /> : (
            <ul className="space-y-2">
              {fair.map((c) => (
                <li key={c.club} className="flex items-center gap-3">
                  <ClubLogo name={c.club} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{c.club}</span>
                  <span className="text-[11px] text-amber-400">{c.yellows} 🟨</span>
                  <span className="text-[11px] text-red-400">{c.reds} 🟥</span>
                  <span className="w-10 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-300">{c.score}</span>
                </li>
              ))}
            </ul>
          )}
        </IntelCard>

        <IntelCard title="Prochains matchs programmés" hint="Les prochains rendez-vous de la compétition depuis la base de données.">
          {upcomingMatches.length === 0 ? <EmptyIntel what="les prochains matchs" /> : (
            <ul className="space-y-2.5">
              {upcomingMatches.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-2.5 text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">J{m.round}</span>
                    <span className="text-zinc-300">{m.homeClub?.name ?? `Club ${m.homeClubId}`} vs {m.awayClub?.name ?? `Club ${m.awayClubId}`}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">{new Date(m.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
        </IntelCard>

        <IntelCard title="Arbitres" hint="Charge et environnement de buts par officiel (champ arbitre des matchs).">
          {refs.length === 0 ? <EmptyIntel what="les arbitres" /> : (
            <ul className="space-y-2">
              {refs.map((r) => (
                <li key={r.referee} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{r.referee}</span>
                  <span className="text-[11px] text-zinc-500">{r.matches} matchs</span>
                  <MeterBar value={(r.avgGoals / 5) * 100} label={`${r.avgGoals}`} />
                </li>
              ))}
            </ul>
          )}
        </IntelCard>
      </div>
    </div>}
    />
  );
}
