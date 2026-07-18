import type { WidgetDefinition } from './types';
import { getModules } from './module.registry';

const shellWidgets = new Map<string, WidgetDefinition>();

export const registerWidgets = (defs: WidgetDefinition[]) =>
  defs.forEach((d) => shellWidgets.set(d.id, d));

export const getWidgets = (): WidgetDefinition[] => [
  ...shellWidgets.values(),
  ...getModules().flatMap((m) => m.widgets ?? []),
];
export const getWidget = (id: string) => getWidgets().find((w) => w.id === id);
