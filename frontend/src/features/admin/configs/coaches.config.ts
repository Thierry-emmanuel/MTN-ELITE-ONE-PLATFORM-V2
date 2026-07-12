import type { EntityConfig } from '../engine/entityConfig.types';

// Mirrors the DTO built by CoachesTab's emptyCoach()/save() in AdminEntityTabs.tsx.
export interface Coach {
  id?: string;
  firstName: string;
  lastName: string;
  nationality?: string;
  birthDate?: string;
  birthPlace?: string;
  photoUrl?: string;
  bannerUrl?: string;
  qualification?: string;
  specialization?: string;
  contractExpiry?: string;
  biography?: string;
  formerClubs?: string[];
  trophies?: string[];
  assistantCoachName?: string;
  fitnessCoachName?: string;
  goalkeeperCoachName?: string;
  analystName?: string;
  socialMedia?: { twitter?: string; instagram?: string; linkedin?: string };
  clubId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

export const coachesConfig: EntityConfig<Coach> = {
  name: 'coaches',
  labelSingular: 'Entraîneur',
  labelPlural: 'Entraîneurs',
  apiBasePath: '/coaches',
  idField: 'id',
  searchableKeys: ['firstName', 'lastName'],

  columns: [
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'clubId', label: 'Club' },
    { key: 'status', label: 'Statut' },
  ],

  fields: [
    { key: 'firstName', label: 'Prénom', type: 'text', required: true, span: 1 },
    { key: 'lastName', label: 'Nom', type: 'text', required: true, span: 1 },
    { key: 'nationality', label: 'Nationalité', type: 'text', span: 1 },
    { key: 'birthDate', label: 'Date de naissance', type: 'date', span: 1 },
    { key: 'birthPlace', label: 'Lieu de naissance', type: 'text', span: 2 },

    { key: 'clubId', label: 'Club', type: 'select', optionsKey: 'clubs', span: 1 },
    {
      key: 'status', label: 'Statut', type: 'select', span: 1,
      options: [
        { value: 'ACTIVE', label: 'Actif' },
        { value: 'INACTIVE', label: 'Inactif' },
      ],
    },
    { key: 'qualification', label: 'Qualification', type: 'text', span: 1, hint: 'ex. Licence CAF Pro' },
    { key: 'specialization', label: 'Spécialisation', type: 'text', span: 1 },
    { key: 'contractExpiry', label: 'Fin de contrat', type: 'date', span: 2 },

    {
      key: 'photoUrl', label: 'Photo', type: 'media-image', span: 1,
      uploadScope: { entity: 'coaches', field: 'photo' },
    },
    {
      key: 'bannerUrl', label: 'Bannière', type: 'media-image', span: 1,
      uploadScope: { entity: 'coaches', field: 'banner' },
    },

    { key: 'biography', label: 'Biographie', type: 'richtext', span: 2 },
    { key: 'formerClubs', label: 'Anciens clubs', type: 'tags', span: 2 },
    { key: 'trophies', label: 'Palmarès', type: 'tags', span: 2 },

    { key: 'assistantCoachName', label: 'Entraîneur Adjoint', type: 'text', span: 1 },
    { key: 'fitnessCoachName', label: 'Préparateur Physique', type: 'text', span: 1 },
    { key: 'goalkeeperCoachName', label: 'Entraîneur des Gardiens', type: 'text', span: 1 },
    { key: 'analystName', label: 'Analyste Vidéo', type: 'text', span: 1 },

    {
      key: 'socialMedia', label: 'Réseaux sociaux', type: 'nested-object', span: 2,
      subFields: [
        { key: 'twitter', label: 'Twitter / X', type: 'text' },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'linkedin', label: 'LinkedIn', type: 'text' },
      ],
    },
    { key: 'notes', label: 'Notes internes', type: 'textarea', span: 2 },
  ],

  emptyRecord: () => ({
    firstName: '', lastName: '', nationality: 'Camerounais',
    formerClubs: [], trophies: [], socialMedia: {}, status: 'ACTIVE',
  }),

  // ── League Studio: Coach Builder ────────────────────────────────────────
  // Mirrors CoachesTab's own six-tab form (Identité, Qualifications, Staff,
  // Carrière, Médias, Réseaux) — same grouping the editor already knows,
  // now as a guided journey with a live preview.
  builderSteps: [
    {
      id: 'identity',
      label: 'Identité',
      description: 'Qui est cet entraîneur ?',
      fieldKeys: ['firstName', 'lastName', 'nationality', 'birthDate', 'birthPlace', 'clubId', 'status'],
    },
    {
      id: 'qualifications',
      label: 'Qualifications',
      description: 'Licences, spécialisation et situation contractuelle.',
      fieldKeys: ['qualification', 'specialization', 'contractExpiry'],
    },
    {
      id: 'staff',
      label: 'Staff Technique',
      description: 'Son équipe autour du terrain.',
      fieldKeys: ['assistantCoachName', 'fitnessCoachName', 'goalkeeperCoachName', 'analystName'],
    },
    {
      id: 'career',
      label: 'Carrière',
      description: 'Biographie, anciens clubs et palmarès.',
      fieldKeys: ['biography', 'formerClubs', 'trophies'],
    },
    {
      id: 'media',
      label: 'Médias & Réseaux',
      description: 'Photo, bannière et présence sociale.',
      fieldKeys: ['photoUrl', 'bannerUrl', 'socialMedia', 'notes'],
    },
  ],
  publishOverrides: { status: 'ACTIVE' },

  // CoachesTab's original save() coerced clubId to Number|null before
  // sending — keep that contract so the backend (which expects a numeric
  // FK) behaves identically whichever path created the record.
  beforeSave: (payload) => ({
    ...payload,
    clubId: payload.clubId ? (Number(payload.clubId) as unknown as string) : (null as unknown as string),
  }),
};
