import { Link, useNavigate } from 'react-router-dom';
import { Bell, CircleHelp, Plus, Search, Zap, ChevronsUpDown, Radio, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { SHELL_BASE } from '../navigation/domains';
import { usePaletteStore } from '../stores/palette.store';
import { useNotifications, useUnreadCount } from '../stores/notifications.store';
import { useHelpStore } from './HelpPanel';
import { ContextSwitcher } from './ContextSwitcher';
import { QuickCreateMenu } from './QuickCreateMenu';
import { ProfileMenu } from './ProfileMenu';
import { ShortcutHint } from './ShortcutHint';
import { useT } from '../i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopCommandBar() {
  const t = useT();
  const navigate = useNavigate();
  const openPalette = usePaletteStore((s) => s.setOpen);
  const setPanelOpen = useNotifications((s) => s.setPanelOpen);
  const unread = useUnreadCount();
  const openHelp = useHelpStore((s) => s.setOpen);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-3">
      {/* Product switcher dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-left outline-none">
          <span className="grid size-6 place-items-center rounded-md bg-emerald-950 text-emerald-400">
            <Zap className="size-3.5" />
          </span>
          <div className="hidden sm:block">
            <span className="block font-sans text-[12px] font-bold tracking-tight text-zinc-100 leading-none">
              Control Panel
            </span>
            <span className="block text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
              FootballOS
            </span>
          </div>
          <ChevronsUpDown className="size-3 text-zinc-500 ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="border-zinc-800 bg-zinc-900 text-zinc-200 w-52">
          <DropdownMenuItem
            className="text-[13px] gap-2 bg-zinc-800 text-zinc-100 font-medium focus:bg-zinc-700 cursor-pointer"
            onSelect={() => navigate(`${SHELL_BASE}/workspace`)}
          >
            <Radio className="size-3.5 text-emerald-500" />
            Control Panel
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] gap-2 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
            onSelect={() => navigate('/admin')}
          >
            <LayoutDashboard className="size-3.5 text-amber-500" />
            Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContextSwitcher />

      {/* Global search — a trigger that opens the palette (one surface, two entry points) */}
      <div className="flex flex-1 justify-center px-2">
        <button
          onClick={() => openPalette(true)}
          className={cn(
            'flex h-8 w-full max-w-md items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3',
            'text-[13px] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-400',
          )}
        >
          <Search className="size-3.5" />
          <span className="flex-1 truncate text-left">{t('bar.search')}</span>
          <ShortcutHint keys="mod+k" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <QuickCreateMenu>
          <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 text-[13px] font-medium text-white hover:bg-emerald-500">
            <Plus className="size-3.5" />
            <span className="hidden md:inline">{t('bar.create')}</span>
          </Button>
        </QuickCreateMenu>

        <button
          onClick={() => setPanelOpen(true)}
          aria-label={t('notifications.title')}
          className="relative grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span
              aria-live="polite"
              className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-600 text-[9px] font-bold text-white"
            >
              {unread}
            </span>
          )}
        </button>

        <button
          onClick={() => openHelp(true)}
          aria-label={t('help.title')}
          className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
        >
          <CircleHelp className="size-4" />
        </button>

        <ProfileMenu />
      </div>
    </header>
  );
}
