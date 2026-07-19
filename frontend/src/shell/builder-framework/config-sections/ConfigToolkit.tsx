/**
 * Configuration toolkit — Phase 5.
 * Renders OS-level settings stored in an entity's `config` JSONB blob.
 *
 * - ConfigGrid: dotted-path field definitions rendered through the SAME
 *   renderEntityField as every other form in the platform (no duplicated
 *   inputs, selects or switches).
 * - RowsEditor: generic structured-list editor (transfer windows, prize
 *   distribution, officials payments…) with optional reordering — one
 *   component, many settings.
 * - MultiCheckEditor: pick-many from real lookup options (participating
 *   clubs, season referees, enabled awards).
 */
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { renderEntityField } from '@/features/admin/engine/renderField';
import type { FieldDef } from '@/features/admin/engine/entityConfig.types';

// ── dotted-path helpers ─────────────────────────────────────────────────────
export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<any>((acc, k) => (acc == null ? undefined : acc[k]), obj);
}
export function setPath<T extends object>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const clone: any = { ...obj };
  let cur = clone;
  keys.slice(0, -1).forEach((k) => { cur[k] = { ...(cur[k] ?? {}) }; cur = cur[k]; });
  cur[keys[keys.length - 1]] = value;
  return clone;
}

// ── ConfigGrid ──────────────────────────────────────────────────────────────
export interface ConfigFieldDef extends Omit<FieldDef<any>, 'key'> {
  /** Dotted path inside the draft, e.g. `config.regulations.pointsSystem.win`. */
  path: string;
}

export function ConfigGrid<T extends object>({ defs, draft, onChange, onSelect }: {
  defs: ConfigFieldDef[];
  draft: T;
  onChange: (next: T) => void;
  onSelect?: (sel: { kind: string; ref: string; label: string }) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
      {defs.map((def) => {
        const field = { ...def, key: def.path } as unknown as FieldDef<any>;
        return (
          <div
            key={def.path}
            className={def.span === 1 ? 'md:col-span-1' : 'md:col-span-2'}
            onFocusCapture={() => onSelect?.({ kind: 'field', ref: def.path, label: def.label })}
          >
            {renderEntityField(
              field,
              getPath(draft, def.path),
              (v) => onChange(setPath(draft, def.path, v)),
              {},
              'w-full',
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── RowsEditor ──────────────────────────────────────────────────────────────
export interface RowColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  width?: string;
}

export function RowsEditor({ label, hint, columns, value = [], onChange, reorderable, addLabel = 'Ajouter' }: {
  label: string;
  hint?: string;
  columns: RowColumn[];
  value?: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
  reorderable?: boolean;
  addLabel?: string;
}) {
  const update = (i: number, key: string, v: unknown) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const inputCls = 'h-8 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[13px] text-zinc-200 outline-none focus:border-emerald-700';

  return (
    <div>
      <p className="mb-1 text-[12px] font-medium text-zinc-300">{label}</p>
      {hint && <p className="mb-2 text-[11px] text-zinc-600">{hint}</p>}
      <div className="space-y-1.5">
        {value.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {reorderable && (
              <span className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} className="text-zinc-700 hover:text-zinc-300"><ArrowUp className="size-3" /></button>
                <button type="button" onClick={() => move(i, 1)} className="text-zinc-700 hover:text-zinc-300"><ArrowDown className="size-3" /></button>
              </span>
            )}
            {columns.map((c) => c.type === 'select' ? (
              <select key={c.key} value={String(row[c.key] ?? '')} onChange={(e) => update(i, c.key, e.target.value)}
                className={cn(inputCls, c.width)}>
                <option value="">—</option>
                {c.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input key={c.key} type={c.type} value={String(row[c.key] ?? '')} placeholder={c.label}
                onChange={(e) => update(i, c.key, c.type === 'number' ? Number(e.target.value) : e.target.value)}
                className={cn(inputCls, c.width)} />
            ))}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="rounded p-1 text-zinc-700 hover:bg-zinc-900 hover:text-red-400" aria-label="Retirer">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button type="button"
        onClick={() => onChange([...value, Object.fromEntries(columns.map((c) => [c.key, c.type === 'number' ? 0 : '']))])}
        className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-800 px-3 py-1.5 text-[12px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200">
        <Plus className="size-3.5" /> {addLabel}
      </button>
    </div>
  );
}

// ── MultiCheckEditor ────────────────────────────────────────────────────────
export function MultiCheckEditor({ label, hint, options, value = [], onChange, columns = 2 }: {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  value?: string[];
  onChange: (values: string[]) => void;
  columns?: 1 | 2 | 3;
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div>
      <p className="mb-1 text-[12px] font-medium text-zinc-300">{label}</p>
      {hint && <p className="mb-2 text-[11px] text-zinc-600">{hint}</p>}
      {options.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-3 text-[12px] text-zinc-600">
          Aucune option — créez d'abord les enregistrements correspondants.
        </p>
      ) : (
        <ul className={cn('grid gap-1', columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
          {options.map((o) => (
            <li key={o.value}>
              <button type="button" onClick={() => toggle(o.value)}
                className={cn('flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition-colors',
                  value.includes(o.value)
                    ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200')}>
                <span className={cn('grid size-3.5 shrink-0 place-items-center rounded border text-[9px]',
                  value.includes(o.value) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-700')}>
                  {value.includes(o.value) ? '✓' : ''}
                </span>
                <span className="truncate">{o.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
