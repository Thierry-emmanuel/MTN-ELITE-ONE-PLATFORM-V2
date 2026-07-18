import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetSize } from '../registry/types';

const nextSize: Record<WidgetSize, WidgetSize> = { S: 'M', M: 'L', L: 'S' };

/** Uniform widget chrome: title, actions, edit-mode controls. */
export function WidgetFrame({ title, icon: Icon, size, editMode, onMove, onResize, onRemove, children }: {
  title: string;
  icon?: LucideIcon;
  size: WidgetSize;
  editMode?: boolean;
  onMove?: (dir: -1 | 1) => void;
  onResize?: (s: WidgetSize) => void;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex min-h-[180px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40',
        size === 'S' && 'md:col-span-4', size === 'M' && 'md:col-span-6', size === 'L' && 'md:col-span-12',
        'col-span-12',
      )}
    >
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-zinc-800/70 px-3">
        {Icon && <Icon className="size-3.5 text-zinc-500" />}
        <h3 className="flex-1 truncate text-[12px] font-semibold uppercase tracking-wide text-zinc-400">{title}</h3>
        {editMode && (
          <div className="flex items-center gap-1 text-zinc-500">
            <button aria-label="Monter" onClick={() => onMove?.(-1)} className="rounded p-1 hover:bg-zinc-800 hover:text-zinc-200"><ArrowUp className="size-3.5" /></button>
            <button aria-label="Descendre" onClick={() => onMove?.(1)} className="rounded p-1 hover:bg-zinc-800 hover:text-zinc-200"><ArrowDown className="size-3.5" /></button>
            <button aria-label="Redimensionner" onClick={() => onResize?.(nextSize[size])} className="rounded p-1 hover:bg-zinc-800 hover:text-zinc-200"><Maximize2 className="size-3.5" /></button>
            <button aria-label="Retirer" onClick={onRemove} className="rounded p-1 hover:bg-zinc-800 hover:text-red-400"><X className="size-3.5" /></button>
          </div>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3">{children}</div>
    </section>
  );
}
