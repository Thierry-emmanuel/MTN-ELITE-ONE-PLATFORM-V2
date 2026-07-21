import type { EntityConfig } from '../engine/entityConfig.types';

export interface StadiumOperationalConfig {
  basicInfo?: {
    shortName?: string;
    nickname?: string;
    slug?: string;
    openingDate?: string;
    closingDate?: string;
    yearRenovated?: number;
    description?: string;
  };
  identity?: {
    officialLogo?: string;
    panoramicCover?: string;
    brandColors?: { primary?: string; secondary?: string; accent?: string };
    officialWebsite?: string;
    socialMedia?: { twitter?: string; facebook?: string; instagram?: string; youtube?: string };
    historicalNames?: { name: string; years: string }[];
  };
  locationDetails?: {
    region?: string;
    district?: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
    nearbyLandmarks?: string[];
    timezone?: string;
    climate?: string;
    travelDirections?: string;
    parkingInformation?: string;
  };
  infrastructureDetails?: {
    vipCapacity?: number;
    pressSeats?: number;
    hospitalitySuites?: number;
    disabledSeats?: number;
    parkingSpaces?: number;
    entrancesCount?: number;
    emergencyExitsCount?: number;
    constructionMaterial?: string;
    roofType?: string;
    lightingSystem?: string;
    soundSystem?: string;
    scoreboardType?: string;
    hasVarRoom?: boolean;
    hasMediaCenter?: boolean;
    hasConferenceRoom?: boolean;
    hasMedicalCenter?: boolean;
    hasTrainingFacilities?: boolean;
    lockerRoomsCount?: number;
  };
  pitchDetails?: {
    dimensions?: { length: number; width: number };
    hasDrainage?: boolean;
    hasHeating?: boolean;
    hasIrrigation?: boolean;
    conditionRating?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    maintenanceSchedule?: string;
  };
  facilitiesList?: {
    restaurantsCount?: number;
    shopsCount?: number;
    hasMuseum?: boolean;
    hasFanZone?: boolean;
    hasKidsArea?: boolean;
    hasWifi?: boolean;
    hasChargingStations?: boolean;
    hasAtm?: boolean;
    hasPrayerRoom?: boolean;
    hasFirstAid?: boolean;
    hasSecurityOffice?: boolean;
    hasVipLounge?: boolean;
    broadcastBoothsCount?: number;
  };
  ownershipDetails?: {
    owner?: string;
    operator?: string;
    managingOrganization?: string;
    leaseInfo?: string;
    constructionCompany?: string;
    architect?: string;
    namingRightsSponsor?: string;
  };
  competitionsConfigured?: {
    allowedCompetitions?: string[];
    defaultCompetition?: string;
  };
  clubsAssigned?: {
    primaryClubId?: string;
    secondaryClubIds?: string[];
    historicalClubNames?: string[];
  };
  mediaKit?: {
    heroImage?: string;
    videos?: { title: string; url: string }[];
    droneFootageUrl?: string;
    tour360Url?: string;
    downloadAssetsUrl?: string;
  };
  galleryAlbums?: {
    matchdays?: { url: string; caption: string }[];
    construction?: { url: string; caption: string }[];
    historicMoments?: { url: string; caption: string }[];
    renovation?: { url: string; caption: string }[];
  };
  documentsList?: {
    title: string;
    category: 'BLUEPRINT' | 'SAFETY' | 'LICENSE' | 'INSPECTION' | 'CONTRACT';
    fileUrl: string;
    date: string;
  }[];
  securitySpecs?: {
    rating?: string;
    emergencyPlanUrl?: string;
    policeContact?: string;
    fireContact?: string;
    medicalContact?: string;
    evacuationTimeMinutes?: number;
  };
  operationsConfig?: {
    maintenanceCalendar?: string;
    cleaningSchedule?: string;
    inspectionSchedule?: string;
    rentalPricePerMatch?: number;
    openingHours?: string;
    bookingRules?: string;
  };
}

export interface Stadium {
  id?: string;
  name: string;
  city: string;
  country?: string;
  capacity: number;
  photoUrl?: string;
  status: 'DRAFT' | 'ACTIVE' | 'RENOVATION' | 'ARCHIVED' | 'MAINTENANCE' | 'CLOSED';
  clubId?: string;
  address?: string;
  surface?: 'GRASS' | 'ARTIFICIAL' | 'HYBRID';
  openedYear?: number;
  description?: string;
  config?: StadiumOperationalConfig;
}

