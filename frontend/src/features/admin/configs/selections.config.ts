import type { EntityConfig } from '../engine/entityConfig.types';

export interface Selection {
  _id?: string;
  campaignLabel: string;     // e.g. "CAN 2027 - Qualifications J4"
  squadDate: string;         // ISO date of squad announcement
  playerIds: string[];
  coachName?: string;
  status: 'PROVISIONAL' | 'FINAL';
  notes?: string;
}

export const selectionsConfig: EntityConfig<Selection> = {
  name: 'selections',
  labelSingular: 'Sélection',
  labelPlural: 'Sélections Lions Indomptables',
  apiBasePath: '/selections',
  idField: '_id',
  columns: [
    { key: 'campaignLabel', label: 'Campagne' },
    { key: 'squadDate', label: 'Date' },
    { key: 'status', label: 'Statut' },
  ],
  fields: [
    { key: 'campaignLabel', label: 'Libellé de la campagne', type: 'text', required: true, span: 2 },
    { key: 'squadDate', label: "Date d'annonce", type: 'date', required: true },
    {
      key: 'status', label: 'Statut', type: 'select', required: true,
      options: [
        { value: 'PROVISIONAL', label: 'Liste provisoire' },
        { value: 'FINAL', label: 'Liste définitive' },
      ],
    },
    { key: 'coachName', label: 'Sélectionneur', type: 'text' },
    { key: 'playerIds', label: 'Joueurs convoqués', type: 'tags', hint: 'IDs ou noms séparés, gérés via le multi-select joueur', span: 2 },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({
    squadDate: new Date().toISOString().slice(0, 10), status: 'PROVISIONAL', playerIds: [],
  }),
};