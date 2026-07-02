import { useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Sparkles, Vote, ChevronRight,
  Trophy, Users, Shield, ClipboardList, CircleDot,
  Award as AwardIcon, Rocket, Lock, ArrowUpRight,
} from 'lucide-react';
import { useAwards, useTeamOfWeek, useRealtimeVotes } from '@/hooks/useAwards';
import { useVotingStore, useRealtimeStore } from '@/store/awards.store';
import { AwardCard } from '@/components/elite/awards/AwardCard';
import { FormationPitch } from '@/components/elite/awards/FormationPitch';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { AWARD_GROUPS, AWARD_META } from '@/types/awards.types';
import type { AwardGroup, AwardCategory, Award } from '@/types/awards.types';

// ─── Group visual metadata (icon + accent, F1/PL "constructor" style) ─────────
const GROUP_META: Record<AwardGroup, { icon: React.FC<{ className?: string; style?: React.CSSProperties }>; accent: string; ring: string; blurb: string }> = {
  BALLON_DOR: { icon: Trophy,        accent: '#FCD116', ring: 'ring-[#FCD116]/25', blurb: 'La récompense suprême de la saison' },
  PLAYER:     { icon: Users,         accent: '#34D399', ring: 'ring-[#34D399]/25', blurb: 'Du homme du match au joueur de la saison' },
  TEAM:       { icon: Shield,        accent: '#60A5FA', ring: 'ring-[#60A5FA]/25', blurb: "Le onze type de la semaine, du mois et de l'année" },
  GOAL:       { icon: Rocket,        accent: '#FB923C', ring: 'ring-[#FB923C]/25', blurb: 'Les plus beaux gestes techniques de la saison' },
  COACH:      { icon: ClipboardList, accent: '#A78BFA', ring: 'ring-[#A78BFA]/25', blurb: 'Les architectes des performances collectives' },
};

const slug = (id: string) => `group-${id}`;

