import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ArrowRight, ChevronDown, LayoutGrid, List as ListIcon, ChevronRight, Heart } from 'lucide-react';
import { usePlayers, useClubs } from '@/hooks/useFootball';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { PlayerAvatar } from '@/components/elite/PlayerAvatar';
import { PlayerCardPhoto } from '@/components/elite/PlayerCardPhoto';
import { RatingBadge } from '@/components/elite/stats/RatingBadge';
import { clubs as CLUB_DIRECTORY } from '@/components/elite/data';
import { computeRating } from '@/lib/statsRating';
import { getQuickMeta } from '@/data/playerProfile.mock';
import { flagFor, shade } from '@/lib/playerVisuals';
import { useFavoritesStore } from '@/store/favorites.store';
import PageLayout from '@/layout/PageLayout';
import type { PlayerStat, Club } from '@/types/football.types';

const POSITIONS = [
  { id: 'ALL', label: 'Tous'        },
  { id: 'GK',  label: 'Gardiens'   },
  { id: 'DF',  label: 'Défenseurs' },
  { id: 'MF',  label: 'Milieux'    },
  { id: 'FW',  label: 'Attaquants' },
] as const;

// Map UI short codes → backend enum values (GK=GK, DF→DEF, MF→MID, FW→FWD)
const POSITION_API_MAP: Record<string, string> = {
  GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'FWD',
};

const POSITION_COLOR: Record<string, string> = {
  // Mock data keys
  GK: '#FCD116', DF: '#3B82F6', MF: '#22C55E', FW: '#EF4444',
  // Backend enum keys
  DEF: '#3B82F6', MID: '#22C55E', FWD: '#EF4444',
};

type ViewMode = 'grid' | 'list';

