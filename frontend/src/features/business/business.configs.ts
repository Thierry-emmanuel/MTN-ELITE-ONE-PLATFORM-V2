/**
 * Football Business — seven studios as EntityConfigs. The Builder Framework
 * factory turns each into a full studio (draft/publish, autosave, real
 * lists, backend validation surfaced) with ZERO bespoke builder code; the
 * Presentation & Export Engine picks any of them up with a one-line dataset
 * adapter. Backend: /business/:collection (Mongo, strict schemas).
 */
import { clubsLookup, seasonsLookup } from '@/features/admin/lookups/sharedLookups';
import type { EntityConfig, FieldDef } from '@/features/admin/engine/entityConfig.types';

type Row = { _id?: string; id?: string } & Record<string, unknown>;

const money = (key: string, label: string): FieldDef<any>[] => [
  { key, label, type: 'number', required: true, span: 1 },
  { key: 'currency', label: 'Devise', type: 'select', span: 1, options: [
    { value: 'FCFA', label: 'FCFA' }, { value: 'EUR', label: 'EUR' }, { value: 'USD', label: 'USD' }] },
];
const statusField = (options: [string, string][]): FieldDef<any> => ({
  key: 'status', label: 'Statut', type: 'select',
  options: options.map(([value, label]) => ({ value, label })),
});
const base = (name: string, singular: string, plural: string, collection: string) => ({
  name, labelSingular: singular, labelPlural: plural,
  apiBasePath: `/business/${collection}`, idField: '_id' as const,
});

