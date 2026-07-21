/**
 * Stadium Builder Canvas — FootballOS Enterprise Workspace Engine.
 * Implements the 14-tier Stadium Operating System canvas with FIFA/CAF standards,
 * Apple-grade aesthetic precision, Linear-level density, and Notion-like flexibility.
 */
import { useState } from 'react';
import {
  Building2, MapPin, Shield, Trophy, Users, Wifi, CheckCircle2,
  Calendar, Layers, FileText, Camera, Flame, Info, Check, Globe, Plus, Trash2
} from 'lucide-react';
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { ConfigGrid, type ConfigFieldDef, getPath, setPath } from '../config-sections/ConfigToolkit';
import type { Stadium } from '@/features/admin/configs/stadiums.config';
import { stadiumsConfig } from '@/features/admin/configs/stadiums.config';
import { MediaUploader } from '@/components/ui/AdminUI';
import { useEntityLookups } from '@/features/admin/lookups/useEntityLookups';

type Draft = Partial<Stadium>;

// ── 1. SECTION CONFIGURATIONS ──────────────────────────────────────────────

const GENERAL_FIELDS: ConfigFieldDef[] = [
  { path: 'config.basicInfo.officialName', label: 'Nom Officiel Complet', type: 'text', span: 2 },
  { path: 'config.basicInfo.shortName', label: 'Nom Court (Broadcast / Scoreboard)', type: 'text', span: 1 },
  { path: 'config.basicInfo.nickname', label: 'Surnom Popularisé (ex: Le Chaudron de Mfandena)', type: 'text', span: 1 },
  { path: 'config.basicInfo.slug', label: 'Slug URL Public', type: 'text', span: 1 },
  { path: 'config.basicInfo.yearRenovated', label: 'Dernière Année de Rénovation', type: 'number', span: 1 },
  { path: 'config.basicInfo.openingDate', label: 'Date d\'Inauguration', type: 'text', span: 1 },
  { path: 'config.basicInfo.closingDate', label: 'Date de Fermeture Prévue / Historique', type: 'text', span: 1 },
  { path: 'config.basicInfo.description', label: 'Présentation Historique & Architecturale', type: 'textarea', span: 2 },
];

const IDENTITY_FIELDS: ConfigFieldDef[] = [
  { path: 'config.identity.officialLogo', label: 'Logo Officiel du Stade (PNG/SVG)', type: 'media-image', span: 1 },
  { path: 'config.identity.panoramicCover', label: 'Bannière Panoramique Héro (4K)', type: 'media-image', span: 1 },
  { path: 'config.identity.brandColors.primary', label: 'Couleur Primaire Brand (Hex)', type: 'text', span: 1 },
  { path: 'config.identity.brandColors.secondary', label: 'Couleur Secondaire Brand (Hex)', type: 'text', span: 1 },
  { path: 'config.identity.officialWebsite', label: 'Site Web Officiel du Stade', type: 'text', span: 1 },
  { path: 'config.identity.socialMedia.twitter', label: 'Compte X / Twitter', type: 'text', span: 1 },
  { path: 'config.identity.socialMedia.instagram', label: 'Compte Instagram', type: 'text', span: 1 },
  { path: 'config.identity.socialMedia.facebook', label: 'Page Facebook Officielle', type: 'text', span: 1 },
];

// Removed Latitude and Longitude fields for a cleaner, intuitive location UI
const LOCATION_FIELDS: ConfigFieldDef[] = [
  { path: 'country', label: 'Pays', type: 'text', span: 1 },
  { path: 'config.locationDetails.region', label: 'Région / Province', type: 'text', span: 1 },
  { path: 'city', label: 'Ville', type: 'text', span: 1 },
  { path: 'config.locationDetails.district', label: 'District / Quartier', type: 'text', span: 1 },
  { path: 'address', label: 'Adresse Physique Complète', type: 'text', span: 2 },
  { path: 'config.locationDetails.postalCode', label: 'Code Postal / BP', type: 'text', span: 1 },
  { path: 'config.locationDetails.timezone', label: 'Fuseau Horaire (ex: Africa/Douala)', type: 'text', span: 1 },
  { path: 'config.locationDetails.climate', label: 'Conditions Climatiques Dominantes', type: 'text', span: 1 },
  { path: 'config.locationDetails.nearbyLandmarks', label: 'Repères / Points d\'intérêt Proches', type: 'tags', span: 2 },
  { path: 'config.locationDetails.travelDirections', label: 'Itinéraires d\'Accès & Transport Public', type: 'textarea', span: 2 },
  { path: 'config.locationDetails.parkingInformation', label: 'Consignes d\'Accès Parking Fans & VIP', type: 'textarea', span: 2 },
];

