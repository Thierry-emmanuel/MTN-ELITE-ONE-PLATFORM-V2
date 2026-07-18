import type { ReactNode } from 'react';
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface WizardStep { id: string; label: string; state: 'done' | 'current' | 'locked' }

/**
 * Linear multi-step flows (season setup, imports…). Left step rail,
 * centered content (max-w 720px), sticky footer. Generalized from the
 * existing GuidedBuilderEngine step model.
 */
export function WizardLayout({ steps, onBack, onContinue, continueLabel = 'Continuer', canContinue = true, children }: {
  steps: WizardStep[];
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  canContinue?: boolean;
  children: ReactNode;
}) {
  const idx = steps.findIndex((s) => s.state === 'current');
  return (
    <div className="flex h-full flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-zinc-800/70 p-4 lg:w-[240px] lg:border-b-0 lg:border-r">
        <ol className="flex gap-4 overflow-auto lg:flex-col lg:gap-1">
          {steps.map((s, i) => (
            <li key={s.id} className={cn('flex items-center gap-2 whitespace-nowrap rounded-lg px-2 py-1.5 text-[13px]',
              s.state === 'current' ? 'bg-zinc-900 font-medium text-zinc-100' : 'text-zinc-500')}>
              <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border text-[10px]',
                s.state === 'done' && 'border-emerald-800 bg-emerald-950 text-emerald-400',
                s.state === 'current' && 'border-zinc-600 text-zinc-200',
                s.state === 'locked' && 'border-zinc-800 text-zinc-600')}>
                {s.state === 'done' ? <Check className="size-3" /> : s.state === 'locked' ? <Lock className="size-2.5" /> : i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[720px] px-4 py-6">{children}</div>
        </div>
        <footer className="flex shrink-0 items-center justify-between border-t border-zinc-800 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={idx <= 0}
            className="text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
            Retour
          </Button>
          <span className="text-[11px] text-zinc-600">Étape {idx + 1} / {steps.length}</span>
          <Button size="sm" onClick={onContinue} disabled={!canContinue}
            className="bg-emerald-600 text-white hover:bg-emerald-500">
            {continueLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
