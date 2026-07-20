import type { EntityConfig } from '../engine/entityConfig.types';
import { clubsLookup, playersLookup } from '../lookups/sharedLookups';

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
  lookups: [playersLookup, clubsLookup],
  columns: [
    {
      key: 'playerName',
      label: 'Joueur',
      render: (r: Transfer, lookups?: any) => {
        const playerOpt = lookups?.players?.find((p: any) => String(p.value) === String(r.playerId));
        return (
          <div className="flex items-center gap-2">
            {playerOpt?.photoUrl ? (
              <img src={playerOpt.photoUrl} alt={r.playerName} className="h-6 w-6 object-cover rounded-full bg-white/5 border border-white/10" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                J
              </div>
            )}
            <span>{r.playerName || playerOpt?.label || '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'toClubId',
      label: 'Vers',
      render: (r: Transfer, lookups?: any) => {
        const clubOpt = lookups?.clubs?.find((c: any) => String(c.value) === String(r.toClubId));
        return (
          <div className="flex items-center gap-2">
            {clubOpt?.logoUrl ? (
              <img src={clubOpt.logoUrl} alt={clubOpt.label} className="h-6 w-6 object-contain rounded bg-white/5 p-0.5" />
            ) : (
              <div className="h-6 w-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                C
              </div>
            )}
            <span>{clubOpt?.label || '—'}</span>
          </div>
        );
      },
    },
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
  builderSteps: [
    {
      id: 'involved',
      label: 'Acteurs',
      description: 'Joueur concerné et clubs de départ / destination.',
      fieldKeys: ['playerId', 'fromClubId', 'toClubId'],
    },
    {
      id: 'terms',
      label: 'Modalités',
      description: 'Type de transfert, montant de l\'indemnité, date et fenêtre.',
      fieldKeys: ['type', 'fee', 'windowLabel', 'transferDate', 'announced'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez la fiche de transfert avant de la valider.',
      fieldKeys: [],
    },
  ],
};
