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
import { refereesConfig } from './configs/referees.config';
import { staffConfig } from './configs/staff.config';
import { awardsConfig } from './configs/awards.config';
import { competitionsConfig } from './configs/competitions.config';
import { sponsorPlacementsConfig } from './configs/sponsorPlacements.config';
import { talentsConfig } from './configs/talents.config';
import { articlesConfig } from './configs/articles.config';
import { mediaConfig } from './configs/media.config';
import { hallOfFameConfig } from './configs/hallOfFame.config';
import { BUSINESS_CONFIGS } from '@/features/business/business.configs';
import { rolesConfig } from '@/features/iam/configs/roles.config';
import { organizationsConfig } from '@/features/iam/configs/organizations.config';
import { iamUsersConfig } from '@/features/iam/configs/users.config';
import type { EntityConfig } from './engine/entityConfig.types';

export const ENTITY_REGISTRY: Record<string, EntityConfig<any>> = {
  roles: rolesConfig,
  organizations: organizationsConfig,
  'iam-users': iamUsersConfig,
  articles: articlesConfig,
  media: mediaConfig,
  'hall-of-fame': hallOfFameConfig,
  ...BUSINESS_CONFIGS,
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
  referees: refereesConfig,
  staff: staffConfig,
  awards: awardsConfig,
  competitions: competitionsConfig,
  'sponsor-placements': sponsorPlacementsConfig,
  talents: talentsConfig,
};

export type EntityRegistryKey = keyof typeof ENTITY_REGISTRY;