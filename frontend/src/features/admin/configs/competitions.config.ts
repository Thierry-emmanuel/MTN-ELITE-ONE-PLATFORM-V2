import type { EntityConfig } from '../engine/entityConfig.types';


/** Phase 5 — OS configuration persisted in competitions.config (JSONB). */
export interface CompetitionConfig {
  identity?: { shortName?: string; code?: string; slug?: string; description?: string; governingBody?: string };
  branding?: { trophyUrl?: string; heroUrl?: string; primaryColor?: string; secondaryColor?: string; sponsors?: string[]; partners?: string[] };
  format?: {
    structure?: 'LEAGUE' | 'KNOCKOUT' | 'GROUPS' | 'HYBRID';
    legs?: 'HOME_AWAY' | 'SINGLE';
    aggregateRules?: string; playoffRules?: string; qualificationRules?: string;
  };
  regulations?: {
    pointsSystem?: { win?: number; draw?: number; loss?: number };
    tieBreakers?: string[];
    yellowsForSuspension?: number; redCardBanMatches?: number;
    squadMaxSize?: number; squadMaxForeign?: number; registrationRules?: string;
  };
  officials?: { director?: string; refereeCommittee?: string[]; commissioners?: string[]; varOfficials?: string[] };
  financial?: { prizePool?: number; registrationFee?: number; tvRights?: number; sponsorshipTotal?: number; prizeDistribution?: { rank?: number; amount?: number }[] };
  media?: { documents?: string[]; seoTitle?: string; seoDescription?: string; landingTheme?: string };
  automation?: { autoStandings?: boolean; autoStatistics?: boolean; autoAwards?: boolean; autoPassports?: boolean; autoPublishing?: boolean };
}

export interface Competition {
  id?: string;
  name: string;
  type: 'LEAGUE' | 'CUP' | 'QUALIFIER';
  country: string;
  tier: number;
  logoUrl?: string;
  config?: CompetitionConfig;
}

export const competitionsConfig: EntityConfig<Competition> = {
  name: 'competitions',
  labelSingular: 'Compétition',
  labelPlural: 'Compétitions',
  apiBasePath: '/competitions',
  idField: 'id',
  extraPersistKeys: ['config'],
  searchableKeys: ['name'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'country', label: 'Pays' },
    { key: 'tier', label: 'Division' },
  ],
  fields: [
    { key: 'name', label: 'Nom de la compétition', type: 'text', required: true, span: 2 },
    {
      key: 'type', label: 'Type', type: 'select', required: true, span: 1,
      options: [
        { value: 'LEAGUE', label: 'Championnat (Ligue)' },
        { value: 'CUP', label: 'Coupe' },
        { value: 'QUALIFIER', label: 'Qualifications' },
      ],
    },
    { key: 'country', label: 'Code Pays (ISO-2)', type: 'text', required: true, span: 1, hint: 'Ex: CM' },
    { key: 'tier', label: 'Division (Niveau)', type: 'number', required: true, span: 1, hint: 'Ex: 1' },
    {
      key: 'logoUrl', label: 'Logo', type: 'media-image', span: 2,
      uploadScope: { entity: 'competitions', field: 'logo' },
    },
  ],
  emptyRecord: () => ({
    name: '', type: 'LEAGUE', country: 'CM', tier: 1,
  }),
  builderSteps: [
    {
      id: 'details',
      label: 'Détails',
      description: 'Nom, type, division et localisation de la compétition.',
      fieldKeys: ['name', 'type', 'country', 'tier'],
    },
    {
      id: 'logo',
      label: 'Logo',
      description: 'Téléchargez le logo officiel de la compétition.',
      fieldKeys: ['logoUrl'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez les informations saisies.',
      fieldKeys: [],
    },
  ],
};
