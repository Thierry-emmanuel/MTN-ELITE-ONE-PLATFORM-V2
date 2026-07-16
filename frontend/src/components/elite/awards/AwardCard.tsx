import React, { memo } from 'react';

import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Users, Clock, ChevronRight, CheckCircle2, Sparkles, Trophy, Vote, Eye } from 'lucide-react';
import { AWARD_META } from '@/types/awards.types';
import type { Award, Nominee, PlayerNominee, VoteResult } from '@/types/awards.types';

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Terminé';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}j ${h}h` : `${h}h ${Math.floor((diff % 3600000) / 60000)}min`;
}

// ─── Nominee avatar ───────────────────────────────────────────────────────────
const Avatar = memo(({ nominee, size = 40 }: { nominee: Nominee; size?: number }) => {
  const [err, setErr] = React.useState(false);
  const photo    = (nominee as PlayerNominee).photoUrl;
  const initials = nominee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (photo && !err)
    ? <img src={photo} alt={nominee.name} onError={() => setErr(true)} className="rounded-full object-cover object-top border border-white/10" style={{ width: size, height: size }} loading="lazy" />
    : <div className="rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white/60" style={{ width: size, height: size, fontSize: size * 0.3 }}>{initials}</div>;
});
Avatar.displayName = 'Avatar';

// ─── Animated vote bar ────────────────────────────────────────────────────────
const VoteBar = memo(({ result, isVoted }: { result: VoteResult; isVoted: boolean }) => (
  <div className="mt-1.5 space-y-0.5">
    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${isVoted ? 'bg-[#FCD116]' : 'bg-white/22'}`}
        initial={{ width: 0 }}
        animate={{ width: `${result.percentage}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
    </div>
    <div className="flex justify-between items-center">
      <span className={`text-[9px] font-bold ${isVoted ? 'text-[#FCD116]' : 'text-white/30'}`}>
        {isVoted && <CheckCircle2 className="h-2.5 w-2.5 inline mr-0.5" />}
        {result.percentage.toFixed(1)}%
      </span>
      <span className="text-[9px] text-white/20 tabular-nums">{result.votes.toLocaleString('fr-FR')}</span>
    </div>
  </div>
));
VoteBar.displayName = 'VoteBar';

