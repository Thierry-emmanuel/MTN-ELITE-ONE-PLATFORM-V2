import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Trophy, Users, Shield,
  Zap, ClipboardList, Rocket, Wifi, WifiOff,
  ChevronRight, Star, Lock, Search,
} from 'lucide-react';
import { useAwards, useVoting, useRealtimeVotes } from '@/hooks/useAwards';
import { useVotingStore } from '@/store/awards.store';
import { VotingPanel } from '@/components/elite/awards/VotingPanel';
import { AWARD_META, AWARD_GROUPS } from '@/types/awards.types';
import type { Award, AwardGroup } from '@/types/awards.types';

// ─── Group metadata (icon + accent) ──────────────────────────────────────────
const GROUP_META: Record<AwardGroup, {
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
  label: string;
}> = {
  BALLON_DOR: { icon: Trophy,        accent: '#FCD116', label: "Ballon d'Or" },
  PLAYER:     { icon: Users,         accent: '#34D399', label: 'Joueurs'    },
  TEAM:       { icon: Shield,        accent: '#60A5FA', label: 'Équipes'    },
  GOAL:       { icon: Rocket,        accent: '#FB923C', label: 'Buts'       },
  COACH:      { icon: ClipboardList, accent: '#A78BFA', label: 'Coaches'    },
};

// ALL_GROUP deleted to avoid unused variable warning

// Fallback so unknown backend categories never crash the page
const DEFAULT_META = { label: 'Récompense', shortLabel: 'Prix', icon: '🏅', type: 'PLAYER' as const, color: 'text-white/50', bg: 'bg-white/[0.06] border-white/10' };
const getMeta = (category: string) => (AWARD_META as Record<string, typeof DEFAULT_META>)[category] ?? DEFAULT_META;

// ─── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Award['votingStatus'] }) => {
  if (status === 'OPEN') return (
    <span className="flex items-center gap-1 text-[9px] font-black text-[#10B981] uppercase tracking-wider">
      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />LIVE
    </span>
  );
  if (status === 'ANNOUNCED') return (
    <span className="flex items-center gap-1 text-[9px] font-bold text-[#FCD116] border border-[#FCD116]/25 rounded-full px-1.5 py-0.5 bg-[#FCD116]/[0.06]">
      <Trophy className="h-2.5 w-2.5" /> Annoncé
    </span>
  );
  if (status === 'CLOSED') return (
    <span className="text-[9px] text-white/25 uppercase tracking-wider">Clôturé</span>
  );
  return <span className="flex items-center gap-1 text-[9px] text-white/20"><Lock className="h-2.5 w-2.5" /> Bientôt</span>;
};

// ─── Award row in sidebar ──────────────────────────────────────────────────────
const AwardSidebarItem = ({
  award, isSelected, hasVoted, onClick,
}: {
  award: Award; isSelected: boolean; hasVoted: boolean; onClick: () => void;
}) => {
  const meta = getMeta(award.category);
  return (
    <button
      onClick={onClick}
      aria-pressed={isSelected}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
        isSelected
          ? 'bg-white/[0.08] border border-white/15 text-white'
          : 'border border-transparent hover:bg-white/[0.04] text-white/50 hover:text-white/80'
      }`}
    >
      <span className="text-base shrink-0">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate">{award.title}</p>
        <p className="text-[9px] text-white/30 truncate">{award.period}</p>
      </div>
      {hasVoted
        ? <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
        : award.votingStatus === 'OPEN'
        ? <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
        : award.votingStatus === 'ANNOUNCED'
        ? <Star className="h-3 w-3 text-[#FCD116]/50 shrink-0" />
        : null
      }
    </button>
  );
};

// ─── Group filter chip ─────────────────────────────────────────────────────────
const GroupChip = ({
  label, icon: Icon, accent, isActive, count, onClick,
}: {
  groupId: string; label: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  accent: string; isActive: boolean; count: number; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
      isActive
        ? 'text-white border-transparent'
        : 'bg-transparent border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
    }`}
    style={isActive ? { backgroundColor: `${accent}25`, borderColor: `${accent}40`, color: accent } : {}}
  >
    <Icon className="h-3.5 w-3.5" style={{ color: isActive ? accent : undefined }} />
    {label}
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
      {count}
    </span>
  </button>
);

