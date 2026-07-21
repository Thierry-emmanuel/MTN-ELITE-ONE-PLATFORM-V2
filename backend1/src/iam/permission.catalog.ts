/**
 * FootballOS IAM — Permission Catalog (Sprint 1)
 * ------------------------------------------------------------------
 * The single source of truth for what can be permitted. Roles store
 * permission strings of the form  "<module>.<action>"  with support
 * for wildcards ("*", "articles.*") and ownership scoping
 * ("articles.update:own" — the holder may only act on records they own).
 *
 * The catalog is served to the frontend at GET /iam/permissions/catalog
 * so the Role Builder's permission matrix is generated, never hardcoded.
 */

export const IAM_ACTIONS = [
  'view', 'create', 'update', 'delete',
  'publish', 'approve', 'reject',
  'import', 'export', 'assign', 'archive', 'configure',
] as const;
export type IamAction = (typeof IAM_ACTIONS)[number];

export interface CatalogModule {
  key: string;
  label: string;
  /** subset of IAM_ACTIONS that make sense for this module */
  actions: IamAction[];
  /** actions that additionally support the ":own" ownership scope */
  ownable?: IamAction[];
}

const CRUD: IamAction[] = ['view', 'create', 'update', 'delete'];
const CRUD_PUB: IamAction[] = [...CRUD, 'publish', 'archive'];
const FULL: IamAction[] = [...IAM_ACTIONS];

export const PERMISSION_CATALOG: CatalogModule[] = [
  // ── Football core ────────────────────────────────────────────────
  { key: 'competitions', label: 'Compétitions', actions: [...CRUD, 'configure', 'archive', 'export'] },
  { key: 'seasons',      label: 'Saisons',      actions: [...CRUD, 'configure', 'archive', 'export'] },
  { key: 'clubs',        label: 'Clubs',        actions: [...CRUD, 'export', 'archive'] },
  { key: 'players',      label: 'Joueurs',      actions: [...CRUD, 'export', 'archive'] },
  { key: 'matches',      label: 'Matchs',       actions: [...CRUD, 'publish', 'export'] },
  { key: 'standings',    label: 'Classements',  actions: ['view', 'update', 'export'] },
  { key: 'stadiums',     label: 'Stades',       actions: CRUD },
  { key: 'referees',     label: 'Arbitres',     actions: [...CRUD, 'assign'] },
  { key: 'staff',        label: 'Staff',        actions: CRUD },
  { key: 'coaches',      label: 'Entraîneurs',  actions: CRUD },
  { key: 'transfers',    label: 'Transferts',   actions: [...CRUD, 'approve', 'reject'] },
  { key: 'injuries',     label: 'Blessures',    actions: CRUD },
  { key: 'selections',   label: 'Sélections',   actions: CRUD },
  { key: 'talents',      label: 'Talents',      actions: CRUD },

  // ── Content / storytelling ──────────────────────────────────────
  { key: 'articles', label: 'Articles',        actions: CRUD_PUB, ownable: ['update', 'delete', 'publish'] },
  { key: 'media',    label: 'Médias',          actions: [...CRUD, 'import'] },
  { key: 'awards',   label: 'Récompenses',     actions: CRUD_PUB },
  { key: 'hall-of-fame', label: 'Hall of Fame', actions: CRUD_PUB },
  { key: 'big-moments',  label: 'Grands moments', actions: CRUD },
  { key: 'hero-banners', label: 'Bannières',   actions: CRUD_PUB },
  { key: 'homepage',     label: 'Page d’accueil', actions: ['view', 'configure'] },

  // ── Business ────────────────────────────────────────────────────
  { key: 'business', label: 'Football Business', actions: [...CRUD, 'approve', 'export', 'configure'] },
  { key: 'uploads',  label: 'Téléversements',    actions: ['create', 'delete'] },

  // ── Platform / IAM ──────────────────────────────────────────────
  { key: 'users',         label: 'Utilisateurs',   actions: [...CRUD, 'assign', 'archive'] },
  { key: 'roles',         label: 'Rôles',          actions: [...CRUD, 'assign', 'archive', 'configure'] },
  { key: 'organizations', label: 'Organisations',  actions: [...CRUD, 'archive'] },
  { key: 'sessions',      label: 'Sessions',       actions: ['view', 'delete'] },
  { key: 'audit',         label: 'Journal d’audit', actions: ['view', 'export'] },
  { key: 'settings',      label: 'Paramètres',     actions: ['view', 'configure'] },
];

/** All valid concrete permission strings (no wildcards). */
export function allPermissions(): string[] {
  return PERMISSION_CATALOG.flatMap((m) => m.actions.map((a) => `${m.key}.${a}`));
}

/**
 * Does a granted set satisfy a required permission?
 * Grants may be "*", "<module>.*", "<module>.<action>" or "<module>.<action>:own".
 * Returns:
 *   'yes'  — full grant
 *   'own'  — granted only on owned records (caller must verify ownership)
 *   'no'   — not granted
 */
export function checkPermission(granted: string[], required: string): 'yes' | 'own' | 'no' {
  const [mod] = required.split('.');
  if (granted.includes('*') || granted.includes(`${mod}.*`) || granted.includes(required)) return 'yes';
  if (granted.includes(`${required}:own`)) return 'own';
  return 'no';
}

/**
 * Legacy bridge — permissions granted to the three historical enum roles
 * so existing tokens/accounts keep working while custom roles roll out.
 * These are also the seeds for the three system roles created by the
 * IamFoundation migration.
 */
export const LEGACY_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'],
  editor: [
    'articles.view', 'articles.create', 'articles.update:own', 'articles.delete:own', 'articles.publish:own',
    'media.view', 'media.create', 'media.import', 'uploads.create',
    'matches.view', 'players.view', 'clubs.view', 'standings.view',
    'awards.view', 'hall-of-fame.view', 'big-moments.view',
  ],
  'match-builder': [
    'matches.view', 'matches.create', 'matches.update', 'matches.delete', 'matches.publish',
    'seasons.view', 'seasons.create', 'seasons.update', 'seasons.delete', 'seasons.configure',
    'stadiums.view', 'stadiums.create', 'stadiums.update', 'stadiums.delete',
    'referees.view', 'referees.create', 'referees.update', 'referees.delete', 'referees.assign',
    'clubs.view', 'players.view', 'standings.view', 'standings.update',
  ],
  user: [],
};
