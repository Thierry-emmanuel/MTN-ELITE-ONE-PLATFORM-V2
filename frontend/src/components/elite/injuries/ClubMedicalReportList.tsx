import { memo } from 'react';
import { HeartPulse } from 'lucide-react';
import type { ClubMedicalReport } from '@/types/transfersInjuries.types';
import { ClubBadge } from '@/components/elite/ClubBadge';

interface Props {
  reports: ClubMedicalReport[];
  activeClubId: string | null;
  onSelect: (clubId: string | null) => void;
}

export const ClubMedicalReportList = memo(({ reports, activeClubId, onSelect }: Props) => (
  <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
      <HeartPulse className="h-4 w-4 text-destructive" />
      <h3 className="font-display text-sm uppercase tracking-wide">Infirmerie par club</h3>
    </div>

    <div className="divide-y divide-border max-h-[560px] overflow-y-auto scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors ${
          activeClubId === null ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-surface-elevated/40'
        }`}
      >
        <span className="font-medium">Tous les clubs</span>
        <span className="font-bold">{reports.reduce((s, r) => s + r.activeCount + r.recoveringCount, 0)}</span>
      </button>

      {reports.map(r => (
        <button
          key={r.club.id}
          onClick={() => onSelect(r.club.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
            activeClubId === r.club.id ? 'bg-accent/10' : 'hover:bg-surface-elevated/40'
          }`}
        >
          <ClubBadge club={r.club} size={26} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{r.club.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {r.activeCount} forfait{r.activeCount !== 1 ? 's' : ''} · {r.recoveringCount} en reprise
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-destructive">{r.activeCount + r.recoveringCount}</div>
            <div className="text-[9px] text-muted-foreground/50 uppercase">joueurs</div>
          </div>
        </button>
      ))}
    </div>
  </div>
));
ClubMedicalReportList.displayName = 'ClubMedicalReportList';
