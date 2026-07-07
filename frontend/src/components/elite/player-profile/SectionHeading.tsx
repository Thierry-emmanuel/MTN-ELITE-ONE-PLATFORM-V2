import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeading({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-accent/12 border border-accent/25 grid place-items-center shrink-0">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide leading-none">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
