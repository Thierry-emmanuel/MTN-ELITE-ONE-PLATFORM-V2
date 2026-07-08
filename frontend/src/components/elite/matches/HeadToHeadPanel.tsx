import { memo } from 'react';
import { ClubLogo } from '@/components/ui/football';
import { formatKickoffDate } from '@/utils/football.utils';
import type { HeadToHead, Club } from '@/types/football.types';

interface HeadToHeadPanelProps {
  data: HeadToHead;
  homeClub: Club;
  awayClub: Club;
}

export const HeadToHeadPanel = memo(({ data, homeClub, awayClub }: HeadToHeadPanelProps) => {
  const { summary, meetings } = data;
  const total = summary.played || 1;

  return (
    <div className="space-y-6">
      {/* Win/draw/loss bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold mb-2">
          <span className="text-foreground/80">{summary.homeWins} victoires</span>
          <span className="text-muted-foreground/50">{summary.draws} nuls</span>
          <span className="text-foreground/80">{summary.awayWins} victoires</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
          <div className="h-full bg-primary" style={{ width: `${(summary.homeWins / total) * 100}%` }} />
          <div className="h-full bg-white/15" style={{ width: `${(summary.draws / total) * 100}%` }} />
          <div className="h-full bg-accent" style={{ width: `${(summary.awayWins / total) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground/40 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ClubLogo club={homeClub} size={16} /> {homeClub.short ?? homeClub.name}
          </span>
          <span>{summary.played} confrontations</span>
          <span className="flex items-center gap-1.5">
            {awayClub.short ?? awayClub.name} <ClubLogo club={awayClub} size={16} />
          </span>
        </div>
      </div>

      {/* Goals summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-3 text-center">
          <p className="font-display text-xl tabular-nums text-foreground">{summary.homeGoals}</p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">Buts {homeClub.short ?? homeClub.name}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-3 text-center">
          <p className="font-display text-xl tabular-nums text-foreground">{summary.awayGoals}</p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">Buts {awayClub.short ?? awayClub.name}</p>
        </div>
      </div>

      {/* Past meetings */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
          Derniers face-à-face
        </p>
        <div className="space-y-1">
          {meetings.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-[10px] text-muted-foreground/40 w-20 shrink-0 tabular-nums">
                {formatKickoffDate(m.kickoffUtc)}
              </span>
              <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                <span className="text-xs text-foreground/80 truncate">{m.homeClub.name}</span>
                <ClubLogo club={m.homeClub} size={18} />
              </div>
              <span className="font-mono text-xs font-bold text-foreground bg-white/5 rounded px-2 py-1 shrink-0">
                {m.homeScore} - {m.awayScore}
              </span>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <ClubLogo club={m.awayClub} size={18} />
                <span className="text-xs text-foreground/80 truncate">{m.awayClub.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
HeadToHeadPanel.displayName = 'HeadToHeadPanel';
