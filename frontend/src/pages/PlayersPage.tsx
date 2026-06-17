import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ArrowRight } from 'lucide-react';
import { usePlayers, useClubs } from '@/hooks/useFootball';
import { PageHero } from '@/components/elite/FootballPrimitives';
import type { PlayerStat, Club } from '@/types/football.types';

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'GK' | 'DF' | 'MF' | 'FW'>('ALL');
  const [clubFilter, setClubFilter] = useState<string>('ALL');

  const { data: clubs } = useClubs();
  const { data: players, isLoading } = usePlayers({
    position: positionFilter !== 'ALL' ? positionFilter : undefined,
    clubId: clubFilter !== 'ALL' ? clubFilter : undefined,
  });

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    return (players as PlayerStat[]).filter((p: PlayerStat) =>
      p.playerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  const POSITIONS = [
    { id: 'ALL', label: 'Tous' },
    { id: 'GK', label: 'Gardiens' },
    { id: 'DF', label: 'Défenseurs' },
    { id: 'MF', label: 'Milieux' },
    { id: 'FW', label: 'Attaquants' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="MTN Elite One · Joueurs"
        title="Galerie des Joueurs"
        subtitle="Découvrez les athlètes de la ligue professionnelle"
        accentColor="gold"
      />

      <div className="container py-8 space-y-6">
        {/* Filters and Search controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Club Filter */}
          <div className="relative">
            <select
              value={clubFilter}
              onChange={e => setClubFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors appearance-none"
            >
              <option value="ALL">Tous les clubs</option>
              {clubs?.map((c: Club) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              ▼
            </div>
          </div>

          {/* Position Pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-0.5">
            {POSITIONS.map(pos => (
              <button
                key={pos.id}
                onClick={() => setPositionFilter(pos.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
                  positionFilter === pos.id
                    ? 'bg-accent text-black border-accent'
                    : 'bg-white/[0.02] text-muted-foreground border-border/40 hover:bg-white/[0.05]'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-white/[0.02] border border-border/40 animate-pulse"
                />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-20">
              <User className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Aucun joueur trouvé pour ces critères.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPlayers.map((player: PlayerStat, idx: number) => (
                <motion.div
                  key={player.playerId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="p-5 flex flex-col justify-between h-full space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 rounded text-accent uppercase tracking-widest font-mono">
                          {player.position}
                        </span>
                        <h3 className="font-display text-lg font-bold leading-tight group-hover:text-accent transition-colors pt-2">
                          {player.playerName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {player.clubName}
                        </p>
                      </div>
                      <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center font-display text-xs font-bold text-white/55">
                        {player.nationality || 'CMR'}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/30 text-center">
                      <div>
                        <div className="text-xs font-bold text-white/80">{player.appearances}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Matches</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-accent">{player.goals}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Buts</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white/80">{player.assists}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Assists</div>
                      </div>
                    </div>

                    <Link
                      to={`/players/${player.playerId}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-accent hover:text-black border border-white/10 hover:border-transparent text-xs font-bold transition-all duration-200"
                    >
                      Voir le profil <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
