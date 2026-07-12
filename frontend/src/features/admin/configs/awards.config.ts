import type { EntityConfig } from '../engine/entityConfig.types';

// Mirrors the DTO built by AdminPage's saveAward().
export interface Award {
  id?: string;
  category: string;
  periodStart?: string; // ISO on the wire; datetime-local string while editing
  periodEnd?: string;
  status?: 'OPEN' | 'CLOSED' | 'ANNOUNCED';
  seasonId?: string;
  winnerId?: string | null;
}

export const AWARD_CATEGORIES = [
  { value: 'Joueur de la Semaine', label: 'Joueur de la Semaine' },
  { value: 'Joueur du Mois', label: 'Joueur du Mois' },
  { value: "Ballon d'Or", label: "Ballon d'Or" },
];

export const awardsConfig: EntityConfig<Award> = {
  name: 'awards',
  labelSingular: 'Award',
  labelPlural: 'Awards',
  apiBasePath: '/awards',
  idField: 'id',

  columns: [
    { key: 'category', label: 'Catégorie' },
    { key: 'periodStart', label: 'Début' },
    { key: 'periodEnd', label: 'Fin' },
    { key: 'status', label: 'Statut' },
  ],

  fields: [
    { key: 'category', label: 'Catégorie', type: 'select', required: true, span: 2, options: AWARD_CATEGORIES },
    { key: 'seasonId', label: 'Saison', type: 'select', optionsKey: 'seasons', span: 2 },
    { key: 'periodStart', label: 'Début des votes', type: 'datetime-local', span: 1 },
    { key: 'periodEnd', label: 'Fin des votes', type: 'datetime-local', span: 1 },
    {
      key: 'status', label: 'Statut', type: 'select', span: 2,
      options: [
        { value: 'CLOSED', label: 'Votes fermés' },
        { value: 'OPEN', label: 'Votes ouverts' },
        { value: 'ANNOUNCED', label: 'Vainqueur annoncé' },
      ],
    },
  ],

  emptyRecord: () => ({ category: '', status: 'CLOSED', seasonId: '' }),

  // ── League Studio: Award Builder ───────────────────────────────────────
  // Covers launching a new award campaign. Nominating players and watching
  // live vote counts is an ongoing workflow, not a one-time form — that
  // stays on the existing bespoke Awards panel, exactly like a Season's
  // Activer/Clôturer actions stay outside the Season Builder.
  builderSteps: [
    {
      id: 'category',
      label: 'Catégorie',
      description: 'Quel type de distinction lancez-vous ?',
      fieldKeys: ['category', 'seasonId'],
    },
    {
      id: 'voting-window',
      label: 'Fenêtre de vote',
      description: 'Quand les supporters peuvent-ils voter ?',
      fieldKeys: ['periodStart', 'periodEnd'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: "Une fois créé, ajoutez les joueurs nommés depuis le panneau Awards.",
      fieldKeys: ['status'],
    },
  ],
  // "Publier" opens voting immediately — the editor can always add
  // nominees and flip to OPEN/ANNOUNCED later from the Awards panel too.
  publishOverrides: { status: 'OPEN' },

  beforeSave: (payload) => ({
    ...payload,
    periodStart: payload.periodStart ? new Date(payload.periodStart).toISOString() : payload.periodStart,
    periodEnd: payload.periodEnd ? new Date(payload.periodEnd).toISOString() : payload.periodEnd,
  }),
};
