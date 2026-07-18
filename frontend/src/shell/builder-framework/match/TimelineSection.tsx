import { useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowLeftRight, Flag, Goal, MonitorPlay, Play,
  Square, Timer, Trash2, Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  useMatchDetail, useMatchLineups, useMatchMutations, useClubPlayers,
  playerName, type MatchEventType,
} from '@/features/matches/matchBuilder.api';
import { PageSkeleton, ErrorState } from '../../components/SystemStates';

const EVENT_META: Record<MatchEventType, { label: string; icon: LucideIcon; tone: string }> = {
  GOAL:             { label: 'But',              icon: Goal,           tone: 'text-emerald-400' },
  PENALTY_GOAL:     { label: 'But (penalty)',    icon: Goal,           tone: 'text-emerald-400' },
  OWN_GOAL:         { label: 'But contre son camp', icon: Goal,        tone: 'text-red-400' },
  YELLOW_CARD:      { label: 'Carton jaune',     icon: Square,         tone: 'text-amber-400' },
  SECOND_YELLOW:    { label: '2e jaune (rouge)', icon: Square,         tone: 'text-orange-400' },
  RED_CARD:         { label: 'Carton rouge',     icon: Square,         tone: 'text-red-500' },
  SUBSTITUTION_IN:  { label: 'Entrée',           icon: ArrowLeftRight, tone: 'text-sky-400' },
  SUBSTITUTION_OUT: { label: 'Sortie',           icon: ArrowLeftRight, tone: 'text-sky-500' },
  INJURY:           { label: 'Blessure',         icon: AlertTriangle,  tone: 'text-rose-400' },
  VAR:              { label: 'VAR',              icon: MonitorPlay,    tone: 'text-violet-400' },
  KICKOFF:          { label: "Coup d'envoi",     icon: Play,           tone: 'text-emerald-500' },
  HALF_TIME:        { label: 'Mi-temps',         icon: Timer,          tone: 'text-zinc-400' },
  FULL_TIME:        { label: 'Coup de sifflet final', icon: Trophy,    tone: 'text-emerald-500' },
};

const PLAYER_EVENTS: MatchEventType[] = [
  'GOAL', 'PENALTY_GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'SECOND_YELLOW', 'INJURY', 'VAR',
];

/**
 * Timeline — the operational heart. Every action fires the backend
 * immediately (POST /matches/:id/events); the score and status shown here
 * come back from the server, never from local arithmetic. Substitutions
 * emit the two schema events (OUT then IN) atomically in sequence.
 */
