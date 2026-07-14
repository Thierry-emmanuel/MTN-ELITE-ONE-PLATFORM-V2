import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, RefreshCw, Radio, Clock,
  CalendarX, Trophy, MapPin, User,
  CircleDot, SquareX, ArrowLeftRight,
} from 'lucide-react';
import type { FormResult, Match, MatchEvent } from '../../types/football.types';
import { statusLabel, formatKickoff } from '../../utils/football.utils';

// ─── ClubLogo ─────────────────────────────────────────────────────────────────

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
  if (club.logoUrl) {
    return (
      <img
        src={club.logoUrl}
        alt={`${club.name} logo`}
        width={size}
        height={size}
        className={`object-contain rounded-sm ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const color = club.color ?? club.primaryColor ?? '#FCD116';
  const shortName = club.short ?? club.name.slice(0, 3);
  return (
    <div
      className={`rounded-lg grid place-items-center font-display font-bold shrink-0 ${className}`}
      style={{
        width: size, height: size,
        background: `${color}22`,
        color: color,
        fontSize: Math.round(size * 0.35),
        border: `1.5px solid ${color}40`,
      }}
      aria-label={club.name}
    >
      {shortName.slice(0, 3)}
    </div>
  );
});
ClubLogo.displayName = 'ClubLogo';

// ─── FormIndicator ────────────────────────────────────────────────────────────

const FORM_STYLES: Record<FormResult, { bg: string; text: string; label: string }> = {
  W: { bg: 'bg-[#1F8A4C]', text: 'text-white', label: 'Victoire' },
  D: { bg: 'bg-[#FCD116]', text: 'text-black',  label: 'Nul' },
  L: { bg: 'bg-[#CE1126]', text: 'text-white',  label: 'Défaite' },
};

export interface FormIndicatorProps {
  result: FormResult;
  size?: 'sm' | 'md';
}

export const FormIndicator = memo(({ result, size = 'sm' }: FormIndicatorProps) => {
  const s = FORM_STYLES[result];
  const dim = size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs';
  return (
    <span
      className={`${dim} ${s.bg} ${s.text} rounded-sm grid place-items-center font-bold leading-none`}
      title={s.label}
      aria-label={s.label}
    >
      {result}
    </span>
  );
});
FormIndicator.displayName = 'FormIndicator';

// ─── MatchStatusChip ──────────────────────────────────────────────────────────

export interface MatchStatusChipProps {
  status: string;
  minute?: number;
}

export const MatchStatusChip = memo(({ status, minute }: MatchStatusChipProps) => {
  const { text, isLive } = statusLabel(status, minute);
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#CE1126]/15 border border-[#CE1126]/30 text-[#CE1126] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        <Radio className="h-2.5 w-2.5 animate-pulse" />
        {text}
      </span>
    );
  }
  const chip: Record<string, string> = {
    FT:        'bg-white/6 text-muted-foreground border-border',
    POSTPONED: 'bg-[#FCD116]/10 text-[#FCD116] border-[#FCD116]/30',
    CANCELLED: 'bg-destructive/10 text-destructive border-destructive/30',
    ABANDONED: 'bg-destructive/10 text-destructive border-destructive/30',
    SCHEDULED: 'bg-white/4 text-muted-foreground border-border',
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
    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      active
        ? 'bg-accent text-accent-foreground shadow-[0_0_14px_rgba(252,209,22,0.3)]'
        : 'bg-surface-elevated border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
    }`}
    aria-pressed={active}
  >
    {label}
    {count !== undefined && (
      <span className={`rounded-full px-1.5 py-px text-[9px] font-bold ${active ? 'bg-black/20' : 'bg-white/10'}`}>
        {count}
      </span>
    )}
  </button>
));
FilterPill.displayName = 'FilterPill';

// ─── PageHero ─────────────────────────────────────────────────────────────────

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accentColor?: 'green' | 'gold' | 'red';
  badge?: React.ReactNode;
}

export const PageHero = memo(({ eyebrow, title, subtitle, accentColor = 'green', badge }: PageHeroProps) => {
  const grad: Record<string, string> = {
    green: 'from-[#008751]/8',
    gold:  'from-[#FCD116]/6',
    red:   'from-[#CE1126]/8',
  };
  return (
    <div className="relative border-b border-border/50 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${grad[accentColor]} via-background to-background`} />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent/4 blur-[100px] pointer-events-none" />
      <div className="container relative py-10 lg:py-14">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-[3px] w-8 bg-accent rounded-full" />
            <p className="text-[10px] uppercase tracking-[0.26em] text-accent font-bold">{eyebrow}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>}
        </motion.div>
      </div>
    </div>
  );
});
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

