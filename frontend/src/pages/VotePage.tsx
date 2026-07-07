import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAwards, useVoting, useRealtimeVotes } from '@/hooks/useAwards';
import { useVotingStore } from '@/store/awards.store';
import { VotingPanel } from '@/components/elite/awards/VotingPanel';
import { AWARD_META } from '@/types/awards.types';
import type { Award } from '@/types/awards.types';

// ─── Voted summary card ───────────────────────────────────────────────────────
const VotedSummaryCard = ({ award, nomineeId }: { award: Award; nomineeId: string }) => {
  const meta     = AWARD_META[award.category];
  const nominee  = award.nominees.find(n => n.id === nomineeId);
  if (!nominee) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/[0.05] border border-accent/20">
      <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground/50 uppercase">{meta.shortLabel}</p>
        <p className="text-sm font-bold text-foreground truncate">{nominee.name}</p>
      </div>
      <span className={`text-lg`}>{meta.icon}</span>
    </div>
  );
};

// ─── Award selector sidebar ───────────────────────────────────────────────────
const AwardSelector = ({
  awards, selectedId, onSelect, votedMap,
}: {
  awards: Award[];
  selectedId: string;
  onSelect: (id: string) => void;
  votedMap: Record<string, string | null>;
}) => (
  <div className="space-y-1.5">
    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Récompenses</p>
    {awards.map(award => {
      const meta    = AWARD_META[award.category];
      const hasVoted = !!votedMap[award.id];
      const active  = award.id === selectedId;

      return (
        <button
          key={award.id}
          onClick={() => onSelect(award.id)}
          aria-pressed={active}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
            active
              ? 'bg-accent/10 border border-accent/25 text-foreground'
              : 'border border-transparent hover:bg-white/[0.04] text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-xl shrink-0">{meta.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{award.title}</p>
            <p className="text-[10px] text-muted-foreground/50 truncate">{award.period}</p>
          </div>
          {hasVoted
            ? <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            : <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          }
        </button>
      );
    })}
  </div>
);

// ─── Inner voting panel with navigation ──────────────────────────────────────
const VoteNavigator = ({
  awards, currentIndex, onPrev, onNext, votedMap,
}: {
  awards: Award[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  votedMap: Record<string, string | null>;
}) => {
  const award = awards[currentIndex];
  const { vote, isVoting, hasVoted, votedNomineeId } = useVoting(award.id);

  return (
    <div className="space-y-5">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-border/40 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" /> Précédent
        </button>

        <div className="flex items-center gap-2">
          {awards.map((a, i) => (
            <div key={a.id} className={`h-1.5 rounded-full transition-all ${
              i === currentIndex
                ? 'w-6 bg-accent'
                : votedMap[a.id]
                ? 'w-2 bg-[#10B981]'
                : 'w-2 bg-white/10'
            }`} />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === awards.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-border/40 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Suivant <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Counter */}
      <p className="text-[11px] text-muted-foreground/40 text-center">
        {currentIndex + 1} / {awards.length}
        {Object.keys(votedMap).length > 0 && (
          <span className="ml-2 text-[#10B981]">
            · {Object.keys(votedMap).length} vote{Object.keys(votedMap).length > 1 ? 's' : ''} enregistré{Object.keys(votedMap).length > 1 ? 's' : ''}
          </span>
        )}
      </p>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={award.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <VotingPanel
            award={award}
            onVote={vote}
            isVoting={isVoting}
            hasVoted={hasVoted}
            votedNomineeId={votedNomineeId}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── VotePage ─────────────────────────────────────────────────────────────────
export default function VotePage() {
  const { data: allAwards } = useAwards();
  const { connected, totalLiveVotes } = useRealtimeVotes();
  const { votedAwards } = useVotingStore();

  const openAwards = useMemo(
    () => allAwards.filter(a => a.votingStatus === 'OPEN' && a.fanVotingEnabled),
    [allAwards],
  );

  const [selectedId,    setSelectedId]    = useState<string>(openAwards[0]?.id ?? '');
  const [currentIndex,  setCurrentIndex]  = useState(0);

  const votedMap = useMemo(
    () => Object.fromEntries(Object.entries(votedAwards).map(([id, r]) => [id, r.nomineeId])),
    [votedAwards],
  );

  const allVoted = openAwards.length > 0 && Object.keys(votedMap).length >= openAwards.length;

  const handleSelect = (id: string) => {
    const idx = openAwards.findIndex(a => a.id === id);
    setSelectedId(id);
    if (idx !== -1) setCurrentIndex(idx);
  };

  if (openAwards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <p className="text-lg font-bold text-foreground/80">Aucun vote ouvert</p>
          <p className="text-sm text-muted-foreground/50">Revenez bientôt pour voter !</p>
          <Link to="/awards" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voir toutes les récompenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/awards" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Récompenses
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link to="/" className="text-muted-foreground hover:text-foreground text-xs transition-colors">
              Accueil
            </Link>
            <div>
              <h1 className="font-display text-sm font-black text-foreground">Espace de vote</h1>
              <p className="text-[10px] text-muted-foreground/50">{openAwards.length} catégories ouvertes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connected && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#10B981]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {totalLiveVotes.toLocaleString('fr-FR')} votes
              </div>
            )}
            {allVoted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tout voté !
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6 lg:py-8">
        {/* All-voted celebration */}
        <AnimatePresence>
          {allVoted && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#FCD116]/10 via-[#10B981]/10 to-[#FCD116]/10 border border-[#FCD116]/20 text-center"
            >
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-display text-lg font-black text-[#FCD116]">Merci pour votre participation !</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Vous avez voté pour toutes les récompenses ouvertes.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 space-y-5">
            <AwardSelector
              awards={openAwards}
              selectedId={selectedId}
              onSelect={handleSelect}
              votedMap={votedMap}
            />

            {/* Voted summary */}
            {Object.keys(votedMap).length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]/70">
                  Vos votes ({Object.keys(votedMap).length})
                </p>
                {Object.entries(votedMap).map(([awardId, nomineeId]) => {
                  const award = openAwards.find(a => a.id === awardId);
                  if (!award || !nomineeId) return null;
                  return <VotedSummaryCard key={awardId} award={award} nomineeId={nomineeId} />;
                })}
              </div>
            )}
          </div>

          {/* Voting panel */}
          <VoteNavigator
            awards={openAwards}
            currentIndex={currentIndex}
            onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex(i => Math.min(openAwards.length - 1, i + 1))}
            votedMap={votedMap}
          />
        </div>
      </div>
    </div>
  );
}