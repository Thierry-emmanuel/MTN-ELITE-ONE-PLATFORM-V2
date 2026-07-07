import { useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Sparkles, Vote, ChevronRight,
  Trophy, Users, Shield, ClipboardList, CircleDot,
  Rocket, Lock, ArrowUpRight, Crown, CalendarDays,
  Medal, Ticket, ScrollText,
} from 'lucide-react';
import { useAwards, useTeamOfWeek, useRealtimeVotes, useBallonDor } from '@/hooks/useAwards';
import { useVotingStore, useRealtimeStore } from '@/store/awards.store';
import { AwardCard } from '@/components/elite/awards/AwardCard';
import { FormationPitch } from '@/components/elite/awards/FormationPitch';
import { PastWinnersGallery } from '@/components/elite/awards/BallonDorComponents';
import { CeremonyBackdrop } from '@/components/elite/awards/CeremonyBackdrop';
import { CEREMONY_PHOTOS } from '@/services/ceremonyPhotos';
import { AWARD_GROUPS, AWARD_META } from '@/types/awards.types';
import type { AwardGroup, AwardCategory, Award, PlayerNominee } from '@/types/awards.types';

// ─── Group visual metadata (icon + accent, event-programme style) ────────────
const GROUP_META: Record<AwardGroup, { icon: React.FC<{ className?: string; style?: React.CSSProperties }>; accent: string; ring: string; blurb: string }> = {
  BALLON_DOR: { icon: Trophy,        accent: '#FCD116', ring: 'ring-[#FCD116]/25', blurb: 'La récompense suprême de la saison' },
  PLAYER:     { icon: Users,         accent: '#34D399', ring: 'ring-[#34D399]/25', blurb: 'Du homme du match au joueur de la saison' },
  TEAM:       { icon: Shield,        accent: '#60A5FA', ring: 'ring-[#60A5FA]/25', blurb: "Le onze type de la semaine, du mois et de l'année" },
  GOAL:       { icon: Rocket,        accent: '#FB923C', ring: 'ring-[#FB923C]/25', blurb: 'Les plus beaux gestes techniques de la saison' },
  COACH:      { icon: ClipboardList, accent: '#A78BFA', ring: 'ring-[#A78BFA]/25', blurb: 'Les architectes des performances collectives' },
};

const slug = (id: string) => `group-${id}`;

const initialsOf = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

