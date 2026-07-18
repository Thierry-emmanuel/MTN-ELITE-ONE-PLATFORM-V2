import { create } from 'zustand';
import type { ReactNode } from 'react';

export interface InspectorTabSpec { id: string; label: string; content: ReactNode }

interface InspectorState {
  open: boolean;
  tabs: InspectorTabSpec[];
  activeTab: string;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setActiveTab: (id: string) => void;
  /** The current surface contributes its inspector content. */
  setTabs: (tabs: InspectorTabSpec[]) => void;
}

export const useInspector = create<InspectorState>((set, get) => ({
  open: false,
  tabs: [],
  activeTab: '',
  toggle: () => set({ open: !get().open }),
  setOpen: (open) => set({ open }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setTabs: (tabs) =>
    set({ tabs, activeTab: tabs.some((t) => t.id === get().activeTab) ? get().activeTab : (tabs[0]?.id ?? '') }),
}));
