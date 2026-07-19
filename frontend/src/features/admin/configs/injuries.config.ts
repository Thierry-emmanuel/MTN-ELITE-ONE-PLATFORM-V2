import type { EntityConfig } from '../engine/entityConfig.types';
import { clubsLookup, playersLookup } from '../lookups/sharedLookups';

export interface Injury {
  id?: string;
  playerId: string;
  playerName?: string;
  type: string;             // e.g. "Entorse de la cheville"
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  status: 'ACTIVE' | 'RECOVERING' | 'CLEARED';
  injuredAt: string;        // ISO date
  expectedReturn?: string;  // ISO date
  notes?: string;
}

export const injuriesConfig: EntityConfig<Injury> = {
  name: 'injuries',
  labelSingular: 'Blessure',
  labelPlural: 'Blessures',
  apiBasePath: '/injuries',
  idField: 'id',
  lookups: [playersLookup, clubsLookup],
  columns: [
    { key: 'playerName', label: 'Joueur' },
    { key: 'type', label: 'Blessure' },
    { key: 'severity', label: 'Gravité' },
    { key: 'status', label: 'Statut' },
    { key: 'expectedReturn', label: 'Retour prévu' },
  ],
  fields: [
    { key: 'playerId', label: 'Joueur', type: 'select', optionsKey: 'players', required: true, span: 2 },
    { key: 'type', label: "Type de blessure", type: 'text', required: true },
    {
      key: 'severity', label: 'Gravité', type: 'select', required: true,
      options: [
        { value: 'MINOR', label: 'Légère' },
        { value: 'MODERATE', label: 'Modérée' },
        { value: 'SEVERE', label: 'Grave' },
      ],
    },
    {
      key: 'status', label: 'Statut', type: 'select', required: true,
      options: [
        { value: 'ACTIVE', label: 'En cours' },
        { value: 'RECOVERING', label: 'En réathlétisation' },
        { value: 'CLEARED', label: 'Rétabli' },
      ],
    },
    { key: 'injuredAt', label: 'Date de blessure', type: 'date', required: true },
    { key: 'expectedReturn', label: 'Retour prévu', type: 'date' },
    { key: 'notes', label: 'Notes médicales', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({
    severity: 'MINOR', status: 'ACTIVE', injuredAt: new Date().toISOString().slice(0, 10),
  }),
  builderSteps: [
    {
      id: 'general',
      label: 'Général',
      description: 'Quel joueur est blessé, quel type de blessure et quelle gravité ?',
      fieldKeys: ['playerId', 'type', 'severity'],
    },
    {
      id: 'timeline',
      label: 'Statut & Chronologie',
      description: 'Dates de blessure, retour prévu et notes médicales.',
      fieldKeys: ['status', 'injuredAt', 'expectedReturn', 'notes'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez la fiche médicale avant publication.',
      fieldKeys: [],
    },
  ],
};