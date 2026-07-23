/**
 * Club Intelligence — momentum, splits, stability and development for one
 * club. Form guides and home/away records come straight from the backend
 * standings; movement from /transfers, availability from /injuries,
 * formations from recorded matches.
 */
import { useMemo } from 'react';
import { AnalyticsLayout } from '../../layouts/AnalyticsLayout';
import { useShellPage } from '../../stores/page.store';
import { SHELL_BASE } from '../../navigation/domains';
import { useSearchParams } from 'react-router-dom';
import {
  useActiveInjuries, usePlayers, usePlayerStats, useSeasonMatches, useStandings, useTransfers,
} from '@/features/intelligence/intelligence.api';
import {
  currentStreak, developmentMetrics, formationTrends, homeAwaySplit, momentum, squadStability,
} from '@/features/intelligence/engine';
import { EmptyIntel, FormChips, IntelCard, MeterBar, SeasonPicker, useSeasonParam, KpiStat, ClubLogo } from './IntelShared';

export default function ClubIntelligencePage() {
  const { seasonId } = useSeasonParam();
  const [params, setParams] = useSearchParams();
  const { data: standings = [] } = useStandings(seasonId);
  const { data: matches = [] } = useSeasonMatches(seasonId);
  const { data: transfers = [] } = useTransfers();
  const { data: injuries = [] } = useActiveInjuries();
  const { data: playerStats = [] } = usePlayerStats(seasonId);
  const { data: players = [] } = usePlayers();

  const clubId = Number(params.get('club')) || standings[0]?.clubId;
  const standing = standings.find((s) => s.clubId === clubId);

  useShellPage({
    title: 'Intelligence — Clubs',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Intelligence', href: `${SHELL_BASE}/intelligence` },
      { label: 'Clubs' },
    ],
  });

  const momo = momentum(standing?.formGuide);
  const streak = currentStreak(standing?.formGuide);
  const split = standing ? homeAwaySplit(standing) : undefined;
  const formations = clubId ? formationTrends(matches, clubId) : [];
  const stability = clubId ? squadStability(clubId, transfers, injuries) : undefined;
  const dev = useMemo(() => developmentMetrics(playerStats, players), [playerStats, players]);
  const clubDev = dev.find((d) => standing && d.club === standing.club?.name);

  const kpis = [
    { label: 'Position', value: standing ? `#${standing.position}` : '—' },
    { label: 'Momentum (5 derniers)', value: `${momo}/100` },
    { label: 'Série en cours', value: streak.length ? `${streak.length} ${streak.type}` : '—' },
    { label: 'Indisponibles', value: String(stability?.unavailable ?? 0) },
  ];

  return (
    <AnalyticsLayout
      filters={<>
        <SeasonPicker />
        <select value={clubId ?? ''} onChange={(e) => setParams((p) => { p.set('club', e.target.value); return p; }, { replace: true })}
          className="h-8 rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[12px] text-zinc-200 outline-none focus:border-emerald-700"
          aria-label="Club">
          {standings.map((s) => <option key={s.clubId} value={s.clubId}>{s.club?.name ?? `Club ${s.clubId}`}</option>)}
        </select>
      </>}
      kpis={kpis.map((k) => <KpiStat key={k.label} {...k} />)}
      charts={<div className="col-span-12">
      {!standing ? <EmptyIntel what="ce club" /> : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <IntelCard title="Momentum" hint="Guide de forme backend, pondéré vers le récent (dernier match ×2).">
            <div className="flex items-center gap-4">
              <FormChips guide={standing.formGuide} />
              <div className="flex-1"><MeterBar value={momo} label={`${momo}`} tone={momo >= 60 ? 'emerald' : momo >= 35 ? 'amber' : 'red'} /></div>
            </div>
            <p className="mt-3 text-[12px] text-zinc-500">
              Série : <span className="font-semibold text-zinc-300">{streak.length ? `${streak.length} ${streak.type}` : 'aucune'}</span>
              {' '}· Bilan {standing.won}V {standing.drawn}N {standing.lost}D · Diff. {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
            </p>
          </IntelCard>

          <IntelCard title="Domicile vs extérieur" hint="Colonnes de split du classement backend.">
            {split && (
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Domicile — {split.home.won}V {split.home.drawn}N {split.home.lost}D</p>
                  <MeterBar value={split.home.winPct} label={`${split.home.winPct}%`} />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Extérieur — {split.away.won}V {split.away.drawn}N {split.away.lost}D</p>
                  <MeterBar value={split.away.winPct} label={`${split.away.winPct}%`} tone="amber" />
                </div>
                <p className="text-[12px] text-zinc-500">
                  {split.home.winPct - split.away.winPct >= 25
                    ? 'Forteresse à domicile — dépendance marquée au terrain.'
                    : split.away.winPct >= split.home.winPct
                      ? 'Aussi solide en déplacement — profil de haut de tableau.'
                      : 'Profil équilibré entre domicile et extérieur.'}
                </p>
              </div>
            )}
          </IntelCard>

          <IntelCard title="Tendances tactiques" hint="Fréquence des schémas enregistrés dans le Match Builder.">
            {formations.length === 0 ? <EmptyIntel what="les schémas (enregistrez des compositions)" /> : (
              <ul className="space-y-2">
                {formations.map((f) => (
                  <li key={f.formation} className="flex items-center gap-3">
                    <span className="w-16 font-sans text-[13px] font-bold text-zinc-200">{f.formation}</span>
                    <MeterBar value={(f.count / (formations[0]?.count || 1)) * 100} label={`×${f.count}`} />
                  </li>
                ))}
              </ul>
            )}
          </IntelCard>

          <IntelCard title="Stabilité de l'effectif" hint="Mouvements (/transfers) + indisponibilités actives (/injuries).">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-zinc-800 py-3">
                <p className="font-sans text-xl font-black tabular-nums text-emerald-400">{stability?.arrivals ?? 0}</p>
                <p className="text-[11px] text-zinc-500">arrivées</p>
              </div>
              <div className="rounded-lg border border-zinc-800 py-3">
                <p className="font-sans text-xl font-black tabular-nums text-amber-400">{stability?.departures ?? 0}</p>
                <p className="text-[11px] text-zinc-500">départs</p>
              </div>
              <div className="rounded-lg border border-zinc-800 py-3">
                <p className="font-sans text-xl font-black tabular-nums text-red-400">{stability?.unavailable ?? 0}</p>
                <p className="text-[11px] text-zinc-500">blessés</p>
              </div>
            </div>
          </IntelCard>

          <IntelCard title="Développement — minutes U21" className="xl:col-span-2"
            hint="Part des minutes confiées aux joueurs de 21 ans et moins, par club (celui-ci en vert).">
            {dev.length === 0 ? <EmptyIntel what="le développement" /> : (
              <ul className="space-y-1.5">
                {dev.slice(0, 10).map((d) => (
                  <li key={d.club} className="flex items-center gap-3">
                    <ClubLogo name={d.club} size="sm" />
                    <span className={`min-w-0 flex-1 truncate text-[13px] ${d.club === clubDev?.club ? 'font-semibold text-emerald-300' : 'text-zinc-300'}`}>{d.club}</span>
                    <MeterBar value={d.sharePct} label={`${d.sharePct}%`} tone={d.club === clubDev?.club ? 'emerald' : 'amber'} />
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
