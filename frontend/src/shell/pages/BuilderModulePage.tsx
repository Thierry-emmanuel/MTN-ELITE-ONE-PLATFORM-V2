import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { SplitLayout } from '../layouts/SplitLayout';
import { EmptyState, ErrorState, PageSkeleton } from '../components/SystemStates';
import { StatusBadge } from '../components/EntityPrimitives';
import { getModule } from '../registry/module.registry';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';
import { createEntityApi } from '@/features/admin/services/entityApi';
import type { EntityTypeDefinition } from '../registry/types';

type Row = Record<string, unknown> & { id?: string; _id?: string };

/** Best-effort display title straight from the record + config. */
function rowTitle(row: Row): string {
  const first = row.firstName ?? row.first_name;
  const last = row.lastName ?? row.last_name;
  if (first || last) return [first, last].filter(Boolean).join(' ');
  return String(row.name ?? row.title ?? row.label ?? `#${row.id ?? row._id}`);
}

function rowSubtitle(row: Row): string | undefined {
  const s = row.city ?? row.position ?? row.type ?? row.status ?? row.startDate;
  return s !== undefined ? String(s) : undefined;
}

/**
 * Live entity list — one mount per entity type (keyed by the parent), fed by
 * the same TanStack cache and entityApi as the rest of the app. Zero mock data.
 */
function EntityListPane({ typeDef, moduleSlug }: { typeDef: EntityTypeDefinition; moduleSlug: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const config = ENTITY_REGISTRY[typeDef.type];
  const api = useMemo(() => createEntityApi(config), [config]);
  const [q, setQ] = useState('');

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: [config.name],
    queryFn: () => api.list(),
    staleTime: 60_000,
  });

  const rows = useMemo(() => {
    const list = data as Row[];
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    const keys = (config.searchableKeys as string[] | undefined) ?? ['name'];
    return list.filter((r) =>
      keys.some((k) => String(r[k] ?? '').toLowerCase().includes(needle)) ||
      rowTitle(r).toLowerCase().includes(needle));
  }, [data, q, config]);

  const openRoute = (row: Row) => `${SHELL_BASE}/builders/${moduleSlug}/${typeDef.type}/${api.idOf(row as any)}`;

  const remove = async (row: Row) => {
    if (!window.confirm(`Supprimer ${rowTitle(row)} ?`)) return;
    await api.remove(api.idOf(row as any));
    queryClient.invalidateQueries({ queryKey: [config.name] });
  };

  if (isLoading) return <div className="p-4"><PageSkeleton /></div>;
  if (error)
    return (
      <div className="p-4">
        <ErrorState
          message={`Backend injoignable pour ${config.labelPlural} (${config.apiBasePath}). Vérifiez que l'API NestJS tourne.`}
          onRetry={() => refetch()}
        />
      </div>
    );

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-sans text-[15px] font-bold tracking-tight text-zinc-100">{config.labelPlural}</h2>
          <p className="text-[11px] text-zinc-600">
            {rows.length} enregistrement{rows.length > 1 ? 's' : ''} · <code>{config.apiBasePath}</code>
          </p>
        </div>
        <Link
          to={`${SHELL_BASE}/builders/${moduleSlug}/${typeDef.type}/new`}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-500"
        >
          <Plus className="size-3.5" /> {config.labelSingular}
        </Link>
      </div>

      <div className="mb-3 flex h-8 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5">
        <Search className="size-3.5 text-zinc-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Filtrer ${config.labelPlural.toLowerCase()}…`}
          className="w-full bg-transparent text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={typeDef.icon}
          title={q ? 'Aucun résultat' : `Aucun(e) ${config.labelSingular.toLowerCase()}`}
          hint={q ? 'Essayez un autre terme.' : 'Créez le premier enregistrement — il sera écrit directement dans le backend.'}
        />
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto">
          {rows.map((row) => (
            <li key={api.idOf(row as any)} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-900">
              <span className="grid size-7 shrink-0 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400">
                <typeDef.icon className="size-3.5" />
              </span>
              <button onClick={() => navigate(openRoute(row))} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[13px] font-medium text-zinc-200">{rowTitle(row)}</span>
                {rowSubtitle(row) && <span className="block truncate text-[11px] text-zinc-500">{rowSubtitle(row)}</span>}
              </button>
              <StatusBadge status="published" />
              <button
                onClick={() => remove(row)}
                aria-label="Supprimer"
                className="rounded p-1 text-zinc-600 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** /builders/:module — Split Layout: entity types (URL-synced) · live records. */
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
      detail={entity
        ? <EntityListPane key={entity.type} typeDef={entity} moduleSlug={mod.slug} />
        : <div className="p-4"><EmptyState hint="Sélectionnez un type d'objet à gauche." /></div>}
    />
  );
}
