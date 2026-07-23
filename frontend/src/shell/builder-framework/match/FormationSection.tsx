import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useClubPlayers, useMatchLineups, useMatchMutations, playerName,
  type LineupEntry, type MatchLineups,
} from '@/features/matches/matchBuilder.api';
import { PageSkeleton, EmptyState } from '../../components/SystemStates';
import type { MatchDraft } from './MatchBuilderCanvas';

type Side = 'home' | 'away';

/**
 * Pattern Library — pitch coordinates in % (posX = left→right, posY =
 * top→bottom, own goal at the bottom). Applying a pattern assigns slots to
 * the CURRENT starting XI in GK→DF→MF→FW order; drag refines from there.
 * Coordinates persist via the same PATCH /matches/:id/lineups (posX/posY
 * exist on the backend lineup entity for exactly this purpose).
 */
const PATTERNS: Record<string, [number, number][]> = {
  '4-4-2': [[50,92],[15,72],[38,74],[62,74],[85,72],[15,48],[38,52],[62,52],[85,48],[38,24],[62,24]],
  '4-3-3': [[50,92],[15,72],[38,74],[62,74],[85,72],[30,52],[50,56],[70,52],[20,26],[50,20],[80,26]],
  '4-2-3-1': [[50,92],[15,72],[38,74],[62,74],[85,72],[38,58],[62,58],[20,38],[50,36],[80,38],[50,16]],
  '3-5-2': [[50,92],[28,74],[50,76],[72,74],[10,50],[34,54],[50,58],[66,54],[90,50],[40,24],[60,24]],
  '5-3-2': [[50,92],[10,70],[30,76],[50,78],[70,76],[90,70],[30,50],[50,54],[70,50],[40,24],[60,24]],
};