function timeUntil(iso?: string) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}j ${h}h` : `${h}h`;
}

// ─── Ambient stage light — used behind the hero and the podium ───────────────
const StageLights = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-1/3 left-[10%] w-56 h-[140%] bg-gradient-to-b from-[#FCD116]/[0.14] via-[#FCD116]/[0.04] to-transparent blur-2xl"
      style={{ transformOrigin: 'top center' }}
      animate={{ rotate: [-8, 8, -8], opacity: [0.5, 0.85, 0.5] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -top-1/3 right-[12%] w-56 h-[140%] bg-gradient-to-b from-[#FCD116]/[0.10] via-[#FCD116]/[0.03] to-transparent blur-2xl"
      style={{ transformOrigin: 'top center' }}
      animate={{ rotate: [9, -9, 9], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
  </div>
);

// ─── Gala hero — the digital equivalent of walking into the ceremony ─────────
const GalaHero = ({
  totalAwards, totalCategories, ceremonyDate, totalVotes,
}: { totalAwards: number; totalCategories: number; ceremonyDate?: string; totalVotes: number }) => {
  const formattedDate = ceremonyDate
    ? new Date(ceremonyDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="relative overflow-hidden border-b border-[#FCD116]/10 bg-black">
      <CeremonyBackdrop photos={CEREMONY_PHOTOS} intensity="subtle" />
      <StageLights />
      {/* Stage floor sheen */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FCD116]/[0.05] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/40 to-transparent" />

      <div className="container relative py-14 lg:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-5"
        >
          <span className="h-px w-8 bg-[#FCD116]/50" />
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[.32em] text-[#FCD116]/80">
            MTN Elite One · Saison 2025–26
          </p>
          <span className="h-px w-8 bg-[#FCD116]/50" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
          className="font-serif italic font-medium leading-[0.95] text-[2.6rem] sm:text-6xl lg:text-7xl text-white"
        >
          La nuit des <span className="text-foil not-italic font-black">Lions</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-white/45"
        >
          Le palmarès officiel du championnat — homme du match, équipe type, plus beau but, Ballon d'Or.
          Chaque trophée honore une performance qui a marqué la saison.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          <div className="flex items-center gap-2">
            <Ticket className="h-3.5 w-3.5 text-[#FCD116]/60" />
            <span className="font-display text-sm font-bold text-white/80 tabular-nums">{totalAwards}</span>
            <span className="text-[11px] text-white/35 uppercase tracking-wider">récompenses en jeu</span>
          </div>
          <span className="hidden sm:block h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <ScrollText className="h-3.5 w-3.5 text-[#FCD116]/60" />
            <span className="font-display text-sm font-bold text-white/80 tabular-nums">{totalCategories}</span>
            <span className="text-[11px] text-white/35 uppercase tracking-wider">catégories au programme</span>
          </div>
          <span className="hidden sm:block h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-[#FCD116]/60" />
            <span className="font-display text-sm font-bold text-white/80 tabular-nums">{totalVotes.toLocaleString('fr-FR')}</span>
            <span className="text-[11px] text-white/35 uppercase tracking-wider">votes des supporters</span>
          </div>
          {formattedDate && (
            <>
              <span className="hidden sm:block h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-[#FCD116]/60" />
                <span className="text-[11px] text-white/35 uppercase tracking-wider">Cérémonie le {formattedDate}</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Foreground winners strip — real faces, sharp, in front of the blurred backdrop */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.36 }}
          className="mt-9 flex items-center justify-center"
        >
          <div className="flex -space-x-3">
            {CEREMONY_PHOTOS.slice(0, 6).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-black"
                style={{ zIndex: 6 - i }}
                loading="lazy"
              />
            ))}
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[#FCD116]/10 border-2 border-black ring-2 ring-[#FCD116]/30 flex items-center justify-center text-[10px] font-black text-[#FCD116]">
              +{Math.max(totalAwards - 6, 0)}
            </div>
          </div>
          <p className="ml-3 text-[11px] text-white/30 max-w-[10rem] text-left leading-tight">
            De nouveaux visages rejoindront ce soir la légende du championnat
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Podium spotlight — the Ballon d'Or top 3, staged like an award ceremony ─
const PodiumAvatar = ({ nominee, size }: { nominee: PlayerNominee; size: number }) =>
  nominee.photoUrl
    ? <img src={nominee.photoUrl} alt={nominee.name} className="rounded-full object-cover object-top" style={{ width: size, height: size }} loading="lazy" />
    : <div className="rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60" style={{ width: size, height: size, fontSize: size * 0.32 }}>{initialsOf(nominee.name)}</div>;

const RISER_H: Record<number, string> = { 1: 'h-24 sm:h-32', 2: 'h-16 sm:h-20', 3: 'h-12 sm:h-14' };
const RISER_ORDER: Record<number, string> = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };
const RISER_RING: Record<number, string> = { 1: 'ring-[#FCD116]', 2: 'ring-[#D9D9D9]', 3: 'ring-[#C08A4E]' };
const RISER_BG: Record<number, string> = { 1: 'from-[#FCD116]/50 to-[#FCD116]/5 border-[#FCD116]/50', 2: 'from-white/30 to-white/5 border-white/25', 3: 'from-[#C08A4E]/40 to-[#C08A4E]/5 border-[#C08A4E]/40' };
const RISER_TXT: Record<number, string> = { 1: 'text-[#FCD116]', 2: 'text-white/70', 3: 'text-[#C08A4E]' };

const PodiumSpotlight = () => {
  const { data: edition } = useBallonDor();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const top3 = edition.ranking.slice(0, 3);
  const closing = timeUntil(edition.votingDeadline);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden border border-[#FCD116]/20 bg-black"
    >
      <CeremonyBackdrop photos={CEREMONY_PHOTOS.slice().reverse()} intensity="subtle" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/55 to-transparent" />
      <StageLights />

      <div className="relative z-10 px-6 pt-8 pb-6 sm:px-10 sm:pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-black text-[#FCD116]/60 uppercase tracking-[.24em] mb-1">Récompense suprême</p>
            <h2 className="font-serif italic text-3xl sm:text-4xl font-medium text-white leading-tight">
              Ballon d'Or <span className="not-italic font-black text-foil">Cameroun</span>
            </h2>
          </div>
          <p className="text-xs text-white/35 max-w-[15rem]">
            {edition.votingOpen ? 'Le classement en direct des trois favoris pour le trophée individuel le plus prestigieux du pays.' : `Trophée décerné — cérémonie du ${new Date(edition.ceremonyDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.`}
          </p>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-8">
            {top3.map(entry => (
              <div key={entry.rank} className={`flex flex-col items-center w-24 sm:w-32 ${RISER_ORDER[entry.rank]}`}>
                <motion.div
                  animate={entry.rank === 1 ? { y: [0, -6, 0] } : {}}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative mb-2"
                >
                  {entry.rank === 1 && <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-5 w-5 text-[#FCD116]" fill="currentColor" />}
                  <div className={`rounded-full ring-2 ${RISER_RING[entry.rank]} ring-offset-2 ring-offset-black`}>
                    <PodiumAvatar nominee={entry.nominee} size={entry.rank === 1 ? 68 : 52} />
                  </div>
                </motion.div>
                <p className="font-display text-xs sm:text-sm font-bold text-white/90 text-center leading-tight truncate max-w-full px-1">{entry.nominee.name}</p>
                <p className="text-[9px] text-white/30 truncate max-w-full px-1">{entry.nominee.clubName}</p>
                <p className={`font-display text-sm font-black tabular-nums mt-0.5 ${RISER_TXT[entry.rank]}`}>{entry.totalPoints} pts</p>

                <div className={`mt-2 w-full rounded-t-lg border border-b-0 bg-gradient-to-b flex items-start justify-center pt-1.5 ${RISER_H[entry.rank]} ${RISER_BG[entry.rank]}`}>
                  <span className={`font-display text-lg sm:text-xl font-black ${RISER_TXT[entry.rank]}`}>{entry.rank}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          <Link to="/awards/ballon-dor"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FCD116] text-black font-black text-sm hover:bg-[#FFE566] transition-colors shadow-[0_0_30px_rgba(252,209,22,0.3)] w-full sm:w-auto">
            <Sparkles className="h-4 w-4" /> Voir le classement complet
          </Link>
          <Link to="/awards/vote"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto">
            <Vote className="h-4 w-4" /> Tous les votes
          </Link>
          {edition.votingOpen && closing && (
            <span className="text-[11px] text-white/30">Votes clôturés dans {closing}</span>
          )}
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

// ─── Sidebar / rail navigation — the evening's programme ─────────────────────
const CategoryRail = ({
  awardsByCategory, onJump,
}: { awardsByCategory: Record<string, Award[]>; onJump: (id: string) => void }) => {
  return (
    <nav className="hidden lg:block sticky top-24 self-start w-64 shrink-0 space-y-1 pr-2">
      <p className="px-3 text-[10px] font-black uppercase tracking-[.2em] text-stone-500 mb-3">Programme de la soirée</p>
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
              <span className="text-[10px] font-serif italic text-stone-600 w-4 shrink-0">{String(gi + 1).padStart(2, '0')}</span>
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

// ─── Award group section — a "category" in the evening's programme ───────────
const GroupSection = ({
  group, index, awardsByCategory, votedMap,
}: { group: typeof AWARD_GROUPS[number]; index: number; awardsByCategory: Record<string, Award[]>; votedMap: Record<string, string | null> }) => {
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
        className="flex items-center gap-4 mb-5"
      >
        <span className="font-serif italic text-3xl text-white/15 shrink-0 tabular-nums">{String(index).padStart(2, '0')}</span>
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ring-1 shrink-0 ${Meta.ring}`} style={{ backgroundColor: `${Meta.accent}18`, borderColor: `${Meta.accent}30` }}>
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

// ─── Hall of Fame — the legacy wall closing out the ceremony ─────────────────
const HallOfFame = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(252,209,22,0.05)_0%,transparent_60%),#020202] p-6 sm:p-10"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="relative z-10 text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Medal className="h-4 w-4 text-[#FCD116]/60" />
          <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#FCD116]/60">Mur de la légende</p>
        </div>
        <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-white max-w-lg mx-auto">
          Chaque Ballon d'Or rejoint une lignée qui dépasse une saison
        </h2>
      </div>
      <div className="relative z-10 mt-8">
        <PastWinnersGallery />
      </div>

      <div className="relative z-10 mt-8 flex justify-center">
        <Link
          to="/halloffame"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#FCD116] transition-colors border-t border-white/10 pt-4"
        >
          Visiter le musée des légendes du championnat <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.section>
  );
};

