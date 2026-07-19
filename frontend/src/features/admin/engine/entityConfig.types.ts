// Generic, strictly-typed config contract every admin entity must satisfy.
// One config file per domain (transfers, injuries, selections, clubs, players, ...)
// replaces the old pattern of one 200+ line bespoke tab per entity.

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime-local' | 'switch'
  | 'media-image' | 'media-video' | 'tags' | 'richtext'
  // ── Added for Clubs/Players ──────────────────────────────────────────────
  // 'nested-object': renders a sub-form for a JSON column (achievements,
  // socialMedia) using the field's own `subFields` definition, and writes
  // back a single object under the parent key — no schema change needed
  // beyond this addition, the entity's DTO already validates the object shape.
  | 'nested-object'
  | 'color';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef<T> {
  key: keyof T;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  /** static options, or a key into EntityConfig.lookups for dynamic options (e.g. clubs, players) */
  optionsKey?: string;
  options?: SelectOption[];
  span?: 1 | 2 | 3; // grid columns in the form
  /**
   * For type === 'nested-object' only. Each entry is rendered as a plain
   * number/text input scoped to `parentKey.subKey`. Kept intentionally
   * simple (no recursion) — these objects are one level deep in every
   * current entity (achievements, socialMedia).
   */
  subFields?: { key: string; label: string; type: 'text' | 'number' }[];
  /**
   * Upload scope passed to MediaUploader for type === 'media-image' |
   * 'media-video'. Maps directly to the backend's POST /uploads/:entity/:field
   * route, e.g. { entity: 'clubs', field: 'logo' }. Falls back to the legacy
   * /uploads/file endpoint if omitted, for entities not yet migrated.
   */
  uploadScope?: { entity: string; field: string };
}

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => string;
  /** Resolve the cell value against a LookupSource (e.g. show club name for clubId) */
  optionsKey?: string;
}

export interface LookupSource {
  key: string;            // referenced by FieldDef.optionsKey
  queryKey: string[];
  fetch: () => Promise<SelectOption[]>;
}

/**
 * Groups a subset of an entity's `fields` into one guided step for the
 * GuidedBuilderEngine (League Studio's "builder instead of a form" pattern).
 * A config becomes wizard-capable simply by adding `builderSteps` — no
 * change to `fields`, `columns`, or the flat EntityCrudEngine required, so
 * both the classic table+form view and the guided builder stay in sync
 * off a single source of truth.
 */
export interface BuilderStepDef<T> {
  id: string;               // 'identity'
  label: string;            // 'Identité'
  description?: string;     // shown under the step title
  icon?: string;             // lucide-react icon name, resolved by the engine
  fieldKeys: (keyof T)[];   // which fields (in order) render in this step
}

/**
 * FootballOS Phase 0 / Part 1 — Entity Registry additions.
 *
 * These fields make EntityConfig<T> the single place every future engine
 * (Workflow — Part 4, Relation — Part 5, Automation — Part 6, Preview —
 * Part 7, Validation — Part 8, Search — Part 9) reads from, instead of each
 * engine inventing its own per-entity wiring. Added additively — every
 * existing config file still compiles unchanged, since every new field is
 * optional.
 *
 * ENFORCEMENT STATUS (so this doesn't quietly become another dead field like
 * `lookups` used to be — that field existed in this file for a long time but
 * nothing ever read it; every admin tab hand-rolled its own options instead.
 * useEntityLookups() below fixes that specific case):
 *   - `permissions`     — schema only. Not yet enforced by EntityCrudEngine.
 *                         Enforcement is Phase 0 Part 13 (Security).
 *   - `workflow`        — schema only. No Workflow Engine exists yet (Part 4).
 *   - `relations`       — schema only. No Relation Engine exists yet (Part 5).
 *                         Declaring these now lets Part 5 be built by reading
 *                         existing configs instead of re-auditing every entity.
 *   - `statistics`      — schema only. No statistics/automation engine yet (Part 6).
 *   - `seo`             — schema only. No Preview/SEO engine yet (Part 7).
 *   - `automationHooks` — schema only (named event identifiers). No
 *                         Automation Engine exists yet to dispatch them (Part 6).
 *   - `icon`, `navGroup`— consumed today by CommandPalette/AdminPage nav.
 *   - `lookups`         — now consumed by useEntityLookups() (this phase).
 */

