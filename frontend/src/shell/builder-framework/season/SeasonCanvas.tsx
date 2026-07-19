/**
 * Season Configuration Builder — Phase 5.
 * Configures the OPERATIONAL environment of a competition season. Base
 * columns via ConfigFieldsGrid; everything else in seasons.config (JSONB).
 * `matchRules` is enforced by the BACKEND match engine (VAR gate,
 * substitution limit); registration/officials pick from REAL clubs and
 * referees via the shared lookups.
 */
import { useMemo } from 'react';
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { ConfigGrid, RowsEditor, MultiCheckEditor, getPath, setPath, type ConfigFieldDef } from '../config-sections/ConfigToolkit';
import { seasonsConfig, type Season } from '@/features/admin/configs/seasons.config';
import { useEntityLookups } from '@/features/admin/lookups/useEntityLookups';
import { clubsLookup, refereesLookup } from '@/features/admin/lookups/sharedLookups';

type Draft = Partial<Season>;

const seasonLookups = { ...seasonsConfig, lookups: [clubsLookup, refereesLookup] };

const PERIOD_COLUMNS = [
  { key: 'label', label: 'Libellé', type: 'text' as const },
  { key: 'start', label: 'Début', type: 'date' as const, width: 'w-40' },
  { key: 'end', label: 'Fin', type: 'date' as const, width: 'w-40' },
];

const GRIDS: Record<string, ConfigFieldDef[]> = {
  identity: [
    { path: 'config.identity.code', label: 'Code (ex. S2026)', type: 'text' },
    { path: 'config.identity.years', label: 'Années (ex. 2025-2026)', type: 'text' },
  ],
  branding: [
    { path: 'config.branding.logoUrl', label: 'Logo de saison', type: 'media-image', uploadScope: { entity: 'seasons', field: 'logo' } },
    { path: 'config.branding.heroUrl', label: 'Bannière héro', type: 'media-image', uploadScope: { entity: 'seasons', field: 'hero' } },
    { path: 'config.branding.theme', label: 'Thème visuel', type: 'select', options: [
      { value: 'CLASSIC', label: 'Classique' }, { value: 'DARK', label: 'Sombre' }, { value: 'FESTIVE', label: 'Festif' }] },
  ],
  calendar: [
    { path: 'config.calendar.registrationStart', label: 'Ouverture des inscriptions', type: 'date', span: 1 },
    { path: 'config.calendar.registrationEnd', label: 'Clôture des inscriptions', type: 'date', span: 1 },
    { path: 'config.calendar.awardsCeremony', label: 'Cérémonie des récompenses', type: 'date', span: 1 },
  ],
  matchconfig: [
    { path: 'config.matchConfig.clubsCount', label: 'Nombre de clubs', type: 'number', span: 1 },
    { path: 'config.matchConfig.matchdays', label: 'Journées', type: 'number', span: 1 },
    { path: 'config.matchConfig.fixtureStrategy', label: 'Stratégie de calendrier', type: 'select', options: [
      { value: 'DOUBLE_ROUND_ROBIN', label: 'Aller-retour (double round robin)' },
      { value: 'SINGLE_ROUND_ROBIN', label: 'Aller simple' }] },
    { path: 'config.matchConfig.stadiumRotation', label: 'Rotation des stades', type: 'switch' },
    { path: 'config.matchConfig.defaultKickoff', label: 'Coup d’envoi par défaut (ex. 15:30)', type: 'text', span: 1 },
    { path: 'config.matchConfig.restDays', label: 'Jours de repos minimum', type: 'number', span: 1 },
    { path: 'config.matchConfig.broadcastWindows', label: 'Fenêtres de diffusion', type: 'tags', span: 2 },
  ],
  registration: [
    { path: 'config.registration.qualificationRules', label: 'Règles de qualification / relégation', type: 'textarea', span: 2 },
  ],
  officials: [
    { path: 'config.officials.assistantReferees', label: 'Arbitres assistants', type: 'tags', span: 2 },
    { path: 'config.officials.commissioners', label: 'Commissaires', type: 'tags', span: 2 },
    { path: 'config.officials.medicalDelegates', label: 'Délégués médicaux', type: 'tags', span: 2 },
  ],
  financial: [
    { path: 'config.financial.seasonBudget', label: 'Budget de saison (FCFA)', type: 'number', span: 1 },
    { path: 'config.financial.matchBudget', label: 'Budget par match', type: 'number', span: 1 },
    { path: 'config.financial.clubSubsidies', label: 'Subventions clubs', type: 'number', span: 1 },
    { path: 'config.financial.awardsBudget', label: 'Budget récompenses', type: 'number', span: 1 },
  ],
  matchrules: [
    { path: 'config.matchRules.duration', label: 'Durée réglementaire (minutes)', type: 'number', span: 1 },
    { path: 'config.matchRules.maxSubstitutions', label: 'Remplacements max / club', type: 'number', span: 1 },
    { path: 'config.matchRules.extraTime', label: 'Prolongations', type: 'switch' },
    { path: 'config.matchRules.penaltyShootout', label: 'Tirs au but', type: 'switch' },
    { path: 'config.matchRules.varEnabled', label: 'VAR disponible', type: 'switch' },
    { path: 'config.matchRules.coolingBreak', label: 'Pauses fraîcheur', type: 'switch' },
    { path: 'config.matchRules.replayRules', label: 'Règles de match à rejouer', type: 'textarea', span: 2 },
  ],
  public: [
    { path: 'config.publicExperience.publicVisible', label: 'Saison visible sur le site public', type: 'switch', span: 2 },
    { path: 'config.publicExperience.liveCenter', label: 'Live Center activé', type: 'switch', span: 2 },
    { path: 'config.publicExperience.statsVisible', label: 'Statistiques publiques', type: 'switch', span: 2 },
    { path: 'config.publicExperience.apiAvailable', label: 'API publique disponible', type: 'switch', span: 2 },
  ],
};

