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
import { usePermissions } from '../services/permissions';

type Row = Record<string, unknown> & { id?: string; _id?: string };

/** Best-effort display title straight from the record + config. */
function rowTitle(row: Row): string {
  const first = row.firstName ?? row.first_name;
  const last = row.lastName ?? row.last_name;
  if (first || last) return [first, last].filter(Boolean).join(' ');

  // Match title formatting: Home vs Away or Round
  const home = (row.homeClub as any)?.name || row.homeClubId;
  const away = (row.awayClub as any)?.name || row.awayClubId;
  if (home && away) {
    return `${home} vs ${away}`;
  }
  if (row.round) return `Journée ${row.round}`;

  return String(row.name ?? row.title ?? row.label ?? `#${row.id ?? row._id}`);
}

function rowSubtitle(row: Row): string | undefined {
  if (row.scheduledAt) {
    const d = new Date(row.scheduledAt as string);
    const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const venue = String(row.venue ?? row.city ?? '');
    return [dateStr, venue].filter(Boolean).join(' · ');
  }
  const s = row.city ?? row.position ?? row.type ?? row.status ?? row.startDate;
  return s !== undefined ? String(s) : undefined;
}

function RowIcon({ row, typeDef }: { row: Row; typeDef: EntityTypeDefinition }) {
  const homeLogo = (row.homeClub as any)?.logoUrl;
  const awayLogo = (row.awayClub as any)?.logoUrl;

  if (typeDef.type === 'matches' && (homeLogo || awayLogo)) {
    return (
      <div className="flex items-center -space-x-1 shrink-0">
        <div className="size-7 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center p-0.5 shadow">
          {homeLogo ? <img src={homeLogo} alt="" className="size-full object-contain" /> : <span className="text-[8px] text-zinc-500 font-bold">H</span>}
        </div>
        <div className="size-7 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center p-0.5 shadow z-10">
          {awayLogo ? <img src={awayLogo} alt="" className="size-full object-contain" /> : <span className="text-[8px] text-zinc-500 font-bold">A</span>}
        </div>
      </div>
    );
  }

  const singleImg = (row.photoUrl || row.photo_url || row.logoUrl || row.logo_url) as string | undefined;
  if (singleImg) {
    return (
      <div className="size-7 shrink-0 rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center p-0.5">
        <img src={singleImg} alt="" className="size-full object-cover rounded-sm" />
      </div>
    );
  }

  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400">
      <typeDef.icon className="size-3.5" />
    </span>
  );
}

/**
 * Clubs-specific pane: two tabs — Clubs de la saison actuelle vs Historique.
 * • Active: clubs with status ACTIVE (currently enrolled in the running season).
 * • Historic: ALL clubs ever registered in the database (every season).
 */
