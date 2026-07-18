import { useEffect, useMemo, useState } from 'react';
import { Ban, Crown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useClubPlayers, useMatchLineups, useMatchMutations, useUnavailablePlayers,
  playerName, type LineupEntry, type MatchLineups,
} from '@/features/matches/matchBuilder.api';
import { PageSkeleton } from '../../components/SystemStates';
import type { MatchDraft } from './MatchBuilderCanvas';

type Side = 'home' | 'away';
type Slot = 'xi' | 'bench' | 'out';

const POS_ORDER = { GK: 0, DEF: 1, DF: 1, MID: 2, MF: 2, FWD: 3, FW: 3 } as Record<string, number>;
const toLineupPos = (p?: string): LineupEntry['position'] =>
  p === 'GK' ? 'GK' : p === 'DEF' || p === 'DF' ? 'DF' : p === 'FWD' || p === 'FW' ? 'FW' : 'MF';

/**
 * Squad Selection — real club rosters (GET /players?clubId), real
 * availability (GET /injuries), persisted through PATCH /matches/:id/lineups.
 * Suspensions/injuries never computed here: a player is « indisponible »
 * exactly when the backend has an ACTIVE/RECOVERING injury for them.
 */
export function SquadSection({ matchId, draft }: { matchId: string; draft: MatchDraft }) {
  const [side, setSide] = useState<Side>('home');
  const clubId = Number(side === 'home' ? draft.homeClubId : draft.awayClubId);

  const { data: players = [], isLoading: loadingPlayers } = useClubPlayers(clubId);
  const { data: lineups, isLoading: loadingLineups } = useMatchLineups(matchId);
  const { data: unavailable = {} } = useUnavailablePlayers();
  const { saveLineups } = useMatchMutations(matchId);

  // Working copy per side, seeded from the backend lineups.
  const [entries, setEntries] = useState<Record<Side, LineupEntry[]>>({ home: [], away: [] });
  useEffect(() => {
    if (lineups) setEntries({ home: lineups.home.entries, away: lineups.away.entries });
  }, [lineups]);

  const slotOf = (playerId: number): Slot => {
    const e = entries[side].find((x) => x.playerId === playerId);
    return e ? (e.isStarting ? 'xi' : 'bench') : 'out';
  };
  const xiCount = entries[side].filter((e) => e.isStarting).length;

  const cycle = (playerId: number, jersey?: number, pos?: string) => {
    const current = slotOf(playerId);
    const next: Slot = current === 'out' ? 'xi' : current === 'xi' ? 'bench' : 'out';
    if (next === 'xi' && xiCount >= 11) { toast.error('XI complet — 11 titulaires maximum.'); return; }
    setEntries((prev) => {
      const rest = prev[side].filter((e) => e.playerId !== playerId);
      if (next === 'out') return { ...prev, [side]: rest };
      return {
        ...prev,
        [side]: [...rest, {
          playerId,
          isStarting: next === 'xi',
          shirtNumber: jersey,
          position: toLineupPos(pos),
        }],
      };
    });
  };

  const toggleCaptain = (playerId: number) =>
    setEntries((prev) => ({
      ...prev,
      [side]: prev[side].map((e) => ({ ...e, isCaptain: e.playerId === playerId ? !e.isCaptain : false })),
    }));

  const persist = () => {
    const dto: MatchLineups = {
      home: { formation: lineups?.home.formation, entries: entries.home },
      away: { formation: lineups?.away.formation, entries: entries.away },
    };
    saveLineups.mutate(dto, {
      onSuccess: () => toast.success('Compositions enregistrées', { description: 'PATCH /matches/:id/lineups' }),
      onError: () => toast.error("Échec de l'enregistrement des compositions."),
    });
  };

  const sorted = useMemo(
    () => [...players].sort((a, b) =>
      (POS_ORDER[a.position ?? ''] ?? 9) - (POS_ORDER[b.position ?? ''] ?? 9) ||
      (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99)),
    [players],
  );

  if (loadingPlayers || loadingLineups) return <div className="p-6"><PageSkeleton /></div>;

  const slotStyle: Record<Slot, string> = {
    xi: 'border-emerald-800 bg-emerald-950/40 text-emerald-400',
    bench: 'border-amber-900 bg-amber-950/30 text-amber-400',
    out: 'border-zinc-800 text-zinc-600',
  };
  const slotLabel: Record<Slot, string> = { xi: 'XI', bench: 'Banc', out: '—' };

  return (
    <div className="mx-auto max-w-[860px] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={side} onValueChange={(v) => setSide(v as Side)}>
          <TabsList className="h-8 gap-1 bg-zinc-900 p-0.5">
            <TabsTrigger value="home" className="h-7 rounded-md px-3 text-[12px] text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Domicile</TabsTrigger>
            <TabsTrigger value="away" className="h-7 rounded-md px-3 text-[12px] text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Extérieur</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <span className={cn('text-[12px] font-semibold', xiCount === 11 ? 'text-emerald-500' : 'text-amber-500')}>
            {xiCount} / 11 titulaires
          </span>
          <Button size="sm" onClick={persist} disabled={saveLineups.isPending}
            className="h-8 gap-1.5 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500">
            <Save className="size-3.5" /> {saveLineups.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <p className="mb-3 text-[12px] text-zinc-600">
        Cliquez un joueur pour le faire tourner : hors groupe → XI → banc. Les joueurs
        marqués <Ban className="inline size-3 text-red-500" /> ont une blessure active côté backend.
      </p>

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-[13px] text-zinc-500">
          Aucun joueur actif pour ce club — créez-les dans le Builder Joueur.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {sorted.map((p) => {
            const slot = slotOf(p.id);
            const hurt = !!unavailable[p.id];
            const isCaptain = entries[side].some((e) => e.playerId === p.id && e.isCaptain);
            return (
              <li key={p.id}>
                <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                  slot === 'out' ? 'border-zinc-800/70 hover:border-zinc-700' : slotStyle[slot])}>
                  <button onClick={() => !hurt && cycle(p.id, p.jerseyNumber, p.position)}
                    disabled={hurt && slot === 'out'}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <span className="w-6 shrink-0 text-center font-sans text-[12px] font-bold tabular-nums text-zinc-500">
                      {p.jerseyNumber ?? '·'}
                    </span>
                    <span className={cn('truncate text-[13px]', hurt ? 'text-zinc-600 line-through' : 'text-zinc-200')}>
                      {playerName(p)}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] uppercase text-zinc-600">{p.position}</span>
                  </button>
                  {hurt && <Ban className="size-3.5 shrink-0 text-red-500" aria-label="Blessé (backend)" />}
                  {slot === 'xi' && (
                    <button onClick={() => toggleCaptain(p.id)} aria-label="Capitaine"
                      className={cn('shrink-0', isCaptain ? 'text-amber-400' : 'text-zinc-700 hover:text-zinc-400')}>
                      <Crown className="size-3.5" />
                    </button>
                  )}
                  <span className={cn('w-9 shrink-0 rounded-md border px-1 py-0.5 text-center text-[10px] font-bold', slotStyle[slot])}>
                    {slotLabel[slot]}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
