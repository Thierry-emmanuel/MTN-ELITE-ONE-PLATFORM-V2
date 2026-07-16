import { motion } from 'framer-motion';
import { Calendar, Clock, Radio, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ApiClub, ApiMatch, MatchEvent, MatchDay } from '@/types/football.types';

// ─── ClubLogo ────────────────────────────────────────────────────────────────

interface ClubLogoProps {
  club: ApiClub;
  size?: number;
  className?: string;
}

export const ClubLogo = ({ club, size = 40, className = '' }: ClubLogoProps) => {
  const initials = club.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  if (club.logoUrl) {
    return (
      <img
        src={club.logoUrl}
        alt={club.name}
        width={size}
        height={size}
        className={`object-contain shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('style');
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full grid place-items-center shrink-0 font-display text-[10px] ${className}`}
      style={{
        width: size, height: size,
        backgroundColor: club.primaryColor ? `${club.primaryColor}30` : 'hsl(var(--surface-elevated))',
        color: club.primaryColor ?? 'hsl(var(--muted-foreground))',
        border: `1px solid ${club.primaryColor ?? 'hsl(var(--border))'}40`,
        fontSize: size * 0.28,
      }}
    >
      {initials}
    </div>
  );
};

// ─── FormIndicator ────────────────────────────────────────────────────────────

export const FormIndicator = ({ result }: { result: string }) => {
  const r = result as 'W' | 'D' | 'L';
  const styles = {
    W: 'bg-win/20 text-win',
    D: 'bg-draw/20 text-draw',
    L: 'bg-loss/20 text-loss',
  };
  return (
    <div
      className={`h-5 w-5 rounded-full grid place-items-center text-[9px] font-bold shrink-0 ${styles[r] ?? 'bg-muted text-muted-foreground'}`}
    >
      {r}
    </div>
  );
};

// ─── PositionChange ───────────────────────────────────────────────────────────

export const PositionChange = ({ delta }: { delta: number }) => {
  if (delta === 0) return <Minus className="h-3 w-3 text-muted-foreground/30" />;
  if (delta > 0)
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-win">
        <TrendingUp className="h-3 w-3" />
        {delta}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-loss">
      <TrendingDown className="h-3 w-3" />
      {Math.abs(delta)}
    </span>
  );
};

// ─── Status badge helpers ─────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'À venir',
  LIVE:      'En direct',
  HT:        'Mi-temps',
  FT:        'FT',        // legacy alias — DB still returns FINISHED
  FINISHED:  'FT',
  POSTPONED: 'Reporté',
  CANCELLED: 'Annulé',
};

// ─── FixtureCard ──────────────────────────────────────────────────────────────

interface FixtureCardProps {
  match: ApiMatch;
}

