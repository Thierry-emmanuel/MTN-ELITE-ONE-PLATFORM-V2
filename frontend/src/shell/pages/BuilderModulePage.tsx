import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SplitLayout } from '../layouts/SplitLayout';
import { EmptyState, ErrorState } from '../components/SystemStates';
import { getModule } from '../registry/module.registry';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { cn } from '@/lib/utils';

/**
 * Generic /builders/:module surface — Split Layout master-detail.
 * Selection syncs to the URL (?selected=type) so it's shareable and
 * back-button-safe. Content is whatever the module registered.
 */
export default function BuilderModulePage() {
  const { module: slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const mod = getModule(slug);
  const selected = params.get('selected') ?? mod?.entities?.[0]?.type ?? '';
  const entity = mod?.entities?.find((e) => e.type === selected);

  useShellPage({
    title: mod?.label ?? 'Module',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Builders', href: `${SHELL_BASE}/builders` },
      { label: mod?.label ?? slug },
    ],
  });

  if (!mod) return <div className="p-6"><ErrorState message={`Module « ${slug} » introuvable dans le registre.`} /></div>;

  return (
    <SplitLayout
      list={
        <nav className="p-2" aria-label="Types d'objet">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Types d'objet</p>
          <ul className="space-y-0.5">
            {(mod.entities ?? []).map((e) => (
              <li key={e.type}>
                <button
                  onClick={() => setParams({ selected: e.type }, { replace: false })}
                  className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]',
                    selected === e.type ? 'bg-zinc-900 font-medium text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200')}
                >
                  <e.icon className="size-3.5 text-zinc-500" />
                  {e.labelPlural}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      }
      detail={
        <div className="p-4">
          {entity ? (
            <EmptyState
              icon={entity.icon}
              title={`${entity.labelPlural} — liste à venir`}
              hint="Phase 1 livre la coquille. En Phase 2, l'EntityCrudEngine existant se branche ici comme premier canevas."
              action={
                entity.creatable ? (
                  <Link to={entity.createRoute ?? `${SHELL_BASE}/builders/${mod.slug}/${entity.type}/new`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-500">
                    Créer : {entity.labelSingular}
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <EmptyState hint="Sélectionnez un type d'objet à gauche." />
          )}
        </div>
      }
    />
  );
}
