import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ShellTheme = 'dark' | 'light';
export type ShellLanguage = 'fr' | 'en';
export type ShellDensity = 'comfortable' | 'compact';

interface PreferencesState {
  theme: ShellTheme;
  language: ShellLanguage;
  density: ShellDensity;
  setTheme: (t: ShellTheme) => void;
  toggleTheme: () => void;
  setLanguage: (l: ShellLanguage) => void;
  setDensity: (d: ShellDensity) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'fr',
      density: 'comfortable',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setLanguage: (language) => set({ language }),
      setDensity: (density) => set({ density }),
    }),
    { name: 'fos.preferences' },
  ),
);
