import type { EntityConfig } from '../engine/entityConfig.types';

// Mirrors backend Club entity (src/clubs/club.entity.ts) and its DTOs.
export interface Club {
  id?: string;
  name: string;
  nickname?: string;
  city: string;
  region?: string;
  foundedYear: number;
  websiteUrl?: string;

  logoUrl?: string;
  bannerUrl?: string;
  videoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;

  stadium: string;
  stadiumCapacity?: number;
  stadiumPhotoUrl?: string;

  description?: string;
  history?: string;
  palmares?: string[];

  presidentName?: string;
  presidentPhotoUrl?: string;
  budget?: number;

  achievements?: { league?: number; cup?: number; regional?: number; african?: number };
  socialMedia?: { twitter?: string; instagram?: string; facebook?: string; youtube?: string; tiktok?: string };

  status?: 'ACTIVE' | 'INACTIVE';
}

export const clubsConfig: EntityConfig<Club> = {
  name: 'clubs',
  labelSingular: 'Club',
  labelPlural: 'Clubs',
  apiBasePath: '/clubs',
  idField: 'id',
  searchableKeys: ['name', 'nickname', 'city'],

  // ── Table columns (matches the HSD-style list pattern: identity, status, actions) ──
  columns: [
    { key: 'name', label: 'Club' },
    { key: 'city', label: 'Ville' },
    { key: 'stadium', label: 'Stade' },
    { key: 'foundedYear', label: 'Fondé en' },
    { key: 'status', label: 'Statut' },
  ],

  fields: [
    // ── Identity ─────────────────────────────────────────────────────────
    { key: 'name', label: 'Nom du club', type: 'text', required: true, span: 1 },
    { key: 'nickname', label: 'Surnom', type: 'text', span: 1, hint: 'ex. Les Diables Noirs' },
    { key: 'city', label: 'Ville', type: 'text', required: true, span: 1 },
    { key: 'region', label: 'Région', type: 'text', span: 1 },
    { key: 'foundedYear', label: 'Année de fondation', type: 'number', required: true, span: 1 },
    { key: 'websiteUrl', label: 'Site web', type: 'text', span: 1 },
    {
      key: 'status', label: 'Statut', type: 'select', span: 1,
      options: [
        { value: 'ACTIVE', label: 'Actif' },
        { value: 'INACTIVE', label: 'Inactif' },
      ],
    },

    // ── Visuals — each maps to its own scoped upload route ────────────────
    {
      key: 'logoUrl', label: 'Logo du club', type: 'media-image', span: 1,
      uploadScope: { entity: 'clubs', field: 'logo' },
      hint: 'PNG/SVG transparent recommandé, min 256×256',
    },
    {
      key: 'bannerUrl', label: 'Bannière (page club)', type: 'media-image', span: 1,
      uploadScope: { entity: 'clubs', field: 'banner' },
      hint: 'Image large format, 1600×600 recommandé',
    },
    {
      key: 'videoUrl', label: 'Vidéo promo / intro', type: 'media-video', span: 1,
      uploadScope: { entity: 'clubs', field: 'video' },
    },
    { key: 'primaryColor', label: 'Couleur principale', type: 'color', span: 1 },
    { key: 'secondaryColor', label: 'Couleur secondaire', type: 'color', span: 1 },

    // ── Stadium ──────────────────────────────────────────────────────────
    { key: 'stadium', label: 'Nom du stade', type: 'text', required: true, span: 1 },
    { key: 'stadiumCapacity', label: 'Capacité du stade', type: 'number', span: 1 },
    {
      key: 'stadiumPhotoUrl', label: 'Photo du stade', type: 'media-image', span: 2,
      uploadScope: { entity: 'clubs', field: 'stadium' },
    },

    // ── Narrative ────────────────────────────────────────────────────────
    { key: 'description', label: 'Description courte', type: 'textarea', span: 2 },
    { key: 'history', label: 'Histoire du club', type: 'richtext', span: 2 },
    {
      key: 'palmares', label: 'Palmarès', type: 'tags', span: 2,
      hint: 'ex. "MTN Elite One 2010", "Coupe du Cameroun 2015"',
    },

    // ── Leadership ───────────────────────────────────────────────────────
    { key: 'presidentName', label: 'Nom du président', type: 'text', span: 1 },
    {
      key: 'presidentPhotoUrl', label: 'Photo du président', type: 'media-image', span: 1,
      uploadScope: { entity: 'clubs', field: 'president' },
    },
    { key: 'budget', label: 'Budget annuel (FCFA)', type: 'number', span: 2 },

    // ── Nested JSON objects ──────────────────────────────────────────────
    {
      key: 'achievements', label: 'Trophées', type: 'nested-object', span: 2,
      subFields: [
        { key: 'league', label: 'Titres de championnat', type: 'number' },
        { key: 'cup', label: 'Coupes nationales', type: 'number' },
        { key: 'regional', label: 'Trophées régionaux', type: 'number' },
        { key: 'african', label: 'Trophées africains (CAF)', type: 'number' },
      ],
    },
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
    name: '', city: '', stadium: '', foundedYear: new Date().getFullYear(),
    status: 'ACTIVE', achievements: {}, socialMedia: {},
  }),
};