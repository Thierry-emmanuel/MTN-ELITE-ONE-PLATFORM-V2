import type { EntityConfig } from '@/features/admin/engine/entityConfig.types';
import { iamApi } from '../iam.api';
import type { IamUser } from '../iam.types';

/** Numeric backend id stringified for the generic engine. */
export type UserRow = Omit<IamUser, 'id'> & { id?: string };

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif', suspended: 'Suspendu', archived: 'Archivé',
};

/**
 * Users — user management through the same generic engine as every other
 * entity. Lifecycle actions (suspend / activate / archive / reset password)
 * are one-click actions in the IAM pages via iamApi.users; the form covers
 * identity + role + organization assignment.
 */
export const iamUsersConfig: EntityConfig<UserRow> = {
  name: 'iam-users',
  labelSingular: 'Utilisateur',
  labelPlural: 'Utilisateurs',
  apiBasePath: '/users',
  idField: 'id',
  searchableKeys: ['email', 'firstName', 'lastName'],
  columns: [
    { key: 'lastName', label: 'Nom', render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'roleKeys', label: 'Rôles', render: (u) => (u.roleKeys ?? [u.role]).join(', ') },
    { key: 'organizationId', label: 'Organisation', optionsKey: 'organizations' },
    { key: 'status', label: 'Statut', render: (u) => STATUS_LABELS[u.status] ?? u.status },
  ],
  fields: [
    { key: 'firstName', label: 'Prénom', type: 'text', required: true, span: 1 },
    { key: 'lastName', label: 'Nom', type: 'text', required: true, span: 1 },
    { key: 'email', label: 'Email', type: 'text', required: true, span: 1 },
    { key: 'username', label: 'Nom d’utilisateur', type: 'text', span: 1 },
    { key: 'phone', label: 'Téléphone', type: 'text', span: 1 },
    {
      key: 'password', label: 'Mot de passe initial', type: 'text', span: 1,
      hint: 'Par défaut : ChangeMe2026',
    } as never,
    {
      key: 'role', label: 'Rôle hérité (legacy)', type: 'select', span: 1,
      hint: 'Compatibilité — sélection directe depuis les rôles enregistrés en BD',
      optionsKey: 'roles',
    },
    { key: 'roleKeys', label: 'Rôles IAM', type: 'tags', span: 2, optionsKey: 'roles', hint: 'Cliquez sur un rôle en BD ou saisissez une clé personnalisée' } as never,
    {
      key: 'permissions',
      label: 'Permissions additionnelles (spécifiques à cet utilisateur)',
      type: 'tags',
      span: 2,
      optionsKey: 'permissionCatalog',
      hint: 'Cliquez sur les permissions du catalogue ou saisissez une permission spécifique',
    } as never,
    { key: 'organizationId', label: 'Organisation', type: 'select', span: 1, optionsKey: 'organizations' },
  ],
  extraPersistKeys: ['roleKeys', 'permissions'],
  emptyRecord: () => ({
    firstName: '', lastName: '', email: '', username: '', phone: '',
    role: 'user', roleKeys: ['user'], permissions: [], organizationId: null, status: 'active',
    password: 'ChangeMe2026',
  }),
  lookups: [
    {
      key: 'organizations',
      queryKey: ['iam', 'organizations', 'lookup'],
      fetch: async () => {
        const orgs = await iamApi.organizations.list();
        return orgs.map((o) => ({ value: String(o.id), label: o.name }));
      },
    },
    {
      key: 'roles',
      queryKey: ['iam', 'roles', 'lookup'],
      fetch: async () => {
        const roles = await iamApi.roles.list();
        return roles.map((r) => ({ value: r.key, label: r.name }));
      },
    },
    {
      key: 'permissionCatalog',
      queryKey: ['iam', 'permissions', 'catalogLookup'],
      fetch: async () => {
        const catalog = await iamApi.catalog();
        const options: { value: string; label: string }[] = [];
        catalog.modules.forEach((m) => {
          m.actions.forEach((a) => {
            options.push({
              value: `${m.key}.${a}`,
              label: `${m.label} · ${a} (${m.key}.${a})`,
            });
          });
        });
        return options;
      },
    },
  ],
  builderSteps: [
    { id: 'identity', label: 'Identité', description: 'Informations du compte', fieldKeys: ['firstName', 'lastName', 'email', 'username', 'phone', 'password'] },
    { id: 'access', label: 'Accès', description: 'Rôle et organisation', fieldKeys: ['role', 'roleKeys', 'permissions', 'organizationId'] },
  ],
};