// ─── Sidebar / rail navigation (F1 standings-style constructor list) ──────────
const CategoryRail = ({
  awardsByCategory, onJump,
}: { awardsByCategory: Record<string, Award[]>; onJump: (id: string) => void }) => {
  return (
    <nav className="hidden lg:block sticky top-24 self-start w-64 shrink-0 space-y-1 pr-2">
      <p className="px-3 text-[10px] font-black uppercase tracking-[.2em] text-stone-500 mb-3">Catégories</p>
      {AWARD_GROUPS.map((group, gi) => {
        const Meta = GROUP_META[group.id];
        const Icon = Meta.icon;
        const openCount = group.categories.reduce((n, c) => n + (awardsByCategory[c]?.some(a => a.votingStatus === 'OPEN') ? 1 : 0), 0);
        return (
          <div key={group.id} className="mb-3">
            <button
              onClick={() => onJump(slug(group.id))}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group text-left"
            >
              <span className="text-[10px] font-mono text-stone-600 w-4 shrink-0">{String(gi + 1).padStart(2, '0')}</span>
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: Meta.accent }} />
              <span className="flex-1 text-xs font-bold text-stone-300 group-hover:text-white transition-colors truncate">{group.label}</span>
              {openCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
              )}
            </button>
            <div className="ml-9 space-y-0.5 mt-0.5">
              {group.categories.map(cat => {
                const meta = AWARD_META[cat];
                const has  = (awardsByCategory[cat]?.length ?? 0) > 0;
                return (
                  <button
                    key={cat}
                    onClick={() => onJump(slug(group.id))}
                    className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left group/item"
                  >
                    <span className="text-[10px] leading-none">{meta.icon}</span>
                    <span className={`text-[10.5px] truncate transition-colors ${has ? 'text-stone-500 group-hover/item:text-stone-300' : 'text-stone-700'}`}>
                      {meta.shortLabel}
                    </span>
                    {!has && <Lock className="h-2 w-2 text-stone-700 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
};

// ─── Mobile chip scroller ──────────────────────────────────────────────────────
const MobileRail = ({ onJump }: { onJump: (id: string) => void }) => (
  <div className="flex lg:hidden gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
    {AWARD_GROUPS.map(group => {
      const Meta = GROUP_META[group.id];
      const Icon = Meta.icon;
      return (
        <button
          key={group.id}
          onClick={() => onJump(slug(group.id))}
          className="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-stone-300"
        >
          <Icon className="h-3.5 w-3.5" style={{ color: Meta.accent }} />
          {group.label}
        </button>
      );
    })}
  </div>
);

// ─── Ballon d'Or CTA banner ───────────────────────────────────────────────────
const BallonDorBanner = () => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden border border-[#FCD116]/25 bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,rgba(252,209,22,0.10)_0%,transparent_65%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/20 to-transparent" />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-[#FCD116] pointer-events-none"
          style={{ left: `${10 + Math.random() * 80}%`, top: `${20 + Math.random() * 60}%` }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -30, -60] }}
          transition={{ duration: 2.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <motion.div
            animate={{ y: [0, -10, 0], filter: ['drop-shadow(0 0 20px rgba(252,209,22,0.4))', 'drop-shadow(0 0 50px rgba(252,209,22,0.7))', 'drop-shadow(0 0 20px rgba(252,209,22,0.4))'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="shrink-0"
          >
            <Trophy className="h-14 w-14 sm:h-16 sm:w-16 text-[#FCD116]" strokeWidth={1} />
          </motion.div>
          <div>
            <p className="text-[10px] font-black text-[#FCD116]/60 uppercase tracking-[.2em] mb-0.5">Récompense suprême</p>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
              Ballon d'Or
              <span className="block text-[#FCD116]">Cameroun 2025</span>
            </h2>
            <p className="text-sm text-white/40 mt-1">Votez pour le meilleur joueur de la saison</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
          <Link to="/awards/ballon-dor"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FCD116] text-black font-black text-sm hover:bg-[#FFE566] transition-colors shadow-[0_0_30px_rgba(252,209,22,0.35)]">
            <Sparkles className="h-4 w-4" /> Voter & Classement
          </Link>
          <Link to="/awards/vote"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
            <Vote className="h-4 w-4" /> Tous les votes
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Live vote ticker ─────────────────────────────────────────────────────────
const LiveTicker = ({ nomineeName }: { nomineeName: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={nomineeName}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="hidden sm:flex items-center gap-2 text-[11px] text-white/40"
    >
      <motion.span
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
      />
      <span className="font-bold text-white/60">{nomineeName}</span>
      <span>vient de voter</span>
    </motion.div>
  </AnimatePresence>
);

// ─── "Coming soon" placeholder tile for categories without live data ─────────
const ComingSoonTile = ({ category }: { category: AwardCategory }) => {
  const meta = AWARD_META[category];
  return (
    <div className="relative rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
      <div className={`h-9 w-9 rounded-xl border flex items-center justify-center text-lg opacity-50 ${meta.bg}`}>{meta.icon}</div>
      <h3 className="text-sm font-bold text-white/40">{meta.label}</h3>
      <p className="text-[10.5px] text-white/20 max-w-[16rem]">Nominés annoncés prochainement pour cette catégorie.</p>
      <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/15 border border-white/10 rounded-full px-2.5 py-1">
        <Lock className="h-2.5 w-2.5" /> Bientôt
      </span>
    </div>
  );
};

// ─── Award group section (with sub-category grid, incl. placeholders) ─────────
const GroupSection = ({
  group, awardsByCategory, votedMap,
}: { group: typeof AWARD_GROUPS[number]; awardsByCategory: Record<string, Award[]>; votedMap: Record<string, string | null> }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const Meta   = GROUP_META[group.id];
  const Icon   = Meta.icon;

  const tiles = group.categories.flatMap(cat => {
    const list = awardsByCategory[cat] ?? [];
    return list.length > 0 ? list : [{ __placeholder: cat } as any];
  });

  return (
    <section ref={ref} id={slug(group.id)} className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3 mb-5"
      >
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ring-1 ${Meta.ring}`} style={{ backgroundColor: `${Meta.accent}18`, borderColor: `${Meta.accent}30` }}>
          <Icon className="h-4 w-4" style={{ color: Meta.accent }} />
        </div>
        <div>
          <h2 className="font-sans text-sm font-black uppercase tracking-widest text-stone-100">{group.label}</h2>
          <p className="text-[10.5px] text-stone-500">{Meta.blurb}</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-2" />
      </motion.div>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {tiles.map((item, i) => (
          <motion.div
            key={item.__placeholder ? `ph-${item.__placeholder}` : item.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {item.__placeholder
              ? <ComingSoonTile category={item.__placeholder} />
              : <AwardCard award={item} votedNomineeId={votedMap[item.id]} index={i} />}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

// ─── Team of week section wrapper ────────────────────────────────────────────
const TeamOfWeekSection = ({ teamOfWeek }: { teamOfWeek: any }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="relative rounded-2xl overflow-hidden border border-[#34D399]/15 bg-[#060606] p-5 mt-4"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(52,211,153,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34D399]/30 to-transparent" />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ filter: ['drop-shadow(0 0 6px rgba(52,211,153,0.3))', 'drop-shadow(0 0 16px rgba(52,211,153,0.6))', 'drop-shadow(0 0 6px rgba(52,211,153,0.3))'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <CircleDot className="h-5 w-5 text-[#34D399]" />
          </motion.span>
          <div>
            <h2 className="font-display text-base font-black text-white/90">Équipe de la semaine</h2>
            <p className="text-[10px] text-white/30">{teamOfWeek.period} · {teamOfWeek.formation}</p>
          </div>
        </div>
        <Link to="/awards/team-of-week"
          className="flex items-center gap-1 text-xs text-[#34D399]/60 hover:text-[#34D399] transition-colors font-bold"
        >
          Voir tout <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="max-w-md mx-auto lg:mx-0">
        <FormationPitch teamOfWeek={teamOfWeek} />
      </div>
    </motion.div>
  );
};

// ─── AwardsPage ───────────────────────────────────────────────────────────────
export default function AwardsPage() {
  const { data: awards, isLoading } = useAwards();
  const { data: teamOfWeek, isLoading: towLoading } = useTeamOfWeek();
  const { connected, totalLiveVotes } = useRealtimeVotes();
  const { votedAwards } = useVotingStore();
  const { liveFeed } = useRealtimeStore();

  const votedMap = useMemo(
    () => Object.fromEntries(Object.entries(votedAwards).map(([id, r]) => [id, r.nomineeId])),
    [votedAwards],
  );

  const awardsByCategory = useMemo(() => {
    const map: Record<string, Award[]> = {};
    for (const a of awards) {
      (map[a.category] ??= []).push(a);
    }
    return map;
  }, [awards]);

  const featured = useMemo(
    () => awards.find(a => a.votingStatus === 'OPEN' && a.type === 'PLAYER' && a.category !== 'BALLON_DOR'),
    [awards],
  );

  const jumpTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const nonBallonDorGroups = AWARD_GROUPS.filter(g => g.id !== 'BALLON_DOR');

  return (
    <div className="min-h-screen bg-black text-stone-100">
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Palmarès & Récompenses"
        subtitle="Homme du match, équipe type, plus beau but, coach du mois… tout le palmarès de la saison"
        accentColor="gold"
      />

      <div className="container py-6 lg:py-10">

        {/* Status row */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <MobileRail onJump={jumpTo} />
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-stone-500">
            <AwardIcon className="h-3.5 w-3.5 text-amber-500" />
            {awards.length} récompenses actives sur {AWARD_GROUPS.reduce((n, g) => n + g.categories.length, 0)} catégories
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {connected && liveFeed.length > 0 && (
              <LiveTicker nomineeName={liveFeed[0]?.nomineeName ?? ''} />
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${connected ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]' : 'bg-white/[0.04] border-border/30 text-white/30'}`}>
              {connected
                ? <><Wifi className="h-3 w-3" /><span className="h-1 w-1 rounded-full bg-[#10B981] animate-pulse" />En direct · {totalLiveVotes.toLocaleString('fr-FR')}</>
                : <><WifiOff className="h-3 w-3" />Hors ligne</>
              }
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          <CategoryRail awardsByCategory={awardsByCategory} onJump={jumpTo} />

          <div className="flex-1 min-w-0 space-y-12">

            {/* Ballon d'Or spotlight */}
            <section id={slug('BALLON_DOR')} className="scroll-mt-24">
              <BallonDorBanner />
            </section>

            {/* Featured award */}
            {featured && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="h-4 w-4 text-accent" />
                  </motion.div>
                  <h2 className="font-display text-base font-black text-white/80">À la une</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent ml-2" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AwardCard award={featured} votedNomineeId={votedMap[featured.id]} variant="featured" />
                </motion.div>
              </section>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="h-64 rounded-2xl bg-white/[0.03] border border-border/25 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {nonBallonDorGroups.map(group => (
                  <div key={group.id}>
                    <GroupSection group={group} awardsByCategory={awardsByCategory} votedMap={votedMap} />
                    {group.id === 'TEAM' && !towLoading && teamOfWeek && (
                      <TeamOfWeekSection teamOfWeek={teamOfWeek} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between flex-wrap gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div>
                <p className="text-sm font-bold text-white/70">Envie de voir tous les votes en un seul endroit ?</p>
                <p className="text-[11px] text-white/30">Consultez le centre de vote complet, catégorie par catégorie.</p>
              </div>
              <Link to="/awards/vote" className="inline-flex items-center gap-1.5 text-sm font-black text-[#FCD116] hover:text-[#FFE566] transition-colors shrink-0">
                Centre de vote <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
