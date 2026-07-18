import type { OSEntity } from '../registry/types';
import { getModules } from '../registry/module.registry';
import { useRecents } from '../stores/recents.store';
import { useFavorites } from '../stores/favorites.store';
import { useDrafts } from '../stores/drafts.store';
import { DOMAINS } from '../navigation/domains';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const matches = (q: string, ...fields: (string | undefined)[]) =>
  fields.some((f) => f && norm(f).includes(norm(q)));

/**
 * Global search — aggregates navigable surfaces (domains, modules) with
 * every OSEntity source (recents, favorites, drafts, module providers).
 * Streams synchronously; module providers may be async and append.
 */
export async function searchEntities(q: string): Promise<OSEntity[]> {
  if (!q.trim()) return [];
  const out: OSEntity[] = [];

  for (const d of DOMAINS)
    if (matches(q, d.id, d.route)) out.push({ id: d.id, type: 'domain', title: d.id, route: d.route });

  for (const m of getModules())
    if (matches(q, m.label, m.slug))
      out.push({ id: m.slug, type: 'module', title: m.label, subtitle: m.domain, route: `/os/${m.domain}/${m.slug}` });

  const stores = [
    ...useRecents.getState().items,
    ...useFavorites.getState().items,
    ...useDrafts.getState().items,
  ];
  for (const e of stores)
    if (matches(q, e.title, e.subtitle, e.type) && !out.some((o) => o.id === e.id && o.type === e.type))
      out.push(e);

  for (const m of getModules()) {
    if (!m.searchProvider) continue;
    try {
      const extra = await m.searchProvider(q);
      for (const e of extra)
        if (!out.some((o) => o.id === e.id && o.type === e.type)) out.push(e);
    } catch { /* a failing provider never breaks global search */ }
  }
  return out.slice(0, 20);
}
