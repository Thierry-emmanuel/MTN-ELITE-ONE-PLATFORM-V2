import { cn } from '@/lib/utils';
import { formatKeys } from '../navigation/shortcuts';

export function Kbd({ children, className }: { children: string; className?: string }) {
  return (
    <kbd className={cn(
      'inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-800 px-1 font-sans text-[10px] font-medium text-zinc-400',
      className,
    )}>
      {children}
    </kbd>
  );
}

export function ShortcutHint({ keys, className }: { keys: string; className?: string }) {
  return <Kbd className={className}>{formatKeys(keys)}</Kbd>;
}
