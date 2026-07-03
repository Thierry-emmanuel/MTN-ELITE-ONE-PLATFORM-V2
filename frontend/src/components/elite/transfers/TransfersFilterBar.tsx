import { memo } from 'react';
import { Search } from 'lucide-react';
import type { TransferStage } from '@/types/transfersInjuries.types';

export type TransferStageFilter = 'ALL' | TransferStage | 'LOAN';

const STAGE_TABS: { id: TransferStageFilter; label: string }[] = [
  { id: 'ALL',       label: 'Tout' },
  { id: 'CONFIRMED', label: 'Officiels' },
  { id: 'IN_TALKS',  label: 'Négociations' },
  { id: 'RUMOR',      label: 'Rumeurs' },
  { id: 'LOAN',       label: 'Prêts' },
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  stage: TransferStageFilter;
  onStage: (v: TransferStageFilter) => void;
  counts: Record<TransferStageFilter, number>;
}

export const TransfersFilterBar = memo(({ search, onSearch, stage, onStage, counts }: Props) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
      <input
        type="search"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Rechercher un joueur, un club…"
        className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
      />
    </div>

    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
      {STAGE_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onStage(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
            stage === tab.id
              ? 'bg-accent text-black border-accent shadow-[0_0_14px_rgba(252,209,22,0.3)]'
              : 'bg-surface-elevated border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
          }`}
        >
          {tab.label}
          <span className={`rounded-full px-1.5 py-px text-[9px] ${stage === tab.id ? 'bg-black/20' : 'bg-white/10'}`}>
            {counts[tab.id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  </div>
));
TransfersFilterBar.displayName = 'TransfersFilterBar';
