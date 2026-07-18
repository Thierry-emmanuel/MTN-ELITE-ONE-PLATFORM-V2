import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarMode = 'expanded' | 'collapsed';

interface NavigationState {
  sidebarMode: SidebarMode;
  focusMode: boolean;             // Cmd+. — hides the sidebar entirely
  toggleSidebar: () => void;
  toggleFocusMode: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      sidebarMode: 'expanded',
      focusMode: false,
      toggleSidebar: () =>
        set({ sidebarMode: get().sidebarMode === 'expanded' ? 'collapsed' : 'expanded' }),
      toggleFocusMode: () => set({ focusMode: !get().focusMode }),
    }),
    { name: 'fos.sidebar' },
  ),
);
