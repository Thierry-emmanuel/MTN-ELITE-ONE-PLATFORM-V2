import { memo } from 'react';

export interface SegmentedTab {
  id: string;
  label: string;
  icon?: React.FC<{ className?: string }>;
  count?: number;
  live?: boolean;
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  active: string;
  onChange: (id: string) => void;
}

/** Pill tab bar — same visual language as the Stats page's main tab switcher. */
export const SegmentedTabs = memo(({ tabs, active, onChange }: SegmentedTabsProps) => (
  <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 w-fit flex-wrap">
    {tabs.map(t => {
      const isActive = active === t.id;
      const Icon = t.icon;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          aria-pressed={isActive}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isActive
              ? 'bg-accent text-black shadow-[0_0_14px_rgba(252,209,22,0.22)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.live && (
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? 'bg-black' : 'bg-live'} animate-pulse`} />
          )}
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span>{t.label}</span>
          {t.count !== undefined && t.count > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/15' : 'bg-white/8'}`}>
              {t.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
));
SegmentedTabs.displayName = 'SegmentedTabs';
