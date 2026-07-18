/**
 * Match Builder — bespoke Canvas mounted inside the universal BuilderHost.
 * The framework keeps owning header/status/inspector/history/publishing;
 * this canvas only routes six operational sections. The backend remains the
 * single source of truth: scores, statuses and standings are never computed
 * here — every action POSTs and re-reads the authoritative match.
 */
import { Lock } from 'lucide-react';
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { matchesConfig, type Match } from '@/features/admin/configs/matches.config';
import { useMatchDetail } from '@/features/matches/matchBuilder.api';
import { EmptyState } from '../../components/SystemStates';
import { SquadSection } from './SquadSection';
import { FormationSection } from './FormationSection';
import { TimelineSection } from './TimelineSection';
import { StatsSection } from './StatsSection';

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
    case 'teams':
      return (
        <div className="mx-auto max-w-[760px] p-6">
          <p className="mb-5 text-[13px] leading-relaxed text-zinc-500">
            Les deux clubs de l'affiche. Le score n'est pas éditable : il est calculé par
            le backend à partir des buts de la chronologie.
          </p>
          <ConfigFieldsGrid
            config={matchesConfig}
            fieldKeys={['homeClubId', 'awayClubId']}
            draft={draft}
            onChange={onChange}
            onSelect={onSelect}
          />
          {live && (
            <div className="mt-6 flex items-center justify-center gap-6 rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-5">
              <span className="max-w-[180px] truncate text-right text-[14px] font-semibold text-zinc-200">
                {live.homeClub?.name ?? 'Domicile'}
              </span>
              <span className="font-sans text-3xl font-black tabular-nums tracking-tight text-zinc-100">
                {live.homeScore ?? '–'}<span className="mx-2 text-zinc-600">:</span>{live.awayScore ?? '–'}
              </span>
              <span className="max-w-[180px] truncate text-[14px] font-semibold text-zinc-200">
                {live.awayClub?.name ?? 'Extérieur'}
              </span>
            </div>
          )}
        </div>
      );

    // ── 3 · Effectifs : XI de départ, banc, indisponibles (blessures réelles)
    case 'squads':
      if (!serverId || !draft.homeClubId || !draft.awayClubId)
        return <NeedsPublish what="Sélection des effectifs" />;
      return <SquadSection matchId={serverId} draft={draft} />;

    // ── 4 · Composition : drag & drop + bibliothèque de schémas
    case 'formation':
      if (!serverId) return <NeedsPublish what="Composition tactique" />;
      return <FormationSection matchId={serverId} draft={draft} />;

    // ── 5 · Chronologie : chaque événement appelle immédiatement le backend
    case 'timeline':
      if (!serverId) return <NeedsPublish what="Chronologie" />;
      return <TimelineSection matchId={serverId} />;

    // ── 6 · Statistiques : lecture seule, calculées par le backend
    case 'stats':
      if (!serverId) return <NeedsPublish what="Statistiques" />;
      return <StatsSection matchId={serverId} />;

    default:
      return <NeedsPublish what="Section" />;
  }
}
