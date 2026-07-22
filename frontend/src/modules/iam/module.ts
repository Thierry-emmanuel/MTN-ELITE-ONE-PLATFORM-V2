/**
 * Identity & Access — tenant module #3 (Sprint 1).
 * Registered exactly like admin-legacy and business: configs feed the
 * generic factory, the Role Builder swaps in a bespoke canvas, and the
 * shell (search, quick-create, sidebar, palette) inherits everything.
 */
import type { LucideIcon } from 'lucide-react';
import { KeyRound, Lock, Network, ShieldCheck, Users } from 'lucide-react';
import { registerModule } from '@/shell/registry/module.registry';
import { builderFromConfig } from '@/shell/builder-framework/configBuilder';
import { RoleCanvas } from '@/shell/builder-framework/iam/RoleCanvas';
import { rolesConfig } from '@/features/iam/configs/roles.config';
import { permissionsConfig } from '@/features/iam/configs/permissions.config';
import { organizationsConfig } from '@/features/iam/configs/organizations.config';
import { iamUsersConfig } from '@/features/iam/configs/users.config';

const IAM_CONFIGS = {
  roles: rolesConfig,
  permissions: permissionsConfig,
  organizations: organizationsConfig,
  'iam-users': iamUsersConfig,
} as const;

const ICONS: Record<string, LucideIcon> = {
  roles: ShieldCheck,
  permissions: Lock,
  organizations: Network,
  'iam-users': Users,
};

registerModule({
  slug: 'iam',
  label: 'Identité & Accès',
  icon: KeyRound,
  domain: 'operations',
  contractVersion: 1,
  entities: Object.entries(IAM_CONFIGS).map(([slug, config]) => ({
    type: slug,
    moduleSlug: 'iam',
    icon: ICONS[slug] ?? KeyRound,
    labelSingular: config.labelSingular,
    labelPlural: config.labelPlural,
    creatable: true,
    createRoute: `/os/builders/iam/${slug}/new`,
  })),
  builders: [
    builderFromConfig(rolesConfig, ShieldCheck, {
      titleOf: (d) => d.name ?? d.key ?? '',
      Canvas: RoleCanvas,
      sections: (d) => [
        { id: 'identity', label: 'Identité', complete: !!d.name && !!d.key },
        { id: 'permissions', label: 'Permissions', complete: (d.permissions ?? []).length > 0 },
        { id: 'fields', label: 'Champs', complete: Object.keys(d.fieldPolicies ?? {}).length > 0 },
      ],
    }),
    builderFromConfig(permissionsConfig, Lock, {
      titleOf: (d) => d.label ?? d.key ?? '',
    }),
    builderFromConfig(organizationsConfig, Network, {
      titleOf: (d) => d.name ?? '',
    }),
    builderFromConfig(iamUsersConfig, Users, {
      titleOf: (d) => [d.firstName, d.lastName].filter(Boolean).join(' '),
    }),
  ],
});
