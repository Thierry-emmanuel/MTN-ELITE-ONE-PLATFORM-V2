import { Link } from 'react-router-dom';
import { Bell, CircleHelp, Plus, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SHELL_BASE } from '../navigation/domains';
import { usePaletteStore } from '../stores/palette.store';
import { useNotifications, useUnreadCount } from '../stores/notifications.store';
import { useHelpStore } from './HelpPanel';
import { ContextSwitcher } from './ContextSwitcher';
import { QuickCreateMenu } from './QuickCreateMenu';
import { ProfileMenu } from './ProfileMenu';
import { ShortcutHint } from './ShortcutHint';
import { useT } from '../i18n';

export function TopCommandBar() {
  const t = useT();
  const openPalette = usePaletteStore((s) => s.setOpen);
  const setPanelOpen = useNotifications((s) => s.setPanelOpen);
  const unread = useUnreadCount();
  const openHelp = useHelpStore((s) => s.setOpen);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-3">
      {/* Product mark */}
      <Link to={`${SHELL_BASE}/workspace`} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-zinc-900">
        <span className="grid size-6 place-items-center rounded-md bg-emerald-950 text-emerald-400">
          <Zap className="size-3.5" />
        </span>
        <span className="hidden font-sans text-[13px] font-bold tracking-tight text-zinc-100 sm:block">
          FootballOS
        </span>
      </Link>

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
