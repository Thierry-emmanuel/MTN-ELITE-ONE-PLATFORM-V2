import { useMatchStats } from '@/features/matches/matchBuilder.api';
import { PageSkeleton, EmptyState } from '../../components/SystemStates';

const LABELS: Record<string, string> = {
  goals: 'Buts', shots: 'Tirs', shotsOnTarget: 'Tirs cadrés', possession: 'Possession (%)',
  passes: 'Passes', passAccuracy: 'Précision passes (%)', fouls: 'Fautes',
  yellowCards: 'Cartons jaunes', redCards: 'Cartons rouges', corners: 'Corners',
  offsides: 'Hors-jeu', saves: 'Arrêts', assists: 'Passes décisives',
  minutesPlayed: 'Minutes jouées',
};

/**
 * Statistics — strictly read-only. Numbers come from GET /matches/:id/stats,
 * aggregated by the backend from match_stats; the frontend renders and never
 * recomputes.
 */
export function StatsSection({ matchId }: { matchId: string }) {
  const { data, isLoading } = useMatchStats(matchId);

  if (isLoading) return <div className="p-6"><PageSkeleton /></div>;

  const keys = data ? [...new Set([...Object.keys(data.home ?? {}), ...Object.keys(data.away ?? {})])] : [];
  if (!data || keys.length === 0)
    return (
      <div className="p-6">
        <EmptyState
          title="Aucune statistique agrégée"
          hint="Le backend agrège match_stats par équipe (GET /matches/:id/stats). Les chiffres apparaîtront dès que des stats joueurs existent pour ce match."
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-[720px] p-6">
      <p className="mb-4 text-[12px] text-zinc-600">
        Lecture seule — agrégées par le backend, jamais recalculées ici.
      </p>
      <ul className="space-y-3">
        {keys.map((k) => {
          const h = Number(data.home?.[k] ?? 0);
          const a = Number(data.away?.[k] ?? 0);
          const total = h + a || 1;
          return (
            <li key={k}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="w-12 font-sans font-bold tabular-nums text-zinc-100">{h}</span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{LABELS[k] ?? k}</span>
                <span className="w-12 text-right font-sans font-bold tabular-nums text-zinc-100">{a}</span>
              </div>
              <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-zinc-900">
                <span className="h-full rounded-full bg-emerald-500" style={{ width: `${(h / total) * 100}%` }} />
                <span className="h-full flex-1 rounded-full bg-zinc-600" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