// ─── AwardsPage ───────────────────────────────────────────────────────────────
export default function AwardsPage() {
  const { data: awards, isLoading } = useAwards();
  const { data: teamOfWeek, isLoading: towLoading } = useTeamOfWeek();
  const { data: ballonDor } = useBallonDor();
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
  const totalCategories = AWARD_GROUPS.reduce((n, g) => n + g.categories.length, 0);
  const totalVotes = awards.reduce((n, a) => n + (a.voteResults?.totalVotes ?? 0), 0) + (ballonDor?.totalVotes ?? 0);

  return (
    <div className="min-h-screen bg-black text-stone-100">
      <GalaHero
        totalAwards={awards.length}
        totalCategories={totalCategories}
        ceremonyDate={ballonDor?.ceremonyDate}
        totalVotes={totalVotes}
      />

      <div className="container py-6 lg:py-10">

        {/* Status row */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <MobileRail onJump={jumpTo} />
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-stone-500">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            {awards.length} récompenses actives sur {totalCategories} catégories
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

            {/* Ballon d'Or podium spotlight */}
            <section id={slug('BALLON_DOR')} className="scroll-mt-24">
              <PodiumSpotlight />
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
                {nonBallonDorGroups.map((group, gi) => (
                  <div key={group.id}>
                    <GroupSection group={group} index={gi + 2} awardsByCategory={awardsByCategory} votedMap={votedMap} />
                    {group.id === 'TEAM' && !towLoading && teamOfWeek && (
                      <TeamOfWeekSection teamOfWeek={teamOfWeek} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hall of Fame */}
            <HallOfFame />

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden flex items-center justify-between flex-wrap gap-4 rounded-2xl border border-[#FCD116]/[0.12] bg-white/[0.02] p-5"
            >
              <div className="divider-engraved absolute top-0 left-0 right-0" />
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