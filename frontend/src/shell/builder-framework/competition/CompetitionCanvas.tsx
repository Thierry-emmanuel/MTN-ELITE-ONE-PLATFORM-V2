/**
 * Competition Configuration Builder — Phase 5.
 * NOT a CRUD form: the control room where a competition is configured.
 * Entity columns (name, type, country, tier, logo) render through the same
 * ConfigFieldsGrid as everywhere else; everything OS-level lives in the
 * `config` JSONB blob and is rendered by the shared configuration toolkit.
 * Consumers of these values: the standings engine (points system, tie
 * breakers — enforced BACKEND-side), the public site (branding, SEO), the
 * awards pipeline (automation flags).
 */
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { ConfigGrid, RowsEditor, MultiCheckEditor, getPath, setPath, type ConfigFieldDef } from '../config-sections/ConfigToolkit';
import { competitionsConfig, type Competition } from '@/features/admin/configs/competitions.config';

type Draft = Partial<Competition>;

const GRIDS: Record<string, ConfigFieldDef[]> = {
  identity: [
    { path: 'config.identity.shortName', label: 'Nom court', type: 'text' },
    { path: 'config.identity.code', label: 'Code (ex. MTN1)', type: 'text' },
    { path: 'config.identity.slug', label: 'Slug public', type: 'text' },
    { path: 'config.identity.governingBody', label: 'Instance organisatrice', type: 'text' },
    { path: 'config.identity.description', label: 'Description', type: 'textarea', span: 2 },
  ],
  branding: [
    { path: 'config.branding.trophyUrl', label: 'Trophée', type: 'media-image', uploadScope: { entity: 'competitions', field: 'trophy' } },
    { path: 'config.branding.heroUrl', label: 'Bannière héro', type: 'media-image', uploadScope: { entity: 'competitions', field: 'hero' } },
    { path: 'config.branding.primaryColor', label: 'Couleur primaire (hex)', type: 'text' },
    { path: 'config.branding.secondaryColor', label: 'Couleur secondaire (hex)', type: 'text' },
    { path: 'config.branding.sponsors', label: 'Sponsors', type: 'tags', span: 2 },
    { path: 'config.branding.partners', label: 'Partenaires', type: 'tags', span: 2 },
  ],
  format: [
    { path: 'config.format.structure', label: 'Structure', type: 'select', options: [
      { value: 'LEAGUE', label: 'Championnat' }, { value: 'KNOCKOUT', label: 'Élimination directe' },
      { value: 'GROUPS', label: 'Phase de groupes' }, { value: 'HYBRID', label: 'Hybride (groupes + KO)' }] },
    { path: 'config.format.legs', label: 'Manches', type: 'select', options: [
      { value: 'HOME_AWAY', label: 'Aller / Retour' }, { value: 'SINGLE', label: 'Manche unique' }] },
    { path: 'config.format.aggregateRules', label: 'Règles de cumul (aller-retour)', type: 'textarea', span: 2 },
    { path: 'config.format.playoffRules', label: 'Règles de barrages', type: 'textarea', span: 2 },
    { path: 'config.format.qualificationRules', label: 'Règles de qualification', type: 'textarea', span: 2 },
  ],
  regulations: [
    { path: 'config.regulations.pointsSystem.win', label: 'Points — victoire', type: 'number', span: 1 },
    { path: 'config.regulations.pointsSystem.draw', label: 'Points — nul', type: 'number', span: 1 },
    { path: 'config.regulations.pointsSystem.loss', label: 'Points — défaite', type: 'number', span: 1 },
    { path: 'config.regulations.yellowsForSuspension', label: 'Jaunes avant suspension', type: 'number', span: 1 },
    { path: 'config.regulations.redCardBanMatches', label: 'Matchs de suspension (rouge)', type: 'number', span: 1 },
    { path: 'config.regulations.squadMaxSize', label: 'Taille max. effectif', type: 'number', span: 1 },
    { path: 'config.regulations.squadMaxForeign', label: 'Joueurs étrangers max.', type: 'number', span: 1 },
    { path: 'config.regulations.registrationRules', label: "Règles d'enregistrement", type: 'textarea', span: 2 },
  ],
  officials: [
    { path: 'config.officials.director', label: 'Directeur de la compétition', type: 'text', span: 2 },
    { path: 'config.officials.refereeCommittee', label: "Commission d'arbitrage", type: 'tags', span: 2 },
    { path: 'config.officials.commissioners', label: 'Commissaires de match', type: 'tags', span: 2 },
    { path: 'config.officials.varOfficials', label: 'Officiels VAR', type: 'tags', span: 2 },
  ],
  financial: [
    { path: 'config.financial.prizePool', label: 'Dotation totale (FCFA)', type: 'number' },
    { path: 'config.financial.registrationFee', label: "Frais d'inscription", type: 'number' },
    { path: 'config.financial.tvRights', label: 'Droits TV', type: 'number' },
    { path: 'config.financial.sponsorshipTotal', label: 'Sponsoring total', type: 'number' },
  ],
  media: [
    { path: 'config.media.documents', label: 'Documents (URLs règlements, chartes)', type: 'tags', span: 2 },
    { path: 'config.media.seoTitle', label: 'Titre SEO', type: 'text', span: 2 },
    { path: 'config.media.seoDescription', label: 'Description SEO', type: 'textarea', span: 2 },
    { path: 'config.media.landingTheme', label: 'Thème de la page publique', type: 'select', options: [
      { value: 'CLASSIC', label: 'Classique' }, { value: 'DARK', label: 'Sombre' }, { value: 'HERO', label: 'Héro plein écran' }] },
  ],
  automation: [
    { path: 'config.automation.autoStandings', label: 'Classement automatique (fin de match)', type: 'switch', span: 2 },
    { path: 'config.automation.autoStatistics', label: 'Statistiques automatiques', type: 'switch', span: 2 },
    { path: 'config.automation.autoAwards', label: 'Récompenses automatiques', type: 'switch', span: 2 },
    { path: 'config.automation.autoPassports', label: 'Passeports joueurs automatiques', type: 'switch', span: 2 },
    { path: 'config.automation.autoPublishing', label: 'Publication publique automatique', type: 'switch', span: 2 },
  ],
};

