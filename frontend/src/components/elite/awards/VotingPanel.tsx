import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { NomineeGalleryCard } from './NomineeGalleryCard';
import { useAwardCountdown } from '@/hooks/useAwards';
import { AWARD_META } from '@/types/awards.types';
import type { Award } from '@/types/awards.types';

// ─── Countdown ────────────────────────────────────────────────────────────────
const VoteCountdown = memo(({ deadline }: { deadline: string }) => {
  const { days, hours, minutes, seconds, expired, urgent } = useAwardCountdown(deadline);
  if (expired) return <p className="text-xs text-white/35 text-center">Votes clôturés</p>;

  return (
    <div className={`flex items-center justify-center gap-3 p-4 rounded-2xl border ${urgent ? 'border-[#CE1126]/30 bg-[#CE1126]/[0.04]' : 'border-white/[0.08] bg-white/[0.02]'}`}>
      {urgent && <AlertCircle className="h-4 w-4 text-[#CE1126] shrink-0 animate-pulse" />}
      <div className="flex items-center gap-3">
        {[
          days > 0 ? { v: days,    l: 'J' }  : null,
          { v: hours,   l: 'H' },
          { v: minutes, l: 'M' },
          { v: seconds, l: 'S' },
        ].filter(Boolean).map((u, i, arr) => (
          <span key={u!.l} className="flex items-center gap-3">
            <span className="flex flex-col items-center">
              <span className={`font-display text-2xl font-black tabular-nums leading-none ${urgent ? 'text-[#CE1126]' : 'text-[#FCD116]'}`}>
                {String(u!.v).padStart(2,'0')}
              </span>
              <span className="text-[9px] text-white/25 uppercase tracking-wider">{u!.l}</span>
            </span>
            {i < arr.length - 1 && <span className={`font-display text-xl ${urgent ? 'text-[#CE1126]/30' : 'text-white/15'}`}>:</span>}
          </span>
        ))}
      </div>
      {urgent && <span className="text-[10px] text-[#CE1126] font-black uppercase tracking-wide">Dernière chance !</span>}
    </div>
  );
});
VoteCountdown.displayName = 'VoteCountdown';

// ─── Success celebration ──────────────────────────────────────────────────────
const VoteSuccess = memo(({ name, onClose }: { name: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      className="text-6xl mb-4"
      style={{ filter: 'drop-shadow(0 0 30px rgba(252,209,22,0.6))' }}
    >
      🏆
    </motion.div>
    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="font-display text-xl font-black text-[#FCD116] mb-1">
      Vote enregistré !
    </motion.p>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
      className="text-sm text-white/50 mb-4 text-center px-6">
      Vous avez voté pour <strong className="text-white">{name}</strong>
    </motion.p>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className="flex items-center gap-1.5 text-[#10B981] text-xs font-bold mb-6">
      <Sparkles className="h-3.5 w-3.5" /> Merci pour votre participation !
    </motion.div>
    <button onClick={onClose} className="text-xs text-white/25 hover:text-white/50 transition-colors">
      Fermer
    </button>
  </motion.div>
));
VoteSuccess.displayName = 'VoteSuccess';

// ─── VotingPanel ─────────────────────────────────────────────────────────────
interface VotingPanelProps {
  award:          Award;
  onVote:         (nomineeId: string) => void;
  isVoting:       boolean;
  hasVoted:       boolean;
  votedNomineeId: string | null;
}

export const VotingPanel = memo(({
  award, onVote, isVoting, hasVoted, votedNomineeId,
}: VotingPanelProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const meta      = AWARD_META[award.category];
  const results   = award.voteResults?.results ?? [];
  const canVote   = award.votingStatus === 'OPEN' && !hasVoted;
  const total     = award.voteResults?.totalVotes ?? 0;
  const showResult = award.votingStatus !== 'UPCOMING';

  const votedNominee = award.nominees.find(n => n.id === votedNomineeId);

  // Sort nominees: voted first, then by vote rank
  const sorted = [...award.nominees].sort((a, b) => {
    if (a.id === votedNomineeId) return -1;
    if (b.id === votedNomineeId) return 1;
    const ra = results.findIndex(r => r.nomineeId === a.id);
    const rb = results.findIndex(r => r.nomineeId === b.id);
    return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
  });

  const handleVote = useCallback((nomineeId: string) => {
    onVote(nomineeId);
    setTimeout(() => { setShowSuccess(true); }, 500);
    setTimeout(() => { setShowSuccess(false); }, 3800);
  }, [onVote]);

  return (
    <div className="relative space-y-6">
      <AnimatePresence>
        {showSuccess && votedNominee && (
          <VoteSuccess name={votedNominee.name} onClose={() => setShowSuccess(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{meta.icon}</span>
            <p className={`text-[10px] font-black uppercase tracking-[.18em] ${meta.color}`}>{meta.shortLabel}</p>
          </div>
          <h2 className="font-display text-2xl font-black text-white leading-tight">{award.title}</h2>
          <p className="text-sm text-white/40 mt-0.5">{award.period}</p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="font-display text-2xl font-black text-white tabular-nums">{total.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-white/30 flex items-center gap-1 justify-end"><Users className="h-3 w-3" />votes</p>
          </div>
        )}
      </div>

      {/* Award description */}
      {award.description && (
        <p className="text-sm text-white/45 leading-relaxed border-l-2 border-white/10 pl-3">
          {award.description}
        </p>
      )}

      {/* Jury / fan split */}
      {award.fanVotingEnabled && award.juryVoteWeight > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex-1 space-y-1">
            <p className="text-[9px] text-white/30 uppercase tracking-wider">Jury professionnel</p>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-[#60A5FA]" style={{ width: `${award.juryVoteWeight}%` }} />
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#60A5FA]/70">{award.juryVoteWeight}%</span>
          <span className="text-white/15">·</span>
          <span className="text-[11px] font-bold text-[#FCD116]">{award.fanVoteWeight}%</span>
          <div className="flex-1 space-y-1">
            <p className="text-[9px] text-white/30 uppercase tracking-wider text-right">Vote des fans</p>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex justify-end">
              <div className="h-full rounded-full bg-[#FCD116]" style={{ width: `${award.fanVoteWeight}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {award.votingStatus === 'OPEN' && award.votingDeadline && (
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Temps restant
          </p>
          <VoteCountdown deadline={award.votingDeadline} />
        </div>
      )}

      {/* Already voted banner */}
      {hasVoted && votedNominee && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-[#FCD116]/10 border border-[#FCD116]/25">
          <CheckCircle2 className="h-5 w-5 text-[#FCD116] shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#FCD116]">Vous avez voté</p>
            <p className="text-[11px] text-white/40">Votre vote : <strong className="text-white">{votedNominee.name}</strong></p>
          </div>
        </motion.div>
      )}

      {/* Nominee gallery grid */}
      <div className={`grid gap-4 ${sorted.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : sorted.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {sorted.map((nominee, i) => (
          <NomineeGalleryCard
            key={nominee.id}
            nominee={nominee}
            result={results.find(r => r.nomineeId === nominee.id)}
            rank={results.findIndex(r => r.nomineeId === nominee.id) + 1 || i + 1}
            isVoted={votedNomineeId === nominee.id}
            canVote={canVote}
            isVoting={isVoting}
            onVote={handleVote}
            index={i}
            showResult={showResult}
          />
        ))}
      </div>

      {award.votingStatus === 'CLOSED' && (
        <p className="text-center text-sm text-white/30 py-3">
          Les votes sont clôturés pour cette récompense.
        </p>
      )}
    </div>
  );
});
VotingPanel.displayName = 'VotingPanel';