// FootballOS Phase 0 / Part 1 — Entity Registry: shared lookup sources.
//
// Before this file, `EntityConfig.lookups` was declared in
// entityConfig.types.ts but nothing ever read it — every admin tab in
// AdminPage.tsx independently wrote the same
//   lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
// (this exact line appears 13+ times in AdminPage.tsx). That's the
// duplicated-configuration problem Phase 0 Part 1 exists to remove.
//
// These are the actual, reusable LookupSource definitions. A config opts in
// simply by listing `lookups: [clubsLookup]` and declaring
// `optionsKey: 'clubs'` on the relevant field — see talents.config.ts for
// the first entity migrated onto this pattern.
//
// Existing configs that received their lookupOptions as a prop from
// AdminPage.tsx (transfers, injuries, big-moments/actions, matches, etc.)
// are intentionally left as-is in this pass — replacing 13+ call sites in a
// 2,400-line file is exactly the kind of change that belongs in the AUD-006
// migration (Phase 4), not bundled quietly into the Phase 0 foundation work,
// per "the public UI should remain almost unchanged" / "avoid breaking
// existing features."

import { footballApi } from '@/services/api';
import type { LookupSource } from '../engine/entityConfig.types';

export const clubsLookup: LookupSource = {
  key: 'clubs',
  queryKey: ['lookups', 'clubs'],
  fetch: async () => {
    const clubs = await footballApi.getClubs();
    return clubs.map((c: any) => ({ value: c.id, label: c.name }));
  },
};

export const playersLookup: LookupSource = {
  key: 'players',
  queryKey: ['lookups', 'players'],
  fetch: async () => {
    const players = await footballApi.getPlayers();
    return players.map((p: any) => ({
      value: p.id,
      label: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.nickname || p.id,
    }));
  },
};
