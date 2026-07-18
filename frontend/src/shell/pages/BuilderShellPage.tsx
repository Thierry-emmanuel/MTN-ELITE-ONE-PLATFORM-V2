import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BuilderHost } from '../builder-framework/BuilderHost';
import { ErrorState } from '../components/SystemStates';
import { getModule } from '../registry/module.registry';
import { getEntityType } from '../registry/entity.registry';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { demoBuilderFor } from '../builder-framework/demoBuilder';
import type { OSEntity } from '../registry/types';

/**
 * /builders/:module/:type/:id — hosts the Builder Framework.
 * Phase 1 mounts the framework with a placeholder canvas (demoBuilderFor)
 * proving all eight regions; real canvases replace it per-entity in Phase 2.
 */
export default function BuilderShellPage() {
  const { module: slug = '', type = '', id = 'new' } = useParams();
  const mod = getModule(slug);
  const typeDef = getEntityType(type);

  const entity: OSEntity = useMemo(() => ({
    id: id === 'new' ? crypto.randomUUID() : id,
    type,
    title: id === 'new' ? `Nouveau ${typeDef?.labelSingular ?? type}` : `${typeDef?.labelSingular ?? type} ${id}`,
    subtitle: mod?.label,
    route: `${SHELL_BASE}/builders/${slug}/${type}/${id}`,
    status: 'draft',
  }), [id, type, slug, mod, typeDef]);

  const def = useMemo(
    () => (typeDef ? demoBuilderFor(typeDef) : null),
    [typeDef],
  );

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
    return <div className="p-6"><ErrorState message={`Type « ${type} » introuvable dans le module « ${slug} ».`} /></div>;

  return <BuilderHost def={def} entity={entity} />;
}
