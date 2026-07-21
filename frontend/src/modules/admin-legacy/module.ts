/**
 * admin-legacy — the existing admin engine registered as FootballOS
 * tenant module #1, now with REAL builders (Phase 2).
 *
 * Nothing is duplicated: labels come from ENTITY_REGISTRY, forms from
 * renderEntityField, data from createEntityApi (real NestJS endpoints),
 * steps from each config's builderSteps. builderFromConfig() assembles
 * these into the universal Builder Framework — the five foundational
 * entities (Competition, Season, Club, Player, Stadium) get curated
 * titles and public previews on top of the generic factory.
 */
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight, Award, Box, Briefcase, Building2, CalendarDays, Camera,
  Flag, Handshake, HeartPulse, ListChecks, Megaphone, Shield, Shirt,
  Sparkles, Trophy, UserRound, Users,
} from 'lucide-react';
import { registerModule } from '@/shell/registry/module.registry';
import { builderFromConfig, type BuilderOptions } from '@/shell/builder-framework/configBuilder';
import type { BuilderDefinition, EntityTypeDefinition } from '@/shell/registry/types';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';
import type { Competition } from '@/features/admin/configs/competitions.config';
import type { Season } from '@/features/admin/configs/seasons.config';
import type { Club } from '@/features/admin/configs/clubs.config';
import type { Player } from '@/features/admin/configs/players.config';
import type { Stadium } from '@/features/admin/configs/stadiums.config';
import type { Match } from '@/features/admin/configs/matches.config';
import { MatchBuilderCanvas } from '@/shell/builder-framework/match/MatchBuilderCanvas';
import { StoryCanvas } from '@/shell/builder-framework/story/StoryCanvas';
import { CompetitionCanvas } from '@/shell/builder-framework/competition/CompetitionCanvas';
import { SeasonCanvas } from '@/shell/builder-framework/season/SeasonCanvas';
import { StadiumCanvas } from '@/shell/builder-framework/stadium/StadiumCanvas';
import type { Article } from '@/features/admin/configs/articles.config';
import type { MediaAsset } from '@/features/admin/configs/media.config';
import type { Legend } from '@/features/admin/configs/hallOfFame.config';

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
  articles: Megaphone,
  media: Camera,
  'hall-of-fame': Award,
};

const iconFor = (slug: string): LucideIcon => ICONS[slug] ?? Box;

/**
 * Curated refinements for the five foundational builders. Everything not
 * listed here still gets a fully functional generic builder — same
 * factory, default preview.
 */
