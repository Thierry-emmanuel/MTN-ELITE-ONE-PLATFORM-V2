import type { EntityConfig } from '../engine/entityConfig.types';

// Mirrors backend Player entity (src/players/player.entity.ts) and its DTOs.
export interface Player {
  id?: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  nationality: string;
  secondNationality?: string;
  birthDate?: string;
  birthPlace?: string;
  jerseyNumber?: number;

  height?: number;
  weight?: number;
  preferredFoot?: 'LEFT' | 'RIGHT' | 'BOTH';

  photoUrl?: string;
  secondaryPhotoUrl?: string;
  videoUrl?: string;

  biography?: string;
  formerClubs?: string[];

  marketValue?: number;
  contractExpiry?: string;
  agentName?: string;

  appearances?: number;
  goals?: number;
  assists?: number;
  internationalCaps?: number;
  internationalGoals?: number;

  status?: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'LOANED' | 'RETIRED';
  isActive?: boolean;

  socialMedia?: { twitter?: string; instagram?: string; facebook?: string; youtube?: string; tiktok?: string };

  clubId?: string;
}

export const playersConfig: EntityConfig<Player> = {
  name: 'players',
  labelSingular: 'Joueur',
  labelPlural: 'Joueurs',
  apiBasePath: '/players',
  idField: 'id',
  searchableKeys: ['firstName', 'lastName', 'nickname', 'nationality'],

  columns: [
    { key: 'lastName', label: 'Nom', render: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'position', label: 'Poste' },
    { key: 'nationality', label: 'Nationalité' },
    { key: 'jerseyNumber', label: 'N°' },
    { key: 'status', label: 'Statut' },
  ],

  fields: [
    // ── Identity ─────────────────────────────────────────────────────────
    { key: 'firstName', label: 'Prénom', type: 'text', required: true, span: 1 },
    { key: 'lastName', label: 'Nom', type: 'text', required: true, span: 1 },
    { key: 'nickname', label: 'Surnom', type: 'text', span: 1, hint: 'ex. "Le Bison"' },
    {
      key: 'position', label: 'Poste', type: 'select', required: true, span: 1,
      options: [
        { value: 'GK', label: 'Gardien' },
        { value: 'DEF', label: 'Défenseur' },
        { value: 'MID', label: 'Milieu' },
        { value: 'FWD', label: 'Attaquant' },
      ],
    },
    { key: 'nationality', label: 'Nationalité', type: 'text', required: true, span: 1 },
    { key: 'secondNationality', label: 'Seconde nationalité', type: 'text', span: 1 },
    { key: 'birthDate', label: 'Date de naissance', type: 'date', span: 1 },
    { key: 'birthPlace', label: 'Lieu de naissance', type: 'text', span: 1 },
    { key: 'jerseyNumber', label: 'Numéro de maillot', type: 'number', span: 1 },
    { key: 'clubId', label: 'Club', type: 'select', optionsKey: 'clubs', span: 1 },

    // ── Physical ─────────────────────────────────────────────────────────
    { key: 'height', label: 'Taille (cm)', type: 'number', span: 1 },
    { key: 'weight', label: 'Poids (kg)', type: 'number', span: 1 },
    {
      key: 'preferredFoot', label: 'Pied préféré', type: 'select', span: 1,
      options: [
        { value: 'LEFT', label: 'Gauche' },
        { value: 'RIGHT', label: 'Droit' },
        { value: 'BOTH', label: 'Ambidextre' },
      ],
    },

    // ── Media ────────────────────────────────────────────────────────────
    {
      key: 'photoUrl', label: 'Photo principale', type: 'media-image', span: 1,
      uploadScope: { entity: 'players', field: 'photo' },
      hint: 'Portrait, fond uni recommandé',
    },
    {
      key: 'secondaryPhotoUrl', label: 'Photo en action', type: 'media-image', span: 1,
      uploadScope: { entity: 'players', field: 'secondary-photo' },
    },
    {
      key: 'videoUrl', label: "Vidéo highlights", type: 'media-video', span: 2,
      uploadScope: { entity: 'players', field: 'video' },
    },

    // ── Biography ────────────────────────────────────────────────────────
    { key: 'biography', label: 'Biographie', type: 'richtext', span: 2 },
    { key: 'formerClubs', label: 'Anciens clubs', type: 'tags', span: 2 },

    // ── Contract ─────────────────────────────────────────────────────────
    { key: 'marketValue', label: 'Valeur marchande (FCFA)', type: 'number', span: 1 },
    { key: 'contractExpiry', label: 'Fin de contrat', type: 'date', span: 1 },
    { key: 'agentName', label: 'Agent', type: 'text', span: 2 },

    // ── Career stats ─────────────────────────────────────────────────────
    { key: 'appearances', label: 'Matchs joués (carrière)', type: 'number', span: 1 },
    { key: 'goals', label: 'Buts (carrière)', type: 'number', span: 1 },
    { key: 'assists', label: 'Passes décisives (carrière)', type: 'number', span: 1 },
    { key: 'internationalCaps', label: 'Sélections internationales', type: 'number', span: 1 },
    { key: 'internationalGoals', label: 'Buts internationaux', type: 'number', span: 1 },

    // ── Status ───────────────────────────────────────────────────────────
    {
      key: 'status', label: 'Statut', type: 'select', span: 1,
      options: [
        { value: 'ACTIVE', label: 'Actif' },
        { value: 'INJURED', label: 'Blessé' },
        { value: 'SUSPENDED', label: 'Suspendu' },
        { value: 'LOANED', label: 'Prêté' },
        { value: 'RETIRED', label: 'Retraité' },
      ],
    },
    { key: 'isActive', label: 'Joueur actif sur la plateforme', type: 'switch', span: 1 },

    // ── Social media ─────────────────────────────────────────────────────
    {
      key: 'socialMedia', label: 'Réseaux sociaux', type: 'nested-object', span: 2,
      subFields: [
        { key: 'twitter', label: 'Twitter / X', type: 'text' },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'facebook', label: 'Facebook', type: 'text' },
        { key: 'youtube', label: 'YouTube', type: 'text' },
        { key: 'tiktok', label: 'TikTok', type: 'text' },
      ],
    },
  ],

  emptyRecord: () => ({
    firstName: '', lastName: '', position: 'MID', nationality: 'Camerounais',
    status: 'ACTIVE', isActive: true, socialMedia: {},
  }),

  // ── League Studio: Player Builder ─────────────────────────────────────
  // Groups the same `fields` above into a guided, six-step journey. No new
  // fields, no new validation rules — this is purely a presentation layer
  // on top of the flat config, so the CRUD table/form and the wizard never
  // drift apart.
  builderSteps: [
    {
      id: 'identity',
      label: 'Identité',
      description: 'Qui est ce joueur ?',
      fieldKeys: ['firstName', 'lastName', 'nickname', 'position', 'nationality', 'secondNationality', 'birthDate', 'birthPlace'],
    },
    {
      id: 'club',
      label: 'Club & Poste',
      description: 'Où évolue-t-il actuellement ?',
      fieldKeys: ['clubId', 'jerseyNumber', 'preferredFoot', 'height', 'weight'],
    },
    {
      id: 'media',
      label: 'Médias',
      description: 'Photo et vidéo qui apparaîtront sur son profil public.',
      fieldKeys: ['photoUrl', 'secondaryPhotoUrl', 'videoUrl'],
    },
    {
      id: 'career',
      label: 'Carrière & Contrat',
      description: 'Statistiques, contrat et anciens clubs.',
      fieldKeys: ['biography', 'formerClubs', 'marketValue', 'contractExpiry', 'agentName', 'appearances', 'goals', 'assists', 'internationalCaps', 'internationalGoals'],
    },
    {
      id: 'status',
      label: 'Statut & Réseaux',
      description: 'Visibilité sur la plateforme et réseaux sociaux.',
      fieldKeys: ['status', 'isActive', 'socialMedia'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: "Vérifiez tout avant de publier — l'aperçu à droite est exactement ce que verront les supporters.",
      fieldKeys: [],
    },
  ],
};