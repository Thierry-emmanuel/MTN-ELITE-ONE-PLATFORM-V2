/**
 * FootballOS — Shell contract types (Phase 1: League Studio Shell)
 * ----------------------------------------------------------------
 * This file is the OS "ABI". The six domains, OSEntity, the seven
 * layouts and the eight builder regions are frozen; everything else
 * in the product is a module built against these interfaces.
 */
import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// ── Object model ────────────────────────────────────────────────────────────
export type EntityStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface BreadcrumbNode {
  label: string;
  href?: string;
  /** optional sibling entries rendered as a dropdown crumb (Stripe pattern) */
  siblings?: { label: string; href: string }[];
}

/**
 * The one interface the entire shell is built against.
 * Search, Recents, Favorites, Drafts, Quick Create, Notifications and the
 * Command Palette all operate on OSEntity — register a type and a module
 * inherits all six global systems for free.
 */
export interface OSEntity {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  route: string;
  status?: EntityStatus;
  updatedAt?: string;
}

export interface EntityTypeDefinition {
  type: string;
  moduleSlug: string;
  icon: LucideIcon;
  labelSingular: string;
  labelPlural: string;
  /** appears in Quick Create (＋ / Cmd+Shift+N) */
  creatable?: boolean;
  /** route for the create surface; defaults to /builders/:module/:type/new */
  createRoute?: string;
}

// ── Command / shortcut model ────────────────────────────────────────────────
export interface PaletteCommand {
  id: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  section?: string;
  shortcut?: string;
  keywords?: string[];
  run: (ctx: CommandRunContext) => void;
}
export interface CommandRunContext {
  navigate: (to: string) => void;
}

export interface ScopedShortcut {
  /** "mod+k", "mod+shift+n", or a sequence "g c" */
  keys: string;
  description: string;
  scope?: string;
  allowInInput?: boolean;
  handler: () => void;
}

// ── Workspace Engine ────────────────────────────────────────────────────────
export type Capability = string;
export type WidgetSize = 'S' | 'M' | 'L';

export interface WidgetDefinition {
  id: string;
  title: string;
  icon?: LucideIcon;
  component: ComponentType;
  defaultSize: WidgetSize;
  requiredCapabilities?: Capability[];
}
export interface PlacedWidget { widgetId: string; size: WidgetSize }
export interface WorkspaceTemplate {
  id: string;
  label: string;
  widgets: PlacedWidget[];
}

// ── Builder Framework (contract only — no real builder ships in Phase 1) ───
export interface BuilderSection { id: string; label: string; complete?: boolean }

export interface CanvasProps<T = unknown> {
  draft: T;
  onChange: (next: T) => void;
  onSelect: (selection: BuilderSelection | null) => void;
  activeSection: string;
}
export interface BuilderSelection { kind: string; ref: string; label: string }

export interface InspectorTab<T = unknown> {
  id: string;
  label: string;
  render: (draft: T, selection: BuilderSelection | null) => ReactNode;
}
export interface RelationDef { label: string; entities: OSEntity[] }
export interface PreviewMode<T = unknown> {
  id: string; label: string;
  render: (draft: T) => ReactNode;
}
export interface ValidationIssue { field: string; message: string }
export interface ValidationResult { ok: boolean; issues: ValidationIssue[] }
export interface PublishAction { id: string; label: string; run: () => Promise<void> | void }

export interface BuilderDefinition<T = unknown> {
  entityType: string;
  icon: LucideIcon;
  sections: BuilderSection[];
  Canvas: ComponentType<CanvasProps<T>>;
  inspectorTabs: InspectorTab<T>[];
  relations?: RelationDef[];
  previews?: PreviewMode<T>[];
  publishing: { validate: (draft: T) => ValidationResult; actions?: PublishAction[] };
  commands?: PaletteCommand[];
  shortcuts?: ScopedShortcut[];
  emptyDraft: () => T;
}

// ── Module contract ─────────────────────────────────────────────────────────
export type DomainId = 'command' | 'workspace' | 'builders' | 'operations' | 'intelligence' | 'settings';

export interface ModuleDefinition {
  slug: string;
  label: string;
  icon: LucideIcon;
  domain: DomainId;
  contractVersion: 1;
  entities?: EntityTypeDefinition[];
  builders?: BuilderDefinition<any>[];
  widgets?: WidgetDefinition[];
  commands?: PaletteCommand[];
  searchProvider?: (q: string) => OSEntity[] | Promise<OSEntity[]>;
}
