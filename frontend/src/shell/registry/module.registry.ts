import type { ModuleDefinition, DomainId } from './types';

const modules = new Map<string, ModuleDefinition>();

export function registerModule(def: ModuleDefinition) {
  if (import.meta.env.DEV && modules.has(def.slug))
    console.warn(`[FootballOS] module "${def.slug}" registered twice`);
  modules.set(def.slug, def);
}
export const getModules = () => [...modules.values()];
export const getModule = (slug: string) => modules.get(slug);
export const getModulesByDomain = (domain: DomainId) =>
  getModules().filter((m) => m.domain === domain);