// ─── Winner showcase for ANNOUNCED awards ────────────────────────────────────
const WinnerShowcase = ({ award }: { award: Award }) => {
  const winner = award.winner ?? award.nominees[0];
  if (!winner) return null;
  const meta = getMeta(award.category);
  const photoUrl = 'photoUrl' in winner ? (winner as any).photoUrl : ('logoUrl' in winner ? (winner as any).logoUrl : null);
  const subtitle = 'clubName' in winner ? (winner as any).clubName : ('city' in winner ? (winner as any).city : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden border border-[#FCD116]/20 bg-gradient-to-br from-[#FCD116]/[0.06] to-black"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/60 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(252,209,22,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 p-6 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-[#FCD116]/40 shadow-[0_0_24px_rgba(252,209,22,0.2)]">
            {photoUrl
              ? <img src={photoUrl} alt={winner.name} className="w-full h-full object-cover object-top" />
              : <div className="w-full h-full bg-white/10 flex items-center justify-center font-black text-white/40 text-2xl">
                  {winner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
            }
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#FCD116] flex items-center justify-center shadow-[0_0_14px_rgba(252,209,22,0.5)]"
          >
            <Trophy className="h-4 w-4 text-black" />
          </motion.div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{meta.icon}</span>
            <p className={`text-[10px] font-black uppercase tracking-wider ${meta.color}`}>{meta.shortLabel}</p>
          </div>
          <h3 className="font-display text-xl font-black text-[#FCD116] leading-tight">{winner.name}</h3>
          <p className="text-sm text-white/45 mt-0.5">{subtitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FCD116]/15 border border-[#FCD116]/30 text-[#FCD116] uppercase tracking-wide">
              Lauréat · {award.period}
            </span>
            <span className="font-display text-lg font-black text-white/80 tabular-nums">
              {winner.highlightStat.value}
            </span>
            <span className="text-[9px] text-white/30 uppercase">{winner.highlightStat.label}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {winner.description && (
        <div className="relative z-10 px-6 pb-5">
          <p className="text-xs text-white/50 leading-relaxed border-l-2 border-[#FCD116]/20 pl-3">
            {winner.description}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Inner panel with voting or winner showcase ───────────────────────────────
const AwardContentPanel = ({
  award,
}: {
  award: Award;
}) => {
  const { vote, isVoting, hasVoted, votedNomineeId } = useVoting(award.id);

  if (award.votingStatus === 'ANNOUNCED') {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getMeta(award.category).icon}</span>
            <p className={`text-[10px] font-black uppercase tracking-[.18em] ${getMeta(award.category).color}`}>
              {getMeta(award.category).shortLabel}
            </p>
            <StatusBadge status={award.votingStatus} />
          </div>
          <h2 className="font-display text-2xl font-black text-white">{award.title}</h2>
          <p className="text-sm text-white/40 mt-0.5">{award.period}</p>
        </div>

        {award.description && (
          <p className="text-sm text-white/45 leading-relaxed border-l-2 border-white/10 pl-3">
            {award.description}
          </p>
        )}

        <WinnerShowcase award={award} />

        {/* All nominees with results */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-white/30 mb-3">Tous les nominés</p>
          <VotingPanel
            award={award}
            onVote={vote}
            isVoting={isVoting}
            hasVoted={hasVoted}
            votedNomineeId={votedNomineeId}
          />
        </div>
      </div>
    );
  }

  return (
    <VotingPanel
      award={award}
      onVote={vote}
      isVoting={isVoting}
      hasVoted={hasVoted}
      votedNomineeId={votedNomineeId}
    />
  );
};

// ─── VotePage ─────────────────────────────────────────────────────────────────
export default function VotePage() {
  const { data: allAwards } = useAwards();
  const { connected, totalLiveVotes } = useRealtimeVotes();
  const { votedAwards } = useVotingStore();

  const [activeGroup, setActiveGroup] = useState<AwardGroup | 'ALL'>('ALL');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedId,   setSelectedId]   = useState<string>('');

  const votedMap = useMemo(
    () => Object.fromEntries(Object.entries(votedAwards).map(([id, r]) => [id, r.nomineeId])),
    [votedAwards],
  );

  // Filter awards by group tab + search
  const filteredAwards = useMemo(() => {
    let list = allAwards;
    if (activeGroup !== 'ALL') {
      const group = AWARD_GROUPS.find(g => g.id === activeGroup);
      if (group) list = list.filter(a => group.categories.includes(a.category));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.period.toLowerCase().includes(q) ||
        a.nominees.some(n => n.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allAwards, activeGroup, searchQuery]);

  // Selected award — prefer explicit selection, else first in filtered list
  const selectedAward = useMemo(
    () => filteredAwards.find(a => a.id === selectedId) ?? filteredAwards[0] ?? null,
    [filteredAwards, selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Stats per group for chips
  const groupCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: allAwards.length };
    for (const g of AWARD_GROUPS) {
      map[g.id] = allAwards.filter(a => g.categories.includes(a.category)).length;
    }
    return map;
  }, [allAwards]);

  const openCount = allAwards.filter(a => a.votingStatus === 'OPEN').length;
  const votedCount = Object.keys(votedMap).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3">
            <Link to="/awards" className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div>
              <h1 className="font-display text-sm font-black text-white">Centre de Vote</h1>
              <p className="text-[10px] text-white/30">{openCount} vote{openCount !== 1 ? 's' : ''} ouvert{openCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {votedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[11px] font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {votedCount} voté{votedCount > 1 ? 's' : ''}
              </div>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${
              connected
                ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]'
                : 'bg-white/[0.04] border-white/10 text-white/30'
            }`}>
              {connected
                ? <><Wifi className="h-3 w-3" /><span className="h-1 w-1 rounded-full bg-[#10B981] animate-pulse" />{totalLiveVotes.toLocaleString('fr-FR')}</>
                : <><WifiOff className="h-3 w-3" />Hors ligne</>
              }
            </div>
          </div>
        </div>

        {/* Group chips */}
        <div className="container pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            <GroupChip
              groupId="ALL" label="Tout" icon={Zap} accent="#ffffff"
              isActive={activeGroup === 'ALL'}
              count={groupCounts['ALL']}
              onClick={() => setActiveGroup('ALL')}
            />
            {AWARD_GROUPS.map(g => {
              const M = GROUP_META[g.id];
              return (
                <GroupChip
                  key={g.id}
                  groupId={g.id} label={M.label} icon={M.icon} accent={M.accent}
                  isActive={activeGroup === g.id}
                  count={groupCounts[g.id]}
                  onClick={() => setActiveGroup(g.id as AwardGroup)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ── Sidebar ── */}
          <div className="lg:sticky lg:top-[130px] space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
              <input
                type="text"
                placeholder="Rechercher un prix ou nominé…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Award list grouped by status */}
            <div className="space-y-4">
              {/* Open awards */}
              {filteredAwards.filter(a => a.votingStatus === 'OPEN').length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/70 flex items-center gap-1.5 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Votes ouverts
                  </p>
                  <div className="space-y-1">
                    {filteredAwards
                      .filter(a => a.votingStatus === 'OPEN')
                      .map(award => (
                        <AwardSidebarItem
                          key={award.id}
                          award={award}
                          isSelected={selectedAward?.id === award.id}
                          hasVoted={!!votedMap[award.id]}
                          onClick={() => handleSelect(award.id)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Announced / winners */}
              {filteredAwards.filter(a => a.votingStatus === 'ANNOUNCED').length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#FCD116]/50 flex items-center gap-1.5 mb-2">
                    <Trophy className="h-3 w-3" />
                    Lauréats annoncés
                  </p>
                  <div className="space-y-1">
                    {filteredAwards
                      .filter(a => a.votingStatus === 'ANNOUNCED')
                      .map(award => (
                        <AwardSidebarItem
                          key={award.id}
                          award={award}
                          isSelected={selectedAward?.id === award.id}
                          hasVoted={false}
                          onClick={() => handleSelect(award.id)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Closed */}
              {filteredAwards.filter(a => a.votingStatus === 'CLOSED').length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Clôturés</p>
                  <div className="space-y-1">
                    {filteredAwards
                      .filter(a => a.votingStatus === 'CLOSED')
                      .map(award => (
                        <AwardSidebarItem
                          key={award.id}
                          award={award}
                          isSelected={selectedAward?.id === award.id}
                          hasVoted={!!votedMap[award.id]}
                          onClick={() => handleSelect(award.id)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {filteredAwards.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">
                  Aucun prix trouvé
                </div>
              )}
            </div>

            {/* My votes summary */}
            {votedCount > 0 && (
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/70 mb-2">
                  Mes votes ({votedCount})
                </p>
                <div className="space-y-1.5">
                  {Object.entries(votedMap).map(([awardId, nomineeId]) => {
                    const award = allAwards.find(a => a.id === awardId);
                    if (!award || !nomineeId) return null;
                    const meta = getMeta(award.category);
                    const nominee = award.nominees.find(n => n.id === nomineeId);
                    return (
                      <div key={awardId} className="flex items-center gap-2 p-2 rounded-lg bg-[#10B981]/[0.05] border border-[#10B981]/15">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-white/30 uppercase">{meta.shortLabel}</p>
                          <p className="text-[11px] font-bold text-white/80 truncate">{nominee?.name}</p>
                        </div>
                        <span className="text-sm">{meta.icon}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA back to awards */}
            <Link
              to="/awards"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/[0.08] text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
            >
              <Trophy className="h-3.5 w-3.5" />
              Voir toutes les récompenses
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Main content ── */}
          <div>
            {selectedAward ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedAward.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <AwardContentPanel award={selectedAward} />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Lock className="h-10 w-10 text-white/10 mb-4" />
                <p className="text-white/40 font-bold">Aucune catégorie disponible</p>
                <p className="text-white/20 text-sm mt-1">Revenez bientôt pour les prochains votes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}