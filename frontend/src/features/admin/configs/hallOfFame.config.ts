/**
 * Heritage Builder — Legends (Hall of Fame, MongoDB).
 * Historic MOMENTS live in big-moments (already registered); heritage
 * NARRATIVES (matchs historiques, saisons, records) route through the Story
 * Builder's CULTURE category — that channel was designed for the Heritage
 * Centre (see ArticleCategory.CULTURE).
 */
import type { EntityConfig } from '../engine/entityConfig.types';

export interface Legend {
  _id?: string;
  id?: string;
  name: string;
  birth_year?: number;
  clubs?: string[];
  career_summary?: string;
  achievements?: string[];
  era?: string;
  images?: string[];
  quote?: string;
  inducted_year?: number;
}

export const hallOfFameConfig: EntityConfig<Legend> = {
  name: 'hall-of-fame',
  labelSingular: 'Légende',
  labelPlural: 'Hall of Fame',
  apiBasePath: '/hall-of-fame',
  idField: '_id',
  searchableKeys: ['name', 'era'],
  columns: [
    { key: 'name', label: 'Nom' },
    { key: 'era', label: 'Époque' },
    { key: 'inducted_year', label: 'Intronisation' },
  ],
  fields: [
    { key: 'name', label: 'Nom de la légende', type: 'text', required: true, span: 2 },
    { key: 'birth_year', label: 'Année de naissance', type: 'number' },
    { key: 'era', label: 'Époque (ex. 1990-2005)', type: 'text' },
    { key: 'clubs', label: 'Clubs marquants', type: 'tags', span: 2 },
    { key: 'career_summary', label: 'Résumé de carrière', type: 'textarea', span: 2 },
    { key: 'achievements', label: 'Palmarès / Records', type: 'tags', span: 2,
      hint: 'Un fait par entrée — titres, records, distinctions' },
    { key: 'quote', label: 'Citation', type: 'textarea', span: 2 },
    { key: 'inducted_year', label: "Année d'intronisation", type: 'number' },
  ],
  emptyRecord: () => ({ name: '', clubs: [], achievements: [], images: [] }),
  beforeSave: (p) => ({
    ...p,
    birth_year: p.birth_year ? Number(p.birth_year) : undefined,
    inducted_year: p.inducted_year ? Number(p.inducted_year) : undefined,
  }),
  builderSteps: [
    { id: 'identity', label: 'Identité', fieldKeys: ['name', 'birth_year', 'era', 'clubs'] },
    { id: 'legacy', label: 'Héritage', fieldKeys: ['career_summary', 'achievements', 'quote'] },
    { id: 'induction', label: 'Intronisation', fieldKeys: ['inducted_year'] },
  ],
};
