import type { EntityConfig } from '../engine/entityConfig.types';

export interface Staff {
  id?: string;
  firstName: string;
  lastName: string;
  nationality?: string;
  birthDate?: string;
  role: 'HEAD_COACH' | 'ASSISTANT_COACH' | 'GOALKEEPER_COACH' | 'FITNESS_COACH' | 'PHYSIO' | 'DOCTOR' | 'ANALYST' | 'SCOUT' | 'KIT_MAN' | 'MEDIA_OFFICER' | 'SECRETARY' | 'TEAM_MANAGER';
  clubId?: string;
  contractStart?: string;
  contractEnd?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  bio?: string;
}

export const staffConfig: EntityConfig<Staff> = {
  name: 'staff',
  labelSingular: 'Membre du staff',
  labelPlural: 'Staff Technique',
  apiBasePath: '/staff',
  idField: 'id',
  searchableKeys: ['firstName', 'lastName'],
  columns: [
    { key: 'lastName', label: 'Nom', render: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'role', label: 'Rôle', render: (r) => r.role.replace('_', ' ') },
    { key: 'clubId', label: 'Club', optionsKey: 'clubs' },
    { key: 'status', label: 'Statut' },
  ],
  fields: [
    { key: 'firstName', label: 'Prénom', type: 'text', required: true, span: 1 },
    { key: 'lastName', label: 'Nom', type: 'text', required: true, span: 1 },
    {
      key: 'role', label: 'Rôle / Fonction', type: 'select', required: true, span: 1,
      options: [
        { value: 'HEAD_COACH', label: 'Entraîneur Principal' },
        { value: 'ASSISTANT_COACH', label: 'Entraîneur Adjoint' },
        { value: 'GOALKEEPER_COACH', label: 'Entraîneur des Gardiens' },
        { value: 'FITNESS_COACH', label: 'Préparateur Physique' },
        { value: 'PHYSIO', label: 'Kinésithérapeute' },
        { value: 'DOCTOR', label: 'Médecin du Sport' },
        { value: 'ANALYST', label: 'Analyste Vidéo' },
        { value: 'SCOUT', label: 'Recruteur / Scout' },
        { value: 'KIT_MAN', label: 'Intendant / Kit Man' },
        { value: 'MEDIA_OFFICER', label: 'Officier Média' },
        { value: 'SECRETARY', label: 'Secrétaire Général' },
        { value: 'TEAM_MANAGER', label: 'Team Manager' },
      ],
    },
    { key: 'clubId', label: 'Club affilié', type: 'select', optionsKey: 'clubs', required: true, span: 1 },
    { key: 'nationality', label: 'Nationalité', type: 'text', span: 1 },
    { key: 'birthDate', label: 'Date de naissance', type: 'date', span: 1 },
    { key: 'contractStart', label: 'Début contrat', type: 'date', span: 1 },
    { key: 'contractEnd', label: 'Fin contrat', type: 'date', span: 1 },
    {
      key: 'status', label: 'Statut du contrat', type: 'select', required: true, span: 1,
      options: [
        { value: 'ACTIVE', label: 'Actif sous contrat' },
        { value: 'INACTIVE', label: 'Inactif / Ancien membre' },
      ],
    },
    {
      key: 'photoUrl', label: 'Photo de profil', type: 'media-image', span: 2,
      uploadScope: { entity: 'staff', field: 'photo' },
    },
    { key: 'bio', label: 'Biographie / Parours professionnel', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({
    firstName: '', lastName: '', role: 'ASSISTANT_COACH', status: 'ACTIVE', nationality: 'Camerounaise',
  }),
  builderSteps: [
    {
      id: 'identity',
      label: 'Identité & Rôle',
      description: 'Nom, fonction et club affilié.',
      fieldKeys: ['firstName', 'lastName', 'role', 'clubId', 'nationality', 'birthDate'],
    },
    {
      id: 'contract',
      label: 'Contrat & Profil',
      description: 'Période contractuelle et photos.',
      fieldKeys: ['contractStart', 'contractEnd', 'status', 'photoUrl', 'bio'],
    },
  ],
  publishOverrides: { status: 'ACTIVE' },
};
