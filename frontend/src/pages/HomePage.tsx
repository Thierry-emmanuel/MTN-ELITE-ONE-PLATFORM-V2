import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Radio, ArrowRight, CalendarDays,
  BarChart2, Newspaper, Users, Star,
} from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import {
  ClubLogo, MatchStatusChip, SummaryCard,
  FixtureCardSkeleton, ErrorState,
} from '@/components/ui/football';
import { useFixtures, useStandings } from '@/hooks/useFootball';
import { Hero } from '@/components/elite/Hero';
import { HallOfFame } from '@/components/elite/HallOfFame';
import { RoadToLions } from '@/components/elite/RoadToLions';
import { layoutApi, HomepageLayout } from '@/services/layoutApi';
import type { Match, MatchDay } from '@/types/football.types';

// ─── Default layout fallback (if backend unreachable) ──────────────────────────

const DEFAULT_LAYOUT: HomepageLayout = {
  section_order: ['hero', 'matches', 'standings', 'stats', 'explore', 'awards', 'halloffame', 'roadtolions'],
  section_visibility: {
    hero: true,
    matches: true,
    standings: true,
    stats: true,
    explore: true,
    awards: true,
    halloffame: true,
    roadtolions: true,
  },
};

// ─── Quick Match Card ──────────────────────────────────────────────────────────

const QuickMatchCard = memo(({ match, index }: { match: Match; index: number }) => {
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-xl border overflow-hidden transition-all duration-300 p-4 ${
        isLive
          ? 'border-live/35 bg-live/[0.04]'
          : 'border-border/60 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      {isLive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-live" />}
      <div className="flex items-center justify-between mb-3 text-[10px]">
        <MatchStatusChip status={match.status} minute={match.liveMinute} />
        {isLive && (
          <span className="flex items-center gap-1 text-live font-bold">
            <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
          </span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center gap-1.5">
          <ClubLogo club={match.homeClub} size={36} />
          <span className="text-[11px] font-semibold text-center leading-tight truncate w-full text-center">
            {match.homeClub.short ?? match.homeClub.name.slice(0, 8)}
          </span>
        </div>
        <div className="text-center">
          {match.homeScore !== undefined && match.awayScore !== undefined ? (
            <span className="font-display text-xl tabular-nums">
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className="text-muted-foreground/40 font-display text-sm">vs</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <ClubLogo club={match.awayClub} size={36} />
          <span className="text-[11px] font-semibold text-center leading-tight truncate w-full text-center">
            {match.awayClub.short ?? match.awayClub.name.slice(0, 8)}
          </span>
        </div>
      </div>
    </motion.article>
  );
});
QuickMatchCard.displayName = 'QuickMatchCard';

// ─── Matches Section ───────────────────────────────────────────────────────────

const MatchesSection = memo(() => {
  const { data, isLoading, isError, refetch } = useFixtures();
  const featured: Match[] = (() => {
    if (!data) return [];
    const all = (data as MatchDay[]).flatMap(d => d.matches);
    const live = all.filter(m => m.status === 'LIVE' || m.status === 'HT');
    if (live.length) return live.slice(0, 6);
    const upcoming = all.filter(m => m.status === 'SCHEDULED');
    if (upcoming.length) return upcoming.slice(0, 6);
    return all.slice(0, 6);
  })();

  return (
    <section className="py-12 border-b border-border/30">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Radio className="h-4 w-4 text-live animate-pulse" />
            <h2 className="font-display text-xl uppercase tracking-wider">Matchs</h2>
          </div>
          <Link to="/fixtures" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <FixtureCardSkeleton key={i} />)}
          </div>
        )}
        {isError && <ErrorState message="Impossible de charger les matchs." onRetry={() => void refetch()} />}
        {!isLoading && !isError && featured.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">Aucun match à afficher pour le moment.</p>
        )}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((m, i) => <QuickMatchCard key={m.id} match={m} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
});
MatchesSection.displayName = 'MatchesSection';

// ─── Mini Standings + News ─────────────────────────────────────────────────────

const StandingsPreview = memo(() => {
  const { data, isLoading } = useStandings();
  const top5 = (data ?? []).slice(0, 5);

  return (
    <section className="py-12 border-b border-border/30">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_380px] gap-0">
          {/* Standings */}
          <div className="border-r-0 lg:border-r border-border/30 pr-0 lg:pr-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-accent" />
                <h2 className="font-display text-xl uppercase tracking-wider">Classement</h2>
              </div>
              <Link to="/standings" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
                Complet <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-surface-elevated/40 border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-2 border-b border-border/30 text-[9px] uppercase tracking-widest text-muted-foreground/50">
                <span className="w-5 text-center">#</span>
                <span>Club</span>
                <span className="w-7 text-center">J</span>
                <span className="w-7 text-center hidden sm:block">GD</span>
                <span className="w-8 text-center font-bold">Pts</span>
              </div>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 animate-pulse">
                      <div className="h-3 w-5 rounded bg-white/6" />
                      <div className="h-6 w-6 rounded-lg bg-white/6" />
                      <div className="flex-1 h-3 rounded bg-white/6" />
                      <div className="h-3 w-12 rounded bg-white/6" />
                    </div>
                  ))
                : top5.map((row, i) => (
                    <motion.div
                      key={row.club.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className={`w-5 text-center text-xs font-bold tabular-nums ${i === 0 ? 'text-accent' : 'text-muted-foreground/50'}`}>{i + 1}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <ClubLogo club={row.club} size={24} />
                        <span className="text-xs font-semibold truncate">{row.club.name}</span>
                      </div>
                      <span className="w-7 text-center text-xs text-muted-foreground tabular-nums">{row.played}</span>
                      <span className="w-7 text-center text-xs text-muted-foreground tabular-nums hidden sm:block">
                        {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                      </span>
                      <span className="w-8 text-center text-sm font-display font-bold text-accent tabular-nums">{row.points}</span>
                    </motion.div>
                  ))}
            </div>
          </div>

          {/* News Preview */}
          <div className="pl-0 lg:pl-8 pt-12 lg:pt-0">
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-display text-xl uppercase tracking-wider">Actualités</h2>
              <Link to="/news" className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-muted-foreground/50 text-sm text-center py-8">Actualités bientôt disponibles</p>
          </div>
        </div>
      </div>
    </section>
  );
});
StandingsPreview.displayName = 'StandingsPreview';

