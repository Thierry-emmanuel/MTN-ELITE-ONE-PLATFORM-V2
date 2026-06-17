import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Sparkles, Vote, ChevronRight,
} from 'lucide-react';
import { useAwards, useTeamOfWeek, useRealtimeVotes } from '@/hooks/useAwards';
import { useAwardsStore, useVotingStore, useRealtimeStore } from '@/store/awards.store';
import { AwardCard } from '@/components/elite/awards/AwardCard';
import { FormationPitch } from '@/components/elite/awards/FormationPitch';
import { PageHero } from '@/components/elite/FootballPrimitives';
import type { AwardType, Award } from '@/types/awards.types';

// ─── Type filter ──────────────────────────────────────────────────────────────
const TYPE_TABS: { id: AwardType | 'ALL'; label: string; icon: string }[] = [
  { id: 'ALL',    label: 'Tous',    icon: '🏆' },
  { id: 'PLAYER', label: 'Joueurs', icon: '⚽' },
  { id: 'TEAM',   label: 'Équipes', icon: '🛡️' },
  { id: 'COACH',  label: 'Coachs',  icon: '📋' },
];

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
            className="text-5xl sm:text-6xl shrink-0"
          >
            🏆
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

// ─── Award section with stagger ───────────────────────────────────────────────
const AwardsGrid = ({
  title, icon, awards, votedMap,
}: { title: string; icon: string; awards: Award[]; votedMap: Record<string, string | null> }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  if (awards.length === 0) return null;

  return (
    <section ref={ref}>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-2 mb-4"
      >
        <span className="text-lg">{icon}</span>
        <h2 className="font-display text-base font-black text-white/80">{title}</h2>
        <span className="text-[11px] text-white/25 font-normal ml-1">({awards.length})</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent ml-2" />
      </motion.div>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {awards.map((a) => (
          <motion.div
            key={a.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <AwardCard award={a} votedNomineeId={votedMap[a.id]} />
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
    <section ref={ref} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="relative rounded-2xl overflow-hidden border border-[#34D399]/15 bg-[#060606] p-5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(52,211,153,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34D399]/30 to-transparent" />

        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ filter: ['drop-shadow(0 0 6px rgba(52,211,153,0.3))', 'drop-shadow(0 0 16px rgba(52,211,153,0.6))', 'drop-shadow(0 0 6px rgba(52,211,153,0.3))'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-lg"
            >
              ⚽
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
    </section>
  );
};

// ─── AwardsPage ───────────────────────────────────────────────────────────────
export default function AwardsPage() {
  const { data: awards, filtered, isLoading } = useAwards();
  const { data: teamOfWeek, isLoading: towLoading } = useTeamOfWeek();
  const { connected, totalLiveVotes } = useRealtimeVotes();
  const { activeType, setActiveType } = useAwardsStore();
  const { votedAwards } = useVotingStore();
  const { liveFeed } = useRealtimeStore();

  const votedMap = useMemo(
    () => Object.fromEntries(Object.entries(votedAwards).map(([id, r]) => [id, r.nomineeId])),
    [votedAwards],
  );

  const featured  = useMemo(() => awards.find(a => a.votingStatus === 'OPEN' && a.type === 'PLAYER' && a.category !== 'BALLON_DOR'), [awards]);
  const openRest  = useMemo(() => filtered.filter(a => a.votingStatus === 'OPEN'     && a.id !== featured?.id), [filtered, featured]);
  const announced = useMemo(() => filtered.filter(a => a.votingStatus === 'ANNOUNCED'), [filtered]);
  const closed    = useMemo(() => filtered.filter(a => a.votingStatus !== 'OPEN' && a.votingStatus !== 'ANNOUNCED'), [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="MTN Elite One · Saison 2025–26"
        title="Palmarès & Récompenses"
        subtitle="Votez pour les meilleurs joueurs, équipes et coachs"
        accentColor="gold"
      />

      <div className="container py-6 lg:py-10 space-y-10">

        {/* Controls row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Type filter tabs */}
          <div className="flex gap-1 bg-surface-elevated rounded-xl p-1">
            {TYPE_TABS.map(t => {
              const active = activeType === t.id;
              return (
                <motion.button
                  key={t.id}
                  onClick={() => setActiveType(t.id as any)}
                  aria-pressed={active}
                  whileTap={{ scale: 0.94 }}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wide transition-all ${
                    active ? 'text-black shadow-[0_0_10px_rgba(252,209,22,0.20)]' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-accent rounded-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t.icon}</span>
                  <span className="relative z-10">{t.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
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

        {/* Ballon d'Or banner */}
        <BallonDorBanner />

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
          <div className="space-y-10">
            <AwardsGrid title="Votes ouverts"      icon="🗳️" awards={openRest}  votedMap={votedMap} />
            <AwardsGrid title="Récemment annoncés" icon="🏆" awards={announced}  votedMap={votedMap} />
            <AwardsGrid title="Clôturés"           icon="📋" awards={closed}     votedMap={votedMap} />
          </div>
        )}

        {/* Team of the week */}
        {!towLoading && teamOfWeek && (
          <TeamOfWeekSection teamOfWeek={teamOfWeek} />
        )}

      </div>
    </div>
  );
}