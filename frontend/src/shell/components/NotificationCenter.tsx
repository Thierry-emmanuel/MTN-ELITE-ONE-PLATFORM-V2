import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNotifications, type NotificationKind } from '../stores/notifications.store';
import { EmptyState } from './SystemStates';
import { useT } from '../i18n';

/**
 * Notification Center — right panel; item click routes to the entity
 * and marks it read (optimistic; the badge decrements instantly).
 */
export function NotificationCenter() {
  const t = useT();
  const navigate = useNavigate();
  const { panelOpen, setPanelOpen, items, markRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState<'all' | NotificationKind>('all');
  const visible = items.filter((i) => tab === 'all' || i.kind === tab);

  return (
    <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
      <SheetContent side="right" className="w-full border-zinc-800 bg-zinc-950 p-0 text-zinc-200 sm:w-[400px]">
        <SheetHeader className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[13px] font-semibold text-zinc-100">{t('notifications.title')}</SheetTitle>
            <button onClick={markAllRead} className="text-[11px] text-zinc-500 hover:text-zinc-300">
              {t('notifications.markAll')}
            </button>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-2">
            <TabsList className="h-8 gap-1 bg-zinc-900 p-0.5">
              {([['all', t('notifications.all')], ['mention', t('notifications.mentions')], ['system', t('notifications.system')]] as const).map(([v, label]) => (
                <TabsTrigger key={v} value={v}
                  className="h-7 rounded-md px-2.5 text-[12px] text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-110px)]">
          {visible.length === 0 ? (
            <div className="p-4"><EmptyState hint="Les alertes système et mentions arriveront ici." /></div>
          ) : (
            <ul className="divide-y divide-zinc-900">
              {visible.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      markRead(n.id);
                      if (n.route) { setPanelOpen(false); navigate(n.route); }
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-900/60"
                  >
                    <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', n.read ? 'bg-zinc-800' : 'bg-emerald-500')} />
                    <span className="min-w-0">
                      <span className={cn('block truncate text-[13px]', n.read ? 'text-zinc-400' : 'font-medium text-zinc-100')}>{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">{n.body}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
