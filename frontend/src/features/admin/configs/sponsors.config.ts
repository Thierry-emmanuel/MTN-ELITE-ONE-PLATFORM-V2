import type { EntityConfig } from '../engine/entityConfig.types';

export interface Sponsor {
  id?: string;
  name: string;
  logoUrl?: string;
  tier: 'TITLE' | 'GOLD' | 'SILVER' | 'PARTNER';
  websiteUrl?: string;
  contactEmail?: string;
  contractStart?: string;
  contractEnd?: string;
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
    { key: 'tier', label: 'Niveau de sponsoring' },
  ],
  fields: [
    { key: 'name', label: 'Nom du sponsor', type: 'text', required: true, span: 2 },
    {
      key: 'tier', label: 'Niveau', type: 'select', required: true, span: 1,
      options: [
        { value: 'TITLE', label: 'Sponsor Titre' },
        { value: 'GOLD', label: 'Partenaire Or' },
        { value: 'SILVER', label: 'Partenaire Argent' },
        { value: 'PARTNER', label: 'Partenaire Officiel' },
      ],
    },
    { key: 'websiteUrl', label: 'Site internet', type: 'text', span: 1 },
    { key: 'contactEmail', label: 'Email Contact', type: 'text', span: 1 },
    { key: 'contractStart', label: 'Début Contrat', type: 'date', span: 1 },
    { key: 'contractEnd', label: 'Fin Contrat', type: 'date', span: 1 },
    {
      key: 'logoUrl', label: 'Logo', type: 'media-image', span: 2,
      uploadScope: { entity: 'sponsors', field: 'logo' },
    },
  ],
  emptyRecord: () => ({
    name: '', tier: 'PARTNER',
  }),
  builderSteps: [
    {
      id: 'details',
      label: 'Détails',
      description: 'Nom, niveau de sponsoring et contact.',
      fieldKeys: ['name', 'tier', 'websiteUrl', 'contactEmail'],
    },
    {
      id: 'contract',
      label: 'Contrat',
      description: 'Dates de validité du sponsoring.',
      fieldKeys: ['contractStart', 'contractEnd'],
    },
    {
      id: 'logo',
      label: 'Logo',
      description: 'Logo officiel du sponsor.',
      fieldKeys: ['logoUrl'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez le sponsor avant de l\'enregistrer.',
      fieldKeys: [],
    },
  ],
};