export const financeConfig: EntityConfig<Row> = {
  ...base('finance', 'Écriture', 'Finance Studio', 'finance'),
  lookups: [clubsLookup, seasonsLookup],
  searchableKeys: ['label', 'category', 'counterparty'],
  columns: [{ key: 'label', label: 'Libellé' }, { key: 'kind', label: 'Sens' }, { key: 'amount', label: 'Montant' }, { key: 'status', label: 'Statut' }],
  fields: [
    { key: 'kind', label: 'Sens', type: 'select', required: true, options: [
      { value: 'INCOME', label: 'Recette' }, { value: 'EXPENSE', label: 'Dépense' }] },
    { key: 'category', label: 'Catégorie', type: 'text', required: true, hint: 'Subventions, billetterie, primes, officiels…' },
    { key: 'label', label: 'Libellé', type: 'text', required: true, span: 2 },
    ...money('amount', 'Montant'),
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'counterparty', label: 'Contrepartie', type: 'text' },
    { key: 'seasonId', label: 'Saison', type: 'select', optionsKey: 'seasons' },
    { key: 'clubId', label: 'Club concerné', type: 'select', optionsKey: 'clubs' },
    statusField([['DRAFT', 'Brouillon'], ['APPROVED', 'Approuvée'], ['PAID', 'Payée']]),
    { key: 'reference', label: 'Référence', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({ kind: 'EXPENSE', category: '', label: '', amount: 0, currency: 'FCFA', status: 'DRAFT' }),
  beforeSave: (p) => ({ ...p, amount: Number(p.amount ?? 0), seasonId: p.seasonId ? Number(p.seasonId) : undefined, clubId: p.clubId ? Number(p.clubId) : undefined }),
  builderSteps: [
    { id: 'entry', label: 'Écriture', fieldKeys: ['kind', 'category', 'label', 'amount', 'currency', 'date'] },
    { id: 'links', label: 'Rattachements', fieldKeys: ['counterparty', 'seasonId', 'clubId', 'reference'] },
    { id: 'validation', label: 'Validation', fieldKeys: ['status', 'notes'] },
  ],
};

export const sponsorshipConfig: EntityConfig<Row> = {
  ...base('sponsorship-deals', 'Contrat sponsor', 'Sponsorship Studio', 'sponsorship'),
  searchableKeys: ['sponsorName', 'tier'],
  columns: [{ key: 'sponsorName', label: 'Sponsor' }, { key: 'tier', label: 'Rang' }, { key: 'amount', label: 'Montant' }, { key: 'status', label: 'Statut' }],
  fields: [
    { key: 'sponsorName', label: 'Sponsor', type: 'text', required: true, span: 2, hint: 'Le registre des partenaires vit dans Sponsors (module Données) — ceci est le CONTRAT.' },
    { key: 'tier', label: 'Rang', type: 'select', options: [
      { value: 'TITLE', label: 'Sponsor titre' }, { value: 'OFFICIAL', label: 'Officiel' },
      { value: 'TECHNICAL', label: 'Technique' }, { value: 'MEDIA', label: 'Média' }, { value: 'SUPPLIER', label: 'Fournisseur' }] },
    ...money('amount', 'Montant du contrat'),
    { key: 'startDate', label: 'Début', type: 'date' },
    { key: 'endDate', label: 'Fin', type: 'date' },
    { key: 'assets', label: 'Actifs activés', type: 'tags', span: 2, hint: 'Maillot, LED, naming, digital…' },
    statusField([['NEGOTIATION', 'Négociation'], ['SIGNED', 'Signé'], ['ACTIVE', 'Actif'], ['EXPIRED', 'Expiré']]),
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({ sponsorName: '', tier: 'OFFICIAL', amount: 0, currency: 'FCFA', assets: [], status: 'NEGOTIATION' }),
  beforeSave: (p) => ({ ...p, amount: Number(p.amount ?? 0) }),
  builderSteps: [
    { id: 'deal', label: 'Contrat', fieldKeys: ['sponsorName', 'tier', 'amount', 'currency', 'startDate', 'endDate'] },
    { id: 'activation', label: 'Activation', fieldKeys: ['assets', 'status', 'notes'] },
  ],
};

export const broadcastConfig: EntityConfig<Row> = {
  ...base('broadcast-deals', 'Droit de diffusion', 'Broadcasting Studio', 'broadcast'),
  lookups: [seasonsLookup],
  searchableKeys: ['broadcaster', 'territory'],
  columns: [{ key: 'broadcaster', label: 'Diffuseur' }, { key: 'medium', label: 'Média' }, { key: 'status', label: 'Statut' }],
  fields: [
    { key: 'broadcaster', label: 'Diffuseur', type: 'text', required: true, span: 2 },
    { key: 'medium', label: 'Média', type: 'select', options: [
      { value: 'TV', label: 'Télévision' }, { value: 'RADIO', label: 'Radio' },
      { value: 'STREAMING', label: 'Streaming' }, { value: 'HIGHLIGHTS', label: 'Résumés' }] },
    { key: 'exclusivity', label: 'Exclusivité', type: 'select', options: [
      { value: 'EXCLUSIVE', label: 'Exclusif' }, { value: 'NON_EXCLUSIVE', label: 'Non exclusif' }] },
    { key: 'territory', label: 'Territoire', type: 'text' },
    ...money('amount', 'Montant'),
    { key: 'seasonId', label: 'Saison', type: 'select', optionsKey: 'seasons' },
    { key: 'matchesPerRound', label: 'Matchs diffusés / journée', type: 'number' },
    statusField([['NEGOTIATION', 'Négociation'], ['SIGNED', 'Signé'], ['ACTIVE', 'Actif'], ['EXPIRED', 'Expiré']]),
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({ broadcaster: '', medium: 'TV', exclusivity: 'NON_EXCLUSIVE', currency: 'FCFA', status: 'NEGOTIATION' }),
  beforeSave: (p) => ({ ...p, amount: p.amount ? Number(p.amount) : undefined, seasonId: p.seasonId ? Number(p.seasonId) : undefined, matchesPerRound: p.matchesPerRound ? Number(p.matchesPerRound) : undefined }),
  builderSteps: [
    { id: 'rights', label: 'Droits', fieldKeys: ['broadcaster', 'medium', 'exclusivity', 'territory'] },
    { id: 'terms', label: 'Conditions', fieldKeys: ['amount', 'currency', 'seasonId', 'matchesPerRound'] },
    { id: 'state', label: 'État', fieldKeys: ['status', 'notes'] },
  ],
};

export const documentsConfig: EntityConfig<Row> = {
  ...base('documents', 'Document', 'Documents Studio', 'documents'),
  searchableKeys: ['title', 'type'],
  columns: [{ key: 'title', label: 'Titre' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Statut' }],
  fields: [
    { key: 'title', label: 'Titre', type: 'text', required: true, span: 2 },
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'CONTRACT', label: 'Contrat' }, { value: 'REGULATION', label: 'Règlement' },
      { value: 'LICENSE', label: 'Licence' }, { value: 'MINUTES', label: 'Procès-verbal' },
      { value: 'CIRCULAR', label: 'Circulaire' }, { value: 'OTHER', label: 'Autre' }] },
    { key: 'fileUrl', label: 'Fichier', type: 'media-image', required: true, span: 2, uploadScope: { entity: 'documents', field: 'file' } },
    { key: 'relatedEntity', label: 'Entité liée', type: 'text', hint: 'ex. clubs/4, seasons/2' },
    { key: 'expiryDate', label: "Date d'expiration", type: 'date' },
    statusField([['DRAFT', 'Brouillon'], ['PUBLISHED', 'Publié'], ['ARCHIVED', 'Archivé']]),
    { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
  ],
  emptyRecord: () => ({ title: '', type: 'OTHER', fileUrl: '', status: 'DRAFT', tags: [] }),
  builderSteps: [
    { id: 'doc', label: 'Document', fieldKeys: ['title', 'type', 'fileUrl'] },
    { id: 'life', label: 'Cycle de vie', fieldKeys: ['relatedEntity', 'expiryDate', 'status', 'tags'] },
  ],
};

export const licensesConfig: EntityConfig<Row> = {
  ...base('licenses', 'Licence', 'Licensing Studio', 'licenses'),
  lookups: [seasonsLookup],
  searchableKeys: ['subjectName', 'subjectType'],
  columns: [{ key: 'subjectName', label: 'Sujet' }, { key: 'subjectType', label: 'Type' }, { key: 'status', label: 'Statut' }],
  fields: [
    { key: 'subjectType', label: 'Type de sujet', type: 'select', required: true, options: [
      { value: 'CLUB', label: 'Club' }, { value: 'PLAYER', label: 'Joueur' },
      { value: 'STAFF', label: 'Staff' }, { value: 'MEDIA', label: 'Média' }] },
    { key: 'subjectId', label: 'Id du sujet', type: 'number', required: true },
    { key: 'subjectName', label: 'Nom du sujet', type: 'text', span: 2 },
    { key: 'seasonId', label: 'Saison', type: 'select', optionsKey: 'seasons' },
    { key: 'validUntil', label: 'Valide jusqu’au', type: 'date' },
    statusField([['PENDING', 'En attente'], ['UNDER_REVIEW', 'En instruction'], ['APPROVED', 'Approuvée'], ['REJECTED', 'Rejetée'], ['REVOKED', 'Révoquée']]),
    { key: 'reviewer', label: 'Instructeur', type: 'text' },
    { key: 'documents', label: 'Pièces (URLs)', type: 'tags', span: 2 },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({ subjectType: 'CLUB', subjectId: 0, status: 'PENDING', documents: [] }),
  beforeSave: (p) => ({ ...p, subjectId: Number(p.subjectId ?? 0), seasonId: p.seasonId ? Number(p.seasonId) : undefined }),
  builderSteps: [
    { id: 'subject', label: 'Sujet', fieldKeys: ['subjectType', 'subjectId', 'subjectName', 'seasonId'] },
    { id: 'review', label: 'Instruction', fieldKeys: ['status', 'reviewer', 'validUntil', 'documents', 'notes'] },
  ],
};

export const contactsConfig: EntityConfig<Row> = {
  ...base('contacts', 'Contact', 'CRM Studio', 'contacts'),
  searchableKeys: ['name', 'organization', 'type'],
  columns: [{ key: 'name', label: 'Nom' }, { key: 'organization', label: 'Organisation' }, { key: 'type', label: 'Type' }],
  fields: [
    { key: 'name', label: 'Nom', type: 'text', required: true, span: 2 },
    { key: 'organization', label: 'Organisation', type: 'text' },
    { key: 'role', label: 'Fonction', type: 'text' },
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'PARTNER', label: 'Partenaire' }, { value: 'MEDIA', label: 'Média' },
      { value: 'OFFICIAL', label: 'Officiel' }, { value: 'SUPPLIER', label: 'Fournisseur' },
      { value: 'INSTITUTION', label: 'Institution' }, { value: 'OTHER', label: 'Autre' }] },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'text' },
    { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
    { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({ name: '', type: 'OTHER', tags: [] }),
  builderSteps: [
    { id: 'identity', label: 'Identité', fieldKeys: ['name', 'organization', 'role', 'type'] },
    { id: 'reach', label: 'Coordonnées', fieldKeys: ['email', 'phone', 'tags', 'notes'] },
  ],
};

export const commercialConfig: EntityConfig<Row> = {
  ...base('commercial', 'Offre', 'Commercial Studio', 'commercial'),
  lookups: [clubsLookup, seasonsLookup],
  searchableKeys: ['name', 'kind'],
  columns: [{ key: 'name', label: 'Offre' }, { key: 'kind', label: 'Type' }, { key: 'price', label: 'Prix' }, { key: 'status', label: 'Statut' }],
  fields: [
    { key: 'name', label: 'Nom de l’offre', type: 'text', required: true, span: 2 },
    { key: 'kind', label: 'Type', type: 'select', options: [
      { value: 'TICKETING', label: 'Billetterie' }, { value: 'HOSPITALITY', label: 'Hospitalité' },
      { value: 'MERCHANDISING', label: 'Merchandising' }, { value: 'DIGITAL', label: 'Digital' }, { value: 'EVENT', label: 'Événement' }] },
    ...money('price', 'Prix'),
    { key: 'seasonId', label: 'Saison', type: 'select', optionsKey: 'seasons' },
    { key: 'clubId', label: 'Club', type: 'select', optionsKey: 'clubs' },
    { key: 'description', label: 'Description', type: 'textarea', span: 2 },
    statusField([['DRAFT', 'Brouillon'], ['ON_SALE', 'En vente'], ['SOLD_OUT', 'Épuisé'], ['ARCHIVED', 'Archivé']]),
  ],
  emptyRecord: () => ({ name: '', kind: 'TICKETING', currency: 'FCFA', status: 'DRAFT' }),
  beforeSave: (p) => ({ ...p, price: p.price ? Number(p.price) : undefined, seasonId: p.seasonId ? Number(p.seasonId) : undefined, clubId: p.clubId ? Number(p.clubId) : undefined }),
  builderSteps: [
    { id: 'offer', label: 'Offre', fieldKeys: ['name', 'kind', 'price', 'currency'] },
    { id: 'scope', label: 'Périmètre', fieldKeys: ['seasonId', 'clubId', 'description', 'status'] },
  ],
};

export const BUSINESS_CONFIGS = {
  finance: financeConfig,
  'sponsorship-deals': sponsorshipConfig,
  'broadcast-deals': broadcastConfig,
  documents: documentsConfig,
  licenses: licensesConfig,
  contacts: contactsConfig,
  commercial: commercialConfig,
} as const;
