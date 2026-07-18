/**
 * configBuilder — EntityConfig → BuilderDefinition bridge (Phase 2).
 * -------------------------------------------------------------------
 * ONE factory gives every registered entity a full production builder
 * inside the universal Builder Framework, reusing the existing engines
 * end-to-end instead of duplicating them:
 *
 *   createEntityApi(config)    → real NestJS endpoints (list/get/create/patch)
 *   config.builderSteps        → Builder Sidebar sections (live completeness)
 *   renderEntityField          → Canvas fields (same renderer as the admin)
 *   useEntityLookups(config)   → dynamic selects (clubs, players, seasons…)
 *   config.beforeSave          → applied by entityApi before every write
 *   config.publishOverrides    → applied by the publish pipeline
 *   config.relations           → Relations region (declared in Phase 0)
 *   backend ValidationPipe     → surfaced verbatim in the Publish dialog
 *
 * No standalone builders. No mock data. Deleting this factory's
 * predecessor (demoBuilder.tsx) is part of this change.
 */
import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { createEntityApi } from '@/features/admin/services/entityApi';
import { renderEntityField } from '@/features/admin/engine/renderField';
import { useEntityLookups } from '@/features/admin/lookups/useEntityLookups';
import type { EntityConfig, FieldDef } from '@/features/admin/engine/entityConfig.types';
import type {
  BuilderDefinition, BuilderSection, CanvasProps, RelationDef, ValidationResult,
} from '../registry/types';
import { SHELL_BASE } from '../navigation/domains';

type AnyRecord = { id?: string; _id?: string };

/** Optional per-entity refinements on top of the generic factory. */
export interface BuilderOptions<T extends AnyRecord> {
  titleOf?: (draft: Partial<T>) => string;
  /** Replace the generic form canvas with a bespoke one (e.g. Match Builder).
   *  The bespoke canvas STILL runs inside BuilderHost — header, inspector,
   *  history, publishing and shortcuts remain framework-owned. */
  Canvas?: ComponentType<CanvasProps<Partial<T>>>;
  /** Replace the builderSteps-derived section list. */
  sections?: (draft: Partial<T>) => BuilderSection[];
  /** Public-preview descriptor — which fields compose the supporter-facing card. */
  preview?: {
    imageKey?: keyof T;
    titleKeys: (keyof T)[];
    subtitleKeys?: (keyof T)[];
    badgeKeys?: (keyof T)[];
  };
}

const filled = (v: unknown) =>
  v !== undefined && v !== null && String(v).trim() !== '' && !(Array.isArray(v) && v.length === 0);

// ── Shared field grid (also used by bespoke canvases like the Match Builder) ─
export function ConfigFieldsGrid<T extends AnyRecord>({ config, fieldKeys, draft, onChange, onSelect }: {
  config: EntityConfig<T>;
  /** Subset + order of fields to render; defaults to every config field. */
  fieldKeys?: (keyof T)[];
  draft: Partial<T>;
  onChange: (next: Partial<T>) => void;
  onSelect?: (sel: { kind: string; ref: string; label: string }) => void;
}) {
  const lookupOptions = useEntityLookups(config);
  const fields: FieldDef<T>[] = (fieldKeys ?? config.fields.map((f) => f.key))
    .map((k) => config.fields.find((f) => f.key === k))
    .filter((f): f is FieldDef<T> => !!f);
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
      {fields.map((field) => (
        <div
          key={String(field.key)}
          className={field.span === 1 ? 'md:col-span-1' : 'md:col-span-2'}
          onFocusCapture={() => onSelect?.({ kind: 'field', ref: String(field.key), label: field.label })}
        >
          {renderEntityField(
            field,
            draft[field.key],
            (v) => onChange({ ...draft, [field.key]: v }),
            lookupOptions,
            'w-full',
          )}
        </div>
      ))}
    </div>
  );
}

