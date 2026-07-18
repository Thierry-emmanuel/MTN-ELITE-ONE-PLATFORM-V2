import { create } from 'zustand';

export type NotificationKind = 'system' | 'mention' | 'activity';
export interface OSNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  route?: string;
  read: boolean;
  at: string;
}

interface NotificationsState {
  panelOpen: boolean;
  items: OSNotification[];
  setPanelOpen: (open: boolean) => void;
  push: (n: Omit<OSNotification, 'read' | 'at' | 'id'> & { id?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const seed: OSNotification[] = [
  {
    id: 'n1', kind: 'system', read: false, at: new Date().toISOString(),
    title: 'Bienvenue dans League Studio',
    body: 'Le shell FootballOS est actif. Appuyez sur ⌘K pour tout faire au clavier.',
    route: '/os/settings/shortcuts',
  },
  {
    id: 'n2', kind: 'system', read: false, at: new Date().toISOString(),
    title: 'Builders connectés au backend',
    body: 'Compétitions, saisons, clubs, joueurs et stades sont éditables avec données réelles.',
    route: '/os/builders/admin',
  },
];

export const useNotifications = create<NotificationsState>((set, get) => ({
  panelOpen: false,
  items: seed,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  push: (n) =>
    set({ items: [{ id: n.id ?? crypto.randomUUID(), read: false, at: new Date().toISOString(), ...n }, ...get().items] }),
  markRead: (id) =>
    set({ items: get().items.map((i) => (i.id === id ? { ...i, read: true } : i)) }),
  markAllRead: () => set({ items: get().items.map((i) => ({ ...i, read: true })) }),
}));

export const useUnreadCount = () =>
  useNotifications((s) => s.items.filter((i) => !i.read).length);
