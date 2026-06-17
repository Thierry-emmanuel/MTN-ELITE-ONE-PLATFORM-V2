import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart2, History, Vote, Sparkles } from 'lucide-react';
import { useBallonDor, useVoting } from '@/hooks/useAwards';
import { BallonDorHero, BallonDorRankingList, PastWinnersGallery } from '@/components/elite/awards/BallonDorComponents';
import { VotingPanel } from '@/components/elite/awards/VotingPanel';
import { MOCK_AWARDS } from '@/services/mockAwards';

type Tab = 'ranking' | 'vote' | 'history';

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
  { id: 'ranking', label: 'Classement', icon: BarChart2  },
  { id: 'vote',    label: 'Voter',      icon: Vote       },
  { id: 'history', label: 'Palmarès',   icon: History    },
];

// ─── Cinematic page entrance ──────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const tabContentVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as any } },
  exit:    { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.18 } },
};

export default function BallonDorPage() {
  const { data: edition, isLoading } = useBallonDor();
  const [activeTab, setActiveTab]    = useState<Tab>('ranking');

  const ballonDorAward = MOCK_AWARDS.find(a => a.category === 'BALLON_DOR') ?? MOCK_AWARDS[0];
  const { vote, isVoting, hasVoted, votedNomineeId } = useVoting(ballonDorAward?.id ?? '');

  // ── Loading ──
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
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#060606]"
    >
      {/* Back nav */}
      <div className="container pt-6 pb-2">
        <Link
          to="/awards"
          className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Récompenses
        </Link>
      </div>

      {/* Hero */}
      <div className="container pb-8">
        <BallonDorHero edition={edition} />
      </div>

      {/* Tabs + content */}
      <div className="container pb-16">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl w-fit mb-8 border border-white/[0.06]">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = activeTab === t.id;
            const showDot = t.id === 'vote' && !hasVoted && edition.votingOpen;

            return (
              <motion.button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                aria-pressed={active}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-[#FCD116] text-black shadow-[0_0_20px_rgba(252,209,22,0.30)]'
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

        {/* Tab content with framer AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-2xl"
            >
              <BallonDorRankingList edition={edition} />
            </motion.div>
          )}

          {activeTab === 'vote' && (
            <motion.div
              key="vote"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
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

          {activeTab === 'history' && (
            <motion.div
              key="history"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PastWinnersGallery />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}