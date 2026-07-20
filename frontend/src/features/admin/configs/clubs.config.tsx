import type { EntityConfig } from '../engine/entityConfig.types';

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

  columns: [
    {
      key: 'name',
      label: 'Club',
      render: (r: Club) => (
        <div className="flex items-center gap-2">
          {r.logoUrl ? (
            <img src={r.logoUrl} alt={r.name} className="h-6 w-6 object-contain rounded bg-white/5 p-0.5" />
          ) : (
            <div className="h-6 w-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
              {r.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span>{r.name}</span>
        </div>
      ),
    },
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
      hint: 'Appuyez sur Entrée pour ajouter un titre, ex: Champion 2024',
    },
    { key: 'presidentName', label: 'Nom du président', type: 'text', span: 1 },
    {
      key: 'presidentPhotoUrl', label: 'Photo du président', type: 'media-image', span: 1,
      uploadScope: { entity: 'clubs', field: 'president' },
    },
    { key: 'budget', label: 'Budget annuel estimé (FCFA)', type: 'number', span: 1 },

    // ── Achievements sub-object (nested) ──────────────────────────────
    {
      key: 'achievements', label: 'Détail des titres nationaux / internationaux', type: 'nested-object', span: 2,
      subFields: [
        { key: 'league', label: 'Titres de Championnat (Elite One)', type: 'number' },
        { key: 'cup', label: 'Coupes du Cameroun', type: 'number' },
        { key: 'regional', label: 'Ligues régionales', type: 'number' },
        { key: 'african', label: 'Titres CAF (Ligue des champions...)', type: 'number' },
      ],
    },

    // ── Social Media sub-object (nested) ──────────────────────────────
    {
      key: 'socialMedia', label: 'Réseaux sociaux officiels', type: 'nested-object', span: 2,
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
    name: '', city: '', foundedYear: new Date().getFullYear(), stadium: '', status: 'ACTIVE',
  }),

  builderSteps: [
    {
      id: 'identity',
      label: 'Identité',
      description: 'Nom du club, ville, année de fondation et statut.',
      fieldKeys: ['name', 'nickname', 'city', 'region', 'foundedYear', 'websiteUrl', 'status'],
    },
    {
      id: 'visuals',
      label: 'Identité Visuelle',
      description: 'Logo officiel, bannière de page et couleurs du club.',
      fieldKeys: ['logoUrl', 'bannerUrl', 'videoUrl', 'primaryColor', 'secondaryColor'],
    },
    {
      id: 'stadium',
      label: 'Infrastructures',
      description: 'Nom, capacité et photo de l\'enceinte du club.',
      fieldKeys: ['stadium', 'stadiumCapacity', 'stadiumPhotoUrl'],
    },
    {
      id: 'narrative',
      label: 'Histoire & Direction',
      description: 'Président, palmarès historique et description du club.',
      fieldKeys: ['description', 'history', 'palmares', 'presidentName', 'presidentPhotoUrl', 'budget'],
    },
    {
      id: 'achievements',
      label: 'Palmarès chiffré',
      description: 'Nombre exact de trophées remportés par catégorie.',
      fieldKeys: ['achievements'],
    },
    {
      id: 'socials',
      label: 'Communauté',
      description: 'Liens vers les réseaux sociaux officiels du club.',
      fieldKeys: ['socialMedia'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Validez toutes les sections de la fiche club.',
      fieldKeys: [],
    },
  ],
};
