import type { EntityConfig } from '../engine/entityConfig.types';
import { clubsLookup, playersLookup } from '../lookups/sharedLookups';

export interface Injury {
  id?: string;
  playerId: string;
  playerName?: string;
  type: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  status: 'ACTIVE' | 'RECOVERING' | 'CLEARED';
  injuredAt: string;
  expectedReturn?: string;
  notes?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  MINOR: 'text-amber-400',
  MODERATE: 'text-orange-400',
  SEVERE: 'text-red-400',
};

export const injuriesConfig: EntityConfig<Injury> = {
  name: 'injuries',
  labelSingular: 'Blessure',
  labelPlural: 'Blessures',
  apiBasePath: '/injuries',
  idField: 'id',
  lookups: [playersLookup, clubsLookup],
  columns: [
    {
      key: 'playerName',
      label: 'Joueur',
      render: (r: Injury, lookups?: any) => {
        const opt = lookups?.players?.find((p: any) => String(p.value) === String(r.playerId));
        return (
          <div className="flex items-center gap-2">
            {opt?.photoUrl ? (
              <img src={opt.photoUrl} alt={r.playerName} className="h-6 w-6 object-cover rounded-full bg-white/5 border border-white/10" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">J</div>
            )}
            <span>{r.playerName || opt?.label || '—'}</span>
          </div>
        );
      },
    },
    { key: 'type', label: 'Blessure' },
    {
      key: 'severity',
      label: 'Gravité',
      render: (r: Injury) => (
        <span className={`font-semibold ${SEVERITY_COLORS[r.severity] || ''}`}>{r.severity}</span>
      ),
    },
    { key: 'status', label: 'Statut' },
    { key: 'expectedReturn', label: 'Retour prévu' },
  ],
  fields: [
    { key: 'playerId', label: 'Joueur', type: 'select', optionsKey: 'players', required: true, span: 2 },
    { key: 'type', label: 'Type de blessure', type: 'text', required: true },
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