const EVENT_ICON_MAP: Record<string, React.ReactNode> = {
  GOAL:         <CircleDot className="h-3 w-3 text-[#10B981]" />,
  OWN_GOAL:     <CircleDot className="h-3 w-3 text-[#CE1126]" />,
  PENALTY:      <CircleDot className="h-3 w-3 text-[#FCD116]" />,
  YELLOW:       <SquareX   className="h-3 w-3 text-[#FCD116]" />,
  RED:          <SquareX   className="h-3 w-3 text-[#CE1126]" />,
  SUBSTITUTION: <ArrowLeftRight className="h-3 w-3 text-white/40" />,
};

export const EventsTimeline = memo(({ events, homeClubId }: EventsTimelineProps) => (
  <div className="space-y-1 py-2">
    {events.map((ev, i) => {
      const isHome = ev.clubId === homeClubId;
      return (
        <div key={i} className={`flex items-center gap-2 text-xs ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="text-muted-foreground/40 w-7 tabular-nums text-[10px] shrink-0 text-right">{ev.minute}'</span>
          <span className="h-5 w-5 flex items-center justify-center shrink-0">
            {EVENT_ICON_MAP[ev.type] ?? <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
          </span>
          <span className="text-muted-foreground truncate">{ev.playerName}</span>
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

export const SummaryCard = memo(({ label, value, sub, color = 'text-accent', badge, delay = 0 }: SummaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-surface-elevated/50 border border-border/50 rounded-xl px-4 py-3.5 text-center"
  >
    <div className={`font-display text-xl lg:text-2xl tabular-nums truncate ${color}`}>{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 leading-tight">{label}</div>
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
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-accent/15 border border-accent/30 grid place-items-center">
          <Trophy className="h-2.5 w-2.5 text-accent" />
        </div>
        <span className="font-display text-sm uppercase tracking-wider text-accent">J{round}</span>
      </div>
      <span className="text-muted-foreground/30">·</span>
      <span className="text-xs text-muted-foreground capitalize">{formatted}</span>
      <span className="ml-auto text-[10px] text-muted-foreground/40 uppercase tracking-wider">
        {matchCount} match{matchCount > 1 ? 's' : ''}
      </span>
    </div>
  );
});
MatchdayHeader.displayName = 'MatchdayHeader';

// ─── Skeletons ────────────────────────────────────────────────────────────────

const shimmer = 'animate-pulse bg-white/6 rounded';

export const ResultCardSkeleton = () => (
  <div className={`flex items-center gap-4 p-4 rounded-xl border border-border/40 ${shimmer}`}>
    <div className="h-8 w-8 rounded-lg bg-white/8" />
    <div className="flex-1 h-4 bg-white/8 rounded" />
    <div className="h-6 w-16 bg-white/8 rounded" />
    <div className="flex-1 h-4 bg-white/8 rounded" />
    <div className="h-8 w-8 rounded-lg bg-white/8" />
  </div>
);

export const FixtureCardSkeleton = () => (
  <div className={`p-4 rounded-xl border border-border/40 space-y-3 ${shimmer}`}>
    <div className="h-3 w-24 bg-white/8 rounded" />
    <div className="flex justify-between items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-white/8" />
      <div className="h-6 w-12 bg-white/8 rounded" />
      <div className="h-10 w-10 rounded-lg bg-white/8" />
    </div>
    <div className="h-3 w-32 bg-white/8 rounded mx-auto" />
  </div>
);

export const StandingRowSkeleton = ({ i = 0 }: { i?: number }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 ${shimmer}`}
    style={{ animationDelay: `${i * 40}ms` }}
  >
    <div className="h-4 w-6 bg-white/8 rounded" />
    <div className="h-7 w-7 bg-white/8 rounded-lg" />
    <div className="flex-1 h-4 bg-white/8 rounded" />
    <div className="hidden sm:flex gap-2">
      {Array.from({ length: 7 }).map((_, j) => (
        <div key={j} className="h-4 w-7 bg-white/8 rounded" />
      ))}
    </div>
    <div className="hidden lg:flex gap-1">
      {Array.from({ length: 5 }).map((_, j) => (
        <div key={j} className="h-5 w-5 bg-white/8 rounded-sm" />
      ))}
    </div>
    <div className="h-5 w-8 bg-white/8 rounded" />
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
    <div className="text-muted-foreground/20 text-4xl">
      {icon ?? <CalendarX className="h-10 w-10" />}
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
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
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated border border-border text-xs font-medium hover:border-accent/50 hover:text-accent transition-all"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Réessayer
      </button>
    )}
  </div>
));
ErrorState.displayName = 'ErrorState';