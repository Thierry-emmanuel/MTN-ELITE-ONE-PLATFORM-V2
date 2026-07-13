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

export interface EntityConfig<T extends { id?: string; _id?: string }> {
  name: string;            // 'transfers'
  labelSingular: string;   // 'Transfert'
  labelPlural: string;     // 'Transferts'
  apiBasePath: string;     // '/transfers'
  idField: 'id' | '_id';
  columns: ColumnDef<T>[];
  fields: FieldDef<T>[];
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
 
  publishOverrides?: Partial<T>;
}