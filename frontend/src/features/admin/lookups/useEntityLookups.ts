// FootballOS Phase 0 / Part 1 — Entity Registry: lookup resolution.
//
// This is the one place `EntityConfig.lookups` gets turned into the
// `lookupOptions: Record<string, SelectOption[]>` that EntityCrudEngine,
// GuidedBuilderEngine and renderField already know how to consume (they've
// supported this prop all along — nothing that reads lookupOptions needs to
// change). Each LookupSource is cached independently under its own
// queryKey, so ten entities all declaring `lookups: [clubsLookup]` still
// only fetch the club list once per staleTime window, shared via the
// TanStack Query cache — no re-fetching per tab.

import { useQueries } from '@tanstack/react-query';
import type { EntityConfig, SelectOption } from '../engine/entityConfig.types';

export function useEntityLookups<T extends { id?: string; _id?: string }>(
  config: EntityConfig<T>,
): Record<string, SelectOption[]> {
  const sources = config.lookups ?? [];

  const results = useQueries({
    queries: sources.map((source) => ({
      queryKey: source.queryKey,
      queryFn: source.fetch,
      staleTime: 60_000,
    })),
  });

  const lookupOptions: Record<string, SelectOption[]> = {};
  sources.forEach((source, i) => {
    lookupOptions[source.key] = (results[i]?.data as SelectOption[] | undefined) ?? [];
  });
  return lookupOptions;
}
