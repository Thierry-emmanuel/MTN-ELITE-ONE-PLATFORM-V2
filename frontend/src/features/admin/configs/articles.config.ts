/**
 * Story Builder — articles (MongoDB, idField '_id').
 * One config covers the five editorial forms via `category`:
 * rapport de match, actualité, interview, éditorial, communiqué.
 * Relations (match/clubs/joueurs) are first-class schema fields, which is
 * what powers auto-population from the linked match in the Story canvas.
 */
import { clubsLookup, matchesLookup, playersLookup } from '../lookups/sharedLookups';
import type { EntityConfig } from '../engine/entityConfig.types';

export interface LocalizedText { fr: string; en: string }

export interface Article {
  _id?: string;
  id?: string;
  articleType?: string;
  category: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  body: LocalizedText;
  slug: string;
  author: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  isBreaking?: boolean;
  cover_image?: string;
  videoUrl?: string;
  relatedMatchId?: string;
  relatedClubIds?: string[];
  relatedPlayerIds?: string[];
  tags?: string[];
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

export const articlesConfig: EntityConfig<Article> = {
  name: 'articles',
  labelSingular: 'Story',
  labelPlural: 'Stories',
  apiBasePath: '/articles',
  idField: '_id',
  lookups: [matchesLookup, clubsLookup, playersLookup],
  searchableKeys: ['slug', 'author', 'category'],
  columns: [
    { key: 'slug', label: 'Slug' },
    { key: 'category', label: 'Catégorie' },
    { key: 'author', label: 'Auteur' },
    { key: 'status', label: 'Statut' },
  ],
  fields: [
    {
      key: 'category', label: 'Type de story', type: 'select', required: true,
      options: [
        { value: 'MATCH_REPORT', label: 'Rapport de match' },
        { value: 'CLUB_NEWS', label: 'Actualité / Communiqué' },
        { value: 'INTERVIEW', label: 'Interview' },
        { value: 'OPINION', label: 'Éditorial / Opinion' },
        { value: 'ANALYSIS', label: 'Analyse' },
        { value: 'TRANSFERS', label: 'Mercato' },
        { value: 'CULTURE', label: 'Héritage / Culture' },
      ],
    },
    {
      key: 'articleType', label: 'Format', type: 'select',
      options: [
        { value: 'STANDARD', label: 'Standard' },
        { value: 'BREAKING', label: 'Breaking' },
        { value: 'VIDEO', label: 'Vidéo' },
        { value: 'PHOTO_GALLERY', label: 'Galerie photo' },
        { value: 'LIVE_BLOG', label: 'Live blog' },
      ],
    },
    {
      key: 'title', label: 'Titre (FR / EN)', type: 'nested-object', required: true, span: 2,
      subFields: [{ key: 'fr', label: 'Français', type: 'text' }, { key: 'en', label: 'English', type: 'text' }],
    },
    {
      key: 'subtitle', label: 'Sous-titre (FR / EN)', type: 'nested-object', span: 2,
      subFields: [{ key: 'fr', label: 'Français', type: 'text' }, { key: 'en', label: 'English', type: 'text' }],
    },
    {
      key: 'body', label: 'Contenu (FR / EN)', type: 'nested-object', required: true, span: 2,
      subFields: [{ key: 'fr', label: 'Français', type: 'text' }, { key: 'en', label: 'English', type: 'text' }],
    },
    { key: 'author', label: 'Auteur / Signature', type: 'text', required: true },
    { key: 'slug', label: 'Slug (auto si vide)', type: 'text', hint: 'Généré depuis le titre FR si laissé vide' },
    { key: 'relatedMatchId', label: 'Match lié', type: 'select', optionsKey: 'matches', span: 2,
      hint: 'Requis pour un rapport de match — alimente l’auto-remplissage' },
    { key: 'cover_image', label: 'Image de couverture', type: 'media-image', span: 2, uploadScope: { entity: 'articles', field: 'cover_image' } },
    { key: 'videoUrl', label: 'URL vidéo', type: 'text', span: 2 },
    { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
    {
      key: 'status', label: 'Statut', type: 'select',
      options: [
        { value: 'DRAFT', label: 'Brouillon' },
        { value: 'PUBLISHED', label: 'Publié' },
        { value: 'ARCHIVED', label: 'Archivé' },
      ],
    },
    { key: 'featured', label: 'À la une', type: 'switch' },
    { key: 'isBreaking', label: 'Breaking news', type: 'switch' },
  ],
  emptyRecord: () => ({
    category: 'CLUB_NEWS', articleType: 'STANDARD',
    title: { fr: '', en: '' }, subtitle: { fr: '', en: '' }, body: { fr: '', en: '' },
    slug: '', author: '', status: 'DRAFT', tags: [],
  }),
  beforeSave: (p) => ({
    ...p,
    slug: p.slug?.trim() ? p.slug : slugify(p.title?.fr ?? ''),
    // EN mirrors FR when the newsroom writes French-only — backend requires both.
    title: p.title ? { fr: p.title.fr, en: p.title.en?.trim() ? p.title.en : p.title.fr } : p.title,
    body: p.body ? { fr: p.body.fr, en: p.body.en?.trim() ? p.body.en : p.body.fr } : p.body,
    subtitle: p.subtitle?.fr?.trim()
      ? { fr: p.subtitle.fr, en: p.subtitle.en?.trim() ? p.subtitle.en : p.subtitle.fr }
      : undefined,
  }),
  publishOverrides: { status: 'PUBLISHED' },
  workflow: {
    statusField: 'status',
    initialStatus: 'draft',
    transitions: {
      draft: ['in_review'],
      in_review: ['needs_changes', 'approved'],
      needs_changes: ['in_review', 'draft'],
      approved: ['published', 'draft'],
      published: ['archived'],
      archived: ['draft'],
    },
  },
  builderSteps: [
    { id: 'type', label: 'Type & angle', fieldKeys: ['category', 'articleType', 'author'] },
    { id: 'content', label: 'Contenu', fieldKeys: ['title', 'subtitle', 'body'] },
    { id: 'relations', label: 'Relations', fieldKeys: ['relatedMatchId', 'tags'] },
    { id: 'media', label: 'Médias', fieldKeys: ['cover_image', 'videoUrl'] },
    { id: 'distribution', label: 'Diffusion', fieldKeys: ['slug', 'status', 'featured', 'isBreaking'] },
    { id: 'review', label: 'Relecture', fieldKeys: [], description: 'Vérifiez la story avant publication sur le site public.' },
  ],
};