function ClubsListPane({ typeDef, moduleSlug }: { typeDef: EntityTypeDefinition; moduleSlug: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const config = ENTITY_REGISTRY[typeDef.type];
  const api = useMemo(() => createEntityApi(config), [config]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'current' | 'historic'>('current');

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: [config.name],
    queryFn: () => api.list(),
    staleTime: 60_000,
  });

  const all = data as Row[];

  const activeClubs = useMemo(() =>
    all.filter((r) => !r.status || r.status === 'ACTIVE'), [all]);

  const historicClubs = useMemo(() =>
    all, [all]);

  const displayed = useMemo(() => {
    const base = tab === 'current' ? activeClubs : historicClubs;
    if (!q.trim()) return base;
    const needle = q.toLowerCase();
    return base.filter((r) =>
      ['name', 'nickname', 'city'].some((k) => String(r[k] ?? '').toLowerCase().includes(needle)));
  }, [tab, activeClubs, historicClubs, q]);

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
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-sans text-[15px] font-bold tracking-tight text-zinc-100">Clubs MTN Elite One</h2>
          <p className="text-[11px] text-zinc-500">
            {tab === 'current'
              ? `${activeClubs.length} club${activeClubs.length > 1 ? 's' : ''} actif${activeClubs.length > 1 ? 's' : ''} cette saison`
              : `${historicClubs.length} club${historicClubs.length > 1 ? 's' : ''} au total dans la base`}
          </p>
        </div>
        <Link
          to={`${SHELL_BASE}/builders/${moduleSlug}/${typeDef.type}/new`}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-500"
        >
          <Plus className="size-3.5" /> Club
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex rounded-xl border border-zinc-800 bg-zinc-900/40 p-1 gap-1">
        <button
          onClick={() => setTab('current')}
          className={cn(
            'flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
            tab === 'current'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          🏆 Saison Actuelle
          <span className="ml-1.5 rounded-full bg-emerald-600/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
            {activeClubs.length}
          </span>
        </button>
        <button
          onClick={() => setTab('historic')}
          className={cn(
            'flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
            tab === 'historic'
              ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          📚 Historique Elite One
          <span className="ml-1.5 rounded-full bg-amber-600/20 px-1.5 py-0.5 text-[10px] text-amber-400">
            {historicClubs.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-3 flex h-8 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5">
        <Search className="size-3.5 text-zinc-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un club…"
          className="w-full bg-transparent text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600"
        />
      </div>

      {/* Section label */}
      {tab === 'current' ? (
        <div className="mb-2 flex items-center gap-2">
          <span className="h-px flex-1 bg-emerald-600/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            Clubs de la saison en cours
          </span>
          <span className="h-px flex-1 bg-emerald-600/20" />
        </div>
      ) : (
        <div className="mb-2 flex items-center gap-2">
          <span className="h-px flex-1 bg-amber-600/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            Tous les clubs — Historique MTN Elite One
          </span>
          <span className="h-px flex-1 bg-amber-600/20" />
        </div>
      )}

      {/* List */}
      {displayed.length === 0 ? (
        <EmptyState
          icon={typeDef.icon}
          title={q ? 'Aucun résultat' : tab === 'current' ? 'Aucun club actif cette saison' : 'Aucun club enregistré'}
          hint={q ? 'Essayez un autre terme.' : 'Créez le premier club.'}
        />
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto">
          {displayed.map((row) => (
            <li key={api.idOf(row as any)} className="group flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all">
              {/* Club Logo */}
              <div className="size-9 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center p-0.5">
                {row.logoUrl
                  ? <img src={String(row.logoUrl)} alt="" className="size-full object-contain" />
                  : <span className="text-[10px] font-bold text-zinc-500">{String(row.name ?? '?').slice(0, 2).toUpperCase()}</span>
                }
              </div>

              <button onClick={() => navigate(openRoute(row))} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[13px] font-semibold text-zinc-100">{rowTitle(row)}</span>
                <span className="block truncate text-[11px] text-zinc-500">{String(row.city ?? '')} {row.foundedYear ? `· Fondé ${row.foundedYear}` : ''}</span>
              </button>

              {/* Status badge */}
              <span className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                row.status === 'ACTIVE'
                  ? 'bg-emerald-600/15 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-500',
              )}>
                {row.status === 'ACTIVE' ? 'Actif' : 'Historique'}
              </span>

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

function EntityListPane({ typeDef, moduleSlug }: { typeDef: EntityTypeDefinition; moduleSlug: string }) {
  // Clubs get a dedicated dual-tab view
  if (typeDef.type === 'clubs') {
    return <ClubsListPane typeDef={typeDef} moduleSlug={moduleSlug} />;
  }

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
              <RowIcon row={row} typeDef={typeDef} />
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

export default function BuilderModulePage() {
  const { module: slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { can } = usePermissions();
  const mod = getModule(slug);

  const allowedEntities = useMemo(() => {
    return (mod?.entities ?? []).filter((e) => can(`${e.type}.view`));
  }, [mod?.entities, can]);

  const selected = params.get('selected') ?? allowedEntities[0]?.type ?? '';
  const entity = allowedEntities.find((e) => e.type === selected);

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
            {allowedEntities.map((e) => (
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
