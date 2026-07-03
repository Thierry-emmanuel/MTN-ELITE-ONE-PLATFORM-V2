import { memo } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Landmark } from 'lucide-react';
import type { ClubTransferActivity } from '@/types/transfersInjuries.types';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { formatFeeCompact } from '@/utils/transfersInjuries.utils';

export const ClubActivityBoard = memo(({ activity }: { activity: ClubTransferActivity[] }) => (
  <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
      <Landmark className="h-4 w-4 text-accent" />
      <h3 className="font-display text-sm uppercase tracking-wide">Activité des clubs</h3>
    </div>

    <div className="divide-y divide-border max-h-[420px] overflow-y-auto scrollbar-hide">
      {activity.length === 0 && (
        <div className="p-6 text-center text-xs text-muted-foreground">Aucun mouvement officiel pour l'instant.</div>
      )}
      {activity.map(a => (
        <div key={a.club.id} className="flex items-center gap-3 px-4 py-3">
          <ClubBadge club={a.club} size={26} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{a.club.name}</div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 text-primary-glow">
                <ArrowDownToLine className="h-3 w-3" />{a.arrivals} arrivées
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <ArrowUpFromLine className="h-3 w-3" />{a.departures} départs
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-sm font-bold ${a.net >= 0 ? 'text-primary-glow' : 'text-destructive'}`}>
              {a.net >= 0 ? '+' : ''}{formatFeeCompact(Math.abs(a.net))}
            </div>
            <div className="text-[9px] text-muted-foreground/50 uppercase">bilan net</div>
          </div>
        </div>
      ))}
    </div>
  </div>
));
ClubActivityBoard.displayName = 'ClubActivityBoard';
