import type { EntityConfig } from '../engine/entityConfig.types';

export interface SponsorPlacement {
  id?: string;
  sponsorId: number;
  placementType: 'HERO_BANNER' | 'AWARD_CATEGORY' | 'MATCH_CENTER' | 'CLUB_PAGE';
  targetId?: number;
  active: boolean;
  priority: number;
  startsAt?: string;
  endsAt?: string;
}

export const sponsorPlacementsConfig: EntityConfig<SponsorPlacement> = {
  name: 'sponsor-placements',
  labelSingular: 'Placement Sponsor',
  labelPlural: 'Placements Sponsors',
  apiBasePath: '/sponsors/placements',
  idField: 'id',
  searchableKeys: [],
  columns: [
    { key: 'sponsorId', label: 'ID Sponsor' },
    { key: 'placementType', label: 'Emplacement' },
    { key: 'targetId', label: 'Cible (ID)' },
    { key: 'active', label: 'Actif' },
    { key: 'priority', label: 'Priorité' },
  ],
  fields: [
    { key: 'sponsorId', label: 'Sponsor (ID)', type: 'number', required: true, span: 1 },
    {
      key: 'placementType', label: 'Type d\'emplacement', type: 'select', required: true, span: 1,
      options: [
        { value: 'HERO_BANNER', label: 'Bannière Hero Accueil' },
        { value: 'AWARD_CATEGORY', label: 'Catégorie d\'Award' },
        { value: 'MATCH_CENTER', label: 'Match Center' },
        { value: 'CLUB_PAGE', label: 'Page de Club' },
      ],
    },
    { key: 'targetId', label: 'Cible (ID optionnel)', type: 'number', span: 1, hint: 'Ex: ID club ou award' },
    { key: 'priority', label: 'Priorité (Ordre d\'affichage)', type: 'number', span: 1, hint: 'Ex: 10' },
    { key: 'active', label: 'Afficher en ligne', type: 'switch', span: 2 },
    { key: 'startsAt', label: 'Date de début', type: 'date', span: 1 },
    { key: 'endsAt', label: 'Date de fin', type: 'date', span: 1 },
  ],
  emptyRecord: () => ({
    sponsorId: 0, placementType: 'HERO_BANNER', active: true, priority: 0,
  }),
  builderSteps: [
    {
      id: 'details',
      label: 'Configuration',
      description: 'Définissez le sponsor, le type d\'affichage et la cible.',
      fieldKeys: ['sponsorId', 'placementType', 'targetId', 'priority', 'active'],
    },
    {
      id: 'scheduling',
      label: 'Planification',
      description: 'Dates de diffusion optionnelles pour le placement.',
      fieldKeys: ['startsAt', 'endsAt'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez le placement avant validation.',
      fieldKeys: [],
    },
  ],
};
