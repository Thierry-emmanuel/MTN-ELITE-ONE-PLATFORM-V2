import { useState, memo } from 'react';
import { Plus } from 'lucide-react';
import {
  AdminCard, FormField, AdminButton, DataTable,
  SectionHeader, MediaUploader,
} from '@/components/ui/AdminUI';
import { RichTextEditor } from '../components/RichTextEditor';
import { createEntityHooks } from '../hooks/useEntityCrud';
import type { EntityConfig, SelectOption } from './entityConfig.types';

interface Props<T extends { id?: string; _id?: string }> {
  config: EntityConfig<T>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  /** resolved lookup options (clubs, players, seasons...) keyed by LookupSource.key */
  lookupOptions?: Record<string, SelectOption[]>;
}

function EntityCrudEngineInner<T extends { id?: string; _id?: string }>({
  config, showToast, lookupOptions = {},
}: Props<T>) {
  const { useList, useMutations } = createEntityHooks(config);
  const { data = [], isLoading } = useList();
  const { create, update, remove, isSaving } = useMutations();

  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const isNew = editing && !editing.id && !editing._id;

  const idOf = (row: T) => (config.idField === '_id' ? row._id! : row.id!);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const action = isNew
      ? create.mutateAsync(editing)
      : update.mutateAsync({ id: idOf(editing as T), payload: editing });

    action
      .then(() => {
        setEditing(null);
        showToast(isNew ? `${config.labelSingular} créé.` : `${config.labelSingular} mis à jour.`);
      })
      .catch(() => showToast(`Erreur lors de l'enregistrement.`, 'error'));
  };

  const handleDelete = (row: T) => {
    if (!window.confirm(`Supprimer ce(tte) ${config.labelSingular.toLowerCase()} ?`)) return;
    remove.mutate(idOf(row), {
      onSuccess: () => showToast(`${config.labelSingular} supprimé.`),
      onError: () => showToast('Erreur lors de la suppression.', 'error'),
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title={config.labelPlural}
        subtitle={`Gérez l'ensemble des ${config.labelPlural.toLowerCase()} de la plateforme`}
        actions={
          <AdminButton onClick={() => setEditing(config.emptyRecord())}>
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </AdminButton>
        }
      />

      {editing && (
        <AdminCard title={isNew ? `Nouveau ${config.labelSingular}` : `Modifier ${config.labelSingular}`} accent>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            {config.fields.map((field) => {
              const value = (editing as Record<string, unknown>)[field.key as string] ?? '';
              const onChange = (v: unknown) =>
                setEditing((prev) => ({ ...(prev as T), [field.key]: v }));
              const wrapClass = field.span === 2 ? 'col-span-2' : field.span === 3 ? 'col-span-3' : '';

              if (field.type === 'richtext') {
                return (
                  <div key={String(field.key)} className={wrapClass || 'col-span-2'}>
                    <RichTextEditor label={field.label} value={value as string} onChange={onChange} />
                  </div>
                );
              }

              if (field.type === 'media-image' || field.type === 'media-video') {
                return (
                  <div key={String(field.key)} className={wrapClass}>
                    <MediaUploader
                      label={field.label}
                      value={value as string}
                      onChange={onChange}
                      acceptType={field.type === 'media-video' ? 'video' : 'image'}
                      hint={field.hint}
                      // NEW: pass uploadUrl through so MediaUploader can POST
                      // to /uploads/:entity/:field instead of the flat legacy
                      // endpoint. Requires MediaUploader to accept this prop
                      // (small addition to AdminUI.tsx — see notes in chat).
                      uploadUrl={
                        field.uploadScope
                          ? `/uploads/${field.uploadScope.entity}/${field.uploadScope.field}`
                          : '/uploads/file'
                      }
                    />
                  </div>
                );
              }

              // ── NEW: nested-object rendering (achievements, socialMedia) ──
              // Renders a labeled mini sub-form, writes the result back as a
              // single object under field.key rather than flat keys.
              if (field.type === 'nested-object') {
                const objValue = (value as Record<string, unknown>) || {};
                const sub = field.subFields ?? [];
                return (
                  <div key={String(field.key)} className={wrapClass || 'col-span-2'}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-2">
                      {field.label}
                    </p>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-stone-200 bg-stone-50">
                      {sub.map((s) => (
                        <FormField
                          key={s.key}
                          label={s.label}
                          type={s.type}
                          value={(objValue[s.key] as string | number) ?? ''}
                          onChange={(v) => onChange({ ...objValue, [s.key]: v })}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              if (field.type === 'color') {
                return (
                  <div key={String(field.key)} className={wrapClass}>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(value as string) || '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-9 w-9 rounded border border-stone-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={(value as string) || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#007A5E"
                        className="flex-1 text-xs rounded border border-stone-300 px-2 py-2"
                      />
                    </div>
                  </div>
                );
              }

              const options = field.optionsKey ? lookupOptions[field.optionsKey] : field.options;
              return (
                <div key={String(field.key)} className={wrapClass}>
                  <FormField
                    label={field.label}
                    type={field.type as 'text' | 'textarea' | 'number' | 'select' | 'date'}
                    value={value as string | number}
                    onChange={onChange}
                    options={options}
                    required={field.required}
                    hint={field.hint}
                  />
                </div>
              );
            })}
            <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-stone-200">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={isSaving}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={config.columns.map((c) => ({
            key: c.key as string,
            label: c.label,
            align: c.align,
            render: c.render ? (r: T) => c.render!(r) : undefined,
          }))}
          data={data}
          keyField={config.idField}
          onEdit={(r: T) => setEditing(r)}
          onDelete={handleDelete}
          loading={isLoading}
          emptyMessage={`Aucun(e) ${config.labelSingular.toLowerCase()} pour le moment.`}
        />
      </AdminCard>
    </div>
  );
}

// memoised per skill 03 — avoids re-render storms when sibling tabs update
export const EntityCrudEngine = memo(EntityCrudEngineInner) as typeof EntityCrudEngineInner;