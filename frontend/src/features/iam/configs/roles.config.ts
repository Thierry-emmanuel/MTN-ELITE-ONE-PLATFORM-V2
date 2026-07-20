import type { EntityConfig } from '@/features/admin/engine/entityConfig.types';
import type { IamRole } from '../iam.types';

/** Row shape for the generic engine (id addressed; key kept for display). */
export type RoleRow = IamRole & { id?: string };

/**
 * Roles — Role Builder config. The table/list view runs through the generic
 * EntityCrudEngine; the builder surface swaps in the bespoke RoleCanvas
 * (permission matrix + field policies), same pattern as the Match Builder.
 */
export const rolesConfig: EntityConfig<RoleRow> = {
  name: 'roles',
  labelSingular: 'Rôle',
  labelPlural: 'Rôles',
  apiBasePath: '/iam/roles',
  idField: 'id',
  searchableKeys: ['key', 'name'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'key', label: 'Clé' },
    { key: 'permissions', label: 'Permissions', render: (r) => `${(r.permissions ?? []).length}` },
    { key: 'version', label: 'Version', render: (r) => `v${r.version ?? 1}` },
    {
      key: 'status', label: 'Statut',
      render: (r) => `${r.status === 'archived' ? 'Archivé' : 'Actif'}${r.isSystem ? ' · système' : ''}${r.isDefault ? ' · défaut' : ''}`,
    },
  ],
  fields: [
    { key: 'name', label: 'Nom du rôle', type: 'text', required: true, span: 1 },
    { key: 'key', label: 'Clé (machine)', type: 'text', required: true, span: 1, hint: 'minuscules, sans espaces — ex: journalist' },
    { key: 'description', label: 'Description', type: 'textarea', span: 2 },
    { key: 'isDefault', label: 'Rôle par défaut des nouveaux comptes', type: 'switch', span: 1 },
    // permissions & fieldPolicies are edited by the RoleCanvas matrix,
    // but must be declared so entityApi forwards them on save.
  ],
  extraPersistKeys: ['permissions', 'fieldPolicies'],
  emptyRecord: () => ({
    name: '', key: '', description: '',
    permissions: [], fieldPolicies: {}, isDefault: false,
  }),
  builderSteps: [
    { id: 'identity', label: 'Identité', description: 'Nom, clé et description du rôle', fieldKeys: ['name', 'key', 'description', 'isDefault'] },
  ],
};