// ─── Nominee row ──────────────────────────────────────────────────────────────
const NomineeRow = memo(({ nominee, result, rank, isVoted }: {
  nominee: Nominee; result?: VoteResult; rank: number; isVoted: boolean;
}) => {
  const clubName = 'clubName' in nominee ? nominee.clubName : ('city' in nominee ? nominee.city : '');
  const goalCtx  = (nominee as PlayerNominee).goalContext;
  return (
    <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors ${isVoted ? 'bg-[#FCD116]/8' : 'hover:bg-white/[0.03]'}`}>
      <span className="text-sm shrink-0">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
      <Avatar nominee={nominee} size={32} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate leading-tight ${isVoted ? 'text-[#FCD116]' : 'text-white/85'}`}>{nominee.name}</p>
        <p className="text-[9px] text-white/35 truncate">
          {goalCtx ? `vs ${goalCtx.opponent} · ${goalCtx.minute}'` : clubName}
        </p>
        {result && <VoteBar result={result} isVoted={isVoted} />}
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-display text-sm tabular-nums font-bold ${isVoted ? 'text-[#FCD116]' : 'text-white/75'}`}>{nominee.highlightStat.value}</p>
        <p className="text-[9px] text-white/25 uppercase">{nominee.highlightStat.label}</p>
      </div>
    </div>
  );
});
NomineeRow.displayName = 'NomineeRow';

// ─── AwardCard ────────────────────────────────────────────────────────────────
interface AwardCardProps {
  award: Award;
  votedNomineeId?: string | null;
  index?: number;
  variant?: 'default' | 'compact' | 'featured';
}

const DEFAULT_META = { label: 'Récompense', shortLabel: 'Prix', icon: '🏅', type: 'PLAYER' as const, color: 'text-white/50', bg: 'bg-white/[0.06] border-white/10' };
const getMeta = (category: string) => (AWARD_META as Record<string, typeof DEFAULT_META>)[category] ?? DEFAULT_META;

export const AwardCard = memo(({ award, votedNomineeId, index = 0, variant = 'default' }: AwardCardProps) => {
  const meta    = getMeta(award.category);
  const isOpen  = award.votingStatus === 'OPEN';
  const results = award.voteResults?.results ?? [];

  // 3D tilt for default and featured
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(useSpring(my, { stiffness: 400, damping: 40 }), [-0.5, 0.5], [4, -4]);
  const ry = useTransform(useSpring(mx, { stiffness: 400, damping: 40 }), [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  };

  // Compact
  if (variant === 'compact') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.04 }}>
        <Link to={`/awards/${award.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all group">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${meta.bg}`}>{meta.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white/85 truncate group-hover:text-white transition-colors">{award.title}</p>
            <p className="text-[10px] text-white/35">{award.period}</p>
          </div>
          {isOpen && <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />}
          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
        </Link>
      </motion.div>
    );
  }

  // Featured
  if (variant === 'featured') {
    const top = award.nominees[0] as PlayerNominee | undefined;
    return (
      <motion.article
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        className="group"
      >
        <motion.div
          style={{ rotateX: rx, rotateY: ry }}
          className="relative rounded-3xl overflow-hidden border border-[#FCD116]/22 bg-gradient-to-br from-[#FCD116]/[0.09] via-black to-black hover:border-[#FCD116]/45 transition-colors duration-500"
        >
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(252,209,22,0.10)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/50 to-transparent" />

          {/* Corner ornaments — plaque framing */}
          <div className="absolute top-3 left-3 h-4 w-4 border-t border-l border-[#FCD116]/40 pointer-events-none" />
          <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[#FCD116]/40 pointer-events-none" />

          {/* Live badge */}
          {isOpen && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[10px] font-black uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Vote ouvert
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Category */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">{meta.icon}</span>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[.18em] ${meta.color}`}>{meta.shortLabel}</p>
                <h3 className="font-serif italic text-xl font-medium text-white">{award.title}</h3>
              </div>
            </div>

            {/* Top nominee spotlight */}
            {top && (
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="relative shrink-0">
                  <Avatar nominee={top} size={56} />
                  <div className="absolute -top-1 -right-1 text-base" style={{ filter: 'drop-shadow(0 0 6px rgba(252,209,22,0.5))' }}>👑</div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#FCD116]/55 uppercase tracking-wider font-bold">Favori</p>
                  <p className="font-serif italic text-lg font-semibold text-white truncate">{top.name}</p>
                  <p className="text-xs text-white/40">
                    {top.goalContext ? `vs ${top.goalContext.opponent} · ${top.goalContext.minute}'` : top.clubName}
                  </p>
                </div>
                <div className="ml-auto shrink-0 text-right">
                  <p className="font-display text-2xl font-black text-[#FCD116] tabular-nums">{top.highlightStat.value}</p>
                  <p className="text-[9px] text-white/30 uppercase">{top.highlightStat.label}</p>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-[11px] text-white/30 mb-5">
              {award.voteResults && (
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{award.voteResults.totalVotes.toLocaleString('fr-FR')} votes</span>
              )}
              {isOpen && award.votingDeadline && (
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{timeUntil(award.votingDeadline)}</span>
              )}
            </div>

            <Link to={`/awards/${award.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#FCD116] text-black text-sm font-black hover:bg-[#FFE566] transition-colors shadow-[0_0_24px_rgba(252,209,22,0.28)]">
              <Sparkles className="h-4 w-4" />
              {isOpen ? 'Voter maintenant' : 'Voir les résultats'}
            </Link>
          </div>
        </motion.div>
      </motion.article>
    );
  }

  // Default
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="group"
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] ${
          award.trophyColor === 'GOLD'
            ? 'border-[#FCD116]/22 bg-gradient-to-b from-[#FCD116]/[0.05] to-transparent hover:border-[#FCD116]/40'
            : 'border-border/30 bg-white/[0.02] hover:border-border/60'
        }`}
      >
        {/* Accent bar */}
        <div className={`h-px bg-gradient-to-r from-transparent ${award.trophyColor === 'GOLD' ? 'via-[#FCD116]/50' : 'via-white/15'} to-transparent`} />

        <div className="relative p-4">
          {award.trophyColor === 'GOLD' && (
            <>
              <div className="absolute top-2.5 left-2.5 h-3 w-3 border-t border-l border-[#FCD116]/35 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 h-3 w-3 border-t border-r border-[#FCD116]/35 pointer-events-none" />
            </>
          )}
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center text-lg ${meta.bg}`}>{meta.icon}</div>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-[.16em] ${meta.color}`}>{award.period}</p>
                <h3 className="font-serif italic text-sm font-semibold text-white/90">{award.title}</h3>
              </div>
            </div>
            {isOpen
              ? <span className="flex items-center gap-1 text-[9px] text-[#10B981] font-black shrink-0"><span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />LIVE</span>
              : award.votingStatus === 'ANNOUNCED'
              ? <span className="flex items-center gap-1 text-[9px] text-[#FCD116] font-bold shrink-0 border border-[#FCD116]/25 rounded-full px-1.5 py-0.5 bg-[#FCD116]/[0.06]">
                  <Trophy className="h-2.5 w-2.5" /> ANNONCÉ
                </span>
              : null}
          </div>

          {/* Nominees */}
          <div className="space-y-0.5 mb-3">
            {award.nominees.slice(0, 3).map((n, i) => (
              <NomineeRow key={n.id} nominee={n} result={results.find(r => r.nomineeId === n.id)} rank={i + 1} isVoted={votedNomineeId === n.id} />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] text-white/25 mb-3">
            {award.voteResults && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{award.voteResults.totalVotes.toLocaleString('fr-FR')}</span>}
            {isOpen && award.votingDeadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeUntil(award.votingDeadline)}</span>}
          </div>

          <Link to={`/awards/${award.id}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-bold text-white/50 hover:bg-white/[0.09] hover:text-white hover:border-[#FCD116]/30 transition-all group-hover:border-white/15">
            {isOpen
              ? <><Vote className="h-3.5 w-3.5" /> Voter</>
              : <><Eye  className="h-3.5 w-3.5" /> Résultats</>}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </motion.article>
  );
});
AwardCard.displayName = 'AwardCard';