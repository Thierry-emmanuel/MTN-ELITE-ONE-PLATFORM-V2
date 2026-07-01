import type { EntityConfig } from '../engine/entityConfig.types';

export interface Transfer {
  id?: string;
  playerId: string;
  playerName?: string;
  fromClubId?: string;
  toClubId: string;
  type: 'PERMANENT' | 'LOAN' | 'FREE' | 'RETURN_FROM_LOAN';
  fee?: number;
  windowLabel: string;     // e.g. "Hiver 2025-26"
  transferDate: string;    // ISO date
  announced: boolean;
}

export const transfersConfig: EntityConfig<Transfer> = {
  name: 'transfers',
  labelSingular: 'Transfert',
  labelPlural: 'Transferts',
  apiBasePath: '/transfers',
  idField: 'id',
  columns: [
    { key: 'playerName', label: 'Joueur' },
    { key: 'toClubId', label: 'Vers' },
    { key: 'type', label: 'Type' },
    { key: 'transferDate', label: 'Date' },
  ],
  fields: [
    { key: 'playerId', label: 'Joueur', type: 'select', optionsKey: 'players', required: true, span: 2 },
    { key: 'fromClubId', label: 'Club de départ', type: 'select', optionsKey: 'clubs' },
    { key: 'toClubId', label: 'Club de destination', type: 'select', optionsKey: 'clubs', required: true },
    {
      key: 'type', label: 'Type de transfert', type: 'select', required: true,
      options: [
        { value: 'PERMANENT', label: 'Définitif' },
        { value: 'LOAN', label: 'Prêt' },
        { value: 'FREE', label: 'Libre' },
        { value: 'RETURN_FROM_LOAN', label: 'Retour de prêt' },
      ],
    },
    { key: 'fee', label: 'Indemnité (FCFA)', type: 'number' },
    { key: 'windowLabel', label: 'Fenêtre de transfert', type: 'text', required: true },
    { key: 'transferDate', label: 'Date du transfert', type: 'date', required: true },
    { key: 'announced', label: 'Annoncé publiquement', type: 'switch' },
  ],
  emptyRecord: () => ({
    type: 'PERMANENT', windowLabel: '', transferDate: new Date().toISOString().slice(0, 10), announced: false,
  }),
};