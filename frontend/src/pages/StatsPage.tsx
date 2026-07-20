import {
  useState, useEffect, useMemo, useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Table2, Target, Zap, BookOpen,
  ArrowUpRight, Square, Clock, RefreshCw, TrendingUp, Star,
} from 'lucide-react';
import { SEASON_KEY } from '@/services/season';
import { PageHero }              from '@/components/ui/football';
import { StatsFilters }          from '@/components/elite/stats/StatsFilters';
import { PlayerStatsTable }      from '@/components/elite/stats/PlayerStatsTable';
import { ClubStatsTable, ClubAttackDefenseChart } from '@/components/elite/stats/ClubStatsComponents';
import { CategoryLeaderboard }   from '@/components/elite/stats/CategoryLeaderboard';
import { LeagueLeadersPodium }   from '@/components/elite/stats/LeagueLeadersPodium';
import { RatingBadge }           from '@/components/elite/stats/RatingBadge';
import { computeRating }         from '@/lib/statsRating';
import { usePlayerStats, useClubStats } from '@/hooks/useFootball';
import type {
  PlayerStat, ClubStat,
  PlayerStatsFilter, StatSortField, StatCategory,
} from '@/types/football.types';

const SEASON_ID = SEASON_KEY;
const DEFAULT_PAGE_SIZE = 25;
// High ceiling so a full season's roster/clubs is never silently truncated client-side.
const FULL_PLAYER_FETCH_LIMIT = 1000;
const FULL_CLUB_FETCH_LIMIT   = 200;

type MainTab = 'players' | 'clubs' | 'tableau';

const STAT_CATEGORIES: { id: StatCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'goals',     label: 'Buteurs',   icon: Target       },
  { id: 'assists',   label: 'Passeurs',  icon: Zap          },
  { id: 'keyPasses', label: 'Créateurs', icon: BookOpen     },
  { id: 'shots',     label: 'Tireurs',   icon: ArrowUpRight },
  { id: 'cards',     label: 'Cartons',   icon: Square       },
  { id: 'minutes',   label: 'Présence',  icon: Clock        },
];

function applyFilters(players: PlayerStat[], f: PlayerStatsFilter) {
  return players.filter(p => {
    if (f.position && f.position !== 'ALL' && p.position !== f.position) return false;
    if (f.teamId && p.clubId !== f.teamId) return false;
    if (f.minMinutes && p.minutesPlayed < f.minMinutes) return false;
    return true;
  });
}
function sortPlayers(players: PlayerStat[], field: StatSortField, dir: 'asc' | 'desc') {
  return [...players].sort((a, b) => {
    const va = (a as any)[field] as number ?? 0;
    const vb = (b as any)[field] as number ?? 0;
    return dir === 'desc' ? vb - va : va - vb;
  });
}
function sortClubs(clubs: ClubStat[], field: StatSortField, dir: 'asc' | 'desc') {
  return [...clubs].sort((a, b) => {
    const va = (a as any)[field] as number ?? 0;
    const vb = (b as any)[field] as number ?? 0;
    return dir === 'desc' ? vb - va : va - vb;
  });
}

