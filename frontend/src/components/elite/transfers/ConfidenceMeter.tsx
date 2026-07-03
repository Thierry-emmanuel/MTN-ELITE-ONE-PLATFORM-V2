import { memo } from 'react';
import type { TransferConfidence } from '@/types/transfersInjuries.types';

const LABELS: Record<TransferConfidence, string> = {
  1: 'Simple rumeur',
  2: 'Piste évoquée',
  3: 'Contacts établis',
  4: 'Accord proche',
  5: 'Here We Go',
};

export const ConfidenceMeter = memo(({ level }: { level: TransferConfidence }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`h-1.5 w-3.5 rounded-full transition-colors ${
            n <= level
              ? level === 5 ? 'bg-primary-glow' : level >= 4 ? 'bg-draw' : 'bg-accent/70'
              : 'bg-white/8'
          }`}
        />
      ))}
    </div>
    <span className={`text-[10px] font-semibold uppercase tracking-wide ${level === 5 ? 'text-primary-glow' : 'text-muted-foreground'}`}>
      {LABELS[level]}
    </span>
  </div>
));
ConfidenceMeter.displayName = 'ConfidenceMeter';
