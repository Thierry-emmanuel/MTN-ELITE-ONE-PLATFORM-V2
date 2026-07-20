import { create } from 'zustand';
import { iamApi } from '@/features/iam/iam.api';
import type { ModuleDefinition } from '../registry/types';

/**
 * Menu Builder store (Sprint 1). The sidebar's module lists are now
 * configurable: administrators set ordering, visibility and a homepage in
 * Settings → Menu; the config persists in the backend iam_config table
 * under "os.menu" and every client applies it at shell start.
 *
 * Shape: { order: string[]; hidden: string[]; homepage?: string }
 * Fallback (empty config / offline) = registry order, everything visible —
 * the shell never breaks because of a missing config.
 */
export interface MenuConfig {
  order: string[];
  hidden: string[];
  homepage?: string;
}

interface MenuState {
  config: MenuConfig;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (config: MenuConfig) => Promise<void>;
  setLocal: (config: MenuConfig) => void;
}

const EMPTY: MenuConfig = { order: [], hidden: [] };

export const useMenuStore = create<MenuState>()((set, get) => ({
  config: EMPTY,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const value = await iamApi.config.get<Partial<MenuConfig>>('os.menu');
      set({
        config: { order: value.order ?? [], hidden: value.hidden ?? [], homepage: value.homepage },
        hydrated: true,
      });
    } catch {
      set({ hydrated: true }); // fallback: registry defaults
    }
  },
  save: async (config) => {
    set({ config });
    await iamApi.config.set('os.menu', config as unknown as Record<string, unknown>);
  },
  setLocal: (config) => set({ config }),
}));

/** Apply ordering + visibility to a module list (pure — testable). */
export function applyMenuConfig(modules: ModuleDefinition[], config: MenuConfig): ModuleDefinition[] {
  const hidden = new Set(config.hidden);
  const rank = new Map(config.order.map((slug, i) => [slug, i]));
  return modules
    .filter((m) => !hidden.has(m.slug))
    .sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999));
}