const StatCard = ({
  icon: Icon, label, value, sub, color = 'text-foreground', delay = 0,
}: {
  icon: React.FC<{ className?: string }>; label: string;
  value: string | number; sub?: string; color?: string; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-xl border border-border/50 bg-gradient-to-b from-white/[0.05] to-transparent p-4 flex items-center gap-3 hover:border-border/80 transition-colors"
  >
    <div className="h-9 w-9 rounded-xl bg-white/[0.05] border border-border/40 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground/60" />
    </div>
    <div className="min-w-0">
      <p className={`font-display text-2xl tabular-nums leading-none ${color}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground/50 mt-0.5 truncate">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/30 mt-0.5 truncate">{sub}</p>}
    </div>
  </motion.div>
);

export default function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab,            setTab]            = useState<MainTab>((searchParams.get('tab') as MainTab) ?? 'players');
  const [seasonId]       = useState(searchParams.get('season') ?? SEASON_ID);
  const [activeCategory, setActiveCategory] = useState<StatCategory>((searchParams.get('cat') as StatCategory) ?? 'goals');
  const { data: allPlayersData, isLoading: playersLoading, refetch: refetchPlayers } = usePlayerStats(seasonId, { limit: FULL_PLAYER_FETCH_LIMIT });
  const { data: allClubsData, isLoading: clubsLoading, refetch: refetchClubs } = useClubStats(seasonId, { limit: FULL_CLUB_FETCH_LIMIT });
  const allPlayers = allPlayersData ?? [];
  const allClubs = allClubsData ?? [];
  const loading = playersLoading || clubsLoading;

  const [per90,          setPer90]          = useState(false);
  const [playerPage,     setPlayerPage]     = useState(1);
  const [playerPageSize, setPlayerPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [playerSort,     setPlayerSort]     = useState<StatSortField>('goals');
  const [playerDir,      setPlayerDir]      = useState<'asc' | 'desc'>('desc');
  const [clubSort,       setClubSort]       = useState<StatSortField>('goalsFor');
  const [clubDir,        setClubDir]        = useState<'asc' | 'desc'>('desc');
  const [filters,        setFilters]        = useState<PlayerStatsFilter>({
    position: 'ALL', teamId: undefined, minMinutes: undefined,
  });

  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    setSearchParams({ tab, season: seasonId, cat: activeCategory }, { replace: true });
  }, [tab, seasonId, activeCategory]);

  const filteredPlayers  = useMemo(() => applyFilters(allPlayers, filters), [allPlayers, filters]);
  const sortedPlayers    = useMemo(() => sortPlayers(filteredPlayers, playerSort, playerDir), [filteredPlayers, playerSort, playerDir]);
  const pagePlayers      = useMemo(() => sortedPlayers.slice((playerPage - 1) * playerPageSize, playerPage * playerPageSize), [sortedPlayers, playerPage, playerPageSize]);
  const totalPlayerPages = Math.max(1, Math.ceil(filteredPlayers.length / playerPageSize));
  const sortedClubs      = useMemo(() => sortClubs(allClubs, clubSort, clubDir), [allClubs, clubSort, clubDir]);
  const clubOptions      = useMemo(() =>
    [...new Map(allPlayers.map(p => [p.clubId, { id: p.clubId, name: p.clubName, short: p.clubShort }])).values()],
    [allPlayers]);

  // Aggregates
  const totalGoals       = allPlayers.reduce((s, p) => s + p.goals,           0);
  const totalAssists     = allPlayers.reduce((s, p) => s + p.assists,         0);
  const totalYellow      = allPlayers.reduce((s, p) => s + p.yellowCards,     0);
  const totalRed         = allPlayers.reduce((s, p) => s + p.redCards,        0);
  const totalShots       = allPlayers.reduce((s, p) => s + p.shots,           0);
  const totalPens        = allPlayers.reduce((s, p) => s + p.penaltiesScored, 0);
  const totalCleanSheets = allClubs.reduce((s, c) => s + c.cleanSheets,       0);
  const totalMatchesPlayed = allClubs.reduce((s, c) => s + c.matchesPlayed,   0);
  const avgGoals = totalMatchesPlayed > 0
    ? (allClubs.reduce((s, c) => s + c.goalsFor, 0) / (totalMatchesPlayed / 2)).toFixed(2)
    : '—';
  const topScorer   = useMemo(() => [...allPlayers].sort((a, b) => b.goals   - a.goals)[0],   [allPlayers]);
  const topAssister = useMemo(() => [...allPlayers].sort((a, b) => b.assists - a.assists)[0], [allPlayers]);
  const topRated     = useMemo(() => {
    const eligible = allPlayers.filter(p => p.appearances >= 5);
    const pool = eligible.length > 0 ? eligible : allPlayers;
    return [...pool].sort((a, b) => computeRating(b) - computeRating(a))[0];
  }, [allPlayers]);

  const load = () => { refetchPlayers(); refetchClubs(); };

  const TABS: { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'players', label: 'Joueurs',          icon: Users  },
    { id: 'clubs',   label: 'Clubs',            icon: Shield },
    { id: 'tableau', label: 'Tableau complet',  icon: Table2 },
  ];

  return (
    <>
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Statistiques"
        subtitle="Performances des joueurs et clubs de la saison"
        accentColor="gold"
      />

      <div className="container py-6 lg:py-8 space-y-12">

        {/* ══════════════════════════════════════════════════
            SECTION 1 — STATISTIQUES GÉNÉRALES
        ══════════════════════════════════════════════════ */}
        <section aria-label="Statistiques générales">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Vue d'ensemble
            </p>
            <h2 className="text-lg font-display font-bold text-foreground">La saison en chiffres</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <StatCard icon={Target}       label="Buts marqués"      value={totalGoals}       color="text-accent" delay={0}    />
            <StatCard icon={Zap}          label="Passes décisives"  value={totalAssists}                            delay={0.04} />
            <StatCard icon={TrendingUp}   label="Moy. buts / match" value={avgGoals}                               delay={0.08} />
            <StatCard icon={ArrowUpRight} label="Tirs tentés"       value={totalShots}                             delay={0.12} />
            <StatCard icon={Square}       label="Cartons jaunes"    value={totalYellow}      color="text-accent" delay={0.16} />
            <StatCard icon={Square}       label="Cartons rouges"    value={totalRed}         color="text-live" delay={0.20} />
            <StatCard icon={Target}       label="Penalties"         value={totalPens}                              delay={0.24} />
            <StatCard icon={Shield}       label="Clean sheets"      value={totalCleanSheets}                       delay={0.28} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard icon={Target} label="Top buteur"
              value={topScorer?.goals ?? 0} sub={topScorer?.playerName}
              color="text-accent" delay={0.32} />
            <StatCard icon={Zap} label="Top passeur"
              value={topAssister?.assists ?? 0} sub={topAssister?.playerName}
              color="text-win" delay={0.36} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.40, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-border/50 bg-gradient-to-b from-white/[0.05] to-transparent p-4 flex items-center gap-3 hover:border-border/80 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-white/[0.05] border border-border/40 flex items-center justify-center shrink-0">
                <Star className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {topRated && <RatingBadge rating={computeRating(topRated)} size="sm" />}
                  <p className="text-[11px] text-muted-foreground/50 truncate">Meilleure note</p>
                </div>
                <p className="text-[10px] text-muted-foreground/30 mt-1 truncate">{topRated?.playerName}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — MENEURS DE LIGUE (podium)
        ══════════════════════════════════════════════════ */}
        <section aria-label="Meneurs de ligue">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Podium
            </p>
            <h2 className="text-lg font-display font-bold text-foreground">Meneurs de la ligue</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LeagueLeadersPodium
              title="Meilleurs buteurs"
              icon={Target}
              players={allPlayers}
              valueKey="goals"
              unit="buts"
              chaseCount={3}
            />
            <LeagueLeadersPodium
              title="Meilleurs passeurs"
              icon={Zap}
              players={allPlayers}
              valueKey="assists"
              unit="passes d."
              chaseCount={3}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — CLASSEMENTS  (3 tabs)
        ══════════════════════════════════════════════════ */}
        <section aria-label="Classements">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Par catégorie
            </p>
            <h2 className="text-lg font-display font-bold text-foreground">Classements</h2>
          </div>

          {/* Tab toggle — Joueurs | Clubs | Tableau complet */}
          <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 w-fit mb-6 flex-wrap">
            {TABS.map(t => {
              const Icon   = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={active}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? 'bg-accent text-black shadow-[0_0_14px_rgba(252,209,22,0.22)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Joueurs ────────────────────────────────────────────────── */}
            {tab === 'players' && (
              <motion.div key="players" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="space-y-5">

                <div className="flex gap-2 flex-wrap" role="tablist">
                  {STAT_CATEGORIES.map(cat => {
                    const Icon   = cat.icon;
                    const active = activeCategory === cat.id;
                    return (
                      <button key={cat.id} role="tab" aria-selected={active}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wide transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          active
                            ? 'bg-accent text-black border-accent shadow-[0_0_14px_rgba(252,209,22,0.20)]'
                            : 'bg-white/[0.03] text-muted-foreground border-border/40 hover:bg-white/[0.06] hover:text-foreground hover:border-border/70'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeCategory} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <CategoryLeaderboard
                      category={activeCategory}
                      players={allPlayers}
                      loading={loading}
                      limit={15}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Clubs ──────────────────────────────────────────────────── */}
            {tab === 'clubs' && (
              <motion.div key="clubs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="space-y-5">
                <ClubAttackDefenseChart clubs={sortedClubs} />
                <ClubStatsTable
                  clubs={sortedClubs}
                  loading={loading}
                  sortField={clubSort}
                  sortDir={clubDir}
                  onSortChange={(f, d) => { setClubSort(f); setClubDir(d); }}
                />
              </motion.div>
            )}

            {/* ── Tableau complet ────────────────────────────────────────── */}
            {tab === 'tableau' && (
              <motion.div key="tableau" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="space-y-5">

                <StatsFilters
                  filters={filters}
                  onChange={u => { setFilters(prev => ({ ...prev, ...u })); setPlayerPage(1); }}
                  onReset={() => { setFilters({ position: 'ALL', teamId: undefined, minMinutes: undefined }); setPlayerPage(1); }}
                  clubOptions={clubOptions}
                  per90={per90}
                  onPer90Toggle={setPer90}
                  mode="player"
                />

                <PlayerStatsTable
                  players={pagePlayers}
                  loading={loading}
                  per90={per90}
                  page={playerPage}
                  totalPages={totalPlayerPages}
                  totalCount={filteredPlayers.length}
                  pageSize={playerPageSize}
                  onPageChange={setPlayerPage}
                  onPageSizeChange={n => { setPlayerPageSize(n); setPlayerPage(1); }}
                  onSortChange={(f, d) => { setPlayerSort(f); setPlayerDir(d); setPlayerPage(1); }}
                  sortField={playerSort}
                  sortDir={playerDir}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </section>

        {!loading && (
          <div className="flex justify-center">
            <button onClick={load}
              className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>
        )}

      </div>
    </>
  );
}
