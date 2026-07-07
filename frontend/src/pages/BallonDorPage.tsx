import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BarChart2, History, Vote, Sparkles,
  Crown, Star, Trophy, Calendar, Users,
} from 'lucide-react';
import { useBallonDor, useVoting } from '@/hooks/useAwards';
import {
  BallonDorHero,
  BallonDorRankingList,
  PastWinnersGallery,
} from '@/components/elite/awards/BallonDorComponents';
import { VotingPanel } from '@/components/elite/awards/VotingPanel';
import { MOCK_AWARDS, MOCK_HISTORICAL } from '@/services/mockAwards';
import type { HistoricalWinner } from '@/types/awards.types';
import trophyImageSrc from '@/assets/images/trophies/ballon-dor-cameroun.png';

type Tab = 'ranking' | 'vote' | 'history' | 'halloffame';

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
  { id: 'ranking',   label: 'Classement', icon: BarChart2 },
  { id: 'vote',      label: 'Voter',      icon: Vote      },
  { id: 'history',   label: 'Palmarès',   icon: History   },
  { id: 'halloffame',label: 'Hall of Fame',icon: Crown     },
];

const tabContentVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as any } },
  exit:    { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.18 } },
};

// ─── Hall of Fame winner card ─────────────────────────────────────────────────
const HofCard = memo(({ winner, rank }: { winner: HistoricalWinner; rank: number }) => {
  const w = winner.winner as any;
  const photoUrl = w.photoUrl as string | undefined;
  const isFirst = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: rank * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative group rounded-2xl overflow-hidden border transition-all duration-300 ${
        isFirst
          ? 'border-[#FCD116]/40 bg-gradient-to-b from-[#FCD116]/[0.08] to-black/40'
          : 'border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/20'
      }`}
      style={isFirst ? { boxShadow: '0 0 40px rgba(252,209,22,0.12)' } : {}}
    >
      {/* Shimmer line top */}
      {isFirst && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FCD116] to-transparent" />
      )}

      {/* Year badge */}
      <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        isFirst ? 'bg-[#FCD116] text-black' : 'bg-white/[0.08] text-white/50 border border-white/10'
      }`}>
        {isFirst && <Crown className="h-2.5 w-2.5" />}
        {winner.year}
      </div>

      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={w.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-white/[0.06] to-black/40 flex items-center justify-center">
            <span className="font-display text-5xl font-black text-white/10">
              {w.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Trophy emoji */}
        <motion.div
          animate={isFirst ? {
            filter: ['drop-shadow(0 0 8px rgba(252,209,22,0.4))', 'drop-shadow(0 0 20px rgba(252,209,22,0.75))', 'drop-shadow(0 0 8px rgba(252,209,22,0.4))'],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-3 right-3 text-2xl"
        >
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h4 className={`font-display font-black leading-tight ${isFirst ? 'text-base text-white' : 'text-sm text-white/80'}`}>
          {w.name}
        </h4>
        {w.clubName && (
          <p className="text-[11px] text-white/35 font-medium">
            {w.clubName}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div>
            <p className={`font-display font-black tabular-nums ${isFirst ? 'text-xl text-[#FCD116]' : 'text-base text-white/60'}`}>
              {w.highlightStat?.value ?? '—'}
            </p>
            <p className="text-[9px] text-white/25 uppercase tracking-wide">
              {w.highlightStat?.label ?? ''}
            </p>
          </div>
          {/* Stars */}
          <div className="flex gap-0.5">
            {[...Array(isFirst ? 5 : 3)].map((_, i) => (
              <Star key={i} className={`h-2.5 w-2.5 ${isFirst ? 'text-[#FCD116]' : 'text-white/20'}`} fill="currentColor" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
HofCard.displayName = 'HofCard';

// ─── Hall of Fame view ────────────────────────────────────────────────────────
const HallOfFameTab = memo(() => {
  const winners = MOCK_HISTORICAL;

  return (
    <div className="space-y-10">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl border border-[#FCD116]/20 bg-black/60 overflow-hidden p-8 sm:p-10 text-center"
      >
        {/* Background radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(252,209,22,0.07),transparent_65%)] pointer-events-none" />

        {/* Shimmer top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FCD116]/60 to-transparent" />

        {/* Trophy row */}
        <div className="flex justify-center items-end gap-2 mb-6">
          {['🥈', '🏆', '🥉'].map((e, i) => (
            <motion.span
              key={i}
              animate={{ y: i === 1 ? [0, -8, 0] : 0 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 * i }}
              className={i === 1 ? 'text-5xl' : 'text-3xl opacity-60'}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-2">
          Hall of Fame
        </h2>
        <p className="text-sm text-white/40 max-w-md mx-auto">
          Les légendes qui ont marqué l'histoire du Ballon d'Or Cameroun.
          Chaque trophée est une page d'histoire du football national.
        </p>

        {/* Stats strip */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-white/[0.06]">
          {[
            { icon: Trophy,   label: 'Éditions',  value: winners.length },
            { icon: Users,    label: 'Lauréats',  value: new Set(winners.map(w => (w.winner as any).name)).size },
            { icon: Calendar, label: 'Années',    value: winners.length > 0 ? `${winners[winners.length - 1].year}–${winners[0].year}` : '—' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="flex justify-center mb-1">
                <s.icon className="h-4 w-4 text-[#FCD116]/50" />
              </div>
              <p className="font-display text-xl font-black text-[#FCD116] tabular-nums">{s.value}</p>
              <p className="text-[9px] text-white/25 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Winner grid */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-[#FCD116]/30 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FCD116]/50">
            Palmarès complet
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-[#FCD116]/30 to-transparent" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {winners.map((winner, i) => (
            <HofCard key={winner.year} winner={winner} rank={i} />
          ))}
        </div>
      </div>

      {/* Honoured legacy footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center pt-4 pb-2"
      >
        <p className="text-[11px] text-white/20 uppercase tracking-widest font-mono">
          MTN Elite One · Ballon d'Or Cameroun · Depuis {winners[winners.length - 1]?.year ?? '2019'}
        </p>
      </motion.div>
    </div>
  );
});
HallOfFameTab.displayName = 'HallOfFameTab';

// ─── BallonDorPage ────────────────────────────────────────────────────────────
export default function BallonDorPage() {
  const { data: edition, isLoading } = useBallonDor();
  const [activeTab, setActiveTab] = useState<Tab>('ranking');

  const ballonDorAward = MOCK_AWARDS.find(a => a.category === 'BALLON_DOR') ?? MOCK_AWARDS[0];
  const { vote, isVoting, hasVoted, votedNomineeId } = useVoting(ballonDorAward?.id ?? '');

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading || !edition) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-5">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              filter: [
                'drop-shadow(0 0 20px rgba(252,209,22,0.3))',
                'drop-shadow(0 0 50px rgba(252,209,22,0.7))',
                'drop-shadow(0 0 20px rgba(252,209,22,0.3))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl"
          >
            🏆
          </motion.div>
          <motion.p
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-[#FCD116]/50 text-sm uppercase tracking-[.2em]"
          >
            Chargement…
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#060606]"
    >
      {/* Back nav */}
      <div className="container pt-6 pb-2 flex gap-4 text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Accueil
        </Link>
        <Link
          to="/awards"
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          Récompenses
        </Link>
      </div>

      {/* Hero */}
      <div className="container pb-8">
        <BallonDorHero edition={edition} trophyImageSrc={trophyImageSrc} />
      </div>

      {/* Tabs + content */}
      <div className="container pb-20">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl w-fit mb-8 border border-white/[0.06] overflow-x-auto scrollbar-hide">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = activeTab === t.id;
            const showDot = t.id === 'vote' && !hasVoted && edition.votingOpen;
            const isHof  = t.id === 'halloffame';

            return (
              <motion.button
                key={t.id}
                id={`ballon-tab-${t.id}`}
                onClick={() => setActiveTab(t.id)}
                aria-pressed={active}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 ${
                  active
                    ? isHof
                      ? 'bg-gradient-to-r from-[#FCD116] to-[#F59E0B] text-black shadow-[0_0_24px_rgba(252,209,22,0.35)]'
                      : 'bg-[#FCD116] text-black shadow-[0_0_20px_rgba(252,209,22,0.30)]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
                {showDot && (
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#CE1126] border-2 border-[#060606]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* ── Ranking ──────────────────────────────────────────────────────── */}
          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              variants={tabContentVariants}
              initial="initial" animate="animate" exit="exit"
              className="max-w-2xl"
            >
              <BallonDorRankingList edition={edition} />
            </motion.div>
          )}

          {/* ── Vote ─────────────────────────────────────────────────────────── */}
          {activeTab === 'vote' && (
            <motion.div
              key="vote"
              variants={tabContentVariants}
              initial="initial" animate="animate" exit="exit"
              className="max-w-2xl"
            >
              {edition.votingOpen && ballonDorAward ? (
                <VotingPanel
                  award={{
                    ...ballonDorAward,
                    nominees: edition.ranking.slice(0, 5).map(r => r.nominee as any),
                  }}
                  onVote={vote}
                  isVoting={isVoting}
                  hasVoted={hasVoted}
                  votedNomineeId={votedNomineeId}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 space-y-5"
                >
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="text-5xl"
                  >
                    🔒
                  </motion.div>
                  <p className="font-display text-lg font-bold text-white/60">
                    Votes clôturés pour le Ballon d'Or {edition.year}
                  </p>
                  <button
                    onClick={() => setActiveTab('ranking')}
                    className="inline-flex items-center gap-2 text-[#FCD116]/60 text-sm hover:text-[#FCD116] transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Voir le classement final
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Palmarès (carousel) ───────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              variants={tabContentVariants}
              initial="initial" animate="animate" exit="exit"
              className="max-w-2xl"
            >
              <PastWinnersGallery />
            </motion.div>
          )}

          {/* ── Hall of Fame (full grid) ──────────────────────────────────────── */}
          {activeTab === 'halloffame' && (
            <motion.div
              key="halloffame"
              variants={tabContentVariants}
              initial="initial" animate="animate" exit="exit"
            >
              <HallOfFameTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}