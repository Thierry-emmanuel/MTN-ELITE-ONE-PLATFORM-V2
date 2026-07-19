import type { EntityConfig } from '../engine/entityConfig.types';

// Mirrors the DTO already used by SeasonsTab's bespoke save() call.

/** Phase 5 — operational configuration persisted in seasons.config (JSONB).
 *  matchRules is READ by the backend match engine (VAR gate, sub limit). */
export interface SeasonConfig {
  identity?: { code?: string; years?: string };
  branding?: { logoUrl?: string; heroUrl?: string; theme?: string };
  calendar?: {
    registrationStart?: string; registrationEnd?: string;
    transferWindows?: { label?: string; start?: string; end?: string }[];
    fifaWindows?: { label?: string; start?: string; end?: string }[];
    holidays?: { label?: string; start?: string; end?: string }[];
    awardsCeremony?: string;
  };
  matchConfig?: {
    clubsCount?: number; matchdays?: number;
    fixtureStrategy?: 'DOUBLE_ROUND_ROBIN' | 'SINGLE_ROUND_ROBIN';
    stadiumRotation?: boolean; defaultKickoff?: string; restDays?: number;
    broadcastWindows?: string[];
  };
  registration?: { participatingClubIds?: string[]; reserveClubIds?: string[]; qualificationRules?: string };
  officials?: { refereeIds?: string[]; assistantReferees?: string[]; commissioners?: string[]; medicalDelegates?: string[] };
  financial?: { seasonBudget?: number; matchBudget?: number; officialsPayments?: { role?: string; amount?: number }[]; clubSubsidies?: number; awardsBudget?: number };
  matchRules?: {
    duration?: number; extraTime?: boolean; penaltyShootout?: boolean;
    varEnabled?: boolean; maxSubstitutions?: number; coolingBreak?: boolean; replayRules?: string;
  };
  awards?: { enabled?: string[] };
  publicExperience?: { publicVisible?: boolean; liveCenter?: boolean; statsVisible?: boolean; apiAvailable?: boolean };
}

export interface Season {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  competitionId?: string;
  config?: SeasonConfig;
}

export const seasonsConfig: EntityConfig<Season> = {
  name: 'seasons',
  labelSingular: 'Saison',
  labelPlural: 'Saisons',
  apiBasePath: '/seasons',
  idField: 'id',
  extraPersistKeys: ['config'],
  searchableKeys: ['name'],

  columns: [
    { key: 'name', label: 'Saison' },
    { key: 'startDate', label: 'Début' },
    { key: 'endDate', label: 'Fin' },
    { key: 'status', label: 'Statut' },
  ],

  fields: [
    { key: 'name', label: 'Nom de la saison', type: 'text', required: true, span: 2, hint: 'Ex : Saison 2025/2026' },
    { key: 'startDate', label: 'Date de début', type: 'date', required: true, span: 1 },
    { key: 'endDate', label: 'Date de fin', type: 'date', required: true, span: 1 },
    {
      key: 'status', label: 'Statut', type: 'select', span: 2,
      options: [
        { value: 'UPCOMING', label: 'À venir' },
        { value: 'ONGOING', label: 'En cours' },
        { value: 'COMPLETED', label: 'Terminée' },
      ],
    },
  ],

  emptyRecord: () => ({ name: '', startDate: '', endDate: '', status: 'UPCOMING' }),

  // ── League Studio: Season Builder ──────────────────────────────────────
  // Lifecycle actions (Activer, Clôturer, Init. Classements) stay on the
  // existing SeasonsTab — a season's lifecycle is a workflow, not a form
  // field, so it deliberately isn't part of this wizard. This builder only
  // covers creation: name the season, set its calendar, confirm.
  builderSteps: [
    {
      id: 'identity',
      label: 'Identité',
      description: 'Comment cette saison doit-elle apparaître partout sur la plateforme ?',
      fieldKeys: ['name'],
    },
    {
      id: 'calendar',
      label: 'Calendrier',
      description: 'Les dates encadrent les matchs, classements et statistiques rattachés à cette saison.',
      fieldKeys: ['startDate', 'endDate'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'La saison démarre "À venir" — activez-la depuis la liste des saisons quand elle commence réellement.',
      fieldKeys: ['status'],
    },
  ],
  // Publishing a season just means "confirmed and saved" — status stays
  // whatever the editor picked in the Relecture step (usually UPCOMING);
  // there's no separate ACTIVE concept for a season the way there is for
  // a Player, so no overrides are merged in on publish.
  publishOverrides: {},
};
