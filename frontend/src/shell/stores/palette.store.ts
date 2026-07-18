import { create } from 'zustand';

interface PaletteState {
  open: boolean;
  initialQuery: string;
  setOpen: (open: boolean) => void;
  openWith: (query: string) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  open: false,
  initialQuery: '',
  setOpen: (open) => set({ open, initialQuery: open ? '' : '' }),
  openWith: (initialQuery) => set({ open: true, initialQuery }),
}));
