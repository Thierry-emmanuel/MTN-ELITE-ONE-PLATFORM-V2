import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCreatableEntityTypes } from '../registry/entity.registry';
import { SHELL_BASE } from '../navigation/domains';
import { useT } from '../i18n';

/**
 * Quick Create (＋ / Cmd+Shift+N) — registry-driven. The shell never knows
 * what a "player" is; it routes to whatever modules registered as creatable.
 */
export function QuickCreateMenu({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const t = useT();
  const types = getCreatableEntityTypes();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-200">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-zinc-500">
          {t('bar.create')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {types.length === 0 && (
          <DropdownMenuItem disabled className="text-[13px] text-zinc-500">
            Aucun module créable enregistré
          </DropdownMenuItem>
        )}
        {types.map((e) => (
          <DropdownMenuItem
            key={e.type}
            className="gap-2 text-[13px] focus:bg-zinc-800 focus:text-zinc-100"
            onSelect={() =>
              navigate(e.createRoute ?? `${SHELL_BASE}/builders/${e.moduleSlug}/${e.type}/new`)}
          >
            <e.icon className="size-3.5 text-zinc-500" />
            {e.labelSingular}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
