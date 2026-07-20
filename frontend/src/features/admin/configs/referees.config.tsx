import type { EntityConfig } from '../engine/entityConfig.types';

export interface Referee {
  id?: string;
  firstName: string;
  lastName: string;
  nationality: string;
  birthDate?: string;
  birthPlace?: string;
  licenseLevel: 'NATIONAL' | 'CAF' | 'FIFA';
  licenseNumber?: string;
  yearsActive?: number;
  phoneNumber?: string;
  email?: string;
  city?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
  notes?: string;
}

const LICENSE_BADGE: Record<string, string> = {
  FIFA: 'text-amber-400 bg-amber-400/10 border border-amber-400/30',
  CAF: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30',
  NATIONAL: 'text-blue-400 bg-blue-400/10 border border-blue-400/30',
};

export const refereesConfig: EntityConfig<Referee> = {
  name: 'referees',
  labelSingular: 'Arbitre',
  labelPlural: 'Arbitres',
  apiBasePath: '/referees',
  idField: 'id',
  searchableKeys: ['firstName', 'lastName', 'city'],
  columns: [
    {
      key: 'lastName',
      label: 'Arbitre',
      render: (r: Referee) => (
        <div className="flex items-center gap-2">
          {r.photoUrl ? (
            <img src={r.photoUrl} alt={`${r.firstName} ${r.lastName}`} className="h-6 w-6 object-cover rounded-full bg-white/5 border border-white/10" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
              {r.firstName?.[0] || ''}{r.lastName?.[0] || ''}
            </div>
          )}
          <span>{r.firstName} {r.lastName}</span>
        </div>
      ),
    },
    {
      key: 'licenseLevel',
      label: 'Niveau',
      render: (r: Referee) => (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${LICENSE_BADGE[r.licenseLevel] || ''}`}>
          {r.licenseLevel}
        </span>
      ),
    },
    { key: 'city', label: 'Ville' },
    { key: 'status', label: 'Statut' },
  ],
  fields: [
    { key: 'firstName', label: 'Prénom', type: 'text', required: true, span: 1 },
    { key: 'lastName', label: 'Nom de famille', type: 'text', required: true, span: 1 },
    { key: 'nationality', label: 'Nationalité', type: 'text', required: true, span: 1 },
    { key: 'city', label: 'Ville de résidence', type: 'text', span: 1 },
    {
      key: 'licenseLevel', label: 'Grade / Niveau de licence', type: 'select', required: true, span: 1,
      options: [
        { value: 'NATIONAL', label: 'Elite National' },
        { value: 'CAF', label: 'Elite CAF' },
        { value: 'FIFA', label: 'FIFA International' },
      ],
    },
    { key: 'licenseNumber', label: 'Numéro de licence', type: 'text', span: 1 },
    { key: 'yearsActive', label: 'Années d\'activité', type: 'number', span: 1 },
    {
      key: 'status', label: 'Statut d\'activité', type: 'select', required: true, span: 1,
      options: [
        { value: 'ACTIVE', label: 'Actif / Disponible' },
        { value: 'SUSPENDED', label: 'Suspendu' },
        { value: 'RETIRED', label: 'Retraité' },
      ],
    },
    { key: 'birthDate', label: 'Date de naissance', type: 'date', span: 1 },
    { key: 'birthPlace', label: 'Lieu de naissance', type: 'text', span: 1 },
    { key: 'phoneNumber', label: 'Numéro de téléphone', type: 'text', span: 1 },
    { key: 'email', label: 'E-mail', type: 'text', span: 1 },
    {
      key: 'photoUrl', label: 'Photo de profil', type: 'media-image', span: 2,
      uploadScope: { entity: 'referees', field: 'photo' },
    },
    { key: 'notes', label: 'Observations / Historique disciplinaire', type: 'textarea', span: 2 },
  ],
  emptyRecord: () => ({
    firstName: '', lastName: '', nationality: 'Camerounaise', licenseLevel: 'NATIONAL', status: 'ACTIVE',
  }),
  builderSteps: [
    {
      id: 'identity',
      label: 'Identité',
      description: 'Détails personnels et civils de l\'arbitre.',
      fieldKeys: ['firstName', 'lastName', 'nationality', 'city', 'birthDate', 'birthPlace'],
    },
    {
      id: 'license',
      label: 'Licence & Contact',
      description: 'Niveau d\'accréditation, années d\'expérience et contacts.',
      fieldKeys: ['licenseLevel', 'licenseNumber', 'yearsActive', 'phoneNumber', 'email', 'status'],
    },
    {
      id: 'profile',
      label: 'Profil & Notes',
      description: 'Photo d\'identité officielle et notes de suivi.',
      fieldKeys: ['photoUrl', 'notes'],
    },
  ],
  publishOverrides: { status: 'ACTIVE' },
};