const INFRASTRUCTURE_FIELDS: ConfigFieldDef[] = [
  { path: 'capacity', label: 'Capacité Brute Spectateurs', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.vipCapacity', label: 'Places VIP / VVIP', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.pressSeats', label: 'Tribune de Presse (Postes de travail)', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.hospitalitySuites', label: 'Loges de Prestige (Skyboxes)', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.disabledSeats', label: 'Emplacements PMR (Handicap)', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.parkingSpaces', label: 'Capacité Parking Véhicules', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.entrancesCount', label: 'Portes / Tourniquets d\'Accès', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.emergencyExitsCount', label: 'Issues de Secours Sécurisées', type: 'number', span: 1 },
  { path: 'config.infrastructureDetails.constructionMaterial', label: 'Matériaux Principaux de Structure', type: 'text', span: 1 },
  { path: 'config.infrastructureDetails.roofType', label: 'Type de Couverture / Toiture', type: 'text', span: 1 },
  { path: 'config.infrastructureDetails.lightingSystem', label: 'Système d\'Éclairage (Lux / TV Standard)', type: 'text', span: 1 },
  { path: 'config.infrastructureDetails.soundSystem', label: 'Système Acoustique & Sono Stadium', type: 'text', span: 1 },
  { path: 'config.infrastructureDetails.scoreboardType', label: 'Écrans Géants LED / Scoreboards', type: 'text', span: 1 },
  { path: 'config.infrastructureDetails.lockerRoomsCount', label: 'Nombre de Vestiaires Équipes', type: 'number', span: 1 },
];

const PITCH_FIELDS: ConfigFieldDef[] = [
  { path: 'surface', label: 'Type de Surface Principale', type: 'select', options: [
    { value: 'GRASS', label: 'Pelouse Naturelle Pro' },
    { value: 'ARTIFICIAL', label: 'Synthétique FIFA Quality Pro' },
    { value: 'HYBRID', label: 'Pelouse Hybride renforcée' }
  ], span: 1 },
  { path: 'config.pitchDetails.conditionRating', label: 'Évaluation de l\'État Actuel', type: 'select', options: [
    { value: 'EXCELLENT', label: 'Excellent (Homologation FIFA Class A)' },
    { value: 'GOOD', label: 'Bon État (Compétition Nationale)' },
    { value: 'FAIR', label: 'Moyen (Nécessite entretien)' },
    { value: 'POOR', label: 'Critique / Non Conforme' }
  ], span: 1 },
  { path: 'config.pitchDetails.dimensions.length', label: 'Longueur du Terrain (Mètres)', type: 'number', span: 1 },
  { path: 'config.pitchDetails.dimensions.width', label: 'Largeur du Terrain (Mètres)', type: 'number', span: 1 },
  { path: 'config.pitchDetails.hasDrainage', label: 'Système de Drainage Sub-surface', type: 'select', options: [{ value: 'true', label: 'Oui - Actif' }, { value: 'false', label: 'Non' }], span: 1 },
  { path: 'config.pitchDetails.hasHeating', label: 'Chauffage du Gazon (Anti-gel)', type: 'select', options: [{ value: 'true', label: 'Oui - Installé' }, { value: 'false', label: 'Non' }], span: 1 },
  { path: 'config.pitchDetails.hasIrrigation', label: 'Système d\'Arrosage Automatique Spray', type: 'select', options: [{ value: 'true', label: 'Oui - Intégré' }, { value: 'false', label: 'Non' }], span: 1 },
  { path: 'config.pitchDetails.maintenanceSchedule', label: 'Cycle de Tonte & Régénération', type: 'textarea', span: 2 },
];

const OWNERSHIP_FIELDS: ConfigFieldDef[] = [
  { path: 'config.ownershipDetails.owner', label: 'Propriétaire Entité Légal', type: 'text', span: 1 },
  { path: 'config.ownershipDetails.operator', label: 'Opérateur / Concessionnaire Exploitant', type: 'text', span: 1 },
  { path: 'config.ownershipDetails.managingOrganization', label: 'Organisme de Gestion au Quotidien', type: 'text', span: 1 },
  { path: 'config.ownershipDetails.namingRightsSponsor', label: 'Sponsor Naming du Stade', type: 'text', span: 1 },
  { path: 'config.ownershipDetails.constructionCompany', label: 'Entreprise de Construction Principale', type: 'text', span: 1 },
  { path: 'config.ownershipDetails.architect', label: 'Cabinet d\'Architecture & Cabinet Design', type: 'text', span: 1 },
  { path: 'config.ownershipDetails.leaseInfo', label: 'Modalités de Bail / Concession', type: 'textarea', span: 2 },
];

const SECURITY_FIELDS: ConfigFieldDef[] = [
  { path: 'config.securitySpecs.rating', label: 'Grade de Sécurité CAF / FIFA', type: 'text', span: 1 },
  { path: 'config.securitySpecs.evacuationTimeMinutes', label: 'Temps d\'Évacuation Totale (Minutes)', type: 'number', span: 1 },
  { path: 'config.securitySpecs.policeContact', label: 'Poste de Commandement Police (Direct)', type: 'text', span: 1 },
  { path: 'config.securitySpecs.fireContact', label: 'Directeur Secours Sapeurs-Pompiers', type: 'text', span: 1 },
  { path: 'config.securitySpecs.medicalContact', label: 'Poste Médical Avancé & Urgences', type: 'text', span: 1 },
  { path: 'config.securitySpecs.emergencyPlanUrl', label: 'URL Plan d\'Urgence Homologué (PDF)', type: 'text', span: 1 },
];

const OPERATIONS_FIELDS: ConfigFieldDef[] = [
  { path: 'config.operationsConfig.rentalPricePerMatch', label: 'Tarif de Location par Match (FCFA / $)', type: 'number', span: 1 },
  { path: 'config.operationsConfig.openingHours', label: 'Plage Horaire d\'Ouverture Administrative', type: 'text', span: 1 },
  { path: 'config.operationsConfig.maintenanceCalendar', label: 'Fréquence de Maintenance Lourde', type: 'text', span: 1 },
  { path: 'config.operationsConfig.cleaningSchedule', label: 'Protocole de Nettoyage Post-Match', type: 'text', span: 1 },
  { path: 'config.operationsConfig.inspectionSchedule', label: 'Inspections Régulières Pré-Match', type: 'text', span: 1 },
  { path: 'config.operationsConfig.bookingRules', label: 'Charte d\'Occupation & Réservations', type: 'textarea', span: 2 },
];

// ── 2. COMPONENT CANVAS RENDERER ──────────────────────────────────────────

export function StadiumCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Draft>) {
  const [newCompInput, setNewCompInput] = useState('');
  const [showCompInput, setShowCompInput] = useState(false);

  // Fetch real database clubs dynamically
  const lookups = useEntityLookups(stadiumsConfig);
  const clubOptions = lookups.clubs ?? [];

  const updateConfigPath = (next: Draft) => {
    onChange(next);
  };

  const updatePathValue = (path: string, val: unknown) => {
    onChange(setPath(draft, path, val));
  };

  const currentSection = activeSection || 'general';

  // Allowed Competitions list
  const allowedCompetitions: string[] = (getPath(draft, 'config.competitionsConfigured.allowedCompetitions') as string[] | undefined) || [
    'Elite One', 'Elite Two', 'Coupe du Cameroun', 'Supercup', 'Champions League CAF', 'Confederation Cup', 'Matchs Amicaux'
  ];

  const handleAddCompetition = () => {
    if (!newCompInput.trim()) return;
    const name = newCompInput.trim();
    if (!allowedCompetitions.includes(name)) {
      updatePathValue('config.competitionsConfigured.allowedCompetitions', [...allowedCompetitions, name]);
    }
    setNewCompInput('');
    setShowCompInput(false);
  };

  // Media Photos List
  const mediaPhotos: string[] = (getPath(draft, 'config.mediaKit.photos') as string[] | undefined) || [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Visual Stadium Canvas Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-r from-zinc-950 via-emerald-950/20 to-zinc-950 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {draft.photoUrl ? (
                <img
                  src={draft.photoUrl}
                  alt={draft.name || 'Stadium'}
                  className="size-20 rounded-xl object-cover border-2 border-emerald-500/30 shadow-lg"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-emerald-800/40 bg-emerald-950/30 text-emerald-400 shadow-inner">
                  <Building2 className="size-9" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-zinc-950 font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                  <Flame className="size-3" /> Stadium OS Engine
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  ID: {draft.id != null ? String(draft.id).substring(0, 8) : 'DRAFT-NEW'}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                {draft.name || 'Stade Sans Nom'}
              </h1>
              <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                <MapPin className="size-3.5 text-emerald-400" />
                {[draft.city, draft.country || 'Cameroun'].filter(Boolean).join(', ')}
                <span className="text-zinc-600">•</span>
                <Users className="size-3.5 text-emerald-400" />
                {draft.capacity ? Number(draft.capacity).toLocaleString() : '0'} Places
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Homologation</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <CheckCircle2 className="size-3.5" /> FIFA / CAF Grade 4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sections rendering based on Left Sidebar selection */}
      {currentSection === 'general' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
              <Info className="size-4" /> Informations Principales
            </h2>
            <ConfigFieldsGrid config={stadiumsConfig} fieldKeys={['name', 'city', 'country', 'capacity', 'openedYear', 'status']} draft={draft} onChange={onChange} onSelect={onSelect} />
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
              <FileText className="size-4" /> Nomenclature & Métadonnées
            </h2>
            <ConfigGrid defs={GENERAL_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
          </div>
        </div>
      )}

      {currentSection === 'identity' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Building2 className="size-4" /> Identité visuelle & Réseaux Sociaux
          </h2>
          <ConfigGrid defs={IDENTITY_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
        </div>
      )}

      {currentSection === 'location' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
              <MapPin className="size-4" /> Adresse Physique & Accès
            </h2>
            <ConfigGrid defs={LOCATION_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
          </div>

          {/* Interactive Map Visual Widget (Clean intuitif sans coordonnées brutes) */}
          <div className="rounded-xl border border-emerald-900/40 bg-zinc-950 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Globe className="size-3.5 text-emerald-400" /> Carte de Localisation StadiumOS
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {draft.city || 'Yaoundé'}, {draft.country || 'Cameroun'}
              </span>
            </div>
            <div className="h-48 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              <div className="relative z-10 flex flex-col items-center gap-2 text-center px-4">
                <div className="size-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
                  <MapPin className="size-6 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-zinc-200">Emplacement Général Homologué</span>
                <span className="text-[10px] text-zinc-400">{draft.address || 'Complexe Sportif, ' + (draft.city || 'Yaoundé')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSection === 'infrastructure' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Building2 className="size-4" /> Capacités & Équipements de Structure
          </h2>
          <ConfigGrid defs={INFRASTRUCTURE_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
        </div>
      )}

      {currentSection === 'pitch' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Layers className="size-4" /> Spécifications de la Pelouse
          </h2>
          <ConfigGrid defs={PITCH_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
        </div>
      )}

      {currentSection === 'facilities' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Wifi className="size-4" /> Facilities & Services Complémentaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'WiFi Haut Débit', key: 'config.facilitiesList.hasWifi' },
              { label: 'Poste Premier Secours', key: 'config.facilitiesList.hasFirstAid' },
              { label: 'Salon VVIP Premier', key: 'config.facilitiesList.hasVipLounge' },
              { label: 'Salle de Presse VAR', key: 'config.infrastructureDetails.hasVarRoom' },
              { label: 'Centre Médical', key: 'config.infrastructureDetails.hasMedicalCenter' },
              { label: 'Fan Zone Dédiée', key: 'config.facilitiesList.hasFanZone' },
              { label: 'Musée du Stade', key: 'config.facilitiesList.hasMuseum' },
              { label: 'Bornes de Recharge', key: 'config.facilitiesList.hasChargingStations' }
            ].map((fac) => {
              const val = (getPath(draft, fac.key) as boolean | undefined) ?? true;
              return (
                <button
                  key={fac.key}
                  type="button"
                  onClick={() => updatePathValue(fac.key, !val)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                    val
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900/20 text-zinc-500'
                  }`}
                >
                  <span className="text-xs font-medium">{fac.label}</span>
                  <div className={`size-4 rounded-full flex items-center justify-center ${val ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800'}`}>
                    {val && <Check className="size-3 font-bold" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentSection === 'ownership' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Shield className="size-4" /> Structure de Propriété & Exploitation
          </h2>
          <ConfigGrid defs={OWNERSHIP_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
        </div>
      )}

      {/* ── COMPETITIONS HOMOLOGUÉES (Avec ajout de nouvelles compétitions) ── */}
      {currentSection === 'competitions' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
                <Trophy className="size-4" /> Compétitions Homologuées
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sélectionnez ou ajoutez les compétitions autorisées à jouer sur ce stade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCompInput(!showCompInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/30 transition-all"
            >
              <Plus className="size-3.5" /> Nouvelle Compétition
            </button>
          </div>

          {showCompInput && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-emerald-800/50">
              <input
                type="text"
                value={newCompInput}
                onChange={(e) => setNewCompInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompetition())}
                placeholder="Ex: Ligue des Champions Féminine CAF..."
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none px-2"
              />
              <button
                type="button"
                onClick={handleAddCompetition}
                className="px-3 py-1.5 rounded-md bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400"
              >
                Ajouter
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 pt-2">
            {allowedCompetitions.map((comp) => {
              const activeComps = (getPath(draft, 'config.competitionsConfigured.allowedCompetitions') as string[] | undefined) || ['Elite One', 'Coupe du Cameroun'];
              const active = activeComps.includes(comp);
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => {
                    const next = active ? activeComps.filter(c => c !== comp) : [...activeComps, comp];
                    updatePathValue('config.competitionsConfigured.allowedCompetitions', next);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
                    active
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-md'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Trophy className={`size-3.5 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  {comp}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CLUBS RÉSIDENTS (Chargement dynamique depuis la BDD) ── */}
      {currentSection === 'resident-clubs' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
              <Users className="size-4" /> Clubs Résidents Principaux & Secondaires
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Liste chargée dynamiquement depuis la base de données de la federation.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-medium text-zinc-300">Club Résident Principal</label>
            <select
              value={draft.clubId || ''}
              onChange={(e) => onChange({ ...draft, clubId: e.target.value || undefined })}
              className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Aucun club principal affecté --</option>
              {clubOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── MEDIA KIT PRESSE & GALERIE DE PHOTOS ── */}
      {currentSection === 'media' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
              <Camera className="size-4" /> Media Kit Presse & Photos Officielles
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Téléversez les visuels HD du stade pour la presse et les diffuseurs télévisés.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-medium text-zinc-300">Photo Principale de Couverture</label>
            <MediaUploader
              label="Bannière principale"
              value={draft.photoUrl}
              onChange={(url) => onChange({ ...draft, photoUrl: url })}
            />
          </div>

          <div className="pt-4 border-t border-zinc-800/60 space-y-4">
            <label className="block text-xs font-medium text-zinc-300">Galerie de Photos Presse Complémentaires</label>
            <MediaUploader
              label="Ajouter une photo de la galerie"
              value=""
              onChange={(url) => {
                if (url) {
                  updatePathValue('config.mediaKit.photos', [...mediaPhotos, url]);
                }
              }}
            />

            {mediaPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {mediaPhotos.map((photo, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-zinc-800 h-28 bg-zinc-950">
                    <img src={photo} alt={`Media ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const next = mediaPhotos.filter((_, idx) => idx !== i);
                        updatePathValue('config.mediaKit.photos', next);
                      }}
                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentSection === 'security' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Shield className="size-4" /> Sécurité, Evacuation & Protocoles CAF
          </h2>
          <ConfigGrid defs={SECURITY_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
        </div>
      )}

      {currentSection === 'operations' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
            <Calendar className="size-4" /> Exploitation & Planning Opérationnel
          </h2>
          <ConfigGrid defs={OPERATIONS_FIELDS} draft={draft} onChange={updateConfigPath} onSelect={onSelect} />
        </div>
      )}

      {/* ── GALERIE PHOTOS AVEC ALBUMS THÉMATIQUES ── */}
      {currentSection === 'gallery' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
              <Camera className="size-4" /> Galerie Photos & Albums Thématiques
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Organisez les visuels du stade par albums : Journées de match, construction, moments historiques et rénovations.
            </p>
          </div>

          {(['matchdays', 'construction', 'historicMoments', 'renovation'] as const).map((albumKey) => {
            const albumLabels: Record<string, string> = {
              matchdays: '📸 Matchdays & Ambiance Fans',
              construction: '🏗️ Construction & Architecture',
              historicMoments: '🏆 Moments Historiques & Finales',
              renovation: '🔧 Rénovations & Modernisation'
            };
            const albumPhotos = (getPath(draft, `config.galleryAlbums.${albumKey}`) as { url: string; caption: string }[] | undefined) || [];

            return (
              <div key={albumKey} className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200">{albumLabels[albumKey]}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">{albumPhotos.length} photo(s)</span>
                </div>

                <MediaUploader
                  label={`Ajouter une photo à l'album ${albumLabels[albumKey]}`}
                  value=""
                  onChange={(url) => {
                    if (url) {
                      const next = [...albumPhotos, { url, caption: '' }];
                      updatePathValue(`config.galleryAlbums.${albumKey}`, next);
                    }
                  }}
                />

                {albumPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {albumPhotos.map((item, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-zinc-800 h-28 bg-zinc-900">
                        <img src={item.url} alt={`Album ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const next = albumPhotos.filter((_, idx) => idx !== i);
                            updatePathValue(`config.galleryAlbums.${albumKey}`, next);
                          }}
                          className="absolute top-1.5 right-1.5 size-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DOCUMENTS & LICENCES ── */}
      {currentSection === 'documents' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
              <FileText className="size-4" /> Documents, Licences & Certificats de Sécurité
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Conservez les plans d'architecte, procès-verbaux d'inspection CAF/FIFA et certificats de conformité.
            </p>
          </div>

          {(() => {
            const docs = (getPath(draft, 'config.documentsList') as { title: string; category: string; fileUrl: string; date: string }[] | undefined) || [];
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                  <span className="text-xs font-bold text-emerald-400">Ajouter un Document Officiel (PDF / DOC)</span>
                  <MediaUploader
                    label="Téléverser le fichier du document"
                    value=""
                    acceptType="all"
                    onChange={(url) => {
                      if (url) {
                        const filename = url.split('/').pop() || 'Document Homologation';
                        const newDoc = {
                          title: filename,
                          category: 'SAFETY',
                          fileUrl: url,
                          date: new Date().toISOString().split('T')[0]
                        };
                        updatePathValue('config.documentsList', [...docs, newDoc]);
                      }
                    }}
                  />
                </div>

                {docs.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {docs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                            PDF
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{doc.title}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{doc.category} • Ajouté le {doc.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700"
                          >
                            Ouvrir
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const next = docs.filter((_, i) => i !== idx);
                              updatePathValue('config.documentsList', next);
                            }}
                            className="p-1 rounded text-red-400 hover:bg-red-950/40"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-zinc-800 text-center">
                    <FileText className="size-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400 font-medium">Aucun document téléversé</p>
                    <p className="text-[10px] text-zinc-600">Téléversez vos rapports d'inspection et plans d'évacuation ci-dessus.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