export default function PlayersPage() {
  const [search,         setSearch]         = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL'|'GK'|'DF'|'MF'|'FW'>('ALL');
  const [clubFilter,     setClubFilter]     = useState<string>('ALL');
  const [viewMode,       setViewMode]       = useState<ViewMode>(() => (localStorage.getItem('players-view') as ViewMode) || 'grid');
  const { toggleLikePlayer, isPlayerLiked } = useFavoritesStore();

  useEffect(() => { localStorage.setItem('players-view', viewMode); }, [viewMode]);

  const { data: clubs }                        = useClubs();
  const { data: players, isLoading }           = usePlayers({
    position: positionFilter !== 'ALL' ? POSITION_API_MAP[positionFilter] : undefined,
    clubId:   clubFilter     !== 'ALL' ? clubFilter     : undefined,
  });

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    const q = search.toLowerCase();
    return (players as PlayerStat[]).filter((p: PlayerStat) => {
      const name = (
        p.playerName ??
        [(p as any).firstName, (p as any).lastName].filter(Boolean).join(' ')
      );
      return name.toLowerCase().includes(q);
    });
  }, [players, search]);

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
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
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

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-border/40 rounded-xl p-1 self-start lg:self-auto shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Vue grille"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === 'grid' ? 'bg-accent text-black' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Grille</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Vue liste"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === 'list' ? 'bg-accent text-black' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Liste</span>
            </button>
          </div>
        </div>

        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            {filteredPlayers.length} joueur{filteredPlayers.length !== 1 ? 's' : ''} trouvé{filteredPlayers.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-2'}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={viewMode === 'grid' ? 'aspect-[3/4] rounded-3xl bg-white/[0.02] border border-border/40 animate-pulse' : 'h-16 rounded-xl bg-white/[0.02] border border-border/40 animate-pulse'}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredPlayers.length === 0 && (
          <div className="text-center py-24">
            <User className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Aucun joueur trouvé pour ces critères.</p>
          </div>
        )}

        {/* ── Grid view : driver-card inspired ── */}
        <AnimatePresence mode="wait">
          {!isLoading && filteredPlayers.length > 0 && viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              {filteredPlayers.map((player: PlayerStat, idx: number) => {
                const pid = player.playerId ?? String((player as any).id ?? idx);
                const p = player as any;
                const displayName = player.playerName
                  || [p.firstName, p.lastName].filter(Boolean).join(' ')
                  || '—';
                const club = CLUB_DIRECTORY[player.clubId];
                const baseColor = club?.color ?? '#1F8A4C';
                const { jerseyNumber } = getQuickMeta(player);
                const posColor = POSITION_COLOR[player.position] ?? '#FCD116';

                return (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.4), ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={`/players/${pid}`}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl aspect-[3/4] border border-white/10 shadow-[0_8px_28px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] hover:-translate-y-1 transition-all duration-300"
                      style={{
                        background: `linear-gradient(150deg, ${shade(baseColor, -0.55)} 0%, ${shade(baseColor, -0.15)} 55%, ${shade(baseColor, -0.6)} 100%)`,
                      }}
                    >
                      {/* dot-grid texture (only visible where the photo doesn't cover) */}
                      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:14px_14px]" />

                      {/* Full-bleed portrait */}
                      <PlayerCardPhoto
                        name={displayName}
                        photoUrl={player.photoUrl}
                        className="grayscale-[0.15] group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      />

                      {/* Top scrim — keeps badges legible over any photo */}
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/15 to-transparent pointer-events-none" />
                      {/* Bottom scrim — keeps text legible over any photo */}
                      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                      {/* Top row: position + jersey number + flag */}
                      <div className="relative z-10 flex items-start justify-between p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm"
                            style={{ background: `${posColor}35`, color: posColor, border: `1px solid ${posColor}55` }}
                          >
                            {player.position}
                          </span>
                          <span className="h-5 min-w-5 px-1 rounded-md bg-black/40 backdrop-blur-sm grid place-items-center text-[10px] font-black text-white/90 border border-white/10">
                            {jerseyNumber}
                          </span>
                        </div>
                        <span className="h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm grid place-items-center text-sm border border-white/10">
                          {flagFor(player.nationality)}
                        </span>
                      </div>

                      {/* Bottom info block */}
                      <div className="relative z-10 p-3.5 pt-2 mt-auto">
                        <h3 className="font-display text-[15px] sm:text-base font-black text-white leading-[1.05] truncate [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 mb-2.5 min-w-0">
                          {club && <ClubBadge club={club} size={14} />}
                          <span className="text-[11px] text-white/70 truncate">{club?.name ?? player.clubName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex gap-2.5">
                            <span className="text-white/60">B <b className="text-white">{player.goals}</b></span>
                            <span className="text-white/60">PD <b className="text-white">{player.assists}</b></span>
                          </div>
                          <span className="flex items-center gap-0.5 font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                            Profil <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                     {/* Like overlay button */}
                     <button
                       onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLikePlayer(pid); }}
                       className={`absolute top-2.5 right-2.5 z-20 h-7 w-7 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm border ${
                         isPlayerLiked(pid)
                           ? 'bg-red-500/30 border-red-500/50 text-red-400'
                           : 'bg-black/40 border-white/10 text-white/40 hover:text-red-400'
                       }`}
                     >
                       <Heart className={`h-3.5 w-3.5 ${isPlayerLiked(pid) ? 'fill-current' : ''}`} />
                     </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── List view : dense professional table ── */}
          {!isLoading && filteredPlayers.length > 0 && viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="text-left px-4 py-3 font-semibold">Joueur</th>
                      <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Club</th>
                      <th className="text-center px-3 py-3 font-semibold">Pos</th>
                      <th className="text-center px-3 py-3 font-semibold hidden md:table-cell">MJ</th>
                      <th className="text-center px-3 py-3 font-semibold">B</th>
                      <th className="text-center px-3 py-3 font-semibold">PD</th>
                      <th className="text-center px-3 py-3 font-semibold hidden lg:table-cell">Min</th>
                      <th className="text-center px-3 py-3 font-semibold">Note</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player: PlayerStat) => {
                      const club = CLUB_DIRECTORY[player.clubId];
                      const rating = computeRating(player);
                      const posColor = POSITION_COLOR[player.position] ?? '#FCD116';
                      return (
                        <tr
                          key={player.playerId}
                          className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors group"
                        >
                          <td className="px-4 py-2.5">
                            <Link to={`/players/${player.playerId}`} className="flex items-center gap-3 min-w-0">
                              <PlayerAvatar name={player.playerName} photoUrl={player.photoUrl} size={34} ring={club?.color} />
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">{player.playerName}</div>
                                <div className="text-[11px] text-muted-foreground sm:hidden truncate">{club?.name ?? player.clubName}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <div className="flex items-center gap-2 min-w-0">
                              {club && <ClubBadge club={club} size={18} />}
                              <span className="text-foreground/80 truncate text-xs">{club?.name ?? player.clubName}</span>
                            </div>
                          </td>
                          <td className="text-center px-3 py-2.5">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase" style={{ background: `${posColor}20`, color: posColor }}>
                              {player.position}
                            </span>
                          </td>
                          <td className="text-center px-3 py-2.5 tabular-nums text-muted-foreground hidden md:table-cell">{player.appearances}</td>
                          <td className="text-center px-3 py-2.5 tabular-nums font-bold text-foreground">{player.goals}</td>
                          <td className="text-center px-3 py-2.5 tabular-nums font-bold text-foreground">{player.assists}</td>
                          <td className="text-center px-3 py-2.5 tabular-nums text-muted-foreground hidden lg:table-cell">{player.minutesPlayed.toLocaleString('fr-FR')}</td>
                          <td className="text-center px-3 py-2.5"><RatingBadge rating={rating} size="sm" /></td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => toggleLikePlayer(player.playerId ?? String((player as any).id))}
                                className={`flex items-center justify-center h-7 w-7 rounded-lg border transition-all ${
                                  isPlayerLiked(player.playerId ?? String((player as any).id))
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-white/5 border-white/10 text-white/30 hover:text-red-400'
                                }`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${isPlayerLiked(player.playerId ?? String((player as any).id)) ? 'fill-current' : ''}`} />
                              </button>
                              <Link
                                to={`/players/${player.playerId}`}
                                className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/5 group-hover:bg-accent group-hover:text-black text-muted-foreground transition-all"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