export function FormationSection({ matchId, draft }: { matchId: string; draft: MatchDraft }) {
  const [side, setSide] = useState<Side>('home');
  const clubId = Number(side === 'home' ? draft.homeClubId : draft.awayClubId);
  const { data: lineups, isLoading } = useMatchLineups(matchId);
  const { data: players = [] } = useClubPlayers(clubId);
  const { saveLineups } = useMatchMutations(matchId);
  const pitchRef = useRef<HTMLDivElement>(null);

  const playerMap = useMemo(() => {
    const m = new Map<number, { name: string; photoUrl?: string }>();
    players.forEach((p) => m.set(p.id, { name: playerName(p), photoUrl: p.photoUrl }));
    return (id: number) => m.get(id);
  }, [players]);

  const nameOf = (id: number) => playerMap(id)?.name ?? `#${id}`;

  const [entries, setEntries] = useState<Record<Side, LineupEntry[]>>({ home: [], away: [] });
  const [formation, setFormation] = useState<Record<Side, string>>({ home: '', away: '' });
  useEffect(() => {
    if (!lineups) return;
    setEntries({ home: lineups.home.entries, away: lineups.away.entries });
    setFormation({ home: lineups.home.formation ?? '', away: lineups.away.formation ?? '' });
  }, [lineups]);

  const xi = entries[side].filter((e) => e.isStarting);
  const posRank = { GK: 0, DF: 1, MF: 2, FW: 3 } as Record<string, number>;
  const orderedXi = [...xi].sort((a, b) => (posRank[a.position ?? 'MF'] ?? 2) - (posRank[b.position ?? 'MF'] ?? 2));

  const applyPattern = (name: string) => {
    const coords = PATTERNS[name];
    setFormation((f) => ({ ...f, [side]: name }));
    setEntries((prev) => ({
      ...prev,
      [side]: prev[side].map((e) => {
        const idx = orderedXi.findIndex((x) => x.playerId === e.playerId);
        if (idx < 0 || idx >= coords.length) return e;
        return { ...e, posX: coords[idx][0], posY: coords[idx][1] };
      }),
    }));
  };

  const onDragEnd = (playerId: number, point: { x: number; y: number }) => {
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const posX = Math.min(100, Math.max(0, ((point.x - rect.left) / rect.width) * 100));
    const posY = Math.min(100, Math.max(0, ((point.y - rect.top) / rect.height) * 100));
    setEntries((prev) => ({
      ...prev,
      [side]: prev[side].map((e) => (e.playerId === playerId ? { ...e, posX, posY } : e)),
    }));
  };

  const persist = () => {
    const dto: MatchLineups = {
      home: { formation: formation.home || undefined, entries: entries.home },
      away: { formation: formation.away || undefined, entries: entries.away },
    };
    saveLineups.mutate(dto, {
      onSuccess: () => toast.success('Composition tactique enregistrée', { description: `Formation ${formation[side] || 'libre'} · positions en %` }),
      onError: () => toast.error("Échec de l'enregistrement de la composition."),
    });
  };

  const isFinished = draft.status === 'FINISHED';

  if (isLoading) return <div className="p-6"><PageSkeleton /></div>;

  return (
    <div className="mx-auto max-w-[860px] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={side} onValueChange={(v) => setSide(v as Side)}>
          <TabsList className="h-8 gap-1 bg-zinc-900 p-0.5">
            <TabsTrigger value="home" className="h-7 rounded-md px-3 text-[12px] text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Domicile</TabsTrigger>
            <TabsTrigger value="away" className="h-7 rounded-md px-3 text-[12px] text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Extérieur</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={persist} disabled={isFinished || saveLineups.isPending}
          className="h-8 gap-1.5 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500 disabled:opacity-50">
          <Save className="size-3.5" /> {saveLineups.isPending ? 'Enregistrement…' : 'Enregistrer la composition'}
        </Button>
      </div>

      {/* Pattern Library */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Schémas</span>
        {Object.keys(PATTERNS).map((name) => (
          <button key={name} onClick={() => !isFinished && applyPattern(name)}
            disabled={isFinished}
            className={cn('rounded-full border px-3 py-1 text-[12px] font-medium transition-colors disabled:opacity-50',
              formation[side] === name
                ? 'border-emerald-700 bg-emerald-950 text-emerald-400'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200')}>
            {name}
          </button>
        ))}
      </div>

      {xi.length === 0 ? (
        <EmptyState title="Aucun titulaire" hint="Sélectionnez d'abord le XI de départ dans l'onglet Effectifs." />
      ) : (
        <div
          ref={pitchRef}
          className="relative aspect-[3/4] w-full max-w-[560px] overflow-hidden rounded-2xl border border-emerald-900/60 bg-gradient-to-b from-emerald-950 to-emerald-900/70 mx-auto"
        >
          {/* pitch markings */}
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-emerald-700/30" />
          <div className="pointer-events-none absolute left-4 right-4 top-1/2 h-px bg-emerald-700/30" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700/30" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-16 w-44 -translate-x-1/2 border border-b-0 border-emerald-700/30" />
          <div className="pointer-events-none absolute top-4 left-1/2 h-16 w-44 -translate-x-1/2 border border-t-0 border-emerald-700/30" />

          {xi.map((e) => (
            <motion.button
              key={e.playerId}
              drag={!isFinished}
              dragMomentum={false}
              dragConstraints={pitchRef}
              onDragEnd={(_, info) => onDragEnd(e.playerId, info.point)}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center active:cursor-grabbing"
              style={{ left: `${e.posX ?? 50}%`, top: `${e.posY ?? 50}%` }}
              whileDrag={{ scale: 1.12 }}
            >
              {playerMap(e.playerId)?.photoUrl ? (
                <div className="relative">
                  <img
                    src={playerMap(e.playerId)?.photoUrl}
                    alt={nameOf(e.playerId)}
                    className={cn(
                      'size-10 rounded-full object-cover border-2 shadow-lg',
                      e.isCaptain ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-white/80 bg-zinc-900'
                    )}
                  />
                  <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-zinc-950 text-[9px] font-bold text-white border border-zinc-700">
                    {e.shirtNumber ?? '·'}
                  </span>
                </div>
              ) : (
                <span className={cn('grid size-9 place-items-center rounded-full border-2 font-sans text-[12px] font-bold shadow-lg',
                  e.isCaptain ? 'border-amber-400 bg-amber-500 text-black' : 'border-white/70 bg-zinc-950 text-white')}>
                  {e.shirtNumber ?? '·'}
                </span>
              )}
              <span className="mt-1 max-w-[84px] truncate rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {nameOf(e.playerId).split(' ').slice(-1)[0]}
              </span>
            </motion.button>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-[11px] text-zinc-600">
        Glissez les joueurs pour affiner — les positions (posX/posY, 0–100) sont
        persistées telles quelles dans <code>match_lineups</code>.
      </p>
    </div>
  );
}