export const FixtureCard = ({ match }: FixtureCardProps) => {
  const live = match.status === 'LIVE';
  const dt   = new Date(match.scheduledAt);
  const time = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date = dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-gradient-card border rounded-xl p-4 cursor-pointer overflow-hidden transition-all duration-300 ${
        live
          ? 'border-live/40 hover:border-live/70 shadow-[0_0_20px_hsl(354_85%_50%/0.1)]'
          : 'border-border hover:border-primary/40 hover:shadow-elegant'
      }`}
    >
      {live && <div className="absolute top-0 left-0 right-0 h-[2px] bg-live" />}

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] mb-4">
        <div className="flex items-center gap-1 text-muted-foreground uppercase tracking-wider">
          <Calendar className="h-2.5 w-2.5" />
          {date}
        </div>
        {live ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-live/15 text-live px-2 py-0.5 font-semibold uppercase tracking-wider">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated text-muted-foreground px-2 py-0.5 uppercase tracking-wider">
            <Clock className="h-2.5 w-2.5" />
            {STATUS_LABEL[match.status] ?? match.status}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <ClubLogo club={match.homeClub} size={48} />
            {match.homeClub.primaryColor && (
              <div
                className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-25 transition-opacity"
                style={{ background: match.homeClub.primaryColor }}
              />
            )}
          </div>
          <span className="font-display text-xs leading-tight">{match.homeClub.name}</span>
        </div>

        {/* Score (live) or VS */}
        {live && match.homeScore !== null ? (
          <div className="font-display text-2xl text-live shrink-0 tabular-nums">
            {match.homeScore} – {match.awayScore}
          </div>
        ) : (
          <div className="font-display text-lg text-muted-foreground/40 shrink-0">vs</div>
        )}

        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <ClubLogo club={match.awayClub} size={48} />
            {match.awayClub.primaryColor && (
              <div
                className="absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-25 transition-opacity"
                style={{ background: match.awayClub.primaryColor }}
              />
            )}
          </div>
          <span className="font-display text-xs leading-tight">{match.awayClub.name}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-3 border-t border-border/50">
        <div className={`font-display text-xl ${live ? 'text-live' : 'text-accent'}`}>{time}</div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
          {typeof match.venue === 'object' ? (match.venue as any).name : (match.venue ?? 'Stade à confirmer')}
        </div>
      </div>
    </motion.div>
  );
};

// ─── ResultCard ───────────────────────────────────────────────────────────────

interface ResultCardProps {
  match: ApiMatch;
}

const goalScorers = (events: MatchEvent[], clubId: string): string[] =>
  events.filter(e => e.type === 'GOAL' && e.clubId === clubId).map(e => `${e.playerName} ${e.minute}'`);

export const ResultCard = ({ match }: ResultCardProps) => {
  const hs = match.homeScore ?? 0;
  const as_ = match.awayScore ?? 0;
  const homeWin = hs > as_;
  const awayWin = as_ > hs;
  const draw    = hs === as_;

  const dt   = new Date(match.scheduledAt);
  const date = dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const homeGoals = match.events ? goalScorers(match.events, match.homeClub.id) : [];
  const awayGoals = match.events ? goalScorers(match.events, match.awayClub.id) : [];

  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="group relative bg-surface/60 border border-border rounded-xl px-4 py-3 cursor-pointer hover:bg-surface hover:border-white/15 transition-all duration-200 overflow-hidden"
    >
      {/* Zone indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-opacity ${
          draw ? 'bg-draw opacity-40' : homeWin ? 'bg-win opacity-60' : 'bg-loss opacity-60'
        }`}
      />

      {/* Top row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pl-2">
        {/* Home */}
        <div className={`flex items-center gap-2 justify-end ${homeWin ? 'text-foreground' : 'text-muted-foreground'}`}>
          <div className="text-right min-w-0">
            <div className={`font-display text-sm truncate ${homeWin ? 'text-foreground' : ''}`}>
              {match.homeClub.name}
            </div>
            {homeGoals.length > 0 && (
              <div className="text-[9px] text-muted-foreground/60 truncate">⚽ {homeGoals.join(', ')}</div>
            )}
          </div>
          <ClubLogo club={match.homeClub} size={28} />
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="flex items-center gap-1.5 font-display text-xl tabular-nums">
            <span className={homeWin ? 'text-accent' : draw ? 'text-draw' : 'text-muted-foreground'}>{hs}</span>
            <span className="text-muted-foreground/30 text-base">–</span>
            <span className={awayWin ? 'text-accent' : draw ? 'text-draw' : 'text-muted-foreground'}>{as_}</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50">FT · {date}</span>
        </div>

        {/* Away */}
        <div className={`flex items-center gap-2 ${awayWin ? 'text-foreground' : 'text-muted-foreground'}`}>
          <ClubLogo club={match.awayClub} size={28} />
          <div className="min-w-0">
            <div className={`font-display text-sm truncate ${awayWin ? 'text-foreground' : ''}`}>
              {match.awayClub.name}
            </div>
            {awayGoals.length > 0 && (
              <div className="text-[9px] text-muted-foreground/60 truncate">⚽ {awayGoals.join(', ')}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MatchdaySection ──────────────────────────────────────────────────────────

interface MatchdaySectionProps {
  day: MatchDay;
  variant: 'fixtures' | 'results';
  index: number;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as any } },
};

export const MatchdaySection = ({ day, variant, index }: MatchdaySectionProps) => {
  const dt      = new Date(day.date);
  const dateStr = dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Matchday header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] uppercase tracking-widest text-accent">
            J{day.round}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[11px] text-muted-foreground capitalize">{dateStr}</span>
        </div>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-[10px] text-muted-foreground/50">
          {day.matches.length} match{day.matches.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={
          variant === 'fixtures'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-2'
        }
      >
        {day.matches.map((match: any) => (
          <motion.div key={match.id} variants={itemVariants as any}>
            {variant === 'fixtures'
              ? <FixtureCard match={match} />
              : <ResultCard match={match} />}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

export const FixtureCardSkeleton = () => (
  <div className="bg-gradient-card border border-border rounded-xl p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-3 w-20 rounded bg-white/6" />
      <div className="h-3 w-14 rounded bg-white/6" />
    </div>
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="h-12 w-12 rounded-full bg-white/6" />
        <div className="h-3 w-16 rounded bg-white/6" />
      </div>
      <div className="h-6 w-6 rounded bg-white/4" />
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="h-12 w-12 rounded-full bg-white/6" />
        <div className="h-3 w-16 rounded bg-white/6" />
      </div>
    </div>
    <div className="border-t border-border/30 pt-3 flex flex-col items-center gap-1">
      <div className="h-5 w-12 rounded bg-white/6" />
      <div className="h-2.5 w-24 rounded bg-white/4" />
    </div>
  </div>
);

export const ResultCardSkeleton = () => (
  <div className="bg-surface/60 border border-border rounded-xl px-4 py-3 animate-pulse">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex items-center justify-end gap-2">
        <div className="h-3 w-20 rounded bg-white/6" />
        <div className="h-7 w-7 rounded-full bg-white/6" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-6 w-16 rounded bg-white/6" />
        <div className="h-2 w-10 rounded bg-white/4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-white/6" />
        <div className="h-3 w-20 rounded bg-white/6" />
      </div>
    </div>
  </div>
);

export const StandingRowSkeleton = ({ i }: { i: number }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 border-b border-border/40 animate-pulse"
    style={{ animationDelay: `${i * 0.05}s` }}
  >
    <div className="w-6 h-4 rounded bg-white/6" />
    <div className="w-5 h-3 rounded bg-white/4" />
    <div className="h-7 w-7 rounded-full bg-white/6" />
    <div className="flex-1 space-y-1">
      <div className="h-3.5 w-28 rounded bg-white/6" />
      <div className="h-2.5 w-16 rounded bg-white/4" />
    </div>
    <div className="hidden sm:flex gap-3">
      {[0,1,2,3].map(j => <div key={j} className="h-4 w-6 rounded bg-white/6" />)}
    </div>
    <div className="hidden md:flex gap-1">
      {[0,1,2,3,4].map(j => <div key={j} className="h-5 w-5 rounded-full bg-white/6" />)}
    </div>
    <div className="w-10 h-5 rounded bg-white/8" />
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

export const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <Trophy className="h-12 w-12 text-muted-foreground/20 mb-4" />
    <p className="font-display text-lg text-muted-foreground/50">{message}</p>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
    <div className="h-12 w-12 rounded-full bg-destructive/10 grid place-items-center">
      <span className="text-destructive text-xl">!</span>
    </div>
    <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-medium text-accent hover:underline uppercase tracking-wider"
      >
        Réessayer
      </button>
    )}
  </div>
);