const AWARD_OPTIONS = [
  { value: 'MOTM', label: 'Homme du match' },
  { value: 'TEAM_OF_WEEK', label: 'Équipe de la semaine' },
  { value: 'PLAYER_OF_MONTH', label: 'Joueur du mois' },
  { value: 'COACH_OF_MONTH', label: 'Entraîneur du mois' },
  { value: 'PLAYER_OF_SEASON', label: 'Joueur de la saison' },
  { value: 'TOP_SCORER', label: 'Meilleur buteur' },
  { value: 'BEST_GOALKEEPER', label: 'Meilleur gardien' },
  { value: 'YOUNG_PLAYER', label: 'Meilleur espoir' },
  { value: 'FAIR_PLAY', label: 'Prix du fair-play' },
];

const INTRO: Record<string, string> = {
  matchrules: 'Règles de match de la saison — le moteur backend les APPLIQUE : VAR désactivé ⇒ événement VAR refusé ; limite de remplacements atteinte ⇒ POST refusé.',
  registration: 'Clubs engagés — sélection parmi les clubs RÉELS du backend.',
  awards: 'Récompenses actives cette saison — le Builder Récompenses les proposera en priorité.',
};

export function SeasonCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Draft>) {
  const lookupOptions = useEntityLookups(seasonLookups as any);
  const clubOptions = useMemo(() => lookupOptions.clubs ?? [], [lookupOptions]);
  const refereeOptions = useMemo(() => lookupOptions.referees ?? [], [lookupOptions]);
  const grid = GRIDS[activeSection];

  const multi = (path: string, label: string, options: { value: string; label: string }[], hint?: string) => (
    <MultiCheckEditor label={label} hint={hint} options={options}
      value={(getPath(draft, path) as string[]) ?? []}
      onChange={(v) => onChange(setPath(draft, path, v))} />
  );
  const periods = (path: string, label: string, addLabel: string) => (
    <RowsEditor label={label} columns={PERIOD_COLUMNS} addLabel={addLabel}
      value={(getPath(draft, path) as Record<string, unknown>[]) ?? []}
      onChange={(rows) => onChange(setPath(draft, path, rows))} />
  );

  return (
    <div className="mx-auto max-w-[760px] space-y-6 p-6">
      {INTRO[activeSection] && <p className="text-[13px] leading-relaxed text-zinc-500">{INTRO[activeSection]}</p>}
      {activeSection === 'identity' && (
        <ConfigFieldsGrid config={seasonsConfig} draft={draft} onChange={onChange} onSelect={onSelect} />
      )}
      {grid && <ConfigGrid defs={grid} draft={draft} onChange={onChange} onSelect={onSelect} />}
      {activeSection === 'calendar' && (
        <>
          {periods('config.calendar.transferWindows', 'Fenêtres de transferts', 'Ajouter une fenêtre')}
          {periods('config.calendar.fifaWindows', 'Fenêtres FIFA', 'Ajouter une fenêtre')}
          {periods('config.calendar.holidays', 'Trêves / jours fériés', 'Ajouter une trêve')}
        </>
      )}
      {activeSection === 'registration' && (
        <>
          {multi('config.registration.participatingClubIds', 'Clubs participants', clubOptions, 'Clubs réels — GET /clubs.')}
          {multi('config.registration.reserveClubIds', 'Clubs réservistes', clubOptions)}
        </>
      )}
      {activeSection === 'officials' &&
        multi('config.officials.refereeIds', 'Arbitres centraux de la saison', refereeOptions, 'Arbitres réels — GET /referees.')}
      {activeSection === 'financial' && (
        <RowsEditor label="Indemnités des officiels" addLabel="Ajouter un rôle"
          columns={[
            { key: 'role', label: 'Rôle', type: 'text' },
            { key: 'amount', label: 'Montant / match (FCFA)', type: 'number', width: 'w-48' },
          ]}
          value={(getPath(draft, 'config.financial.officialsPayments') as Record<string, unknown>[]) ?? []}
          onChange={(rows) => onChange(setPath(draft, 'config.financial.officialsPayments', rows))} />
      )}
      {activeSection === 'awards' &&
        multi('config.awards.enabled', 'Récompenses activées', AWARD_OPTIONS)}
    </div>
  );
}
