import {
  Radio, LayoutGrid, Hammer, Workflow, BrainCircuit, Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DomainId } from '../registry/types';

export const SHELL_BASE = '/os';

export interface DomainDef {
  id: DomainId;
  label: string;          // i18n key
  icon: LucideIcon;
  route: string;
  /** Linear-style "g x" sequence key */
  goKey: string;
}

/** The six domains — frozen forever. Modules multiply inside them. */
export const DOMAINS: DomainDef[] = [
  { id: 'command',      label: 'domain.command',      icon: Radio,        route: `${SHELL_BASE}/command`,      goKey: 'c' },
  { id: 'workspace',    label: 'domain.workspace',    icon: LayoutGrid,   route: `${SHELL_BASE}/workspace`,    goKey: 'w' },
  { id: 'builders',     label: 'domain.builders',     icon: Hammer,       route: `${SHELL_BASE}/builders`,     goKey: 'b' },
  { id: 'operations',   label: 'domain.operations',   icon: Workflow,     route: `${SHELL_BASE}/operations`,   goKey: 'o' },
  { id: 'intelligence', label: 'domain.intelligence', icon: BrainCircuit, route: `${SHELL_BASE}/intelligence`, goKey: 'i' },
  { id: 'settings',     label: 'domain.settings',     icon: Settings,     route: `${SHELL_BASE}/settings`,     goKey: 's' },
];