// ── Canvas ──────────────────────────────────────────────────────────────────
function makeCanvas<T extends AnyRecord>(config: EntityConfig<T>): ComponentType<CanvasProps<Partial<T>>> {
  const steps = config.builderSteps ?? [];

  return function ConfigCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Partial<T>>) {
    const lookupOptions = useEntityLookups(config);
    const step = steps.find((s) => s.id === activeSection);
    const isReview = !!step && step.fieldKeys.length === 0;
    const fields: FieldDef<T>[] = isReview
      ? []
      : step
        ? step.fieldKeys
            .map((k) => config.fields.find((f) => f.key === k))
            .filter((f): f is FieldDef<T> => !!f)
        : config.fields;

    if (isReview) {
      const answered = config.fields.filter((f) => filled(draft[f.key]));
      return (
        <div className="mx-auto max-w-[760px] space-y-4 p-6">
          <p className="text-[13px] leading-relaxed text-zinc-500">
            {step?.description ?? 'Vérifiez les informations avant publication.'}
          </p>
          <dl className="divide-y divide-zinc-800/70 overflow-hidden rounded-xl border border-zinc-800">
            {answered.map((f) => (
              <div key={String(f.key)} className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{f.label}</dt>
                <dd className="col-span-2 truncate text-[13px] text-zinc-200">
                  {Array.isArray(draft[f.key]) ? (draft[f.key] as unknown[]).join(', ') : String(draft[f.key])}
                </dd>
              </div>
            ))}
            {answered.length === 0 && (
              <div className="px-4 py-6 text-center text-[13px] text-zinc-600">Aucun champ renseigné pour le moment.</div>
            )}
          </dl>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[760px] p-6">
        {step?.description && (
          <p className="mb-5 text-[13px] leading-relaxed text-zinc-500">{step.description}</p>
        )}
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
          {fields.map((field) => {
            const span = field.span === 1 ? 'md:col-span-1' : 'md:col-span-2';
            return (
              <div
                key={String(field.key)}
                className={span}
                onFocusCapture={() => onSelect({ kind: 'field', ref: String(field.key), label: field.label })}
              >
                {renderEntityField(
                  field,
                  draft[field.key],
                  (v) => onChange({ ...draft, [field.key]: v }),
                  lookupOptions,
                  'w-full',
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
}

// ── Preview ─────────────────────────────────────────────────────────────────
function PublicPreview<T extends AnyRecord>({ draft, opts }: { draft: Partial<T>; opts?: BuilderOptions<T>['preview'] }) {
  const title = (opts?.titleKeys ?? [])
    .map((k) => draft[k]).filter(filled).join(' ') || 'Sans titre';
  const subtitle = (opts?.subtitleKeys ?? [])
    .map((k) => draft[k]).filter(filled).join(' · ');
  const badges = (opts?.badgeKeys ?? []).map((k) => draft[k]).filter(filled);
  const img = opts?.imageKey ? draft[opts.imageKey] : undefined;

  return (
    <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-stone-50 text-stone-900 shadow-xl">
      {typeof img === 'string' && img && (
        <div className="h-44 w-full bg-stone-200">
          <img src={img} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">MTN Elite One</p>
        <h2 className="mt-1.5 font-sans text-2xl font-black tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-[14px] text-stone-500">{subtitle}</p>}
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((b, i) => (
              <span key={i} className="rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                {String(b)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Factory ─────────────────────────────────────────────────────────────────
export function builderFromConfig<T extends AnyRecord>(
  config: EntityConfig<T>,
  icon: LucideIcon,
  opts: BuilderOptions<T> = {},
): BuilderDefinition<Partial<T>> {
  const api = createEntityApi(config);
  const steps = config.builderSteps ?? [];
  const requiredFields = config.fields.filter((f) => f.required);

  const sections = (draft: Partial<T>): BuilderSection[] =>
    steps.length > 0
      ? steps.map((s) => ({
          id: s.id,
          label: s.label,
          complete:
            s.fieldKeys.length > 0 &&
            s.fieldKeys.every((k) => {
              const f = config.fields.find((x) => x.key === k);
              return !f?.required || filled(draft[k]);
            }),
        }))
      : [{ id: 'details', label: 'Détails', complete: requiredFields.every((f) => filled(draft[f.key])) }];

  const validate = (draft: Partial<T>): ValidationResult => {
    const issues = requiredFields
      .filter((f) => !filled(draft[f.key]))
      .map((f) => ({ field: f.label, message: 'requis avant publication.' }));
    return { ok: issues.length === 0, issues };
  };

  const relations = (draft: Partial<T>): RelationDef[] =>
    (config.relations ?? [])
      .filter((r) => filled(draft[r.key]))
      .map((r) => {
        const ids = r.cardinality === 'many' && Array.isArray(draft[r.key])
          ? (draft[r.key] as unknown[])
          : [draft[r.key]];
        return {
          label: config.fields.find((f) => f.key === r.key)?.label ?? String(r.key),
          entities: ids.map((id) => ({
            id: String(id),
            type: r.targetEntity,
            title: `${r.targetEntity} · #${id}`,
            route: `${SHELL_BASE}/builders/admin/${r.targetEntity}/${id}`,
          })),
        };
      });

  return {
    entityType: config.name,
    icon,
    emptyDraft: () => config.emptyRecord(),
    titleOf: opts.titleOf,
    sections: opts.sections ?? sections,
    Canvas: opts.Canvas ?? makeCanvas(config),
    inspectorTabs: [
      {
        id: 'properties',
        label: 'Propriétés',
        render: (_draft, selection) => {
          const field = selection ? config.fields.find((f) => String(f.key) === selection.ref) : undefined;
          return (
            <div className="space-y-4 text-[13px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Champ sélectionné</p>
                {field ? (
                  <div className="mt-1.5 space-y-1 text-zinc-300">
                    <p className="font-medium text-zinc-100">{field.label}</p>
                    <p className="text-[12px] text-zinc-500">
                      clé <code className="text-zinc-400">{String(field.key)}</code> · type {field.type}
                      {field.required && <span className="text-amber-500"> · requis</span>}
                    </p>
                    {field.hint && <p className="text-[12px] text-zinc-500">{field.hint}</p>}
                  </div>
                ) : (
                  <p className="mt-1 text-zinc-500">Cliquez un champ du canevas.</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">API</p>
                <p className="mt-1 text-[12px] text-zinc-400">
                  <code>{config.apiBasePath}</code> · id: <code>{config.idField}</code>
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'validation',
        label: 'Validation',
        render: (draft) => {
          const v = validate(draft);
          return (
            <ul className="space-y-1.5">
              {requiredFields.map((f) => {
                const ok = filled(draft[f.key]);
                return (
                  <li key={String(f.key)} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] hover:bg-zinc-900/60">
                    <span className={ok ? 'text-zinc-400' : 'text-zinc-200'}>{f.label}</span>
                    <span className={ok ? 'text-emerald-500' : 'text-amber-500'}>{ok ? '✓' : 'requis'}</span>
                  </li>
                );
              })}
              {v.ok && (
                <li className="mt-2 rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-[12px] text-emerald-400">
                  Prêt à publier. La validation finale (DTO NestJS) s'exécute côté backend.
                </li>
              )}
            </ul>
          );
        },
      },
    ],
    relations,
    previews: [
      {
        id: 'public',
        label: 'Site public',
        render: (draft) => <PublicPreview draft={draft} opts={opts.preview ?? { titleKeys: [config.fields[0]?.key].filter(Boolean) as (keyof T)[] }} />,
      },
    ],
    publishing: { validate },
    persistence: {
      load: async (id) => ({ ...config.emptyRecord(), ...(await api.get(id)) }),
      saveDraft: async (id, draft) => { await api.update(id, draft as Partial<T>); },
      publish: async (id, draft) => {
        const payload = { ...(draft as Partial<T>), ...(config.publishOverrides ?? {}) };
        const saved = id ? await api.update(id, payload) : await api.create(payload);
        return { id: api.idOf(saved) };
      },
    },
  };
}