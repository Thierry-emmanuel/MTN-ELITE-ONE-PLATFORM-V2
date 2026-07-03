import type { EntityConfig } from '../engine/entityConfig.types';

export interface Stadium {
  id?: string;
  name: string;
  city: string;
  capacity: number;
  photoUrl?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  clubId?: string;
}

export const stadiumsConfig: EntityConfig<Stadium> = {
  name: 'stadiums',
  labelSingular: 'Stade',
  labelPlural: 'Stades',
  apiBasePath: '/stadiums',
  idField: 'id',
  searchableKeys: ['name', 'city'],
  columns: [
    { key: 'name', label: 'Stade' },
    { key: 'city', label: 'Ville' },
    { key: 'capacity', label: 'Capacité', render: (r) => r.capacity ? Number(r.capacity).toLocaleString() : '—' },
    { key: 'status', label: 'Statut' },
  ],
  fields: [
    { key: 'name', label: 'Nom du stade', type: 'text', required: true, span: 2 },
    { key: 'city', label: 'Ville', type: 'text', required: true, span: 1 },
    { key: 'capacity', label: 'Capacité', type: 'number', required: true, span: 1 },
    {
      key: 'status', label: 'Statut de disponibilité', type: 'select', required: true, span: 1,
      options: [
        { value: 'ACTIVE', label: 'Disponible / Actif' },
        { value: 'MAINTENANCE', label: 'En maintenance' },
        { value: 'CLOSED', label: 'Fermé' },
      ],
    },
    { key: 'clubId', label: 'Club résident', type: 'select', optionsKey: 'clubs', span: 1 },
    {
      key: 'photoUrl', label: 'Photo du stade', type: 'media-image', span: 2,
      uploadScope: { entity: 'stadiums', field: 'photo' },
    },
  ],
  emptyRecord: () => ({
    name: '', city: '', capacity: 20000, status: 'ACTIVE',
  }),
};
