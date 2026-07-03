import { memo } from 'react';
import { Search } from 'lucide-react';
import type { InjuryStatus } from '@/types/transfersInjuries.types';

export type InjuryStatusFilter = 'ALL' | InjuryStatus;

const STATUS_TABS: { id: InjuryStatusFilter; label: string }[] = [
  { id: 'ALL',        label: 'Tous' },
  { id: 'ACTIVE',     label: 'Forfaits' },
  { id: 'RECOVERING', label: 'En reprise' },
  { id: 'CLEARED',    label: 'Rétablis' },
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  status: InjuryStatusFilter;
  onStatus: (v: InjuryStatusFilter) => void;
  counts: Record<InjuryStatusFilter, number>;
}

export const InjuriesFilterBar = memo(({ search, onSearch, status, onStatus, counts }: Props) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
      <input
        type="search"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Rechercher un joueur…"
        className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
      />
    </div>

    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
      {STATUS_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onStatus(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
            status === tab.id
              ? 'bg-accent text-black border-accent shadow-[0_0_14px_rgba(252,209,22,0.3)]'
              : 'bg-surface-elevated border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
          }`}
        >
          {tab.label}
          <span className={`rounded-full px-1.5 py-px text-[9px] ${status === tab.id ? 'bg-black/20' : 'bg-white/10'}`}>
            {counts[tab.id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  </div>
));
InjuriesFilterBar.displayName = 'InjuriesFilterBar';
