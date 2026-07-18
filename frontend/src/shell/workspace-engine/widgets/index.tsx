import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Clock, FileEdit, Hammer, Keyboard, Plus, Search, Server, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WidgetDefinition } from '../../registry/types';
import { useDrafts } from '../../stores/drafts.store';
import { useRecents } from '../../stores/recents.store';
import { useFavorites } from '../../stores/favorites.store';
import { useNotifications } from '../../stores/notifications.store';
import { usePaletteStore } from '../../stores/palette.store';
import { EntityRow } from '../../components/EntityPrimitives';
import { EmptyState } from '../../components/SystemStates';
import { Kbd } from '../../components/ShortcutHint';
import { SHELL_BASE } from '../../navigation/domains';

/** Phase-1 widget set — shell-only, zero football logic. Modules add theirs via the registry. */

function EntityListWidget({ items, emptyTitle, emptyHint }: {
  items: ReturnType<typeof useRecents.getState>['items']; emptyTitle: string; emptyHint: string;
}) {
  if (items.length === 0) return <EmptyState title={emptyTitle} hint={emptyHint} />;
  return <div className="space-y-0.5">{items.slice(0, 6).map((e) => <EntityRow key={`${e.type}:${e.id}`} entity={e} showFavorite />)}</div>;
}

const MyDrafts = () => {
  const items = useDrafts((s) => s.items);
  return <EntityListWidget items={items} emptyTitle="Aucun brouillon" emptyHint="Créez un objet avec ⌘⇧N — il apparaîtra ici immédiatement." />;
};

const RecentItems = () => {
  const items = useRecents((s) => s.items);
  return <EntityListWidget items={items} emptyTitle="Aucun élément récent" emptyHint="Naviguez avec ⌘K — vos derniers objets vivront ici." />;
};

const FavoritesWidget = () => {
  const items = useFavorites((s) => s.items);
  return <EntityListWidget items={items} emptyTitle="Aucun favori" emptyHint="Épinglez un objet pour le garder à portée de main." />;
};

const QuickActions = () => {
  const navigate = useNavigate();
  const openPalette = usePaletteStore((s) => s.openWith);
  const actions = [
    { label: 'Ouvrir la palette', icon: Search, run: () => openPalette('') },
    { label: 'Créer un objet', icon: Plus, run: () => openPalette('+') },
    { label: 'Explorer les Builders', icon: Hammer, run: () => navigate(`${SHELL_BASE}/builders`) },
    { label: 'Raccourcis clavier', icon: Keyboard, run: () => openPalette('?') },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((a) => (
        <Button key={a.label} variant="outline" onClick={a.run}
          className="h-auto flex-col items-start gap-1.5 border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-left hover:border-zinc-700 hover:bg-zinc-900">
          <a.icon className="size-4 text-emerald-500" />
          <span className="text-[12px] font-medium text-zinc-300">{a.label}</span>
        </Button>
      ))}
    </div>
  );
};

const SystemStatus = () => (
  <ul className="space-y-2">
    {[
      { label: 'Shell FootballOS', state: 'Opérationnel', ok: true },
      { label: 'Registre des modules', state: 'Actif', ok: true },
      { label: 'Builders métier (backend réel)', state: 'Opérationnel', ok: true },
      { label: 'Temps réel (socket.io)', state: 'Phase 3', ok: false },
    ].map((row) => (
      <li key={row.label} className="flex items-center justify-between rounded-lg border border-zinc-800/70 px-3 py-2">
        <span className="flex items-center gap-2 text-[13px] text-zinc-300">
          <Server className="size-3.5 text-zinc-600" /> {row.label}
        </span>
        <span className={`flex items-center gap-1.5 text-[12px] ${row.ok ? 'text-emerald-400' : 'text-zinc-500'}`}>
          <span className={`size-1.5 rounded-full ${row.ok ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
          {row.state}
        </span>
      </li>
    ))}
  </ul>
);

const ActivityFeed = () => {
  const items = useNotifications((s) => s.items);
  return (
    <ul className="space-y-1">
      {items.slice(0, 6).map((n) => (
        <li key={n.id}>
          <Link to={n.route ?? '#'} className="block rounded-lg px-2 py-1.5 hover:bg-zinc-900/60">
            <span className="block text-[13px] text-zinc-300">{n.title}</span>
            <span className="text-[11px] text-zinc-600">{new Date(n.at).toLocaleTimeString()}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const ShortcutTips = () => (
  <ul className="space-y-2 text-[13px] text-zinc-400">
    <li className="flex items-center justify-between">Palette de commandes <Kbd>⌘K</Kbd></li>
    <li className="flex items-center justify-between">Créer <Kbd>⌘⇧N</Kbd></li>
    <li className="flex items-center justify-between">Inspecteur <Kbd>⌘\</Kbd></li>
    <li className="flex items-center justify-between">Mode focus <Kbd>⌘.</Kbd></li>
    <li className="flex items-center justify-between">Aller au Workspace <Kbd>G W</Kbd></li>
  </ul>
);

export const SHELL_WIDGETS: WidgetDefinition[] = [
  { id: 'my-drafts', title: 'Mes brouillons', icon: FileEdit, component: MyDrafts, defaultSize: 'S' },
  { id: 'recent-items', title: 'Récents', icon: Clock, component: RecentItems, defaultSize: 'S' },
  { id: 'favorites', title: 'Favoris', icon: Star, component: FavoritesWidget, defaultSize: 'S' },
  { id: 'quick-actions', title: 'Actions rapides', icon: Plus, component: QuickActions, defaultSize: 'M' },
  { id: 'system-status', title: 'État du système', icon: Server, component: SystemStatus, defaultSize: 'M' },
  { id: 'activity-feed', title: 'Activité', icon: Activity, component: ActivityFeed, defaultSize: 'M' },
  { id: 'shortcut-tips', title: 'Raccourcis', icon: Keyboard, component: ShortcutTips, defaultSize: 'S' },
];
