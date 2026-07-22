import type { EntityConfig } from '@/features/admin/engine/entityConfig.types';

export interface PermissionRow {
  id?: string;
  key: string;
  label: string;
  module: string;
  description?: string;
}

export const permissionsConfig: EntityConfig<PermissionRow> = {
  name: 'permissions',
  labelSingular: 'Permission',
  labelPlural: 'Permissions',
  apiBasePath: '/iam/permissions',
  idField: 'id',
  searchableKeys: ['key', 'label', 'module'],
  columns: [
    { key: 'label', label: 'Libellé' },
    { key: 'key', label: 'Clé de la permission' },
    { key: 'module', label: 'Module' },
    { key: 'description', label: 'Description' },
  ],
  fields: [
    { key: 'label', label: 'Libellé de la permission', type: 'text', required: true, span: 1, hint: 'Ex: Validation des résultats de matchs' },
    { key: 'key', label: 'Clé de la permission (module.action)', type: 'text', required: true, span: 1, hint: 'Ex: matches.verify_score' },
    {
      key: 'module', label: 'Module concerné', type: 'select', required: true, span: 1,
      options: [
        { value: 'matches', label: 'Matchs & Calendrier' },
        { value: 'seasons', label: 'Saisons & Compétitions' },
        { value: 'stadiums', label: 'Stades & Terrains' },
        { value: 'referees', label: 'Arbitres & Officiels' },
        { value: 'clubs', label: 'Clubs & Effectifs' },
        { value: 'players', label: 'Joueurs & Fiches' },
        { value: 'articles', label: 'Articles & Presse' },
        { value: 'users', label: 'Utilisateurs & Comptes' },
        { value: 'roles', label: 'Rôles & Habilitations' },
        { value: 'custom', label: 'Personnalisé / Général' },
      ],
    },
    { key: 'description', label: 'Description des accès accordés', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({
    key: '', label: '', module: 'matches', description: '',
  }),
  builderSteps: [
    { id: 'identity', label: 'Identité', description: 'Définition et module de la permission', fieldKeys: ['label', 'key', 'module', 'description'] },
  ],
};
