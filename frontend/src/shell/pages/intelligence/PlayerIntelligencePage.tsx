/**
 * Player Intelligence — form, contribution, pathways. Aggregates come from
 * /stats/players; the engine turns them into indices and shortlists. Career
 * progression reads the SAME endpoint across every season — one source,
 * multiple vintages.
 */
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { apiClient } from '@/services/api';
import { AnalyticsLayout } from '../../layouts/AnalyticsLayout';
import { useShellPage } from '../../stores/page.store';
import { SHELL_BASE } from '../../navigation/domains';
import {
  usePlayers, usePlayerStats, useStandings, type PlayerStatRow,
} from '@/features/intelligence/intelligence.api';
import {
  age, formIndex, goalContribution, minutesOf, nameOf, roadToTheLions, youngTalentWatch,
} from '@/features/intelligence/engine';
import { EmptyIntel, IntelCard, MeterBar, SeasonPicker, useSeasonParam, KpiStat, PlayerAvatar, ClubLogo } from './IntelShared';

const chartConfig = { index: { label: 'Indice de forme', color: '#10b981' } } satisfies ChartConfig;

export default function PlayerIntelligencePage() {
  const { seasonId, seasons } = useSeasonParam();
  const [params, setParams] = useSearchParams();
  const { data: stats = [] } = usePlayerStats(seasonId);
  const { data: players = [] } = usePlayers();
  const { data: standings = [] } = useStandings(seasonId);

  const ranked = useMemo(() => [...stats].sort((a, b) => formIndex(b) - formIndex(a)), [stats]);
  const playerId = Number(params.get('player')) || ranked[0]?.playerId;
  const row = stats.find((s) => s.playerId === playerId);
  const meta = players.find((p) => p.id === playerId);

  useShellPage({
    title: 'Intelligence — Joueurs',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Intelligence', href: `${SHELL_BASE}/intelligence` },
      { label: 'Joueurs' },
    ],
  });

  // Career progression: the same aggregates endpoint, one query per season.
  const careerQueries = useQueries({
    queries: seasons.map((s) => ({
      queryKey: ['intel', 'career', s.id, playerId],
      queryFn: async () => {
        const { data } = await apiClient.get('/stats/players', { params: { season: s.id, limit: 300 } });
        const rows: PlayerStatRow[] = data.items ?? data;
        const mine = (Array.isArray(rows) ? rows : []).find((r) => r.playerId === playerId);
        return { season: s.name, index: mine ? formIndex(mine) : null, goals: mine?.goals ?? null };
      },
      enabled: !!playerId,
      staleTime: 60_000,
    })),
  });
  const career = careerQueries
    .map((q) => q.data)
    .filter((d): d is { season: string; index: number | null; goals: number | null } => !!d && d.index !== null);

  const clubGoals = standings.find((s) => s.clubId === row?.clubId)?.goalsFor;
  const index = row ? formIndex(row) : 0;
  const contribution = row ? goalContribution(row, clubGoals) : 0;
  const talents = useMemo(() => youngTalentWatch(stats, players).slice(0, 8), [stats, players]);
  const lions = useMemo(() => roadToTheLions(stats, players), [stats, players]);

  const kpis = [
    { label: 'Indice de forme', value: `${index}/100` },
    { label: 'Buts + passes', value: row ? String(Number(row.goals ?? 0) + Number(row.assists ?? 0)) : '—' },
    { label: 'Minutes', value: row ? String(minutesOf(row)) : '—' },
    { label: 'Part des buts du club', value: `${contribution}%` },
  ];

  return (
    <AnalyticsLayout
      filters={<>
        <SeasonPicker />
        <select value={playerId ?? ''} onChange={(e) => setParams((p) => { p.set('player', e.target.value); return p; }, { replace: true })}
          className="h-8 max-w-[220px] rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[12px] text-zinc-200 outline-none focus:border-emerald-700"
          aria-label="Joueur">
          {ranked.slice(0, 100).map((s) => (
            <option key={s.playerId} value={s.playerId}>{nameOf(s)} — {s.clubName ?? ''}</option>
          ))}
        </select>
      </>}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={<div className="col-span-12">
      {!row ? <EmptyIntel what="les joueurs (jouez des matchs avec stats)" /> : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <IntelCard title={`Forme — ${nameOf(row)}`}
            hint="Contributions (buts + passes) par 90 min, saturation à 1,5/90 ; gardiens : clean sheets par 90.">
            <MeterBar value={index} label={`${index}`} tone={index >= 60 ? 'emerald' : index >= 30 ? 'amber' : 'red'} />
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                ['Buts', row.goals ?? 0], ['Passes déc.', row.assists ?? 0],
                ['Matchs', row.matches ?? '—'], ['Âge', age(meta?.birthDate) ?? '—'],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-lg border border-zinc-800 py-2">
                  <p className="font-sans text-lg font-black tabular-nums text-zinc-100">{String(v)}</p>
                  <p className="text-[10px] text-zinc-500">{String(l)}</p>
                </div>
              ))}
            </div>
          </IntelCard>

          <IntelCard title="Contribution offensive"
            hint="Part des buts du club auxquels ce joueur participe (buts club = classement backend).">
            <MeterBar value={contribution} label={`${contribution}%`} />
            <p className="mt-3 text-[12px] text-zinc-500">
              {contribution >= 40 ? 'Dépendance forte — le club repose sur lui.'
                : contribution >= 20 ? 'Contributeur majeur de l’attaque.'
                : 'Contribution répartie dans le collectif.'}
            </p>
          </IntelCard>

          <IntelCard title="Progression de carrière" className="xl:col-span-2"
            hint="Indice de forme saison par saison — même endpoint d'agrégats, un millésime par saison.">
            {career.length < 2 ? <EmptyIntel what="la progression (une seule saison de données)" /> : (
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <LineChart data={career} margin={{ left: 0, right: 12, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="season" tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis width={28} domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="index" type="monotone" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            )}
          </IntelCard>

          <IntelCard title="Young Talent Watch" hint="U21, ≥180 minutes, classés par indice de forme.">
            {talents.length === 0 ? <EmptyIntel what="les jeunes talents" /> : (
              <ul className="space-y-2">
                {talents.map((t) => (
                  <li key={t.playerId} className="flex items-center gap-3">
                    <PlayerAvatar name={nameOf(t)} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">
                      {nameOf(t)} <span className="text-zinc-600">· {t.age} ans · {t.clubName ?? ''}</span>
                    </span>
                    <MeterBar value={t.index} label={`${t.index}`} />
                  </li>
                ))}
              </ul>
            )}
          </IntelCard>

          <IntelCard title="Road to the Lions"
            hint="Présélection Lions Indomptables — Camerounais, ≥270 minutes, classés par forme.">
            {lions.length === 0 ? <EmptyIntel what="la présélection" /> : (
              <ul className="space-y-2">
                {lions.slice(0, 8).map((l) => (
                  <li key={l.playerId} className="flex items-center gap-3">
                    <PlayerAvatar name={nameOf(l)} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">
                      {nameOf(l)} <span className="text-zinc-600">· {l.position ?? ''} · {l.age ?? '—'} ans</span>
                    </span>
                    <MeterBar value={l.index} label={`${l.index}`} tone="emerald" />
                  </li>
                ))}
              </ul>
            )}
          </IntelCard>
        </div>
      )}
    </div>}
    />
  );
}
