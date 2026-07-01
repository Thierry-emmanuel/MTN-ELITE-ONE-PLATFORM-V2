import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';
import { useClubOptions, usePlayerOptions } from '@/features/admin/hooks/useLookupOptions';

// Lazy per skill 03 — keeps the admin bundle out of the public-site chunk
const EntityCrudEngine = lazy(() =>
  import('@/features/admin/engine/EntityCrudEngine').then((m) => ({ default: m.EntityCrudEngine })),
);

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

/**
 * Route: /admin/entities/:entityKey
 * Replaces the per-entity `if (activeTab === 'x')` blocks in the old
 * AdminPage.tsx for every config-driven domain.
 */
export default function AdminEntityPage({ showToast }: Props) {
  const { entityKey = '' } = useParams<{ entityKey: string }>();
  const config = ENTITY_REGISTRY[entityKey];

  const { data: clubs = [] } = useClubOptions();
  const { data: players = [] } = usePlayerOptions();

  if (!config) {
    return <p className="text-sm text-stone-500">Entité inconnue : {entityKey}</p>;
  }

  return (
    <Suspense fallback={<div className="animate-pulse text-stone-400 text-sm">Chargement…</div>}>
      <EntityCrudEngine
        config={config}
        showToast={showToast}
        lookupOptions={{ clubs, players }}
      />
    </Suspense>
  );
}