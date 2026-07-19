/**
 * Media & Gallery Builder — unified library (MongoDB media_assets).
 * The binary lives on Cloudinary via the existing uploads module; this
 * catalogues it: metadata, credit and entity relationships so an asset is
 * findable from any story, match, club or player.
 */
import { clubsLookup, matchesLookup, playersLookup } from '../lookups/sharedLookups';
import type { EntityConfig } from '../engine/entityConfig.types';

export interface MediaAsset {
  _id?: string;
  id?: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
  title: string;
  altText?: string;
  credit?: string;
  tags?: string[];
  relatedMatchId?: number;
  relatedClubId?: number;
  relatedPlayerId?: number;
}

export const mediaConfig: EntityConfig<MediaAsset> = {
  name: 'media',
  labelSingular: 'Média',
  labelPlural: 'Médiathèque',
  apiBasePath: '/media',
  idField: '_id',
  lookups: [matchesLookup, clubsLookup, playersLookup],
  searchableKeys: ['title', 'credit'],
  columns: [
    { key: 'title', label: 'Titre' },
    { key: 'type', label: 'Type' },
    { key: 'credit', label: 'Crédit' },
  ],
  fields: [
    {
      key: 'type', label: 'Type', type: 'select', required: true,
      options: [{ value: 'IMAGE', label: 'Image' }, { value: 'VIDEO', label: 'Vidéo' }],
    },
    { key: 'title', label: 'Titre', type: 'text', required: true },
    { key: 'url', label: 'Fichier', type: 'media-image', required: true, span: 2, uploadScope: { entity: 'media', field: 'url' },
      hint: 'Téléversé sur Cloudinary via le module uploads existant' },
    { key: 'thumbnailUrl', label: 'Miniature (vidéos)', type: 'media-image', span: 2, uploadScope: { entity: 'media', field: 'thumbnail' } },
    { key: 'altText', label: 'Texte alternatif', type: 'text', span: 2 },
    { key: 'credit', label: 'Crédit / Photographe', type: 'text' },
    { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
    { key: 'relatedMatchId', label: 'Match lié', type: 'select', optionsKey: 'matches' },
    { key: 'relatedClubId', label: 'Club lié', type: 'select', optionsKey: 'clubs' },
    { key: 'relatedPlayerId', label: 'Joueur lié', type: 'select', optionsKey: 'players' },
  ],
  emptyRecord: () => ({ type: 'IMAGE', url: '', title: '', tags: [] }),
  beforeSave: (p) => ({
    ...p,
    relatedMatchId: p.relatedMatchId ? Number(p.relatedMatchId) : undefined,
    relatedClubId: p.relatedClubId ? Number(p.relatedClubId) : undefined,
    relatedPlayerId: p.relatedPlayerId ? Number(p.relatedPlayerId) : undefined,
  }),
  builderSteps: [
    { id: 'asset', label: 'Fichier', fieldKeys: ['type', 'title', 'url', 'thumbnailUrl'] },
    { id: 'meta', label: 'Métadonnées', fieldKeys: ['altText', 'credit', 'tags'] },
    { id: 'relations', label: 'Relations', fieldKeys: ['relatedMatchId', 'relatedClubId', 'relatedPlayerId'] },
  ],
};
