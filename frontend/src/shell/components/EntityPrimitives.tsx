import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OSEntity, EntityStatus } from '../registry/types';
import { getEntityType } from '../registry/entity.registry';
import { useFavorites } from '../stores/favorites.store';
import { useT } from '../i18n';

/** The three canonical renderings of OSEntity — used everywhere. */

export function StatusBadge({ status }: { status?: EntityStatus }) {
  const t = useT();
  if (!status) return null;
  const styles: Record<EntityStatus, string> = {
    draft: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    published: 'bg-emerald-950 text-emerald-400 border-emerald-900',
    archived: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    scheduled: 'bg-amber-950 text-amber-400 border-amber-900',
  };
  return (
    <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide', styles[status])}>
      {t(`status.${status}` as const)}
    </span>
  );
}

function EntityIcon({ entity, className }: { entity: OSEntity; className?: string }) {
  const def = getEntityType(entity.type);
  const Icon = def?.icon;
  return (
    <span className={cn('grid size-7 shrink-0 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400', className)}>
      {Icon ? <Icon className="size-3.5" /> : <span className="text-[10px] font-semibold uppercase">{entity.type.slice(0, 2)}</span>}
    </span>
  );
}

export function EntityRow({ entity, showFavorite = false }: { entity: OSEntity; showFavorite?: boolean }) {
  const { toggle, isFavorite } = useFavorites();
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-900">
      <EntityIcon entity={entity} />
      <Link to={entity.route} className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-zinc-200">{entity.title}</div>
        {entity.subtitle && <div className="truncate text-[11px] text-zinc-500">{entity.subtitle}</div>}
      </Link>
      <StatusBadge status={entity.status} />
      {showFavorite && (
        <button
          onClick={() => toggle(entity)}
          aria-label="Basculer favori"
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Star className={cn('size-3.5', isFavorite(entity) ? 'fill-amber-500 text-amber-500' : 'text-zinc-500')} />
        </button>
      )}
    </div>
  );
}

export function EntityChip({ entity }: { entity: OSEntity }) {
  return (
    <Link
      to={entity.route}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[12px] text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
    >
      <span className="truncate">{entity.title}</span>
    </Link>
  );
}

export function EntityCard({ entity }: { entity: OSEntity }) {
  return (
    <Link
      to={entity.route}
      className="group flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <EntityIcon entity={entity} />
        <StatusBadge status={entity.status} />
      </div>
      <div>
        <div className="truncate text-[13px] font-medium text-zinc-200 group-hover:text-white">{entity.title}</div>
        {entity.subtitle && <div className="truncate text-[11px] text-zinc-500">{entity.subtitle}</div>}
      </div>
    </Link>
  );
}
