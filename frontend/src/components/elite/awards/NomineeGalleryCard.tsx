import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { CheckCircle2, TrendingUp, TrendingDown, Minus, Zap, X, Play, User, Shield, ExternalLink } from 'lucide-react';
import type { Nominee, PlayerNominee, TeamNominee, VoteResult } from '@/types/awards.types';

// ─── Goal Video Modal ─────────────────────────────────────────────────────────
const GoalVideoModal = memo(({ nominee, onClose }: { nominee: PlayerNominee; onClose: () => void }) => {
  const ctx = nominee.goalContext!;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden border border-[#FB923C]/30 bg-[#050505] shadow-[0_0_80px_rgba(251,146,60,0.2)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[#FB923C]/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(251,146,60,0.07)_0%,transparent_60%)] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Video / placeholder */}
        <div className="relative w-full aspect-video bg-black">
          {ctx.videoUrl ? (
            <iframe
              src={ctx.videoUrl}
              title={`But de ${nominee.name}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-16 w-16 rounded-full bg-[#FB923C]/15 border border-[#FB923C]/30 flex items-center justify-center"
              >
                <Play className="h-7 w-7 text-[#FB923C]" fill="currentColor" />
              </motion.div>
              <p className="text-white/30 text-xs">Vidéo disponible prochainement</p>
            </div>
          )}
        </div>

        {/* Context strip */}
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FB923C]/10 border border-[#FB923C]/20 flex items-center justify-center shrink-0 text-base">⚽</div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-black text-white/90 truncate">{nominee.name}</p>
              <p className="text-[10px] text-[#FB923C]/70 mt-0.5">
                vs {ctx.opponent} · {ctx.minute}'
              </p>
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{ctx.description}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
GoalVideoModal.displayName = 'GoalVideoModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const getClubInfo = (nominee: Nominee): string => {
  if ('clubName' in nominee) return (nominee as PlayerNominee).clubName;
  if ('city' in nominee) return (nominee as TeamNominee).city;
  return '';
};

// ─── Form bubble ─────────────────────────────────────────────────────────────
const FormBubble = ({ result }: { result: string }) => {
  const colors: Record<string, string> = {
    W: 'bg-[#10B981] text-white',
    D: 'bg-[#FCD116] text-black',
    L: 'bg-[#CE1126] text-white',
  };
  return (
    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black ${colors[result] ?? 'bg-white/10 text-white/40'}`}>
      {result}
    </span>
  );
};

// ─── Expanded player detail modal ─────────────────────────────────────────────
const NomineeDetailModal = memo(({
  nominee, result, rank, isVoted, canVote, isVoting, onVote, onClose, awardCategory,
}: {
  nominee: Nominee;
  result?: VoteResult;
  rank: number;
  isVoted: boolean;
  canVote: boolean;
  isVoting: boolean;
  onVote: (id: string) => void;
  onClose: () => void;
  awardCategory?: string;
}) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const player = nominee as PlayerNominee;
  const team   = nominee as TeamNominee;
  const isPlayer = nominee.type === 'PLAYER';
  const isTeam   = nominee.type === 'TEAM';
  const isGoalCategory = awardCategory?.startsWith('GOAL_');
  const hasGoalCtx = isGoalCategory && isPlayer && !!player.goalContext;

  const statItems = isPlayer
    ? [
        player.stats.goals    != null && { label: 'Buts',          value: player.stats.goals,    icon: '⚽' },
        player.stats.assists  != null && { label: 'Passes D.',      value: player.stats.assists,  icon: '🎯' },
        player.stats.rating   != null && { label: 'Note moy.',      value: player.stats.rating?.toFixed(1), icon: '⭐' },
        player.stats.cleanSheets != null && { label: 'Clean sheets', value: player.stats.cleanSheets, icon: '🧤' },
        player.stats.saves    != null && { label: 'Arrêts',         value: player.stats.saves,    icon: '🛡️' },
        player.stats.keyPasses != null && { label: 'Passes clés',   value: player.stats.keyPasses, icon: '🔑' },
        player.stats.appearances != null && { label: 'Matchs',      value: player.stats.appearances, icon: '📅' },
      ].filter(Boolean)
    : isTeam
    ? [
        { label: 'Victoires',  value: team.stats.wins,         icon: '✅' },
        { label: 'Nuls',       value: team.stats.draws,        icon: '🤝' },
        { label: 'Défaites',   value: team.stats.losses,       icon: '❌' },
        { label: 'Buts pour',  value: team.stats.goalsFor,     icon: '⚽' },
        { label: 'Buts contre',value: team.stats.goalsAgainst, icon: '🛡️' },
        { label: 'Points',     value: team.stats.points,       icon: '🏆' },
      ]
    : [];

  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden border border-[#FCD116]/25 bg-[#050505] shadow-[0_0_80px_rgba(252,209,22,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Gold top line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#FCD116]/70 to-transparent" />

        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(252,209,22,0.08)_0%,transparent_60%)] pointer-events-none" />

        {/* Particle burst on open */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-[#FCD116]"
              style={{ left: '50%', top: '15%' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 120,
                y: Math.sin((i / 8) * Math.PI * 2) * 80,
                scale: [0, 1, 0],
                opacity: [1, 0.8, 0],
              }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.03, ease: 'easeOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
              className="relative shrink-0"
            >
              <div className={`h-20 w-20 rounded-2xl overflow-hidden border-2 shadow-[0_0_28px_rgba(252,209,22,0.25)] ${isVoted ? 'border-[#FCD116]' : 'border-white/15'}`}>
                {(nominee as PlayerNominee).photoUrl
                  ? <img src={(nominee as PlayerNominee).photoUrl} alt={nominee.name} className="w-full h-full object-cover object-top" />
                  : (nominee as TeamNominee).logoUrl
                  ? <img src={(nominee as TeamNominee).logoUrl} alt={nominee.name} className="w-full h-full object-contain p-1" />
                  : <div className="w-full h-full bg-white/10 flex items-center justify-center font-black text-white text-2xl">
                      {getInitials(nominee.name)}
                    </div>
                }
              </div>
              {isVoted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-[#FCD116] flex items-center justify-center shadow-[0_0_12px_rgba(252,209,22,0.6)]"
                >
                  <CheckCircle2 className="h-4 w-4 text-black" />
                </motion.div>
              )}
              {medal && !isVoted && (
                <div className="absolute -top-2 -right-2 text-lg">{medal}</div>
              )}
            </motion.div>

            {/* Name block */}
            <div className="min-w-0 flex-1">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`font-display text-2xl font-black leading-tight ${isVoted ? 'text-[#FCD116]' : 'text-white'}`}
              >
                {nominee.name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-white/40 mt-0.5"
              >
                {getClubInfo(nominee)}
              </motion.p>
              {isPlayer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-1.5 mt-2"
                >
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-white/50 uppercase tracking-wide">
                    {player.position}
                  </span>
                  {player.nationality && (
                    <span className="text-[10px] text-white/30">{player.nationality}</span>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Highlight stat */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FCD116]/[0.06] border border-[#FCD116]/15 mb-5"
          >
            <span className="text-sm text-white/50">{nominee.highlightStat.label}</span>
            <span className="font-display text-3xl font-black text-[#FCD116] tabular-nums">
              {nominee.highlightStat.value}
            </span>
          </motion.div>

          {/* Stats grid */}
          {statItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-3 gap-2 mb-5"
            >
              {(statItems as { label: string; value: number | string; icon: string }[]).slice(0, 6).map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04, type: 'spring', stiffness: 300 }}
                  className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 text-center"
                >
                  <p className="text-base mb-0.5">{s.icon}</p>
                  <p className="font-display text-lg font-black text-white/90 tabular-nums">{s.value}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-wide leading-tight mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Form */}
          {(nominee as any).form && (nominee as any).form.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 mb-5"
            >
              <span className="text-[10px] text-white/25 uppercase tracking-wider">Forme</span>
              <div className="flex gap-1">
                {(nominee as any).form.map((r: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.42 + i * 0.06, type: 'spring', stiffness: 400 }}
                  >
                    <FormBubble result={r} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Biography / Description */}
          {nominee.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="mb-5 space-y-1.5"
            >
              <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Biographie & Contexte</h4>
              <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl">
                {nominee.description}
              </p>
            </motion.div>
          )}

          {/* ─── Action buttons ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-2 mb-5"
          >
            {/* Goal video button */}
            {hasGoalCtx && (
              <button
                onClick={() => setVideoOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FB923C]/10 border border-[#FB923C]/25 text-[#FB923C] text-[11px] font-bold hover:bg-[#FB923C]/20 transition-colors"
              >
                <Play className="h-3 w-3" fill="currentColor" />
                Voir le but
              </button>
            )}
            {/* Player profile link */}
            {isPlayer && (
              <Link
                to={`/players/${player.clubId}`}
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/50 text-[11px] font-bold hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                <User className="h-3 w-3" />
                Profil joueur
                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
              </Link>
            )}
            {/* Club link */}
            {isPlayer && player.clubId && (
              <Link
                to={`/clubs/${player.clubId}`}
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/50 text-[11px] font-bold hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                <Shield className="h-3 w-3" />
                {player.clubName}
              </Link>
            )}
            {/* Team club link */}
            {isTeam && (
              <Link
                to={`/clubs/${team.id}`}
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/50 text-[11px] font-bold hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                <Shield className="h-3 w-3" />
                Voir le club
                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
              </Link>
            )}
          </motion.div>

          {/* Goal context card — only in goal categories */}
          {hasGoalCtx && player.goalContext && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.37 }}
              className="mb-5 rounded-2xl bg-[#FB923C]/[0.06] border border-[#FB923C]/15 p-4 space-y-1.5"
            >
              <h4 className="text-[10px] font-bold text-[#FB923C]/60 uppercase tracking-wider">Contexte du but</h4>
              <p className="text-[10px] text-[#FB923C]/80 font-bold">
                vs {player.goalContext.opponent} · {player.goalContext.minute}'
              </p>
              <p className="text-xs text-white/55 leading-relaxed">{player.goalContext.description}</p>
            </motion.div>
          )}
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mb-5 space-y-1.5"
            >
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30 flex items-center gap-1">
                  {result.trending === 'UP'   && <TrendingUp   className="h-3 w-3 text-[#10B981]" />}
                  {result.trending === 'DOWN' && <TrendingDown className="h-3 w-3 text-[#CE1126]" />}
                  {result.trending === 'STABLE' && <Minus      className="h-3 w-3 text-white/20" />}
                  {result.votes.toLocaleString('fr-FR')} votes
                </span>
                <span className={`font-bold ${isVoted ? 'text-[#FCD116]' : 'text-white/50'}`}>
                  {result.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isVoted ? 'bg-gradient-to-r from-[#FCD116] to-[#FFE566]' : 'bg-white/25'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.percentage}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Vote CTA */}
          {canVote && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => { onVote(nominee.id); onClose(); }}
              disabled={isVoting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl bg-[#FCD116] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(252,209,22,0.35)] hover:bg-[#FFE566] transition-colors disabled:opacity-60"
            >
              <Zap className="h-4 w-4" />
              Voter pour {nominee.name.split(' ')[0]}
            </motion.button>
          )}
          {isVoted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 py-3 text-[#FCD116] text-sm font-bold"
            >
              <CheckCircle2 className="h-4 w-4" />
              Votre vote est enregistré
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>

    {/* Goal video modal — stacks on top */}
    <AnimatePresence>
      {videoOpen && hasGoalCtx && (
        <GoalVideoModal nominee={player} onClose={() => setVideoOpen(false)} />
      )}
    </AnimatePresence>
  </>);
});
NomineeDetailModal.displayName = 'NomineeDetailModal';

// ─── NomineeGalleryCard ───────────────────────────────────────────────────────
interface NomineeGalleryCardProps {
  nominee:        Nominee;
  result?:        VoteResult;
  rank:           number;
  isVoted:        boolean;
  canVote:        boolean;
  isVoting:       boolean;
  onVote:         (id: string) => void;
  index:          number;
  showResult:     boolean;
  awardCategory?: string;
}

export const NomineeGalleryCard = memo(({
  nominee, result, rank, isVoted, canVote, isVoting, onVote, index, showResult, awardCategory,
}: NomineeGalleryCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(useSpring(my, { stiffness: 350, damping: 35 }), [-0.5, 0.5], [5, -5]);
  const ry = useTransform(useSpring(mx, { stiffness: 350, damping: 35 }), [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const medal    = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const isPlayer = nominee.type === 'PLAYER';
  const photoUrl = (nominee as PlayerNominee).photoUrl ?? (nominee as TeamNominee).logoUrl;
  const clubInfo = getClubInfo(nominee);
  const isGoalCategory = awardCategory?.startsWith('GOAL_');
  const hasGoalCtx = isGoalCategory && isPlayer && !!(nominee as PlayerNominee).goalContext;

  const trendIcon =
    result?.trending === 'UP'   ? <TrendingUp   className="h-3 w-3 text-[#10B981]" /> :
    result?.trending === 'DOWN' ? <TrendingDown className="h-3 w-3 text-[#CE1126]/70" /> :
                                  <Minus        className="h-3 w-3 text-white/20" />;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 900 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        className="group cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <motion.div
          style={{ rotateX: rx, rotateY: ry }}
          className={`relative rounded-3xl border overflow-hidden aspect-[3/4] transition-all duration-300 ${
            isVoted
              ? 'border-[#FCD116]/45 bg-[#0e1520] shadow-[0_0_30px_rgba(252,209,22,0.18)]'
              : rank === 1
              ? 'border-white/15 bg-white/[0.03] hover:border-[#FCD116]/30 hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
              : 'border-border/10 bg-white/[0.02] hover:border-border/30 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* dot-grid texture */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Full-bleed portrait/logo image */}
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={nominee.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-top grayscale-[0.1] group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-white/5 flex items-center justify-center font-black text-white/20 text-4xl">
              {getInitials(nominee.name)}
            </div>
          )}

          {/* Scrims */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* Goal pill on hover */}
          {hasGoalCtx && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FB923C] text-black text-[10px] font-black shadow-[0_0_20px_rgba(251,146,60,0.6)] backdrop-blur-sm">
                <Play className="h-3 w-3" fill="currentColor" /> Voir le but
              </div>
            </div>
          )}

          {/* Top row: position badge + rank/medal */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              {isPlayer && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-white/15 border border-white/20 text-white uppercase tracking-wider backdrop-blur-sm">
                  {(nominee as PlayerNominee).position}
                </span>
              )}
              {isVoted && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#FCD116]/20 border border-[#FCD116]/30 text-[#FCD116] uppercase tracking-wider backdrop-blur-sm">
                  Voté
                </span>
              )}
            </div>

            <div className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              {medal ? (
                <span className="text-xs">{medal}</span>
              ) : (
                <span className="font-display text-[10px] font-bold text-white/50">{rank}</span>
              )}
            </div>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 pt-0 flex flex-col justify-end pointer-events-auto">
            <h3 className="font-display text-base font-black text-white leading-tight truncate [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
              {nominee.name}
            </h3>
            <p className="text-[10px] text-white/50 truncate mt-0.5 mb-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
              {clubInfo}
            </p>

            {/* Highlight stat */}
            <div className="flex items-center justify-between text-[10px] text-white/60 mb-2">
              <span>{nominee.highlightStat.label}</span>
              <span className="font-display font-black text-[#FCD116] text-xs">{nominee.highlightStat.value}</span>
            </div>

            {/* Vote progress / result bar */}
            {showResult && result && (
              <div className="space-y-1 mt-1">
                <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isVoted ? 'bg-[#FCD116]' : 'bg-white/40'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${result.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-white/40 flex items-center gap-1">
                    {trendIcon}
                    {result.votes.toLocaleString('fr-FR')} votes
                  </span>
                  <span className={`font-bold ${isVoted ? 'text-[#FCD116]' : 'text-white/70'}`}>
                    {result.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Vote CTA */}
            {canVote && (
              <motion.button
                onClick={e => {
                  e.stopPropagation();
                  onVote(nominee.id);
                }}
                disabled={isVoting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`mt-2.5 w-full py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all ${
                  isVoted
                    ? 'bg-[#FCD116] text-black'
                    : 'bg-white/10 hover:bg-[#FCD116] hover:text-black border border-white/5 text-white/80'
                }`}
              >
                {isVoted ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Voté
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" /> Voter
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.article>

      {/* Expanded modal */}
      <AnimatePresence>
        {expanded && (
          <NomineeDetailModal
            nominee={nominee}
            result={result}
            rank={rank}
            isVoted={isVoted}
            canVote={canVote}
            isVoting={isVoting}
            onVote={onVote}
            onClose={() => setExpanded(false)}
            awardCategory={awardCategory}
          />
        )}
      </AnimatePresence>
    </>
  );
});
NomineeGalleryCard.displayName = 'NomineeGalleryCard';