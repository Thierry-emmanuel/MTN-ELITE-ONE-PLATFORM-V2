import type { EntityTypeDefinition } from './types';
import { getModules } from './module.registry';

export const getEntityTypes = (): EntityTypeDefinition[] =>
  getModules().flatMap((m) => m.entities ?? []);

export const getCreatableEntityTypes = () =>
  getEntityTypes().filter((e) => e.creatable);

export const getEntityType = (type: string) =>
  getEntityTypes().find((e) => e.type === type);
