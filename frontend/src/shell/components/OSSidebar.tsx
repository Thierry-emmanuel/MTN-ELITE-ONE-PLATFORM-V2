import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FileEdit, PanelLeftClose, PanelLeftOpen, Star, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { DOMAINS } from '../navigation/domains';
import { getModulesByDomain } from '../registry/module.registry';
import { useNavigationStore } from '../stores/navigation.store';
import { useFavorites } from '../stores/favorites.store';
import { useRecents } from '../stores/recents.store';
import { useDrafts } from '../stores/drafts.store';
import { applyMenuConfig, useMenuStore } from '../stores/menu.store';
import { EntityRow } from './EntityPrimitives';
import { useT } from '../i18n';
import type { OSEntity } from '../registry/types';
import { usePermissions } from '../services/permissions';

function DomainItem({ id, collapsed }: { id: (typeof DOMAINS)[number]['id']; collapsed: boolean }) {
  const t = useT();
  const d = DOMAINS.find((x) => x.id === id)!;
  const { pathname } = useLocation();
  const active = pathname.startsWith(d.route);
  const { can } = usePermissions();

  // Sprint 1 — Menu Builder: ordering + visibility come from iam_config
  // ("os.menu"), falling back to raw registry order when unset.
  const menuConfig = useMenuStore((s) => s.config);
  const rawModules = applyMenuConfig(getModulesByDomain(d.id), menuConfig);

  const modules = useMemo(() => {
    return rawModules.filter((m) => {
      // If it contains entities, filter out modules where user has no access to any entity
      if (m.entities?.length) {
        return m.entities.some((e) => can(`${e.type}.view`));
      }
      return true;
    });
  }, [rawModules, can]);

  const link = (
    <NavLink
      to={d.route}
      className={cn(
        'relative flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13px] transition-colors',
        active ? 'font-medium text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
        collapsed && 'justify-center px-0',
      )}
    >
      {/* 2px accent bar — the only "active" decoration (Apple restraint) */}
      {active && <span className="absolute -left-2 top-1.5 h-5 w-0.5 rounded-full bg-emerald-500" />}
      <d.icon className={cn('size-4 shrink-0', active ? 'text-emerald-500' : 'text-zinc-500')} />
      {!collapsed && <span className="truncate">{t(d.label as never)}</span>}
    </NavLink>
  );

  return (
    <div>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-[12px] text-zinc-200">
            {t(d.label as never)}
            {modules.length > 0 && (
              <span className="ml-1 text-zinc-500">· {modules.length} module{modules.length > 1 ? 's' : ''}</span>
            )}
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
      {/* registered modules of this domain, shown when the domain is active */}
      {!collapsed && active && modules.length > 0 && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-zinc-800/70 pl-2.5">
          {modules.map((m) => (
            <NavLink
              key={m.slug}
              to={`${d.route}/${m.slug}`}
              className={({ isActive }) =>
                cn('flex h-7 items-center gap-2 rounded-md px-2 text-[12px]',
                  isActive ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300')}
            >
              <m.icon className="size-3.5" />
              <span className="truncate">{m.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function PersonalSection({ title, icon: Icon, items, collapsed, emptyHint }: {
  title: string; icon: typeof Star; items: OSEntity[]; collapsed: boolean; emptyHint: string;
}) {
  if (collapsed) return null;
  return (
    <div className="mt-1">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        <Icon className="size-3" /> {title}
      </div>
      {items.length === 0 ? (
        <p className="px-2 pb-1 text-[11px] leading-relaxed text-zinc-700">{emptyHint}</p>
      ) : (
        <div className="space-y-0.5">
          {items.slice(0, 6).map((e) => <EntityRow key={`${e.type}:${e.id}`} entity={e} showFavorite />)}
        </div>
      )}
    </div>
  );
}

export function OSSidebar() {
  const t = useT();
  const { sidebarMode, focusMode, toggleSidebar } = useNavigationStore();
  const favorites = useFavorites((s) => s.items);
  const recents = useRecents((s) => s.items);
  const drafts = useDrafts((s) => s.items);
  const collapsed = sidebarMode === 'collapsed';

  return (
    <AnimatePresence initial={false}>
      {!focusMode && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: collapsed ? 64 : 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          className="hidden shrink-0 overflow-hidden border-r border-zinc-800 bg-zinc-950 md:block"
        >
          <div className="flex h-full flex-col" style={{ width: collapsed ? 64 : 240 }}>
            <ScrollArea className="min-h-0 flex-1 px-2 py-3">
              <nav aria-label="Navigation principale" className="space-y-0.5 px-1">
                {DOMAINS.filter((d) => d.id !== 'settings').map((d) => (
                  <DomainItem key={d.id} id={d.id} collapsed={collapsed} />
                ))}
              </nav>

              <div className="mx-2 my-3 h-px bg-zinc-800/70" />

              <PersonalSection title={t('nav.favorites')} icon={Star} items={favorites} collapsed={collapsed}
                emptyHint="Épinglez un objet avec ⌘⇧F — il vivra ici." />
              <PersonalSection title={t('nav.recents')} icon={Clock} items={recents} collapsed={collapsed}
                emptyHint="Vos derniers objets visités apparaîtront ici." />
              <PersonalSection title={t('nav.drafts')} icon={FileEdit} items={drafts} collapsed={collapsed}
                emptyHint="Chaque création commence comme un brouillon." />
            </ScrollArea>

            <div className="shrink-0 border-t border-zinc-800 p-2">
              <div className={cn('flex items-center gap-1', collapsed && 'flex-col')}>
                <DomainItemSettings collapsed={collapsed} />
                <button
                  onClick={toggleSidebar}
                  aria-label={collapsed ? 'Déployer la barre latérale' : 'Réduire la barre latérale'}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                >
                  {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DomainItemSettings({ collapsed }: { collapsed: boolean }) {
  const t = useT();
  const d = DOMAINS.find((x) => x.id === 'settings')!;
  return (
    <NavLink
      to={d.route}
      className={({ isActive }) =>
        cn('flex h-8 flex-1 items-center gap-2.5 rounded-lg px-2 text-[13px]',
          isActive ? 'font-medium text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
          collapsed && 'flex-none justify-center px-0')}
    >
      <d.icon className="size-4 text-zinc-500" />
      {!collapsed && <span>{t(d.label as never)}</span>}
    </NavLink>
  );
}
