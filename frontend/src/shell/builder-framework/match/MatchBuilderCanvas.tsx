/**
 * Match Builder — bespoke Canvas mounted inside the universal BuilderHost.
 * The framework keeps owning header/status/inspector/history/publishing;
 * this canvas only routes six operational sections. The backend remains the
 * single source of truth: scores, statuses and standings are never computed
 * here — every action POSTs and re-reads the authoritative match.
 */
import { useState } from 'react';
import { CalendarX, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { matchesConfig, type Match } from '@/features/admin/configs/matches.config';
import { useMatchDetail, useMatchMutations } from '@/features/matches/matchBuilder.api';
import { useEntityLookups } from '@/features/admin/lookups/useEntityLookups';
import { EmptyState } from '../../components/SystemStates';
import { SquadSection } from './SquadSection';
import { FormationSection } from './FormationSection';
import { TimelineSection } from './TimelineSection';
import { StatsSection } from './StatsSection';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export type MatchDraft = Partial<Match>;

const serverIdOf = (draft: MatchDraft): string | null =>
  draft.id != null ? String(draft.id) : null;

function NeedsPublish({ what }: { what: string }) {
  return (
    <div className="p-6">
      <EmptyState
        icon={Lock}
        title={`${what} — après la première publication`}
        hint="Publiez d'abord la programmation (Aperçu du match) : le backend crée l'enregistrement, puis compositions, événements et statistiques opèrent sur des données réelles."
      />
    </div>
  );
}

export function MatchBuilderCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<MatchDraft>) {
  const serverId = serverIdOf(draft);
  // Authoritative match (score/status/events) — refreshed after every event.
  const { data: live } = useMatchDetail(serverId);
  const lookupOptions = useEntityLookups(matchesConfig);
  const { addEvent } = useMatchMutations(serverId || '');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('Intempéries / Terrain impraticable');

  const clubs = lookupOptions['clubs'] || [];
  const homeClub = clubs.find((c) => String(c.value) === String(draft.homeClubId)) || (live?.homeClub ? { label: live.homeClub.name, logoUrl: live.homeClub.logoUrl, value: live.homeClub.id } : undefined);
  const awayClub = clubs.find((c) => String(c.value) === String(draft.awayClubId)) || (live?.awayClub ? { label: live.awayClub.name, logoUrl: live.awayClub.logoUrl, value: live.awayClub.id } : undefined);

  const isFinished = (live?.status ?? draft.status) === 'FINISHED';

  const renderSection = () => {
    switch (activeSection) {
      // ── 1 · Aperçu du match : compétition/saison, journée, stade, officiels, statut
      case 'overview':
        return (
          <div className="mx-auto max-w-[760px] p-6">
            <p className="mb-5 text-[13px] leading-relaxed text-zinc-500">
              Programmation du match — saison, journée, coup d'envoi, stade et officiels.
              Le statut opérationnel (LIVE, terminé…) est piloté par la chronologie, pas ici.
            </p>
            <ConfigFieldsGrid
              config={matchesConfig}
              fieldKeys={['seasonId', 'round', 'scheduledAt', 'venue', 'referee', 'status']}
              draft={draft}
              onChange={onChange}
              onSelect={onSelect}
            />
          </div>
        );

      // ── 2 · Équipes : domicile / extérieur + score autoritaire
      case 'teams': {
        return (
          <div className="mx-auto max-w-[760px] p-6 space-y-6">
            <div>
              <h3 className="text-[14px] font-bold text-zinc-200">Sélection des Équipes</h3>
              <p className="text-[12px] text-zinc-500 mt-1">
                Choisissez les deux clubs qui s'affrontent. Les logos sont visualisés en temps réel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Club Domicile */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col items-center text-center space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Club Domicile</span>
                <div className="size-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3">
                  {homeClub?.logoUrl ? (
                    <img src={homeClub.logoUrl} alt={homeClub.label} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[11px] text-zinc-650">Aucun logo</span>
                  )}
                </div>
                <div className="w-full">
                  <select
                    disabled={isFinished}
                    value={draft.homeClubId || ''}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      onChange({
                        ...draft,
                        homeClubId: nextVal,
                        awayClubId: nextVal === draft.awayClubId ? '' : draft.awayClubId,
                      });
                    }}
                    className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-[13px] text-zinc-200 focus:border-emerald-600 outline-none disabled:opacity-50"
                  >
                    <option value="">-- Choisir un club --</option>
                    {clubs.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Club Extérieur */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col items-center text-center space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Club Extérieur</span>
                <div className="size-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3">
                  {awayClub?.logoUrl ? (
                    <img src={awayClub.logoUrl} alt={awayClub.label} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[11px] text-zinc-650">Aucun logo</span>
                  )}
                </div>
                <div className="w-full">
                  <select
                    disabled={isFinished}
                    value={draft.awayClubId || ''}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      onChange({
                        ...draft,
                        awayClubId: nextVal,
                        homeClubId: nextVal === draft.homeClubId ? '' : draft.homeClubId,
                      });
                    }}
                    className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-[13px] text-zinc-200 focus:border-emerald-600 outline-none disabled:opacity-50"
                  >
                    <option value="">-- Choisir un club --</option>
                    {clubs.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(homeClub || awayClub) && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-center gap-6">
                <div className="flex items-center gap-3">
                  {homeClub?.logoUrl && <img src={homeClub.logoUrl} alt={homeClub.label} className="size-8 object-contain" />}
                  <span className="max-w-[180px] truncate text-right text-[14px] font-semibold text-zinc-200">
                    {homeClub?.label ?? 'Domicile'}
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tabular-nums tracking-tight text-zinc-100">
                  {live?.homeScore ?? '–'}<span className="mx-2 text-zinc-650">:</span>{live?.awayScore ?? '–'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="max-w-[180px] truncate text-[14px] font-semibold text-zinc-200">
                    {awayClub?.label ?? 'Extérieur'}
                  </span>
                  {awayClub?.logoUrl && <img src={awayClub.logoUrl} alt={awayClub.label} className="size-8 object-contain" />}
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── 3 · Effectifs : XI de départ, banc, indisponibles (blessures réelles)
      case 'squads':
        if (!serverId || !draft.homeClubId || !draft.awayClubId)
          return <NeedsPublish what="Sélection des effectifs" />;
        return <SquadSection matchId={serverId} draft={draft} />;

      // ── 4 · Composition : drag & drop + bibliothèque de schémas
      case 'formation':
        if (!serverId) return <NeedsPublish what="Composition tactique" />;
        return <FormationSection matchId={serverId} draft={draft} />;

      // ── 5 · Match en Direct (Live)
      case 'live': {
        if (!serverId) return <NeedsPublish what="Match en Direct" />;

        return (
          <div className="mx-auto max-w-[760px] p-6 space-y-6">
            <div>
              <h3 className="text-[14px] font-bold text-zinc-200">Console de Match en Direct</h3>
              <p className="text-[12px] text-zinc-500 mt-1">
                Pilotez le coup d'envoi, la mi-temps ou le sifflet final en direct.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col items-center text-center space-y-6">
              <div className="flex items-center justify-between w-full max-w-lg gap-6">
                {/* Home */}
                <div className="flex flex-col items-center space-y-2 flex-1">
                  <div className="size-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2">
                    {homeClub?.logoUrl ? (
                      <img src={homeClub.logoUrl} alt={homeClub.label} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[9px] text-zinc-650">Logo</span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-zinc-200 truncate max-w-[120px]">{homeClub?.label}</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                    {live?.status || 'SCHEDULED'}
                  </span>
                  <span className="text-4xl font-black text-white mt-2 tabular-nums">
                    {live?.homeScore ?? 0} : {live?.awayScore ?? 0}
                  </span>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center space-y-2 flex-1">
                  <div className="size-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2">
                    {awayClub?.logoUrl ? (
                      <img src={awayClub.logoUrl} alt={awayClub.label} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[9px] text-zinc-650">Logo</span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-zinc-200 truncate max-w-[120px]">{awayClub?.label}</span>
                </div>
              </div>

              {/* Quick Actions */}
              {!isFinished ? (
                <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-zinc-900 w-full">
                  <button
                    type="button"
                    onClick={() => addEvent.mutate({ type: 'KICKOFF', minute: 1 }).then(() => toast.success('Match commencé !'))}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-500 transition-colors"
                  >
                    Lancer le match
                  </button>
                  <button
                    type="button"
                    onClick={() => addEvent.mutate({ type: 'HALF_TIME', minute: 45 }).then(() => toast.success('Mi-temps lancée !'))}
                    className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-750 text-zinc-250 text-[12px] font-bold hover:bg-zinc-750 transition-colors"
                  >
                    Déclarer la mi-temps
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFinishModal(true)}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-[12px] font-bold hover:bg-red-500 transition-colors"
                  >
                    Sifflet Final
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPostponeModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-[12px] font-bold hover:bg-amber-500 transition-colors flex items-center gap-1.5"
                  >
                    <CalendarX className="size-3.5" /> Reporter le match
                  </button>
                </div>
              ) : (
                <div className="w-full pt-4 border-t border-zinc-900 text-[12px] text-emerald-400 font-semibold">
                  ✓ Le match est terminé. Les actions en direct sont désactivées.
                </div>
              )}
            </div>
          </div>
        );
      }

      // ── 6 · Résultat / Score
      case 'results': {
        if (!serverId) return <NeedsPublish what="Résultats & Score" />;
        const scorers = live?.events?.filter((e: any) => e.type === 'GOAL' || e.type === 'PENALTY_GOAL') || [];

        return (
          <div className="mx-auto max-w-[760px] p-6 space-y-6">
            <div>
              <h3 className="text-[14px] font-bold text-zinc-200">Fiche de Résultat du Match</h3>
              <p className="text-[12px] text-zinc-500 mt-1">
                Rapport final et buteurs du match.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col items-center space-y-6">
              <div className="flex items-center justify-between w-full max-w-lg gap-6">
                {/* Home */}
                <div className="flex flex-col items-center space-y-2 flex-1">
                  <div className="size-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3">
                    {homeClub?.logoUrl ? (
                      <img src={homeClub.logoUrl} alt={homeClub.label} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-zinc-650">Logo</span>
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-zinc-200 truncate max-w-[140px]">{homeClub?.label}</span>
                </div>

                {/* Final Score */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Score Final</span>
                  <span className="text-5xl font-black text-white mt-1 tabular-nums">
                    {live?.homeScore ?? 0} - {live?.awayScore ?? 0}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1">Statut: {live?.status}</span>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center space-y-2 flex-1">
                  <div className="size-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3">
                    {awayClub?.logoUrl ? (
                      <img src={awayClub.logoUrl} alt={awayClub.label} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-zinc-650">Logo</span>
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-zinc-200 truncate max-w-[140px]">{awayClub?.label}</span>
                </div>
              </div>

              {/* Buteurs */}
              <div className="w-full pt-4 border-t border-zinc-900">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 text-center">Buteurs</h4>
                {scorers.length === 0 ? (
                  <p className="text-[12px] text-zinc-500 text-center italic">Aucun but enregistré.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-[12px]">
                    <div className="space-y-1 text-right border-r border-zinc-900 pr-4">
                      {scorers.filter((e: any) => String(e.clubId) === String(draft.homeClubId)).map((e: any) => (
                        <div key={e.id} className="text-zinc-300">
                          {e.player?.lastName || `Joueur #${e.playerId}`} ({e.minute}')
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1 text-left pl-4">
                      {scorers.filter((e: any) => String(e.clubId) === String(draft.awayClubId)).map((e: any) => (
                        <div key={e.id} className="text-zinc-300">
                          {e.player?.lastName || `Joueur #${e.playerId}`} ({e.minute}')
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // ── 7 · Chronologie : chaque événement appelle immédiatement le backend
      case 'timeline':
        if (!serverId) return <NeedsPublish what="Chronologie" />;
        return <TimelineSection matchId={serverId} />;

      // ── 8 · Statistiques : lecture seule, calculées par le backend
      case 'stats':
        if (!serverId) return <NeedsPublish what="Statistiques" />;
        return <StatsSection matchId={serverId} />;

      default:
        return <NeedsPublish what="Section" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Universal Visual Match Header with Team Logos & Date ── */}
      {(homeClub || awayClub || draft.scheduledAt) && (
        <div className="bg-zinc-950/90 border-b border-zinc-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {homeClub?.logoUrl ? (
              <img src={homeClub.logoUrl} alt={homeClub.label} className="size-8 object-contain" />
            ) : (
              <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                {homeClub?.label?.slice(0, 2) || 'DOM'}
              </div>
            )}
            <span className="text-[14px] font-bold text-zinc-100">{homeClub?.label || 'Équipe Domicile'}</span>
            
            <span className="text-[11px] font-black tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
              VS
            </span>

            <span className="text-[14px] font-bold text-zinc-100">{awayClub?.label || 'Équipe Extérieur'}</span>
            {awayClub?.logoUrl ? (
              <img src={awayClub.logoUrl} alt={awayClub.label} className="size-8 object-contain" />
            ) : (
              <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                {awayClub?.label?.slice(0, 2) || 'EXT'}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {draft.scheduledAt && (
              <span className="text-[12px] text-zinc-400 font-medium bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                📅 {new Date(draft.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {isFinished && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                ✓ Terminé (Verrouillé)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Read-Only Notice for Finished Match */}
      {isFinished && (
        <div className="mx-auto max-w-[760px] px-6 pt-2">
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-3 text-center text-[13px] font-medium text-emerald-400">
            🔒 Ce match est actuellement terminé et clôturé. Les données sont affichées en mode lecture seule. Aucune modification ne peut être effectuée.
          </div>
        </div>
      )}

      {renderSection()}

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="size-5 text-red-500" /> Confirmation de la Fin du Match
            </DialogTitle>
            <DialogDescription className="text-[12px] text-zinc-400 leading-relaxed mt-2">
              Êtes-vous sûr de vouloir siffler la fin définitive de la rencontre entre{' '}
              <strong className="text-zinc-200">{homeClub?.label ?? 'l\'équipe domicile'}</strong> et{' '}
              <strong className="text-zinc-200">{awayClub?.label ?? 'l\'équipe extérieure'}</strong> ?
              <br /><br />
              <span className="text-amber-400">
                Remarque : Cette action clôturera le match et verrouillera toutes les données (compositions, événements, score) en mode lecture seule.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFinishModal(false)} className="text-zinc-400 hover:bg-zinc-900">
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={() => {
                addEvent.mutate({ type: 'FULL_TIME', minute: 90 }, {
                  onSuccess: () => {
                    toast.success('Sifflet final enregistré ! Match clôturé.');
                    setShowFinishModal(false);
                  },
                });
              }}
              className="bg-red-600 text-white hover:bg-red-500 font-bold"
            >
              Confirmer la fin du match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Postpone Confirmation Dialog */}
      <Dialog open={showPostponeModal} onOpenChange={setShowPostponeModal}>
        <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-amber-400 flex items-center gap-2">
              <CalendarX className="size-5 text-amber-500" /> Reporter la Rencontre
            </DialogTitle>
            <DialogDescription className="text-[12px] text-zinc-400 leading-relaxed mt-2">
              Programmez une date ultérieure pour le match entre{' '}
              <strong className="text-zinc-200">{homeClub?.label ?? 'Équipe domicile'}</strong> et{' '}
              <strong className="text-zinc-200">{awayClub?.label ?? 'Équipe extérieure'}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Nouvelle Date & Heure
              </label>
              <input
                type="datetime-local"
                value={postponeDate ? postponeDate.slice(0, 16) : ''}
                onChange={(e) => setPostponeDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-[13px] text-zinc-200 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Raccourcis de Report
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setPostponeDate(d.toISOString().slice(0, 16));
                  }}
                  className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-300 hover:border-amber-700"
                >
                  + 7 Jours
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    setPostponeDate(d.toISOString().slice(0, 16));
                  }}
                  className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-300 hover:border-amber-700"
                >
                  + 14 Jours
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Motif du Report
              </label>
              <select
                value={postponeReason}
                onChange={(e) => setPostponeReason(e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-[13px] text-zinc-200 focus:border-amber-500 outline-none"
              >
                <option value="Intempéries / Terrain impraticable">Intempéries / Terrain impraticable</option>
                <option value="Décision Sanitaire / FECAFOOT">Décision Sanitaire / FECAFOOT</option>
                <option value="Problème de Sécurité">Problème de Sécurité</option>
                <option value="Accord mutuel entre clubs">Accord mutuel entre clubs</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPostponeModal(false)} className="text-zinc-400 hover:bg-zinc-900">
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!postponeDate) {
                  toast.error('Veuillez choisir une nouvelle date.');
                  return;
                }
                onChange({
                  ...draft,
                  status: 'POSTPONED',
                  scheduledAt: postponeDate,
                });
                toast.success('Match reporté au ' + new Date(postponeDate).toLocaleDateString('fr-FR'));
                setShowPostponeModal(false);
              }}
              className="bg-amber-600 text-white hover:bg-amber-500 font-bold"
            >
              Confirmer le Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
