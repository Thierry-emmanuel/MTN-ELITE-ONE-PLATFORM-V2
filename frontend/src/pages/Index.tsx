/**
 * Football UI Primitives — single source of truth.
 *
 * Replaces the duplicated FootballPrimitives.tsx and FootballUI.tsx files.
 * Import from '@/components/ui/football' everywhere.
 *
 * Legacy files re-export from here for backward compatibility:
 *   - components/elite/FootballPrimitives.tsx  → re-exports this
 *   - components/elite/FootballUI.tsx          → re-exports this
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, RefreshCw, Radio, Clock,
  CalendarX, Trophy, MapPin, User,
  CircleDot, SquareX, ArrowLeftRight,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import type { FormResult, Match, MatchEvent } from '@/types/football.types';
import { statusLabel, formatKickoff } from '@/utils/football.utils';

// ─── ClubLogo ─────────────────────────────────────────────────────────────────
// Renders the club's logoUrl if available, falls back to a coloured initials badge.
// Works with both `Club` (has `.color`, `.short`) and legacy `ApiClub` (has `.primaryColor`).

export interface ClubLogoProps {
  club: {
    id: string;
    name: string;
    short?: string;
    color?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  size?: number;
  className?: string;
}

export const ClubLogo = memo(({ club, size = 32, className = '' }: ClubLogoProps) => {
  // Resolve colour — Club uses `.color`, ApiClub uses `.primaryColor`
  const color = club.color ?? club.primaryColor ?? 'hsl(var(--muted-foreground))';
  // Resolve abbreviation — Club has `.short`, otherwise compute from name
  const abbr = (club.short ?? club.name.split(' ').map((w: string) => w[0]).join('')).slice(0, 3).toUpperCase();

  if (club.logoUrl) {
    return (
      <img
        src={club.logoUrl}
        alt={`${club.name} logo`}
        width={size}
        height={size}
        className={`object-contain shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // On image error, hide img and show fallback sibling
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('style');
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-lg grid place-items-center font-display font-bold shrink-0 ${className}`}
      style={{
        width: size, height: size,
        background: `${color}22`,
        color,
        fontSize: Math.round(size * 0.32),
        border: `1.5px solid ${color}40`,
      }}
      aria-label={club.name}
    >
      {abbr}
    </div>
  );
});
ClubLogo.displayName = 'ClubLogo';

// ─── FormIndicator ────────────────────────────────────────────────────────────

export interface FormIndicatorProps {
  result: FormResult | string;
  size?: 'sm' | 'md';
}

export const FormIndicator = memo(({ result, size = 'sm' }: FormIndicatorProps) => {
  const styles: Record<string, string> = {
    W: 'bg-win/20 text-win border-win/30',
    D: 'bg-draw/20 text-draw border-draw/30',
    L: 'bg-loss/20 text-loss border-loss/30',
  };
  const labels: Record<string, string> = { W: 'Victoire', D: 'Nul', L: 'Défaite' };
  const dim = size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-[11px]';

  return (
    <span
      className={`${dim} ${styles[result] ?? 'bg-muted text-muted-foreground border-border'} border rounded-sm grid place-items-center font-bold leading-none shrink-0`}
      title={labels[result]}
      aria-label={labels[result]}
    >
      {result}
    </span>
  );
});
FormIndicator.displayName = 'FormIndicator';

// ─── PositionChange ───────────────────────────────────────────────────────────

export const PositionChange = memo(({ delta }: { delta: number }) => {
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
});
PositionChange.displayName = 'PositionChange';

// ─── MatchStatusChip ──────────────────────────────────────────────────────────

export interface MatchStatusChipProps {
  status: string;
  minute?: number;
}

export const MatchStatusChip = memo(({ status, minute }: MatchStatusChipProps) => {
  const { text, isLive } = statusLabel(status, minute);

  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-live/15 border border-live/30 text-live px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        <Radio className="h-2.5 w-2.5 animate-pulse" />
        {text}
      </span>
    );
  }

  const chip: Record<string, string> = {
    FT:        'bg-white/5 text-muted-foreground border-border/50',
    FINISHED:  'bg-white/5 text-muted-foreground border-border/50',
    POSTPONED: 'bg-draw/10 text-draw border-draw/30',
    CANCELLED: 'bg-destructive/10 text-destructive border-destructive/30',
    ABANDONED: 'bg-destructive/10 text-destructive border-destructive/30',
    SCHEDULED: 'bg-white/4 text-muted-foreground/60 border-border/40',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${chip[status] ?? chip.SCHEDULED}`}>
      {status === 'SCHEDULED' && <Clock className="h-2.5 w-2.5" />}
      {text}
    </span>
  );
});
MatchStatusChip.displayName = 'MatchStatusChip';

// ─── FilterPill ───────────────────────────────────────────────────────────────

export interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

export const FilterPill = memo(({ label, active, onClick, count }: FilterPillProps) => (
  <button
    onClick={onClick}
    className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      active
        ? 'bg-accent text-accent-foreground shadow-[0_0_14px_rgba(252,209,22,0.25)]'
        : 'bg-surface-elevated border border-border/60 text-muted-foreground hover:border-accent/40 hover:text-foreground'
    }`}
    aria-pressed={active}
  >
    {label}
    {count !== undefined && (
      <span className={`rounded-full px-1.5 py-px text-[9px] font-bold ${active ? 'bg-black/20' : 'bg-white/8'}`}>
        {count}
      </span>
    )}
  </button>
));
FilterPill.displayName = 'FilterPill';

// ─── PageHero ─────────────────────────────────────────────────────────────────
// Consistent page header used by all inner pages (not homepage).

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accentColor?: 'green' | 'gold' | 'red';
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

const HERO_GRAD: Record<string, string> = {
  green: 'from-primary/8',
  gold:  'from-accent/6',
  red:   'from-live/8',
};

export const PageHero = memo(({
  eyebrow, title, subtitle, accentColor = 'green', badge, children,
}: PageHeroProps) => (
  <div className="relative border-b border-border/50 overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-br ${HERO_GRAD[accentColor]} via-transparent to-transparent`} />
    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/4 blur-[80px] pointer-events-none" />
    <div className="container relative py-10 lg:py-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[3px] w-8 bg-accent rounded-full" />
          <p className="text-[10px] uppercase tracking-[0.26em] text-accent font-bold">{eyebrow}</p>
        </div>
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="font-display text-4xl lg:text-5xl tracking-tight leading-none">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-muted-foreground text-sm mt-2 max-w-xl">{subtitle}</p>}
        {children}
      </motion.div>
    </div>
  </div>
));
PageHero.displayName = 'PageHero';

// ─── MatchMeta ────────────────────────────────────────────────────────────────

export interface MatchMetaProps {
  match: Pick<Match, 'venue' | 'referee' | 'attendance' | 'kickoffUtc'>;
  showTime?: boolean;
}

export const MatchMeta = memo(({ match, showTime = true }: MatchMetaProps) => (
  <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground/50 uppercase tracking-wide">
    {showTime && (
      <span className="flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" />
        {formatKickoff(match.kickoffUtc)}
      </span>
    )}
    {match.venue && (
      <span className="flex items-center gap-1">
        <MapPin className="h-2.5 w-2.5" />
        {typeof match.venue === 'object' ? match.venue.name : match.venue}
      </span>
    )}
    {match.referee && (
      <span className="flex items-center gap-1">
        <User className="h-2.5 w-2.5" />
        {match.referee.name}
      </span>
    )}
    {match.attendance && (
      <span>{match.attendance.toLocaleString('fr-FR')} spectateurs</span>
    )}
  </div>
));
MatchMeta.displayName = 'MatchMeta';

// ─── EventsTimeline ───────────────────────────────────────────────────────────

export interface EventsTimelineProps {
  events: MatchEvent[];
  homeClubId: string;
}

const EVENT_ICON: Record<string, React.ReactNode> = {
  GOAL:         <CircleDot  className="h-3 w-3 text-win" />,
  OWN_GOAL:     <CircleDot  className="h-3 w-3 text-live" />,
  PENALTY:      <CircleDot  className="h-3 w-3 text-draw" />,
  YELLOW:       <SquareX    className="h-3 w-3 text-draw" />,
  RED:          <SquareX    className="h-3 w-3 text-live" />,
  SUBSTITUTION: <ArrowLeftRight className="h-3 w-3 text-muted-foreground/40" />,
};

export const EventsTimeline = memo(({ events, homeClubId }: EventsTimelineProps) => (
  <div className="space-y-1 py-3">
    {events.map((ev, i) => {
      const isHome = ev.clubId === homeClubId;
      return (
        <div key={i} className={`flex items-center gap-2 text-xs ${isHome ? 'flex-row' : 'flex-row-reverse text-right'}`}>
          <span className="text-muted-foreground/40 w-6 tabular-nums text-[10px] shrink-0">{ev.minute}'</span>
          <span className="h-4 w-4 flex items-center justify-center shrink-0">
            {EVENT_ICON[ev.type] ?? <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
          </span>
          <span className="text-muted-foreground text-[11px] truncate">{ev.playerName}</span>
        </div>
      );
    })}
  </div>
));
EventsTimeline.displayName = 'EventsTimeline';

// ─── SummaryCard ──────────────────────────────────────────────────────────────

export interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  badge?: React.ReactNode;
  delay?: number;
}

export const SummaryCard = memo(({
  label, value, sub, color = 'text-accent', badge, delay = 0,
}: SummaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-surface-elevated/50 border border-border/50 rounded-xl px-4 py-3.5 text-center"
  >
    <div className={`font-display text-xl lg:text-2xl tabular-nums truncate leading-none ${color}`}>{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">{label}</div>
    {sub && <div className="text-[9px] text-muted-foreground/40 mt-0.5">{sub}</div>}
    {badge}
  </motion.div>
));
SummaryCard.displayName = 'SummaryCard';

// ─── MatchdayHeader ───────────────────────────────────────────────────────────

export interface MatchdayHeaderProps {
  round: number;
  date: string;
  matchCount: number;
}

export const MatchdayHeader = memo(({ round, date, matchCount }: MatchdayHeaderProps) => {
  const formatted = (() => {
    try {
      return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
      });
    } catch { return date; }
  })();
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-accent/15 border border-accent/30 grid place-items-center">
          <Trophy className="h-2.5 w-2.5 text-accent" />
        </div>
        <span className="font-display text-sm uppercase tracking-wider text-accent">J{round}</span>
      </div>
      <span className="text-muted-foreground/20">·</span>
      <span className="text-xs text-muted-foreground capitalize">{formatted}</span>
      <div className="flex-1 h-px bg-border/30" />
      <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider shrink-0">
        {matchCount} match{matchCount > 1 ? 's' : ''}
      </span>
    </div>
  );
});
MatchdayHeader.displayName = 'MatchdayHeader';

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

const shimmer = 'rounded bg-white/6';

export const FixtureCardSkeleton = () => (
  <div className="bg-gradient-card border border-border/40 rounded-xl p-4 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className={`h-3 w-20 ${shimmer}`} />
      <div className={`h-3 w-14 ${shimmer}`} />
    </div>
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className={`h-10 w-10 rounded-lg ${shimmer}`} />
        <div className={`h-3 w-16 ${shimmer}`} />
      </div>
      <div className={`h-5 w-10 ${shimmer}`} />
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className={`h-10 w-10 rounded-lg ${shimmer}`} />
        <div className={`h-3 w-16 ${shimmer}`} />
      </div>
    </div>
    <div className={`h-3 w-28 ${shimmer} mx-auto`} />
  </div>
);

export const ResultCardSkeleton = () => (
  <div className="bg-surface/60 border border-border rounded-xl px-4 py-3 animate-pulse">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex items-center justify-end gap-2">
        <div className={`h-3 w-20 ${shimmer}`} />
        <div className={`h-7 w-7 rounded-lg ${shimmer}`} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className={`h-6 w-16 ${shimmer}`} />
        <div className={`h-2 w-10 ${shimmer}`} />
      </div>
      <div className="flex items-center gap-2">
        <div className={`h-7 w-7 rounded-lg ${shimmer}`} />
        <div className={`h-3 w-20 ${shimmer}`} />
      </div>
    </div>
  </div>
);

export const StandingRowSkeleton = ({ i = 0 }: { i?: number }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 animate-pulse"
    style={{ animationDelay: `${i * 50}ms` }}
  >
    <div className={`h-4 w-6 ${shimmer}`} />
    <div className={`h-3 w-4 ${shimmer}`} />
    <div className={`h-7 w-7 rounded-lg ${shimmer}`} />
    <div className="flex-1 h-4 rounded bg-white/6" />
    <div className="hidden sm:flex gap-2">
      {Array.from({ length: 4 }).map((_, j) => (
        <div key={j} className={`h-4 w-7 ${shimmer}`} />
      ))}
    </div>
    <div className="hidden md:flex gap-1">
      {Array.from({ length: 5 }).map((_, j) => (
        <div key={j} className={`h-5 w-5 rounded-sm ${shimmer}`} />
      ))}
    </div>
    <div className={`h-5 w-8 rounded ${shimmer}`} />
  </div>
);

export const PlayerCardSkeleton = () => (
  <div className="bg-gradient-card border border-border/40 rounded-xl p-4 animate-pulse space-y-3">
    <div className={`h-12 w-12 rounded-full ${shimmer} mx-auto`} />
    <div className={`h-4 w-28 ${shimmer} mx-auto`} />
    <div className={`h-3 w-16 ${shimmer} mx-auto`} />
    <div className="grid grid-cols-3 gap-2 pt-2">
      {[0,1,2].map(i => <div key={i} className={`h-8 ${shimmer}`} />)}
    </div>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = memo(({ message, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
    <div className="text-muted-foreground/20">
      {icon ?? <CalendarX className="h-10 w-10" />}
    </div>
    <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    {action}
  </div>
));
EmptyState.displayName = 'EmptyState';

// ─── ErrorState ───────────────────────────────────────────────────────────────

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = memo(({ message, onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
    <AlertTriangle className="h-8 w-8 text-destructive/50" />
    <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated border border-border/60 text-xs font-medium hover:border-accent/40 hover:text-accent transition-all"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Réessayer
      </button>
    )}
  </div>
));
ErrorState.displayName = 'ErrorState';