import type { EntityConfig } from '@/features/admin/engine/entityConfig.types';
import { iamApi } from '../iam.api';
import type { IamOrganization } from '../iam.types';

export type OrganizationRow = IamOrganization & { id?: string };

const TYPE_LABELS: Record<string, string> = {
  FEDERATION: 'Fédération',
  DEPARTMENT: 'Département',
  COMMITTEE: 'Commission',
  REGIONAL_LEAGUE: 'Ligue régionale',
  TEAM: 'Équipe',
};

/**
 * Organizations — federation structure builder. Parent selection is a
 * dynamic lookup on the organizations themselves (self-referencing tree),
 * resolved by the existing useEntityLookups() engine.
 */
export const organizationsConfig: EntityConfig<OrganizationRow> = {
  name: 'organizations',
  labelSingular: 'Organisation',
  labelPlural: 'Organisations',
  apiBasePath: '/iam/organizations',
  idField: 'id',
  searchableKeys: ['name'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type', render: (o) => TYPE_LABELS[o.type] ?? o.type },
    { key: 'parentId', label: 'Parent', optionsKey: 'parentOrgs' },
    { key: 'status', label: 'Statut', render: (o) => (o.status === 'archived' ? 'Archivée' : 'Active') },
  ],
  fields: [
    { key: 'name', label: 'Nom', type: 'text', required: true, span: 1 },
    {
      key: 'type', label: 'Type', type: 'select', required: true, span: 1,
      options: Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
    },
    { key: 'parentId', label: 'Organisation parente', type: 'select', span: 1, optionsKey: 'parentOrgs' },
    { key: 'description', label: 'Description', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({ name: '', type: 'DEPARTMENT', parentId: null, description: '' }),
  lookups: [
    {
      key: 'parentOrgs',
      queryKey: ['iam', 'organizations', 'lookup'],
      fetch: async () => {
        const orgs = await iamApi.organizations.list();
        return orgs.map((o) => ({ value: String(o.id), label: `${o.name} (${TYPE_LABELS[o.type] ?? o.type})` }));
      },
    },
  ],
  builderSteps: [
    { id: 'identity', label: 'Identité', description: 'Nom et type de la structure', fieldKeys: ['name', 'type'] },
    { id: 'hierarchy', label: 'Hiérarchie', description: 'Position dans la fédération', fieldKeys: ['parentId', 'description'] },
  ],
};