// ─── Season Stats ──────────────────────────────────────────────────────────────

const SeasonStats = memo(() => (
  <section className="py-12 border-t border-border/30">
    <div className="container">
      <div className="flex items-center gap-3 mb-6">
        <BarChart2 className="h-4 w-4 text-primary" />
        <h2 className="font-display text-xl uppercase tracking-wider">Saison en chiffres</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Clubs" value={16} color="text-accent" delay={0} />
        <SummaryCard label="Journées" value={30} color="text-primary" delay={0.05} />
        <SummaryCard label="Matchs joués" value="—" color="text-win" delay={0.1} />
        <SummaryCard label="Buts marqués" value="—" color="text-live" delay={0.15} />
      </div>
    </div>
  </section>
));
SeasonStats.displayName = 'SeasonStats';

// ─── Quick Nav / Explore ───────────────────────────────────────────────────────

const NAV_CARDS = [
  { to: '/fixtures',  icon: CalendarDays, label: 'Calendrier',   sub: 'Prochains matchs',     color: 'text-primary' },
  { to: '/results',   icon: BarChart2,    label: 'Résultats',    sub: 'Derniers résultats',   color: 'text-win' },
  { to: '/players',  icon: Users,         label: 'Joueurs',      sub: 'Stats & profils',      color: 'text-accent' },
  { to: '/news',     icon: Newspaper,     label: 'Actualités',   sub: 'News & transferts',    color: 'text-muted-foreground' },
  { to: '/clubs',    icon: Star,          label: 'Clubs',        sub: '16 équipes',           color: 'text-draw' },
  { to: '/awards',   icon: Trophy,        label: 'Trophées',     sub: "Ballon d'Or & plus",   color: 'text-accent' },
] as const;

const QuickNavSection = memo(() => (
  <section className="py-12">
    <div className="container">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-xl uppercase tracking-wider">Explorer</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {NAV_CARDS.map(({ to, icon: Icon, label, sub, color }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-surface-elevated/30 hover:border-accent/30 hover:bg-surface-elevated/60 transition-all duration-200 group text-center"
            >
              <div className={`h-8 w-8 rounded-lg bg-white/5 border border-border/50 grid place-items-center group-hover:border-accent/30 transition-colors ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
));
QuickNavSection.displayName = 'QuickNavSection';

// ─── Awards Section (Placeholder linking to awards page) ──────────────────────

const AwardsPreview = memo(() => (
  <section className="py-12 border-t border-border/30">
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-4 w-4 text-accent" />
          <h2 className="font-display text-xl uppercase tracking-wider">Trophées & Distinctions</h2>
        </div>
        <Link to="/awards" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
          Voir tout <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Ballon d'Or Elite One", link: '/awards/ballon-dor', badge: 'Votes ouverts', color: 'text-amber-400' },
          { label: 'Équipe de la Semaine', link: '/awards/team-of-week', badge: 'Journée 18', color: 'text-sky-400' },
          { label: 'Votes en cours', link: '/awards/vote', badge: 'Participez', color: 'text-emerald-400' },
        ].map(({ label, link, badge, color }, i) => (
          <motion.div
            key={link}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              to={link}
              className="group flex flex-col gap-3 p-5 rounded-xl border border-border/50 bg-surface-elevated/20 hover:border-accent/30 hover:bg-surface-elevated/40 transition-all"
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 self-start ${color}`}>{badge}</span>
              <p className="text-sm font-semibold group-hover:text-accent transition-colors">{label}</p>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-accent transition-all group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
));
AwardsPreview.displayName = 'AwardsPreview';

// ─── Section registry: maps section key → component ────────────────────────────
//  Keeps HomePage.tsx DRY — adding new sections = just add an entry here.

const SECTION_MAP: Record<string, React.ComponentType> = {
  hero:       Hero,
  matches:    MatchesSection,
  standings:  StandingsPreview,
  stats:      SeasonStats,
  explore:    QuickNavSection,
  awards:     AwardsPreview,
  halloffame: HallOfFame,
  roadtolions: RoadToLions,
};

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [layout, setLayout] = useState<HomepageLayout>(DEFAULT_LAYOUT);

  useEffect(() => {
    layoutApi.getHomepageLayout()
      .then(setLayout)
      .catch(() => {
        // silently use DEFAULT_LAYOUT on backend error
      });
  }, []);

  const orderedSections = layout.section_order.filter(
    (key) => layout.section_visibility[key] !== false && SECTION_MAP[key]
  );

  return (
    <PageLayout>
      {orderedSections.map((key) => {
        const Section = SECTION_MAP[key];
        return <Section key={key} />;
      })}
    </PageLayout>
  );
}
