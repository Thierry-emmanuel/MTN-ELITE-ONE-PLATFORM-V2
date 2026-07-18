import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleAlert, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useT } from '../i18n';

/** The three system states — designed once, reused everywhere. */

export function EmptyState({ icon: Icon = Inbox, title, hint, action }: {
  icon?: LucideIcon; title?: string; hint?: string; action?: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 p-8 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[13px] font-medium text-zinc-300">{title ?? t('empty.default')}</p>
        {hint && <p className="mt-1 max-w-sm text-[12px] text-zinc-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const t = useT();
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-red-950 bg-red-950/20 p-8 text-center" role="alert">
      <CircleAlert className="size-6 text-red-500" />
      <p className="text-[13px] text-zinc-300">{message ?? t('error.default')}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-900">
          {t('error.retry')}
        </Button>
      )}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-8 w-64 bg-zinc-900" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Skeleton className="h-32 bg-zinc-900" />
        <Skeleton className="h-32 bg-zinc-900" />
        <Skeleton className="h-32 bg-zinc-900" />
      </div>
      <Skeleton className="h-64 bg-zinc-900" />
    </div>
  );
}
