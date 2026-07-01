import type { EntityConfig } from '../engine/entityConfig.types';

export interface BigMoment {
  _id?: string;
  title: string;
  description: string;      // rich text
  momentDate: string;       // ISO date the moment happened
  category: 'GOAL' | 'TROPHY' | 'RECORD' | 'CEREMONY' | 'OTHER';
  mediaUrl: string;          // image or video
  mediaType: 'image' | 'video';
  relatedClubIds?: string[];
  relatedPlayerIds?: string[];
  featured: boolean;
}

export const bigMomentsConfig: EntityConfig<BigMoment> = {
  name: 'big-moments',
  labelSingular: 'Grand Moment',
  labelPlural: 'Grands Moments',
  apiBasePath: '/big-moments',
  idField: '_id',
  columns: [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Catégorie' },
    { key: 'momentDate', label: 'Date' },
    { key: 'featured', label: 'En vedette', align: 'center', render: (r) => (r.featured ? '★' : '—') },
  ],
  fields: [
    { key: 'title', label: 'Titre', type: 'text', required: true, span: 2 },
    {
      key: 'category', label: 'Catégorie', type: 'select', required: true,
      options: [
        { value: 'GOAL', label: 'But mémorable' },
        { value: 'TROPHY', label: 'Trophée' },
        { value: 'RECORD', label: 'Record' },
        { value: 'CEREMONY', label: 'Cérémonie' },
        { value: 'OTHER', label: 'Autre' },
      ],
    },
    { key: 'momentDate', label: 'Date du moment', type: 'date', required: true },
    { key: 'mediaUrl', label: 'Média', type: 'media-image', required: true, span: 2 },
    { key: 'description', label: 'Récit', type: 'richtext', required: true, span: 2 },
    { key: 'featured', label: 'Mettre en vedette', type: 'switch' },
  ],
  emptyRecord: () => ({
    category: 'OTHER', momentDate: new Date().toISOString().slice(0, 10),
    mediaType: 'image', featured: false,
  }),
};