export function TimelineSection({ matchId }: { matchId: string }) {
  const { data: match, isLoading, error, refetch } = useMatchDetail(matchId);
  const { data: lineups } = useMatchLineups(matchId);
  const { addEvent, removeEvent } = useMatchMutations(matchId);

  const [minute, setMinute] = useState(1);
  const [extraTime, setExtraTime] = useState(0);
  const [type, setType] = useState<MatchEventType>('GOAL');
  const [clubSide, setClubSide] = useState<'home' | 'away'>('home');
  const [playerId, setPlayerId] = useState<string>('');
  const [subOut, setSubOut] = useState<string>('');
  const [subIn, setSubIn] = useState<string>('');

  const clubId = match ? (clubSide === 'home' ? match.homeClubId : match.awayClubId) : undefined;
  const { data: clubPlayers = [] } = useClubPlayers(clubId);

  // Substitution sources come from the saved lineup (XI out, bench in).
  const sideLineup = lineups?.[clubSide]?.entries ?? [];
  const onPitchIds = useMemo(() => new Set(sideLineup.filter((e) => e.isStarting).map((e) => e.playerId)), [sideLineup]);
  const benchIds = useMemo(() => new Set(sideLineup.filter((e) => !e.isStarting).map((e) => e.playerId)), [sideLineup]);

  const fire = (dto: Parameters<typeof addEvent.mutate>[0], okMsg: string) =>
    addEvent.mutateAsync(dto)
      .then(() => toast.success(okMsg, { description: `POST /matches/${matchId}/events · ${dto.type}` }))
      .catch((err) => {
        const m = err?.response?.data?.message;
        toast.error('Événement refusé par le backend', { description: Array.isArray(m) ? m.join(' · ') : m ?? 'Erreur serveur' });
        throw err;
      });

  const control = (t: MatchEventType, m: number) => fire({ type: t, minute: m }, EVENT_META[t].label);

  const submit = async () => {
    if (type === 'SUBSTITUTION_IN' || type === 'SUBSTITUTION_OUT') {
      if (!subOut || !subIn) { toast.error('Choisissez le sortant ET l\'entrant.'); return; }
      await fire({ type: 'SUBSTITUTION_OUT', minute, extraTime, clubId, playerId: Number(subOut) }, 'Sortie enregistrée');
      await fire({ type: 'SUBSTITUTION_IN', minute, extraTime, clubId, playerId: Number(subIn) }, 'Entrée enregistrée');
      setSubOut(''); setSubIn('');
      return;
    }
    if (PLAYER_EVENTS.includes(type) && !playerId) { toast.error('Choisissez un joueur.'); return; }
    await fire(
      { type, minute, extraTime, clubId, playerId: playerId ? Number(playerId) : undefined },
      `${EVENT_META[type].label} — ${minute}'`,
    );
  };

  if (isLoading) return <div className="p-6"><PageSkeleton /></div>;
  if (error || !match)
    return <div className="p-6"><ErrorState message="Match introuvable côté backend." onRetry={() => refetch()} /></div>;

  const events = [...(match.events ?? [])].sort((a, b) => b.minute - a.minute || b.id - a.id);
  const live = match.status === 'LIVE';
  const finished = match.status === 'FINISHED';
  const selectCls = 'h-8 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[13px] text-zinc-200 outline-none focus:border-emerald-700';
  const isSub = type === 'SUBSTITUTION_IN' || type === 'SUBSTITUTION_OUT';

  return (
    <div className="mx-auto max-w-[860px] p-6">
      {/* Authoritative scoreboard */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
        <span className="max-w-[200px] truncate text-[14px] font-semibold text-zinc-200">{match.homeClub?.name}</span>
        <div className="text-center">
          <p className="font-sans text-3xl font-black tabular-nums tracking-tight text-zinc-100">
            {match.homeScore ?? 0} <span className="text-zinc-600">–</span> {match.awayScore ?? 0}
          </p>
          <p className={cn('mt-0.5 text-[10px] font-bold uppercase tracking-widest',
            live ? 'text-red-500' : finished ? 'text-emerald-500' : 'text-zinc-500')}>
            {live ? '● EN DIRECT' : finished ? 'Terminé' : match.status}
          </p>
        </div>
        <span className="max-w-[200px] truncate text-right text-[14px] font-semibold text-zinc-200">{match.awayClub?.name}</span>
      </div>

      {/* Control events */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => control('KICKOFF', 0)} disabled={live || finished || addEvent.isPending}
          className="h-8 gap-1.5 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500">
          <Play className="size-3.5" /> Coup d'envoi
        </Button>
        <Button size="sm" variant="outline" onClick={() => control('HALF_TIME', 45)} disabled={!live || addEvent.isPending}
          className="h-8 gap-1.5 border-zinc-800 bg-transparent text-[13px] text-zinc-300 hover:bg-zinc-900">
          <Timer className="size-3.5" /> Mi-temps
        </Button>
        <Button size="sm" variant="outline" onClick={() => control('FULL_TIME', 90)} disabled={!live || addEvent.isPending}
          className="h-8 gap-1.5 border-emerald-900 bg-transparent text-[13px] text-emerald-400 hover:bg-emerald-950">
          <Flag className="size-3.5" /> Sifflet final
        </Button>
        {finished && (
          <span className="ml-auto self-center text-[12px] text-zinc-500">
            Match clôturé — classement recalculé par le backend.
          </span>
        )}
      </div>

      {/* Event composer */}
      {!finished && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Événement</span>
              <select value={type} onChange={(e) => setType(e.target.value as MatchEventType)} className={selectCls}>
                {(['GOAL','PENALTY_GOAL','OWN_GOAL','YELLOW_CARD','SECOND_YELLOW','RED_CARD','SUBSTITUTION_IN','INJURY','VAR'] as MatchEventType[]).map((t) => (
                  <option key={t} value={t}>{t === 'SUBSTITUTION_IN' ? 'Remplacement' : EVENT_META[t].label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Minute · +arrêts</span>
              <div className="flex gap-1.5">
                <input type="number" min={0} max={120} value={minute} onChange={(e) => setMinute(Number(e.target.value))} className={cn(selectCls, 'w-2/3')} />
                <input type="number" min={0} max={15} value={extraTime} onChange={(e) => setExtraTime(Number(e.target.value))} className={cn(selectCls, 'w-1/3')} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Équipe</span>
              <select value={clubSide} onChange={(e) => { setClubSide(e.target.value as 'home' | 'away'); setPlayerId(''); setSubOut(''); setSubIn(''); }} className={selectCls}>
                <option value="home">{match.homeClub?.name ?? 'Domicile'}</option>
                <option value="away">{match.awayClub?.name ?? 'Extérieur'}</option>
              </select>
            </label>
            {!isSub ? (
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Joueur</span>
                <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {clubPlayers.map((p) => <option key={p.id} value={p.id}>{playerName(p)}</option>)}
                </select>
              </label>
            ) : (
              <div className="col-span-2 grid grid-cols-2 gap-1.5 md:col-span-1 md:grid-cols-1">
                <select value={subOut} onChange={(e) => setSubOut(e.target.value)} className={selectCls}>
                  <option value="">Sortant (XI)…</option>
                  {clubPlayers.filter((p) => onPitchIds.has(p.id)).map((p) => <option key={p.id} value={p.id}>{playerName(p)}</option>)}
                </select>
                <select value={subIn} onChange={(e) => setSubIn(e.target.value)} className={selectCls}>
                  <option value="">Entrant (banc)…</option>
                  {clubPlayers.filter((p) => benchIds.has(p.id)).map((p) => <option key={p.id} value={p.id}>{playerName(p)}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={submit} disabled={addEvent.isPending || !live}
              className="h-8 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500">
              {addEvent.isPending ? 'Envoi…' : !live ? 'En attente du coup d\'envoi' : "Enregistrer l'événement"}
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Chronologie ({events.length})
      </h3>
      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-[13px] text-zinc-600">
          Aucun événement — le coup d'envoi ouvrira le match côté backend (statut LIVE).
        </p>
      ) : (
        <ul className="space-y-1">
          {events.map((ev) => {
            const meta = EVENT_META[ev.type] ?? EVENT_META.VAR;
            const clubName = ev.clubId === match.homeClubId ? match.homeClub?.name : ev.clubId === match.awayClubId ? match.awayClub?.name : null;
            return (
              <li key={ev.id} className="group flex items-center gap-3 rounded-lg border border-zinc-800/70 px-3 py-2">
                <span className="w-11 shrink-0 text-right font-sans text-[12px] font-bold tabular-nums text-zinc-400">
                  {ev.minute}'{ev.extraTime > 0 ? `+${ev.extraTime}` : ''}
                </span>
                <meta.icon className={cn('size-4 shrink-0', meta.tone)} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">
                  {meta.label}
                  {ev.player && <span className="text-zinc-400"> — {playerName(ev.player)}</span>}
                  {clubName && <span className="text-zinc-600"> · {clubName}</span>}
                </span>
                {!finished && (
                  <button onClick={() =>
                    removeEvent.mutateAsync(ev.id)
                      .then(() => toast('Événement retiré', { description: 'Effets annulés par le backend.' }))
                      .catch(() => toast.error('Suppression refusée.'))}
                    aria-label="Retirer"
                    className="rounded p-1 text-zinc-700 opacity-0 transition-opacity hover:bg-zinc-900 hover:text-red-400 group-hover:opacity-100">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
