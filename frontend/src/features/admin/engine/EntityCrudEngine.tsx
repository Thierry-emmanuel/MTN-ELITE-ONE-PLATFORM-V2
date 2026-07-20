import { useState, memo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import {
  AdminCard, AdminButton, DataTable,
  SectionHeader,
} from '@/components/ui/AdminUI';
import { createEntityHooks } from '../hooks/useEntityCrud';
import { renderEntityField } from './renderField';
import type { EntityConfig, SelectOption } from './entityConfig.types';
import { WorkflowActionBar } from '@/shell/components/WorkflowActionBar';
import { exportEntity } from '@/services/exportApi';

interface Props<T extends { id?: string; _id?: string }> {
  config: EntityConfig<T>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  /** resolved lookup options (clubs, players, seasons...) keyed by LookupSource.key */
  lookupOptions?: Record<string, SelectOption[]>;
  /** When the config has `builderSteps`, "Nouveau X" opens the guided
   *  builder instead of the flat form. Parent (AdminPage) owns builder
   *  routing since it needs to render GuidedBuilderEngine full-screen. */
  onOpenBuilder?: (record: Partial<T>) => void;
}

function EntityCrudEngineInner<T extends { id?: string; _id?: string }>({
  config, showToast, lookupOptions = {}, onOpenBuilder,
}: Props<T>) {
  const { useList, useMutations } = createEntityHooks(config);
  const { data = [], isLoading } = useList();
  const { create, update, remove, isSaving } = useMutations();

  const [editing, setEditing] = useState<Partial<T> | null>(null);
  // Use explicit null/undefined check so integer id=0 doesn't falsely mark as new.
  const isNew = editing !== null && (
    (editing as any).id == null && (editing as any)._id == null
  );

  const idOf = (row: T): string =>
    String(config.idField === '_id' ? row._id! : row.id!);

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
          <div className="flex items-center gap-2">
            <AdminButton variant="secondary" onClick={() => exportEntity(config.name, 'csv')}>
              Exporter CSV
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => exportEntity(config.name, 'json')}>
              Exporter JSON
            </AdminButton>
            {config.builderSteps && onOpenBuilder ? (
              <AdminButton onClick={() => onOpenBuilder(config.emptyRecord())}>
                <Sparkles className="h-3.5 w-3.5" /> Nouveau {config.labelSingular.toLowerCase()}
              </AdminButton>
            ) : (
              <AdminButton onClick={() => setEditing(config.emptyRecord())}>
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </AdminButton>
            )}
          </div>
        }
      />

      {editing && (
        <AdminCard title={isNew ? `Nouveau ${config.labelSingular}` : `Modifier ${config.labelSingular}`} accent>
          <div className="space-y-4">
            {!isNew && config.workflow && (
              <WorkflowActionBar
                entity={config.name}
                id={idOf(editing as T)}
                currentStatus={(editing as any)[config.workflow.statusField] || ''}
                allowedTransitions={(() => {
                  const currentStatus = (editing as any)[config.workflow.statusField] || 'draft';
                  const t = (config.workflow.transitions as Record<string, string[]>)[currentStatus.toLowerCase()] || [];
                  return t.map((s: string) => s.toUpperCase());
                })()}
                refetch={() => {
                  setEditing(null);
                }}
                showToast={showToast}
              />
            )}
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              {config.fields.map((field) => {
                const value = (editing as Record<string, unknown>)[field.key as string] ?? '';
                const onChange = (v: unknown) =>
                  setEditing((prev) => ({ ...(prev as T), [field.key]: v }));
                const wrapClass = field.span === 2 ? 'col-span-2' : field.span === 3 ? 'col-span-3' : '';
                return renderEntityField(field, value, onChange, lookupOptions, wrapClass);
              })}
              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-stone-200">
                <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
                <AdminButton type="submit" loading={isSaving}>Sauvegarder</AdminButton>
              </div>
            </form>
          </div>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={config.columns.map((c) => ({
            key: c.key as string,
            label: c.label,
            align: c.align,
            render: c.render
              ? (r: T) => c.render!(r, lookupOptions)
              : c.optionsKey
                ? (r: T) => {
                    const v = (r as Record<string, unknown>)[c.key as string];
                    const opt = lookupOptions[c.optionsKey!]?.find((o) => String(o.value) === String(v));
                    return opt?.label ?? String(v ?? '—');
                  }
                : undefined,
          }))}
          data={data}
          keyField={config.idField}
          onEdit={(r: T) => (config.builderSteps && onOpenBuilder ? onOpenBuilder(r) : setEditing(r))}
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