export interface EntityPermissions {
  view?: string[];
  create?: string[];
  update?: string[];
  delete?: string[];
  publish?: string[];
}

export type WorkflowStatus =
  | 'draft' | 'in_review' | 'needs_changes' | 'approved' | 'scheduled' | 'published' | 'archived';

export interface EntityWorkflow<T> {
  /** Key on T that holds the current WorkflowStatus. */
  statusField: keyof T;
  initialStatus: WorkflowStatus;
  /** Allowed status → status transitions, enforced by the future Workflow Engine (Part 4). */
  transitions: Partial<Record<WorkflowStatus, WorkflowStatus[]>>;
}

export interface EntityRelation<T> {
  /** Field on T holding the foreign reference, e.g. 'clubId' or 'relatedClubIds'. */
  key: keyof T;
  /** ENTITY_REGISTRY key of the target entity, e.g. 'clubs'. */
  targetEntity: string;
  cardinality: 'one' | 'many';
  required?: boolean;
  /** What should happen to this entity if the target record is deleted, enforced by the future Relation Engine (Part 5). */
  onDeleteOfTarget?: 'block' | 'null' | 'cascade';
}

export interface EntityStatistic<T> {
  key: string;
  label: string;
  compute: 'count' | 'sum' | 'avg' | 'max' | 'min';
  /** Field to aggregate for sum/avg/max/min; ignored for 'count'. */
  sourceField?: keyof T;
}

export interface EntitySeo {
  titleField?: string;
  descriptionField?: string;
  imageField?: string;
}

export interface EntityConfig<T extends { id?: string; _id?: string }> {
  name: string;            // 'transfers'
  labelSingular: string;   // 'Transfert'
  labelPlural: string;     // 'Transferts'
  apiBasePath: string;     // '/transfers'
  idField: 'id' | '_id';
  columns: ColumnDef<T>[];
  fields: FieldDef<T>[];
  /** Dynamic select options (e.g. clubs, players) resolved by useEntityLookups(). */
  lookups?: LookupSource[];
  emptyRecord: () => Partial<T>;
  searchableKeys?: (keyof T)[];
  /** Optional — presence of this array is what makes "Nouveau X" open the
   *  guided builder (step wizard + live preview) instead of the flat form. */
  builderSteps?: BuilderStepDef<T>[];
  /**
   * Runs once, right before create/update is sent to the API (both the flat
   * form and the guided builder go through this — see useEntityCrud). Use
   * it for field-format conversions the generic engine can't infer, e.g.
   * turning a `datetime-local` input's local string into an ISO timestamp.
   */
  beforeSave?: (payload: Partial<T>) => Partial<T>;
  /** Phase 5 — extra top-level keys allowed through sanitise() even though
   *  no FieldDef renders them (e.g. the `config` JSONB blob written by
   *  bespoke configuration canvases). */
  extraPersistKeys?: string[];
 
  publishOverrides?: Partial<T>;

  // ── Phase 0 / Part 1 registry surface (see enforcement-status note above) ──
  icon?: string;                     // lucide-react icon name, used in nav/command palette
  navGroup?: string;                 // command-palette grouping label, e.g. 'Médias'
  permissions?: EntityPermissions;
  workflow?: EntityWorkflow<T>;
  relations?: EntityRelation<T>[];
  statistics?: EntityStatistic<T>[];
  seo?: EntitySeo;
  /** Named automation events this entity's lifecycle should fire, e.g. ['recalculateStandings']. */
  automationHooks?: { onCreate?: string[]; onUpdate?: string[]; onDelete?: string[] };
}