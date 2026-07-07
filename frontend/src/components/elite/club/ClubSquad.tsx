import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users2 } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import { PlayerAvatar } from '@/components/elite/stats/MediaAvatar';
import type { Club } from '@/types/football.types';

interface ClubSquadProps {
  club: Club;
  squad?: any[];
  isLoading: boolean;
}

const POSITION_GROUPS: { code: string; label: string }[] = [
  { code: 'GK', label: 'Gardiens' },
  { code: 'DF', label: 'Défenseurs' },
  { code: 'MF', label: 'Milieux' },
  { code: 'FW', label: 'Attaquants' },
];

export const ClubSquad = memo(({ club, squad, isLoading }: ClubSquadProps) => {
  const primary = club.color || '#FCD116';

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    POSITION_GROUPS.forEach(g => map.set(g.code, []));
    (squad ?? []).forEach((p: any) => {
      const pos = (p.position || 'MF').toUpperCase();
      const bucket = map.has(pos) ? pos : 'MF';
      map.get(bucket)!.push(p);
    });
    return map;
  }, [squad]);

  return (
    <>
      <SectionHeading
        icon={Users2}
        room="Salle 03"
        title="L'équipe première"
        subtitle="Le groupe professionnel qui porte les couleurs du club cette saison."
        accentColor={primary}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : !squad || squad.length === 0 ? (
        <p className="text-sm text-white/40">Aucun joueur répertorié pour ce club.</p>
      ) : (
        <div className="space-y-10">
          {POSITION_GROUPS.map(group => {
            const players = grouped.get(group.code) ?? [];
            if (players.length === 0) return null;
            return (
              <div key={group.code}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[10px] font-black px-2.5 py-1 uppercase tracking-widest border"
                    style={{ background: `${primary}14`, color: primary, borderColor: `${primary}40` }}
                  >
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] text-white/35">{players.length} joueur{players.length > 1 ? 's' : ''}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player: any, idx: number) => (
                    <Reveal key={player.playerId || player.id} delay={Math.min(idx * 0.03, 0.3)}>
                      <Link
                        to={`/players/${player.playerId || player.id}`}
                        className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 hover:border-white/25 transition-all hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar photoUrl={player.photoUrl} name={player.playerName || player.name || '?'} size={44} />
                          <div className="min-w-0">
                            <div className="text-sm font-bold group-hover:text-accent transition-colors truncate">
                              {player.playerName || player.name}
                            </div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wide">
                              {player.age ? `${player.age} ans` : '—'} · {player.nationality || 'CMR'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="text-[9px] font-mono font-bold text-white/40 block uppercase">Buts</span>
                          <span className="text-sm font-bold text-white">{player.goals ?? 0}</span>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
});
ClubSquad.displayName = 'ClubSquad';
