import type { WorkspaceTemplate } from '../registry/types';

/**
 * Role-agnostic templates. Roles (Competition Manager, Journalist,
 * Match Operator, Medical Staff, League Administrator, Scout, Referee
 * Manager) are named capability bundles configured in Settings — they
 * map to a template here. New role = new bundle + optional template.
 * Zero engine changes.
 */
export const TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'template.default',
    label: 'Modèle par défaut',
    widgets: [
      { widgetId: 'quick-actions', size: 'M' },
      { widgetId: 'system-status', size: 'M' },
      { widgetId: 'my-drafts', size: 'S' },
      { widgetId: 'recent-items', size: 'S' },
      { widgetId: 'favorites', size: 'S' },
      { widgetId: 'activity-feed', size: 'M' },
      { widgetId: 'shortcut-tips', size: 'S' },
    ],
  },
];

export const resolveTemplate = (roleTemplateId?: string): WorkspaceTemplate =>
  TEMPLATES.find((t) => t.id === roleTemplateId) ?? TEMPLATES[0];
