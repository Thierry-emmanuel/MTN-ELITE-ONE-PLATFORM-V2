import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayers, useClubs } from '@/hooks/useFootball';
import { PageHero } from '@/components/elite/FootballPrimitives';
import PageLayout from '@/layout/PageLayout';
import type { PlayerStat, Club } from '@/types/football.types';

const POSITIONS = [
  { id: 'ALL', label: 'Tous'        },
  { id: 'GK',  label: 'Gardiens'   },
  { id: 'DF',  label: 'Défenseurs' },
  { id: 'MF',  label: 'Milieux'    },
  { id: 'FW',  label: 'Attaquants' },
] as const;

const POSITION_COLOR: Record<string, string> = {
  GK: 'text-[#FCD116]',
  DF: 'text-[#10B981]',
  MF: 'text-[#60A5FA]',
  FW: 'text-[#F87171]',
};

export default function PlayersPage() {
  const [search,         setSearch]         = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL'|'GK'|'DF'|'MF'|'FW'>('ALL');
  const [clubFilter,     setClubFilter]     = useState<string>('ALL');

  // Top scorers carousel ref — declared at component level (valid hook usage)
  const topScorersTrackRef = useRef<HTMLDivElement>(null);

  const { data: clubs }            = useClubs();
  const { data: players, isLoading } = usePlayers({
    position: positionFilter !== 'ALL' ? positionFilter : undefined,
    clubId:   clubFilter     !== 'ALL' ? clubFilter     : undefined,
  });

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    return (players as PlayerStat[]).filter((p: PlayerStat) =>
      p.playerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  const topScorers = useMemo(() =>
    [...filteredPlayers].sort((a: PlayerStat, b: PlayerStat) => b.goals - a.goals).slice(0, 10),
    [filteredPlayers]
  );

  const scrollTopScorers = (dir: 'left' | 'right') =>
    topScorersTrackRef.current?.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' });

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Joueurs"
        title="Galerie des Joueurs"
        subtitle="Découvrez les athlètes de la ligue professionnelle du Cameroun"
        accentColor="gold"
      />

      <div className="container py-10 space-y-6">
        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un joueur…"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Club select */}
          <div className="relative">
            <select
              value={clubFilter}
              onChange={e => setClubFilter(e.target.value)}
              className="w-full sm:w-48 pl-4 pr-8 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors appearance-none"
            >
              <option value="ALL">Tous les clubs</option>
              {clubs?.map((c: Club) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Position pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {POSITIONS.map(pos => (
              <button
                key={pos.id}
                onClick={() => setPositionFilter(pos.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
                  positionFilter === pos.id
                    ? 'bg-accent text-black border-accent shadow-[0_0_14px_rgba(252,209,22,0.3)]'
                    : 'bg-white/[0.02] text-muted-foreground border-border/40 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Top Scorers Carousel ── */}
        {!isLoading && topScorers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
                ⚡ Meilleurs buteurs
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => scrollTopScorers('left')}
                  className="h-7 w-7 rounded-full bg-white/5 border border-border/40 grid place-items-center hover:bg-white/10 text-muted-foreground hover:text-accent transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => scrollTopScorers('right')}
                  className="h-7 w-7 rounded-full bg-white/5 border border-border/40 grid place-items-center hover:bg-white/10 text-muted-foreground hover:text-accent transition-all cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={topScorersTrackRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {topScorers.map((p: PlayerStat, i: number) => (
                <Link
                  key={p.playerId}
                  to={`/players/${p.playerId}`}
                  style={{ scrollSnapAlign: 'start' }}
                  className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-surface-elevated border border-border/50 rounded-xl hover:border-accent/40 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-full bg-white/5 border border-border/40 grid place-items-center font-display text-xs font-bold text-accent">
                      {(p.nationality || 'CMR').slice(0, 2)}
                    </div>
                    {i < 3 && (
                      <span className="absolute -top-1 -right-1 text-[8px] leading-none">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate max-w-[110px]">
                      {p.playerName}
                    </div>
                    <div className="text-[9px] text-muted-foreground truncate">{p.clubName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-display font-bold text-accent">{p.goals}</div>
                    <div className="text-[8px] text-muted-foreground uppercase">buts</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            {filteredPlayers.length} joueur{filteredPlayers.length !== 1 ? 's' : ''} trouvé{filteredPlayers.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Players Grid ── */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-white/[0.02] border border-border/40 animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-24">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                >
                  <div className="p-5 flex flex-col justify-between h-full space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 min-w-0 pr-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 bg-white/5 rounded uppercase tracking-widest font-mono ${POSITION_COLOR[player.position] ?? 'text-accent'}`}>
                          {player.position}
                        </span>
                        <h3 className="font-display text-lg font-bold leading-tight group-hover:text-accent transition-colors pt-2 truncate">
                          {player.playerName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{player.clubName}</p>
                      </div>
                      {/* Nationality badge */}
                      <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display text-[10px] font-bold text-white/55">
                        {(player.nationality || 'CMR').slice(0, 3)}
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/30 text-center">
                      {[
                        { label: 'Matchs', val: player.appearances, color: 'text-white/80' },
                        { label: 'Buts',   val: player.goals,       color: 'text-accent'   },
                        { label: 'Assists',val: player.assists,     color: 'text-[#10B981]'},
                      ].map(s => (
                        <div key={s.label}>
                          <div className={`text-sm font-bold ${s.color}`}>{s.val}</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
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
    </PageLayout>
  );
}
