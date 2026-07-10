import type { EntityConfig } from '../engine/entityConfig.types';

// Mirrors the DTO built by AdminPage's saveMatch().
export interface Match {
  id?: string;
  homeClubId: string;
  awayClubId: string;
  homeScore?: number;
  awayScore?: number;
  status?: 'SCHEDULED' | 'LIVE' | 'HT' | 'FT' | 'POSTPONED' | 'CANCELLED';
  round: number;
  scheduledAt: string; // ISO timestamp on the wire; datetime-local string while editing
  venue?: string;
  seasonId: string;
}

function toLocalDateTimeInputValue(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const matchesConfig: EntityConfig<Match> = {
  name: 'matches',
  labelSingular: 'Match',
  labelPlural: 'Matchs',
  apiBasePath: '/matches',
  idField: 'id',

  columns: [
    { key: 'round', label: 'J.' },
    { key: 'homeClubId', label: 'Domicile' },
    { key: 'awayClubId', label: 'Extérieur' },
    { key: 'scheduledAt', label: "Coup d'envoi" },
    { key: 'status', label: 'Statut' },
  ],

  fields: [
    { key: 'homeClubId', label: 'Club Domicile', type: 'select', optionsKey: 'clubs', required: true, span: 1 },
    { key: 'awayClubId', label: 'Club Extérieur', type: 'select', optionsKey: 'clubs', required: true, span: 1 },
    { key: 'seasonId', label: 'Saison', type: 'select', optionsKey: 'seasons', required: true, span: 2 },
    { key: 'round', label: 'Journée', type: 'number', required: true, span: 1 },
    { key: 'scheduledAt', label: "Coup d'envoi", type: 'datetime-local', required: true, span: 1 },
    { key: 'venue', label: 'Stade / Lieu', type: 'text', span: 2 },
    {
      key: 'status', label: 'Statut', type: 'select', span: 2,
      options: [
        { value: 'SCHEDULED', label: 'Programmé' },
        { value: 'LIVE', label: 'LIVE' },
        { value: 'HT', label: 'Mi-temps' },
        { value: 'FT', label: 'Terminé' },
        { value: 'POSTPONED', label: 'Reporté' },
        { value: 'CANCELLED', label: 'Annulé' },
      ],
    },
    { key: 'homeScore', label: 'Score Domicile', type: 'number', span: 1 },
    { key: 'awayScore', label: 'Score Extérieur', type: 'number', span: 1 },
  ],

  emptyRecord: () => ({
    homeClubId: '', awayClubId: '', seasonId: '',
    status: 'SCHEDULED', round: 1,
    scheduledAt: toLocalDateTimeInputValue(new Date().toISOString()),
    venue: '',
  }),

  // ── League Studio: Match Builder ───────────────────────────────────────
  builderSteps: [
    {
      id: 'matchup',
      label: 'Confrontation',
      description: 'Qui affronte qui, et dans quelle saison ?',
      fieldKeys: ['homeClubId', 'awayClubId', 'seasonId'],
    },
    {
      id: 'schedule',
      label: 'Programmation',
      description: "Journée, date et lieu du coup d'envoi.",
      fieldKeys: ['round', 'scheduledAt', 'venue'],
    },
    {
      id: 'score',
      label: 'Score & Statut',
      description: 'Laissez le score vide pour un match à venir.',
      fieldKeys: ['status', 'homeScore', 'awayScore'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez la confrontation avant de la publier sur le hub Matchs.',
      fieldKeys: [],
    },
  ],
  // A published match becomes visible on the public Matches hub as
  // SCHEDULED by default — the editor already chose the real status in the
  // Score & Statut step, so publishing doesn't need to force anything.
  publishOverrides: {},

  // The datetime-local input yields 'YYYY-MM-DDTHH:mm' in local time; the
  // backend expects a full ISO timestamp — exactly the conversion the old
  // bespoke saveMatch() did by hand. Club/season ids are coerced to string
  // defensively since <select> always yields strings.
  beforeSave: (payload) => ({
    ...payload,
    scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt).toISOString() : payload.scheduledAt,
    homeClubId: payload.homeClubId != null ? String(payload.homeClubId) : payload.homeClubId,
    awayClubId: payload.awayClubId != null ? String(payload.awayClubId) : payload.awayClubId,
    seasonId: payload.seasonId != null ? String(payload.seasonId) : payload.seasonId,
  }),
};
