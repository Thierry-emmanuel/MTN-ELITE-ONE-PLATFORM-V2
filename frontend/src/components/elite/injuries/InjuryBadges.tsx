import { memo } from 'react';
import { AlertOctagon, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { InjurySeverity, InjuryStatus } from '@/types/transfersInjuries.types';

// ─── Severity badge — small coloured pill (Transfermarkt-style) ──────────────

const SEVERITY_STYLES: Record<InjurySeverity, { label: string; classes: string }> = {
  SEVERE:   { label: 'Grave',   classes: 'bg-destructive/12 text-destructive border-destructive/30' },
  MODERATE: { label: 'Modérée', classes: 'bg-draw/12 text-draw border-draw/30' },
  MINOR:    { label: 'Légère',  classes: 'bg-primary-glow/12 text-primary-glow border-primary-glow/30' },
};

export const InjurySeverityBadge = memo(({ severity }: { severity: InjurySeverity }) => {
  const s = SEVERITY_STYLES[severity];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.classes}`}>
      {s.label}
    </span>
  );
});
InjurySeverityBadge.displayName = 'InjurySeverityBadge';

// ─── Status badge — availability state (Sofascore-style team-news chip) ──────

const STATUS_STYLES: Record<InjuryStatus, { label: string; classes: string; icon: React.FC<{ className?: string }> }> = {
  ACTIVE:     { label: 'Forfait',       classes: 'bg-destructive/15 text-destructive', icon: AlertOctagon },
  RECOVERING: { label: 'Réathlétisation', classes: 'bg-draw/15 text-draw',             icon: TrendingUp },
  CLEARED:    { label: 'Rétabli',       classes: 'bg-primary-glow/15 text-primary-glow', icon: CheckCircle2 },
};

export const InjuryStatusBadge = memo(({ status, size = 'md' }: { status: InjuryStatus; size?: 'sm' | 'md' }) => {
  const s = STATUS_STYLES[status];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${s.classes} ${
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {s.label}
    </span>
  );
});
InjuryStatusBadge.displayName = 'InjuryStatusBadge';

// ─── Body-part icon chip ──────────────────────────────────────────────────────

export const InjuryBodyPartIcon = memo(({ className = '' }: { className?: string }) => (
  <AlertTriangle className={className} />
));
InjuryBodyPartIcon.displayName = 'InjuryBodyPartIcon';
