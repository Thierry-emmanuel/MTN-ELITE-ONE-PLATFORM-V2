import type { EntityConfig } from '../engine/entityConfig.types';

export interface Sponsor {
  id?: string;
  name: string;
  logoUrl?: string;
  type: 'TITLE' | 'GOLD' | 'SILVER' | 'PARTNER';
  websiteUrl?: string;
}

export const sponsorsConfig: EntityConfig<Sponsor> = {
  name: 'sponsors',
  labelSingular: 'Sponsor',
  labelPlural: 'Sponsors',
  apiBasePath: '/sponsors',
  idField: 'id',
  searchableKeys: ['name'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Niveau de sponsoring' },
  ],
  fields: [
    { key: 'name', label: 'Nom du sponsor', type: 'text', required: true, span: 2 },
    {
      key: 'type', label: 'Niveau', type: 'select', required: true, span: 1,
      options: [
        { value: 'TITLE', label: 'Sponsor Titre' },
        { value: 'GOLD', label: 'Partenaire Or' },
        { value: 'SILVER', label: 'Partenaire Argent' },
        { value: 'PARTNER', label: 'Partenaire Officiel' },
      ],
    },
    { key: 'websiteUrl', label: 'Site internet', type: 'text', span: 1 },
    {
      key: 'logoUrl', label: 'Logo', type: 'media-image', span: 2,
      uploadScope: { entity: 'sponsors', field: 'logo' },
    },
  ],
  emptyRecord: () => ({
    name: '', type: 'PARTNER',
  }),
};
