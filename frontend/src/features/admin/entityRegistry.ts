import { transfersConfig } from './configs/transfers.config';
import { injuriesConfig } from './configs/injuries.config';
import { selectionsConfig } from './configs/selections.config';
import { bigMomentsConfig } from './configs/bigMoments.config';
import { clubsConfig } from './configs/clubs.config';
import { playersConfig } from './configs/players.config';
import { stadiumsConfig } from './configs/stadiums.config';
import { equipmentsConfig } from './configs/equipments.config';
import { sponsorsConfig } from './configs/sponsors.config';
import type { EntityConfig } from './engine/entityConfig.types';

/**
 * Every config-driven entity goes here. Bespoke domains that need more than
 * CRUD (matches with live status, articles with the Tiptap editor screen,
 * awards with nominations/voting) stay as their own pages and are NOT
 * registered here — this registry is only for the generic engine.
 *
 * Clubs and Players are config-driven as of this change: their forms are
 * rich (image uploads, nested JSON) but still fit the generic engine via
 * the 'media-image', 'nested-object', and 'color' field types — no bespoke
 * page needed.
 */
export const ENTITY_REGISTRY: Record<string, EntityConfig<any>> = {
  transfers: transfersConfig,
  injuries: injuriesConfig,
  selections: selectionsConfig,
  'big-moments': bigMomentsConfig,
  actions: { ...bigMomentsConfig, name: 'actions', labelSingular: 'Action', labelPlural: 'Actions' },
  clubs: clubsConfig,
  players: playersConfig,
  stadiums: stadiumsConfig,
  equipments: equipmentsConfig,
  sponsors: sponsorsConfig,
};

export type EntityRegistryKey = keyof typeof ENTITY_REGISTRY;