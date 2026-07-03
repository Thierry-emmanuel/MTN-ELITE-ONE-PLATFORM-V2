import type { EntityConfig } from '../engine/entityConfig.types';

export interface Equipment {
  id?: string;
  name: string;
  type: 'JERSEY_HOME' | 'JERSEY_AWAY' | 'BALL' | 'TRAINING_KIT' | 'OTHER';
  brand: string;
  imageUrl?: string;
  clubId?: string;
}

export const equipmentsConfig: EntityConfig<Equipment> = {
  name: 'equipments',
  labelSingular: 'Équipement',
  labelPlural: 'Équipements',
  apiBasePath: '/equipments',
  idField: 'id',
  searchableKeys: ['name', 'brand'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'brand', label: 'Marque' },
  ],
  fields: [
    { key: 'name', label: "Nom de l'équipement", type: 'text', required: true, span: 2 },
    {
      key: 'type', label: 'Type', type: 'select', required: true, span: 1,
      options: [
        { value: 'JERSEY_HOME', label: 'Maillot Domicile' },
        { value: 'JERSEY_AWAY', label: 'Maillot Extérieur' },
        { value: 'BALL', label: 'Ballon officiel' },
        { value: 'TRAINING_KIT', label: "Kit d'entraînement" },
        { value: 'OTHER', label: 'Autre' },
      ],
    },
    { key: 'brand', label: 'Marque', type: 'text', required: true, span: 1 },
    { key: 'clubId', label: 'Club associé', type: 'select', optionsKey: 'clubs', span: 2 },
    {
      key: 'imageUrl', label: "Image de l'équipement", type: 'media-image', span: 2,
      uploadScope: { entity: 'equipments', field: 'image' },
    },
  ],
  emptyRecord: () => ({
    name: '', type: 'JERSEY_HOME', brand: '',
  }),
};
