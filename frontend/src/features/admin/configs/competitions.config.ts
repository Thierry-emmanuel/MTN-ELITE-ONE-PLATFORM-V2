import type { EntityConfig } from '../engine/entityConfig.types';

export interface Competition {
  id?: string;
  name: string;
  type: 'LEAGUE' | 'CUP' | 'QUALIFIER';
  country: string;
  tier: number;
  logoUrl?: string;
}

export const competitionsConfig: EntityConfig<Competition> = {
  name: 'competitions',
  labelSingular: 'Compétition',
  labelPlural: 'Compétitions',
  apiBasePath: '/competitions',
  idField: 'id',
  searchableKeys: ['name'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'country', label: 'Pays' },
    { key: 'tier', label: 'Division' },
  ],
  fields: [
    { key: 'name', label: 'Nom de la compétition', type: 'text', required: true, span: 2 },
    {
      key: 'type', label: 'Type', type: 'select', required: true, span: 1,
      options: [
        { value: 'LEAGUE', label: 'Championnat (Ligue)' },
        { value: 'CUP', label: 'Coupe' },
        { value: 'QUALIFIER', label: 'Qualifications' },
      ],
    },
    { key: 'country', label: 'Code Pays (ISO-2)', type: 'text', required: true, span: 1, hint: 'Ex: CM' },
    { key: 'tier', label: 'Division (Niveau)', type: 'number', required: true, span: 1, hint: 'Ex: 1' },
    {
      key: 'logoUrl', label: 'Logo', type: 'media-image', span: 2,
      uploadScope: { entity: 'competitions', field: 'logo' },
    },
  ],
  emptyRecord: () => ({
    name: '', type: 'LEAGUE', country: 'CM', tier: 1,
  }),
  builderSteps: [
    {
      id: 'details',
      label: 'Détails',
      description: 'Nom, type, division et localisation de la compétition.',
      fieldKeys: ['name', 'type', 'country', 'tier'],
    },
    {
      id: 'logo',
      label: 'Logo',
      description: 'Téléchargez le logo officiel de la compétition.',
      fieldKeys: ['logoUrl'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez les informations saisies.',
      fieldKeys: [],
    },
  ],
};
