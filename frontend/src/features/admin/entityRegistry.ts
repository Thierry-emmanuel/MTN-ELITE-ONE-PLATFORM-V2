import { transfersConfig } from './configs/transfers.config';
import { injuriesConfig } from './configs/injuries.config';
import { selectionsConfig } from './configs/selections.config';
import { bigMomentsConfig } from './configs/bigMoments.config';
import { clubsConfig } from './configs/clubs.config';
import { playersConfig } from './configs/players.config';
import { stadiumsConfig } from './configs/stadiums.config';
import { equipmentsConfig } from './configs/equipments.config';
import { sponsorsConfig } from './configs/sponsors.config';
import { seasonsConfig } from './configs/seasons.config';
import { matchesConfig } from './configs/matches.config';
import { coachesConfig } from './configs/coaches.config';
import { awardsConfig } from './configs/awards.config';
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
 *
 * Seasons and Matches are registered too, but their tabs remain the
 * bespoke SeasonsTab / matches block in AdminPage — those own lifecycle
 * actions (Activer, Clôturer, live score entry) the generic table doesn't
 * model. Registering them here just lets their configs power the League
 * Studio guided builders via createEntityHooks, same as every other entity.
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
  seasons: seasonsConfig,
  matches: matchesConfig,
  coaches: coachesConfig,
  awards: awardsConfig,
};

export type EntityRegistryKey = keyof typeof ENTITY_REGISTRY;