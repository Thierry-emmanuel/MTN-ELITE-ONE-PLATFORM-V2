import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, BarChart2, History, Vote } from 'lucide-react';
import { useBallonDor, useVoting } from '@/hooks/useAwards';
import { BallonDorHero, BallonDorRankingList, PastWinnersGallery } from '@/components/elite/awards/BallonDorComponents';
import { VotingPanel } from '@/components/elite/awards/VotingPanel';
import { MOCK_AWARDS } from '@/services/mockAwards';

type Tab = 'ranking' | 'vote' | 'history';

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'ranking', label: 'Classement', icon: BarChart2 },
  { id: 'vote',    label: 'Voter',      icon: Vote      },
  { id: 'history', label: 'Palmarès',   icon: History   },
];

export default function BallonDorPage() {
  const { data: edition, isLoading } = useBallonDor();
  const [activeTab, setActiveTab]    = useState<Tab>('ranking');

  const ballonDorAward = MOCK_AWARDS.find(a => a.category === 'BALLON_DOR') ?? MOCK_AWARDS[0];
  const { vote, isVoting, hasVoted, votedNomineeId } = useVoting(ballonDorAward?.id ?? '');

  if (isLoading || !edition) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-5">
          <motion.div
            animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0 0 20px rgba(252,209,22,0.3))', 'drop-shadow(0 0 50px rgba(252,209,22,0.7))', 'drop-shadow(0 0 20px rgba(252,209,22,0.3))'] }}
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
    <div className="min-h-screen bg-[#060606]">

      {/* Back nav */}
      <div className="container pt-6 pb-2">
        <Link to="/awards"
          className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Récompenses
        </Link>
      </div>

      {/* Hero */}
      <div className="container pb-8">
        <BallonDorHero edition={edition} />
      </div>

      {/* Tabs */}
      <div className="container pb-16">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl w-fit mb-8 border border-white/[0.06]">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = activeTab === t.id;
            const showDot = t.id === 'vote' && !hasVoted && edition.votingOpen;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                aria-pressed={active}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-[#FCD116] text-black shadow-[0_0_20px_rgba(252,209,22,0.30)]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
                {showDot && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#CE1126] border-2 border-[#060606]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl"
            >
              <BallonDorRankingList edition={edition} />
            </motion.div>
          )}

          {activeTab === 'vote' && (
            <motion.div
              key="vote"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
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
                <div className="text-center py-20 space-y-4">
                  <div className="text-5xl">🔒</div>
                  <p className="font-display text-lg font-bold text-white/60">
                    Votes clôturés pour le Ballon d'Or {edition.year}
                  </p>
                  <button onClick={() => setActiveTab('ranking')}
                    className="text-[#FCD116]/60 text-sm hover:text-[#FCD116] transition-colors">
                    → Voir le classement final
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <PastWinnersGallery />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}