const CURATED: Record<string, BuilderOptions<any>> = {
  /** Competition CONFIGURATION Builder — Phase 5. Not a CRUD form: the
   *  regulations feed the backend standings engine, the branding feeds the
   *  public site, the automation flags feed the pipelines. */
  competitions: {
    titleOf: (d: Partial<Competition>) => d.name ?? '',
    Canvas: CompetitionCanvas,
    sections: (d: Partial<Competition>) => [
      { id: 'identity',    label: 'Identité',      complete: !!d.name },
      { id: 'branding',    label: 'Image de marque', complete: !!(d.logoUrl || d.config?.branding?.heroUrl) },
      { id: 'format',      label: 'Format',        complete: !!d.config?.format?.structure },
      { id: 'regulations', label: 'Règlement',     complete: d.config?.regulations?.pointsSystem?.win != null },
      { id: 'officials',   label: 'Officiels',     complete: !!d.config?.officials?.director },
      { id: 'financial',   label: 'Finances',      complete: d.config?.financial?.prizePool != null },
      { id: 'media',       label: 'Médias & SEO',  complete: !!d.config?.media?.seoTitle },
      { id: 'automation',  label: 'Automatisations', complete: d.config?.automation != null },
    ],
    preview: { imageKey: 'logoUrl', titleKeys: ['name'], subtitleKeys: ['country'], badgeKeys: ['type', 'tier'] },
  } satisfies BuilderOptions<Competition>,
  /** Season CONFIGURATION Builder — Phase 5. Operational environment:
   *  matchRules are ENFORCED by the backend match engine; clubs and
   *  referees are picked from real records. */
  seasons: {
    titleOf: (d: Partial<Season>) => d.name ?? '',
    Canvas: SeasonCanvas,
    sections: (d: Partial<Season>) => [
      { id: 'identity',     label: 'Identité',        complete: !!d.name },
      { id: 'branding',     label: 'Image de marque', complete: !!d.config?.branding?.logoUrl },
      { id: 'calendar',     label: 'Calendrier',      complete: !!d.startDate },
      { id: 'matchconfig',  label: 'Config. matchs',  complete: d.config?.matchConfig?.clubsCount != null },
      { id: 'registration', label: 'Clubs engagés',   complete: (d.config?.registration?.participatingClubIds?.length ?? 0) > 0 },
      { id: 'officials',    label: 'Officiels',       complete: (d.config?.officials?.refereeIds?.length ?? 0) > 0 },
      { id: 'financial',    label: 'Finances',        complete: d.config?.financial?.seasonBudget != null },
      { id: 'matchrules',   label: 'Règles de match', complete: d.config?.matchRules?.duration != null },
      { id: 'awards',       label: 'Récompenses',     complete: (d.config?.awards?.enabled?.length ?? 0) > 0 },
      { id: 'public',       label: 'Expérience publique', complete: d.config?.publicExperience != null },
    ],
    preview: { titleKeys: ['name'], subtitleKeys: ['startDate', 'endDate'], badgeKeys: ['status'] },
  } satisfies BuilderOptions<Season>,
  clubs: {
    titleOf: (d: Partial<Club>) => d.name ?? '',
    preview: { imageKey: 'logoUrl', titleKeys: ['name'], subtitleKeys: ['city', 'stadium'], badgeKeys: ['nickname'] },
  } satisfies BuilderOptions<Club>,
  players: {
    titleOf: (d: Partial<Player>) => [d.firstName, d.lastName].filter(Boolean).join(' '),
    preview: { imageKey: 'photoUrl', titleKeys: ['firstName', 'lastName'], subtitleKeys: ['nationality'], badgeKeys: ['position', 'jerseyNumber'] },
  } satisfies BuilderOptions<Player>,
  stadiums: {
    titleOf: (d: Partial<Stadium>) => d.name ?? '',
    Canvas: StadiumCanvas,
    sections: (d: Partial<Stadium>) => [
      { id: 'general', label: 'Informations Générales', complete: !!(d.name && d.city && d.capacity) },
      { id: 'identity', label: 'Identité & Brand', complete: !!(d.photoUrl || d.config?.identity?.officialLogo) },
      { id: 'location', label: 'Localisation & GPS', complete: !!(d.city && d.address) },
      { id: 'infrastructure', label: 'Infrastructure & Sièges', complete: !!(d.capacity && d.config?.infrastructureDetails?.vipCapacity) },
      { id: 'pitch', label: 'Terrain & Pelouse', complete: !!(d.surface && d.config?.pitchDetails?.conditionRating) },
      { id: 'facilities', label: 'Équipements & Services', complete: !!(d.config?.facilitiesList?.hasWifi) },
      { id: 'ownership', label: 'Propriété & Gestion', complete: !!(d.config?.ownershipDetails?.owner) },
      { id: 'competitions', label: 'Compétitions Homologuées', complete: (d.config?.competitionsConfigured?.allowedCompetitions?.length ?? 0) > 0 },
      { id: 'resident-clubs', label: 'Clubs Résidents', complete: !!(d.clubId || d.config?.clubsAssigned?.primaryClubId) },
      { id: 'media', label: 'Médias & Kit Presse', complete: !!(d.photoUrl) },
      { id: 'gallery', label: 'Galerie Photos', complete: false },
      { id: 'documents', label: 'Documents & Licences', complete: false },
      { id: 'security', label: 'Sécurité & Secours CAF', complete: !!(d.config?.securitySpecs?.rating) },
      { id: 'operations', label: 'Exploitation & Planning', complete: !!(d.config?.operationsConfig?.rentalPricePerMatch) },
    ],
    preview: { imageKey: 'photoUrl', titleKeys: ['name'], subtitleKeys: ['city'], badgeKeys: ['capacity', 'surface'] },
  } satisfies BuilderOptions<Stadium>,
  /**
   * Match Builder — Phase 3. Bespoke canvas (6 operational sections) inside
   * the SAME BuilderHost as every other entity; the backend is the single
   * source of truth for score, status, standings and statistics.
   */
  matches: {
    titleOf: (d: Partial<Match>) => (d.round ? `Journée ${d.round}` : ''),
    Canvas: MatchBuilderCanvas,
    sections: (d: Partial<Match>) => {
      const created = d.id != null;
      const scheduled = !!(d.seasonId && d.round && d.scheduledAt);
      const teams = !!(d.homeClubId && d.awayClubId);
      return [
        { id: 'overview',  label: 'Aperçu du match', complete: scheduled },
        { id: 'teams',     label: 'Équipes',         complete: teams },
        { id: 'squads',    label: 'Effectifs',       complete: created },
        { id: 'formation', label: 'Composition',     complete: created },
        { id: 'timeline',  label: 'Chronologie',     complete: created && d.status === 'FINISHED' },
        { id: 'stats',     label: 'Statistiques',    complete: false },
      ];
    },
    preview: { titleKeys: ['round'], subtitleKeys: ['venue', 'scheduledAt'], badgeKeys: ['status'] },
  } satisfies BuilderOptions<Match>,
  /** Story Builder — Phase 4. Bespoke canvas: auto-population from the linked
   *  match (the Match Builder is the source of truth for every report). */
  articles: {
    titleOf: (d: Partial<Article>) => d.title?.fr ?? '',
    Canvas: StoryCanvas,
  } satisfies BuilderOptions<Article>,
  media: {
    titleOf: (d: Partial<MediaAsset>) => d.title ?? '',
    preview: { imageKey: 'url', titleKeys: ['title'], subtitleKeys: ['credit'], badgeKeys: ['type'] },
  } satisfies BuilderOptions<MediaAsset>,
  'hall-of-fame': {
    titleOf: (d: Partial<Legend>) => d.name ?? '',
    preview: { titleKeys: ['name'], subtitleKeys: ['era', 'career_summary'], badgeKeys: ['inducted_year'] },
  } satisfies BuilderOptions<Legend>,
};

const entities: EntityTypeDefinition[] = Object.entries(ENTITY_REGISTRY).map(
  ([slug, config]) => ({
    type: slug,
    moduleSlug: 'admin',
    icon: iconFor(slug),
    labelSingular: config.labelSingular ?? slug,
    labelPlural: config.labelPlural ?? slug,
    creatable: true,
  }),
);

const builders: BuilderDefinition<any>[] = Object.entries(ENTITY_REGISTRY).map(
  ([slug, config]) => builderFromConfig(config, iconFor(slug), CURATED[slug]),
);

registerModule({
  slug: 'admin',
  label: 'Données de la ligue',
  icon: Box,
  domain: 'builders',
  contractVersion: 1,
  entities,
  builders,
});
