import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlacedWidget, WidgetSize } from '../registry/types';

interface WorkspaceState {
  /** null → fall back to the role template, then template.default */
  layout: PlacedWidget[] | null;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  setLayout: (l: PlacedWidget[]) => void;
  move: (index: number, dir: -1 | 1) => void;
  resize: (index: number, size: WidgetSize) => void;
  removeAt: (index: number) => void;
  add: (widgetId: string, size: WidgetSize) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      layout: null,
      editMode: false,
      setEditMode: (editMode) => set({ editMode }),
      setLayout: (layout) => set({ layout }),
      move: (index, dir) => {
        const l = [...(get().layout ?? [])];
        const j = index + dir;
        if (j < 0 || j >= l.length) return;
        [l[index], l[j]] = [l[j], l[index]];
        set({ layout: l });
      },
      resize: (index, size) => {
        const l = [...(get().layout ?? [])];
        if (!l[index]) return;
        l[index] = { ...l[index], size };
        set({ layout: l });
      },
      removeAt: (index) => set({ layout: (get().layout ?? []).filter((_, i) => i !== index) }),
      add: (widgetId, size) => set({ layout: [...(get().layout ?? []), { widgetId, size }] }),
      reset: () => set({ layout: null, editMode: false }),
    }),
    { name: 'fos.workspace-layout' },
  ),
);
