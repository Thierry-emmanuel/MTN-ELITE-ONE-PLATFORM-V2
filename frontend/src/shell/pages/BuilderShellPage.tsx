import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BuilderHost } from '../builder-framework/BuilderHost';
import { ErrorState, PageSkeleton } from '../components/SystemStates';
import { getModule } from '../registry/module.registry';
import { getEntityType } from '../registry/entity.registry';
import { useShellPage } from '../stores/page.store';
import { useDrafts } from '../stores/drafts.store';
import { useRecents } from '../stores/recents.store';
import { SHELL_BASE } from '../navigation/domains';
import type { OSEntity } from '../registry/types';

/**
 * /builders/:module/:type/:id — hosts the Builder Framework with REAL data.
 * id === 'new'  → empty draft, publish creates the record (POST).
 * id === <uuid> → record loaded from the backend, autosave PATCHes it,
 *                 publish updates it with the config's publishOverrides.
 * After a first publish the URL is replaced with the real server id, the
 * local shell-draft is cleared, and the entity lands in Recents.
 */
export default function BuilderShellPage() {
  const { module: slug = '', type = '', id = 'new' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mod = getModule(slug);
  const typeDef = getEntityType(type);
  const def = mod?.builders?.find((b) => b.entityType === type);
  const isNew = id === 'new';
  const removeDraft = useDrafts((s) => s.remove);
  const pushRecent = useRecents((s) => s.push);

  const { data: record, isLoading, error } = useQuery({
    queryKey: [type, 'one', id],
    queryFn: () => def!.persistence!.load(id),
    enabled: !isNew && !!def?.persistence,
    staleTime: 30_000,
  });

  const entity: OSEntity = useMemo(() => ({
    id: isNew ? crypto.randomUUID() : id,
    type,
    title: isNew ? `Nouveau ${typeDef?.labelSingular ?? type}` : `${typeDef?.labelSingular ?? type} #${id}`,
    subtitle: mod?.label,
    route: `${SHELL_BASE}/builders/${slug}/${type}/${id}`,
    status: isNew ? 'draft' : 'published',
  }), [id, type, slug, mod, typeDef, isNew]);

  useShellPage({
    title: entity.title,
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Builders', href: `${SHELL_BASE}/builders` },
      { label: mod?.label ?? slug, href: `${SHELL_BASE}/builders/${slug}` },
      { label: entity.title },
    ],
  });

  if (!mod || !typeDef || !def)
    return <div className="p-6"><ErrorState message={`Aucun builder enregistré pour « ${type} » dans le module « ${slug} ».`} /></div>;
  if (!isNew && isLoading)
    return <div className="p-6"><PageSkeleton /></div>;
  if (!isNew && error)
    return <div className="p-6"><ErrorState message={`Impossible de charger ${typeDef.labelSingular} #${id} depuis le backend.`} onRetry={() => queryClient.invalidateQueries({ queryKey: [type, 'one', id] })} /></div>;

  return (
    <BuilderHost
      key={`${type}:${id}`}
      def={def}
      entity={entity}
      serverId={isNew ? null : id}
      initialDraft={record}
      onPublished={(serverId) => {
        queryClient.invalidateQueries({ queryKey: [type] });
        removeDraft(entity.id, type);
        pushRecent({ ...entity, id: serverId, status: 'published', route: `${SHELL_BASE}/builders/${slug}/${type}/${serverId}` });
        if (isNew) navigate(`${SHELL_BASE}/builders/${slug}/${type}/${serverId}`, { replace: true });
      }}
    />
  );
}
