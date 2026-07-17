import type { EntityConfig } from '../engine/entityConfig.types';
import { playersLookup } from '../lookups/sharedLookups';

// This shape matches the REAL backend contract:
// backend1/src/talents/schemas/talent-profile.schema.ts (Mongoose, collection
// `talent_profiles`) and backend1/src/talents/dto/create-talent-profile.dto.ts.
//
// It intentionally does NOT match the previous admin UI in AdminPage.tsx
// (the 'halloffame'-embedded "Talents" block and the separate 'scouting'
// tab), which posted { playerId, highlightVideoUrl, status, scoutingNotes,
// rating } — camelCase field names and three fields (`status`,
// `highlightVideoUrl`, plus a `position`/`age` pair only present in the
// 'scouting' tab's local form state) that do not exist anywhere in the
// backend schema or DTO. Concretely, on the old UI:
//   - Every save sent `playerId` while the DTO requires `player_id` — the
//     required field was always missing, so every create/update to this
//     entity failed backend validation.
//   - `status`, `highlightVideoUrl`, `position` and `age` were entered into
//     the form and then silently dropped — `saveTalent()` in AdminPage.tsx
//     only ever forwarded playerId/highlightVideoUrl/status/scoutingNotes/
//     rating, and none of those (except the always-missing playerId) exist
//     on the DTO, so nothing an editor typed into those fields was ever
//     persisted.
//   - The same collection was editable from two different tabs
//     ('halloffame' and 'scouting') with duplicated local state.
//
// Per the Phase 0 brief ("do NOT build new business features"), this config
// exposes exactly the fields the backend already persists. The
// Watchlist/Promoted/National-Team progression status and highlight-video
// concepts the old UI implied are real, plausible product features — but
// since nothing ever actually backed them, adding that support is a real
// schema change (new Mongoose fields + DTO validation) and belongs in a
// later, explicitly-scoped feature phase, not folded quietly into this
// architecture pass. Flagged in the audit follow-up for a product decision.
export interface TalentProfile {
  _id?: string;
  player_id: string;
  bio?: { fr: string; en: string };
  potential_rating?: number;
  scout_notes?: string;
  similar_player_id?: string;
  academy?: string;
}

export const talentsConfig: EntityConfig<TalentProfile> = {
  name: 'talents',
  labelSingular: 'Profil Talent',
  labelPlural: 'Jeunes Talents',
  apiBasePath: '/talents',
  idField: '_id',
  icon: 'TrendingUp',
  navGroup: 'Contenu',
  lookups: [playersLookup],
  columns: [
    // No player name shown here yet — the backend stores only `player_id`
    // with no join/enrichment (see TalentsService.findAll), so a readable
    // name in the table (not just the form's dropdown) needs either a
    // backend-side populate or the future Relation Engine's preview
    // resolution (Part 5). Tracked, not silently faked with a placeholder.
    { key: 'player_id', label: 'Joueur (ID)' },
    { key: 'academy', label: 'Académie' },
    { key: 'potential_rating', label: 'Potentiel', align: 'center', render: (r) => (r.potential_rating ? `${r.potential_rating}/10` : '—') },
  ],
  fields: [
    { key: 'player_id', label: 'Joueur', type: 'select', optionsKey: 'players', required: true, span: 2 },
    { key: 'potential_rating', label: 'Potentiel (1–10)', type: 'number', hint: 'Évaluation du potentiel, de 1 à 10' },
    { key: 'academy', label: 'Académie / Centre de formation', type: 'text' },
    { key: 'similar_player_id', label: 'Joueur de référence (comparable)', type: 'select', optionsKey: 'players' },
    { key: 'scout_notes', label: "Notes d'observation (scout)", type: 'textarea', span: 2 },
    {
      key: 'bio', label: 'Biographie', type: 'nested-object', span: 2,
      subFields: [
        { key: 'fr', label: 'Biographie (Français)', type: 'text' },
        { key: 'en', label: 'Biographie (English)', type: 'text' },
      ],
    },
  ],
  emptyRecord: () => ({ potential_rating: 5 }),
  searchableKeys: ['academy', 'scout_notes'],
  builderSteps: [
    {
      id: 'identity',
      label: 'Identité',
      description: 'Quel joueur suit-on, et dans quelle académie ?',
      fieldKeys: ['player_id', 'academy', 'potential_rating'],
    },
    {
      id: 'scouting',
      label: 'Observation',
      description: 'Notes de scouting et biographie.',
      fieldKeys: ['similar_player_id', 'scout_notes', 'bio'],
    },
    {
      id: 'review',
      label: 'Relecture',
      description: 'Vérifiez le profil talent avant de le sauvegarder.',
      fieldKeys: [],
    },
  ],
};
