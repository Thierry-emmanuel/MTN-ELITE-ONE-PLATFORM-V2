import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, CircleDot,
} from 'lucide-react';
import { ClubLogo, MatchMeta, EventsTimeline } from '@/components/ui/football';
import { formatKickoff } from '@/utils/football.utils';
import type { Match, MatchEvent } from '@/types/football.types';

const GOAL_TYPES = new Set(['GOAL', 'OWN_GOAL', 'PENALTY']);

const GoalIcon = ({ type }: { type: MatchEvent['type'] }) => {
  if (type === 'OWN_GOAL') return <CircleDot className="h-2.5 w-2.5 text-live shrink-0" />;
  if (type === 'PENALTY')  return <CircleDot className="h-2.5 w-2.5 text-draw shrink-0" />;
  return <CircleDot className="h-2.5 w-2.5 text-win shrink-0" />;
};

// ─── Compact scorer strip (always visible, Sofascore-style) ──────────────────
const ScorerStrip = memo(({ events, homeClubId }: { events: MatchEvent[]; homeClubId: string }) => {
  const goals = events.filter(e => GOAL_TYPES.has(e.type));
  if (goals.length === 0) return null;
  const home = goals.filter(e => e.clubId === homeClubId);
  const away = goals.filter(e => e.clubId !== homeClubId);

  return (
    <div className="grid grid-cols-[1fr_72px_1fr] gap-3 px-4 pb-2.5 -mt-1 text-[10px] text-muted-foreground/60">
      <div className="text-right space-y-0.5 min-w-0">
        {home.map((e, i) => (
          <div key={i} className="flex items-center justify-end gap-1 truncate">
            <span className="truncate">{e.playerName}</span>
            <span className="tabular-nums text-muted-foreground/40">{e.minute}'</span>
            <GoalIcon type={e.type} />
          </div>
        ))}
      </div>
      <div />
      <div className="text-left space-y-0.5 min-w-0">
        {away.map((e, i) => (
          <div key={i} className="flex items-center gap-1 truncate">
            <GoalIcon type={e.type} />
            <span className="tabular-nums text-muted-foreground/40">{e.minute}'</span>
            <span className="truncate">{e.playerName}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
ScorerStrip.displayName = 'ScorerStrip';

interface MatchRowProps {
  match: Match;
  index: number;
  showXg?: boolean;
}

export const MatchRow = memo(({ match, index, showXg = false }: MatchRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLive     = match.status === 'LIVE' || match.status === 'HT';
  const isFinished = match.status === 'FT' || match.status === 'FINISHED';
  const hasScore   = match.homeScore !== null && match.awayScore !== null;
  const hasEvents  = !!match.events && match.events.length > 0;
  const hasDetails = hasEvents || !!match.venue || !!match.referee || !!match.attendance;

  const hs = match.homeScore ?? 0;
  const as_ = match.awayScore ?? 0;
  const homeWon = isFinished && hs > as_;
  const awayWon = isFinished && as_ > hs;

  // Deterministic placeholder xG until real per-match xG is wired from the backend.
  const xg = showXg && hasScore
    ? {
        home: Math.max(0.1, +(hs + ((String(match.id).charCodeAt(0) % 7) / 10 - 0.2)).toFixed(1)),
        away: Math.max(0.1, +(as_ + ((String(match.id).charCodeAt(String(match.id).length - 1) % 7) / 10 - 0.2)).toFixed(1)),
      }
    : null;

  return (
    <div className={`relative border-b border-border/20 last:border-0 ${isLive ? 'bg-live/[0.03]' : ''}`}>
      {isLive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-live" />}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
        onClick={() => hasDetails && setExpanded(v => !v)}
        role={hasDetails ? 'button' : undefined}
        aria-expanded={hasDetails ? expanded : undefined}
        className={`grid grid-cols-[44px_1fr_72px_1fr_20px] sm:grid-cols-[56px_1fr_84px_1fr_20px] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 transition-colors ${
          hasDetails ? 'cursor-pointer hover:bg-white/[0.025]' : ''
        }`}
      >
        {/* Status / round tag */}
        <div className="flex flex-col items-start justify-center min-w-0">
          {isLive ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-live uppercase tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse shrink-0" />
              {match.liveMinute ? `${match.liveMinute}'` : match.status}
            </span>
          ) : isFinished ? (
            <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-wide">Terminé</span>
          ) : (
            <span className="text-[11px] font-semibold text-muted-foreground/70 tabular-nums">
              {formatKickoff(match.kickoffUtc)}
            </span>
          )}
        </div>

        {/* Home */}
        <div className="flex items-center justify-end gap-2 min-w-0">
          <span className={`font-display text-[13px] sm:text-sm leading-tight truncate text-right ${homeWon ? 'text-foreground font-bold' : 'text-foreground/80'}`}>
            {match.homeClub.name}
          </span>
          <ClubLogo club={match.homeClub} size={26} className="shrink-0" />
        </div>

        {/* Score / kickoff badge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          {hasScore ? (
            <div className={`rounded-md px-2 py-1 font-mono font-bold text-sm flex items-center gap-1 border shadow-inner ${
              isLive
                ? 'bg-live/10 border-live/30 text-live'
                : 'bg-zinc-950 border-zinc-800 text-accent'
            }`}>
              <span className={homeWon ? '' : 'opacity-60'}>{hs}</span>
              <span className="text-stone-600">:</span>
              <span className={awayWon ? '' : 'opacity-60'}>{as_}</span>
            </div>
          ) : (
            <div className="text-[10px] font-mono font-semibold text-stone-400 bg-zinc-950 border border-zinc-800 rounded px-2 py-1">
              VS
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2 min-w-0">
          <ClubLogo club={match.awayClub} size={26} className="shrink-0" />
          <span className={`font-display text-[13px] sm:text-sm leading-tight truncate ${awayWon ? 'text-foreground font-bold' : 'text-foreground/80'}`}>
            {match.awayClub.name}
          </span>
        </div>

        {/* Expand affordance */}
        <div className="flex justify-end">
          {hasDetails && (
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground/30 transition-transform duration-200 ${expanded ? 'rotate-180 text-accent' : ''}`} />
          )}
        </div>
      </motion.div>

      {/* Compact scorer strip — always visible for finished/live matches with goals */}
      {(isFinished || isLive) && hasEvents && (
        <ScorerStrip events={match.events!} homeClubId={match.homeClub.id} />
      )}

      {/* xG bar (results only) */}
      {xg && (
        <div className="px-4 pb-2.5 -mt-0.5">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-1">
            <span className="tabular-nums text-muted-foreground/60">{xg.home.toFixed(1)}</span>
            <span>xG</span>
            <span className="tabular-nums text-muted-foreground/60">{xg.away.toFixed(1)}</span>
          </div>
          <div className="flex h-1 rounded-full overflow-hidden">
            <div className="h-full rounded-l-full bg-[#1F8A4C]/60" style={{ width: `${(xg.home / (xg.home + xg.away)) * 100}%` }} />
            <div className="h-full rounded-r-full flex-1 bg-[#CE1126]/40" />
          </div>
        </div>
      )}

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/20 bg-white/[0.015] px-4"
          >
            {hasEvents && <EventsTimeline events={match.events!} homeClubId={match.homeClub.id} />}
            {(match.venue || match.referee || match.attendance) && (
              <div className="flex justify-center py-3 border-t border-border/10">
                <MatchMeta match={match} showTime={!isFinished && !isLive} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
MatchRow.displayName = 'MatchRow';
