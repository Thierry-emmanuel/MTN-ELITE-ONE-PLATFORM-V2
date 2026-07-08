import { memo } from 'react';
import { Star } from 'lucide-react';
import type { MatchLineups, LineupPlayer, Club } from '@/types/football.types';

interface PlayerDotProps {
  player: LineupPlayer;
  side: 'home' | 'away';
  color: string;
}

const PlayerDot = memo(({ player, side, color }: PlayerDotProps) => {
  // Away team pitch coordinates mirror vertically so both teams face each other.
  const top = side === 'home' ? `${100 - (player.y ?? 50)}%` : `${player.y ?? 50}%`;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
      style={{ left: `${player.x ?? 50}%`, top }}
    >
      <div
        className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full grid place-items-center text-[10px] font-bold text-black shadow-lg ring-2 ring-black/30"
        style={{ background: color }}
      >
        {player.shirtNumber ?? '—'}
        {player.isCaptain && (
          <Star className="absolute -top-1.5 -right-1.5 h-3 w-3 text-accent fill-accent" />
        )}
      </div>
      <span className="text-[9px] text-foreground/70 whitespace-nowrap bg-black/60 px-1 rounded leading-tight max-w-[64px] truncate">
        {player.name}
      </span>
    </div>
  );
});
PlayerDot.displayName = 'PlayerDot';

interface LineupFormationProps {
  lineups: MatchLineups;
  homeClub: Club;
  awayClub: Club;
}

export const LineupFormation = memo(({ lineups, homeClub, awayClub }: LineupFormationProps) => {
  const homeColor = homeClub.color ?? '#1F8A4C';
  const awayColor = awayClub.color ?? '#FCD116';

  return (
    <div className="space-y-6">
      {/* Formations header */}
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: homeColor }} />
          <span className="text-foreground/80 truncate">{homeClub.short ?? homeClub.name}</span>
          {lineups.home.formation && (
            <span className="text-muted-foreground/40 font-mono">{lineups.home.formation}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lineups.away.formation && (
            <span className="text-muted-foreground/40 font-mono">{lineups.away.formation}</span>
          )}
          <span className="text-foreground/80 truncate">{awayClub.short ?? awayClub.name}</span>
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: awayColor }} />
        </div>
      </div>

      {/* Pitch */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-b from-[#0d2b1a] via-[#0a2216] to-[#0d2b1a]">
        {/* Pitch markings */}
        <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3" />
          <rect x="22" y="0" width="56" height="16" fill="none" stroke="white" strokeWidth="0.3" />
          <rect x="22" y="84" width="56" height="16" fill="none" stroke="white" strokeWidth="0.3" />
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="0.3" />
        </svg>

        {/* Home half (top) */}
        <div className="absolute inset-x-0 top-0 h-1/2">
          {lineups.home.startXI.map(p => (
            <PlayerDot key={p.playerId} player={p} side="home" color={homeColor} />
          ))}
        </div>
        {/* Away half (bottom) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2">
          {lineups.away.startXI.map(p => (
            <PlayerDot
              key={p.playerId}
              player={{ ...p, y: (p.y ?? 50) }}
              side="away"
              color={awayColor}
            />
          ))}
        </div>
      </div>

      {/* Substitutes */}
      <div className="grid grid-cols-2 gap-4">
        {[{ club: homeClub, team: lineups.home, color: homeColor }, { club: awayClub, team: lineups.away, color: awayColor }].map(({ club, team, color }) => (
          <div key={club.id}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">
              Remplaçants · {club.short ?? club.name}
            </p>
            <ul className="space-y-1.5">
              {team.substitutes.map(p => (
                <li key={p.playerId} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <span
                    className="h-4 w-4 rounded-full grid place-items-center text-[8px] font-bold text-black shrink-0"
                    style={{ background: `${color}` }}
                  >
                    {p.shirtNumber ?? '—'}
                  </span>
                  <span className="truncate">{p.name}</span>
                  {p.position && (
                    <span className="ml-auto text-[9px] text-muted-foreground/40 uppercase">{p.position}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {!lineups.confirmed && (
        <p className="text-[10px] text-muted-foreground/30 text-center uppercase tracking-wider">
          Composition estimative — sera confirmée avant le coup d'envoi
        </p>
      )}
    </div>
  );
});
LineupFormation.displayName = 'LineupFormation';
