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
    { key: 'phone', label: 'Téléphone', type: 'text', span: 1 },
    {
      key: 'password', label: 'Mot de passe initial', type: 'text', span: 1,
      hint: 'Création uniquement — l’utilisateur devra le changer',
    } as never,
    {
      key: 'role', label: 'Rôle hérité (legacy)', type: 'select', span: 1,
      hint: 'Compatibilité — les permissions réelles viennent des rôles IAM',
      options: [
        { value: 'user', label: 'Utilisateur' },
        { value: 'editor', label: 'Éditeur' },
        { value: 'admin', label: 'Administrateur' },
      ],
    },
    { key: 'organizationId', label: 'Organisation', type: 'select', span: 1, optionsKey: 'organizations' },
  ],
  extraPersistKeys: ['roleKeys'],
  emptyRecord: () => ({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'user', roleKeys: ['user'], organizationId: null, status: 'active',
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
  ],
  builderSteps: [
    { id: 'identity', label: 'Identité', description: 'Informations du compte', fieldKeys: ['firstName', 'lastName', 'email', 'phone'] },
    { id: 'access', label: 'Accès', description: 'Rôle et organisation', fieldKeys: ['role', 'organizationId'] },
  ],
};
