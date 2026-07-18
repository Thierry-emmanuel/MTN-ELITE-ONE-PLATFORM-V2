/**
 * admin-legacy — the existing admin engine registered as FootballOS
 * tenant module #1. Nothing is rewritten: the 19 entity configs of
 * ENTITY_REGISTRY are wrapped into shell EntityTypeDefinitions, so
 * labels come from the same source of truth as /admin.
 *
 * Phase 2: LegacyFormCanvas mounts EntityCrudEngine inside BuilderHost
 * region ③, and each entity graduates to a native canvas one by one.
 */
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight, Award, Box, Briefcase, Building2, CalendarDays, Camera,
  Flag, Handshake, HeartPulse, ListChecks, Megaphone, Shield, Shirt,
  Sparkles, Trophy, UserRound, Users,
} from 'lucide-react';
import { registerModule } from '@/shell/registry/module.registry';
import type { EntityTypeDefinition } from '@/shell/registry/types';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';

const ICONS: Record<string, LucideIcon> = {
  transfers: ArrowLeftRight,
  injuries: HeartPulse,
  selections: ListChecks,
  'big-moments': Sparkles,
  actions: Camera,
  clubs: Shield,
  players: UserRound,
  stadiums: Building2,
  equipments: Shirt,
  sponsors: Handshake,
  seasons: CalendarDays,
  matches: Trophy,
  coaches: Megaphone,
  referees: Flag,
  staff: Briefcase,
  awards: Award,
  competitions: Trophy,
  'sponsor-placements': Megaphone,
  talents: Users,
};

const entities: EntityTypeDefinition[] = Object.entries(ENTITY_REGISTRY).map(
  ([slug, config]) => ({
    type: slug,
    moduleSlug: 'admin',
    icon: ICONS[slug] ?? Box,
    labelSingular: config.labelSingular ?? slug,
    labelPlural: config.labelPlural ?? slug,
    creatable: true,
  }),
);

registerModule({
  slug: 'admin',
  label: 'Données de la ligue',
  icon: Box,
  domain: 'builders',
  contractVersion: 1,
  entities,
});
