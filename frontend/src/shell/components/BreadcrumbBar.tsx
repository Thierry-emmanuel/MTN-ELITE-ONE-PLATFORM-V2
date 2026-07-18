import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, PanelRight } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePageStore } from '../stores/page.store';
import { useInspector } from '../stores/inspector.store';

/**
 * Breadcrumb bar — rendered by the shell from page metadata; pages never
 * draw their own. Crumbs with siblings become dropdown crumbs (Stripe).
 * Right side hosts page actions + the Inspector toggle.
 */
export function BreadcrumbBar() {
  const { breadcrumb, actions } = usePageStore();
  const { toggle, open, tabs } = useInspector();

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-zinc-800/70 bg-zinc-950 px-4">
      <nav aria-label="Fil d'Ariane" className="flex min-w-0 flex-1 items-center gap-1 text-[13px]">
        {breadcrumb.map((node, i) => {
          const last = i === breadcrumb.length - 1;
          return (
            <span key={`${node.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="size-3 shrink-0 text-zinc-700" />}
              {node.siblings?.length ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn('flex items-center gap-0.5 truncate rounded px-1 py-0.5 hover:bg-zinc-900',
                    last ? 'font-medium text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
                    {node.label} <ChevronDown className="size-3 text-zinc-600" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                    {node.siblings.map((s) => (
                      <DropdownMenuItem key={s.href} asChild className="text-[13px] focus:bg-zinc-800">
                        <Link to={s.href}>{s.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : node.href && !last ? (
                <Link to={node.href} className="truncate rounded px-1 py-0.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
                  {node.label}
                </Link>
              ) : (
                <span className={cn('truncate px-1', last ? 'font-medium text-zinc-100' : 'text-zinc-500')}>{node.label}</span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-1.5">
        {actions}
        {tabs.length > 0 && (
          <button
            onClick={toggle}
            aria-label="Basculer l'inspecteur"
            aria-pressed={open}
            className={cn('grid size-7 place-items-center rounded-lg border',
              open ? 'border-zinc-700 bg-zinc-900 text-zinc-200' : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300')}
          >
            <PanelRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
