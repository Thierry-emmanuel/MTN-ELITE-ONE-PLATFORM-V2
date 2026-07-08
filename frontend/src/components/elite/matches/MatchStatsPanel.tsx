import { memo } from 'react';
import { StatComparisonBar } from './StatComparisonBar';
import type { MatchStatsResponse, Club } from '@/types/football.types';

interface MatchStatsPanelProps {
  stats: MatchStatsResponse;
  homeClub: Club;
  awayClub: Club;
}

export const MatchStatsPanel = memo(({ stats, homeClub, awayClub }: MatchStatsPanelProps) => {
  const { home, away } = stats;

  return (
    <div className="space-y-6">
      {/* Team labels */}
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide">
        <span className="text-foreground/80 truncate">{homeClub.short ?? homeClub.name}</span>
        <span className="text-foreground/80 truncate text-right">{awayClub.short ?? awayClub.name}</span>
      </div>

      {home.possession !== undefined && away.possession !== undefined && (
        <StatComparisonBar label="Possession" home={home.possession} away={away.possession} suffix="%" delay={0} />
      )}
      {home.shots !== undefined && away.shots !== undefined && (
        <StatComparisonBar label="Tirs" home={home.shots} away={away.shots} delay={0.03} />
      )}
      {home.shotsOnTarget !== undefined && away.shotsOnTarget !== undefined && (
        <StatComparisonBar label="Tirs cadrés" home={home.shotsOnTarget} away={away.shotsOnTarget} delay={0.06} />
      )}
      {home.passes !== undefined && away.passes !== undefined && (
        <StatComparisonBar label="Passes" home={home.passes} away={away.passes} delay={0.09} />
      )}
      {home.passAccuracy !== undefined && away.passAccuracy !== undefined && (
        <StatComparisonBar label="Précision passes" home={home.passAccuracy} away={away.passAccuracy} suffix="%" delay={0.12} />
      )}
      {home.corners !== undefined && away.corners !== undefined && (
        <StatComparisonBar label="Corners" home={home.corners} away={away.corners} delay={0.15} />
      )}
      {home.fouls !== undefined && away.fouls !== undefined && (
        <StatComparisonBar label="Fautes" home={home.fouls} away={away.fouls} delay={0.18} />
      )}
      {home.offsides !== undefined && away.offsides !== undefined && (
        <StatComparisonBar label="Hors-jeu" home={home.offsides} away={away.offsides} delay={0.21} />
      )}
      <StatComparisonBar label="Cartons jaunes" home={home.yellowCards} away={away.yellowCards} delay={0.24} />
      <StatComparisonBar label="Cartons rouges" home={home.redCards} away={away.redCards} delay={0.27} />
      {home.saves !== undefined && away.saves !== undefined && (
        <StatComparisonBar label="Arrêts" home={home.saves} away={away.saves} delay={0.3} />
      )}
    </div>
  );
});
MatchStatsPanel.displayName = 'MatchStatsPanel';