export const stadiumsConfig: EntityConfig<Stadium> = {
  name: 'stadiums',
  labelSingular: 'Stade',
  labelPlural: 'Stades',
  apiBasePath: '/stadiums',
  idField: 'id',
  searchableKeys: ['name', 'city', 'country'],
  columns: [
    { key: 'name', label: 'Stade' },
    { key: 'city', label: 'Ville' },
    { key: 'country', label: 'Pays', render: (r) => r.country ?? 'Cameroun' },
    { key: 'capacity', label: 'Capacité', render: (r) => r.capacity ? Number(r.capacity).toLocaleString() : '—' },
    { key: 'surface', label: 'Surface' },
    { key: 'status', label: 'Statut' },
  ],
  fields: [
    { key: 'name', label: 'Nom officiel du stade', type: 'text', required: true, span: 2 },
    { key: 'city', label: 'Ville', type: 'text', required: true, span: 1 },
    { key: 'country', label: 'Pays', type: 'text', span: 1 },
    { key: 'capacity', label: 'Capacité totale', type: 'number', required: true, span: 1 },
    {
      key: 'surface', label: 'Surface de jeu', type: 'select', required: true, span: 1,
      options: [
        { value: 'GRASS', label: 'Pelouse Naturelle' },
        { value: 'ARTIFICIAL', label: 'Synthétique' },
        { value: 'HYBRID', label: 'Hybride' },
      ],
    },
    {
      key: 'status', label: 'Statut opérationnel', type: 'select', required: true, span: 1,
      options: [
        { value: 'DRAFT', label: 'Brouillon' },
        { value: 'ACTIVE', label: 'Actif / Homologué' },
        { value: 'RENOVATION', label: 'En Rénovation' },
        { value: 'ARCHIVED', label: 'Archivé' },
      ],
    },
    { key: 'clubId', label: 'Club résident principal', type: 'select', optionsKey: 'clubs', span: 1 },
    { key: 'openedYear', label: 'Année d\'inauguration', type: 'number', span: 1 },
    { key: 'address', label: 'Adresse physique', type: 'text', span: 2 },
    {
      key: 'photoUrl', label: 'Photo de couverture principale', type: 'media-image', span: 2,
      uploadScope: { entity: 'stadiums', field: 'photo' },
    },
    { key: 'description', label: 'Description générale', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({
    name: '',
    city: 'Yaoundé',
    country: 'Cameroun',
    capacity: 40000,
    status: 'DRAFT',
    surface: 'GRASS',
    config: {
      basicInfo: {},
      identity: {},
      locationDetails: { region: 'Centre', district: 'Omnisports', timezone: 'UTC+1', climate: 'Tropical' },
      infrastructureDetails: { hasVarRoom: true, hasMediaCenter: true, hasMedicalCenter: true },
      pitchDetails: { conditionRating: 'EXCELLENT', hasDrainage: true, hasIrrigation: true },
      facilitiesList: { hasWifi: true, hasFirstAid: true, hasVipLounge: true },
      ownershipDetails: { owner: 'État du Cameroun (MINSEP)', operator: 'ONIES' },
      competitionsConfigured: { allowedCompetitions: ['Elite One', 'Cup', 'CAF'] },
      securitySpecs: { rating: 'Catégorie 4 CAF', evacuationTimeMinutes: 8 },
      operationsConfig: { openingHours: '08:00 - 22:00' }
    }
  }),

  builderSteps: [
    { id: 'general', label: 'Général', description: 'Informations de base du complexe', fieldKeys: ['name', 'city', 'country', 'capacity', 'openedYear', 'status'] },
    { id: 'identity', label: 'Identité', description: 'Identité de marque & médias officiels', fieldKeys: ['photoUrl', 'address'] },
    { id: 'location', label: 'Localisation', description: 'Géolocalisation & accès', fieldKeys: [] },
    { id: 'infrastructure', label: 'Infrastructure', description: 'Capacité & installations techniques', fieldKeys: [] },
    { id: 'pitch', label: 'Terrain / Pelouse', description: 'Spécifications de l\'aire de jeu', fieldKeys: ['surface'] },
    { id: 'facilities', label: 'Équipements & Services', description: 'Services aux spectateurs et médias', fieldKeys: [] },
    { id: 'ownership', label: 'Propriété & Gestion', description: 'Propriétaire, opérateur et sponsors', fieldKeys: ['clubId'] },
    { id: 'competitions', label: 'Compétitions Homologuées', description: 'Tournois acceptés et défauts', fieldKeys: [] },
    { id: 'resident-clubs', label: 'Clubs Résidents', description: 'Affectation des clubs', fieldKeys: [] },
    { id: 'media', label: 'Médias & Visuels', description: 'Photos 360, drone et kits médias', fieldKeys: [] },
    { id: 'gallery', label: 'Galerie Photos', description: 'Albums thématiques', fieldKeys: [] },
    { id: 'documents', label: 'Documents & Licences', description: 'Certificats de sécurité & plans', fieldKeys: [] },
    { id: 'security', label: 'Sécurité & Secours', description: 'Note CAF, contacts et plan d\'évacuation', fieldKeys: [] },
    { id: 'operations', label: 'Exploitation & Planning', description: 'Calendrier de maintenance & réservation', fieldKeys: [] },
  ],
  publishOverrides: { status: 'ACTIVE' },
};