const TIE_BREAKER_OPTIONS = [
  { value: 'GOAL_DIFFERENCE', label: 'Différence de buts' },
  { value: 'GOALS_FOR', label: 'Buts marqués' },
  { value: 'WINS', label: 'Victoires' },
  { value: 'HEAD_TO_HEAD', label: 'Confrontations directes (à venir)' },
];

const INTRO: Record<string, string> = {
  identity: 'Identité de la compétition — les champs de base (nom, type, pays, palier, logo) plus l’identité éditoriale.',
  regulations: 'Règlement sportif. Le barème de points et l’ordre des critères de départage sont LUS par le moteur de classement backend à chaque recalcul.',
  automation: 'Interrupteurs des pipelines automatiques du système.',
};

export function CompetitionCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Draft>) {
  const grid = GRIDS[activeSection];
  return (
    <div className="mx-auto max-w-[760px] space-y-6 p-6">
      {INTRO[activeSection] && (
        <p className="text-[13px] leading-relaxed text-zinc-500">{INTRO[activeSection]}</p>
      )}
      {activeSection === 'identity' && (
        <ConfigFieldsGrid config={competitionsConfig} draft={draft} onChange={onChange} onSelect={onSelect} />
      )}
      {grid && <ConfigGrid defs={grid} draft={draft} onChange={onChange} onSelect={onSelect} />}
      {activeSection === 'regulations' && (
        <MultiCheckEditor
          label="Critères de départage (dans l'ordre coché)"
          hint="Appliqués par le backend après les points. Confrontations directes : accepté dans la configuration, appliqué dès que le moteur le supporte."
          options={TIE_BREAKER_OPTIONS}
          value={(getPath(draft, 'config.regulations.tieBreakers') as string[]) ?? []}
          onChange={(v) => onChange(setPath(draft, 'config.regulations.tieBreakers', v))}
        />
      )}
      {activeSection === 'financial' && (
        <RowsEditor
          label="Distribution de la dotation"
          hint="Montant par rang final — consommé par la cérémonie de fin de saison."
          columns={[
            { key: 'rank', label: 'Rang', type: 'number', width: 'w-24' },
            { key: 'amount', label: 'Montant (FCFA)', type: 'number' },
          ]}
          value={(getPath(draft, 'config.financial.prizeDistribution') as Record<string, unknown>[]) ?? []}
          onChange={(rows) => onChange(setPath(draft, 'config.financial.prizeDistribution', rows))}
          addLabel="Ajouter un rang"
        />
      )}
    </div>
  );
}
