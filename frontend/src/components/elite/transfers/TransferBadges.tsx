import { memo } from 'react';
import { Repeat, Gift, ArrowLeftRight, RotateCcw, BadgeCheck, MessagesSquare, Radio, XCircle } from 'lucide-react';
import type { TransferKind, TransferStage } from '@/types/transfersInjuries.types';

const KIND_STYLES: Record<TransferKind, { label: string; classes: string; icon: React.FC<{ className?: string }> }> = {
  PERMANENT:        { label: 'Définitif',      classes: 'bg-primary/15 text-primary-glow', icon: ArrowLeftRight },
  LOAN:              { label: 'Prêt',           classes: 'bg-accent/15 text-accent',         icon: Repeat },
  FREE:              { label: 'Libre',          classes: 'bg-white/8 text-foreground/80',    icon: Gift },
  RETURN_FROM_LOAN:  { label: 'Fin de prêt',    classes: 'bg-white/8 text-muted-foreground',  icon: RotateCcw },
};

export const TransferKindBadge = memo(({ kind }: { kind: TransferKind }) => {
  const s = KIND_STYLES[kind];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${s.classes}`}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
});
TransferKindBadge.displayName = 'TransferKindBadge';

const STAGE_STYLES: Record<TransferStage, { label: string; classes: string; icon: React.FC<{ className?: string }> }> = {
  CONFIRMED: { label: 'Officiel',    classes: 'bg-primary-glow/15 text-primary-glow border-primary-glow/30', icon: BadgeCheck },
  IN_TALKS:  { label: 'En négociation', classes: 'bg-draw/15 text-draw border-draw/30',                       icon: MessagesSquare },
  RUMOR:     { label: 'Rumeur',      classes: 'bg-white/8 text-muted-foreground border-border',               icon: Radio },
  REJECTED:  { label: 'Refusé',      classes: 'bg-destructive/12 text-destructive border-destructive/30',     icon: XCircle },
};

export const TransferStageBadge = memo(({ stage }: { stage: TransferStage }) => {
  const s = STAGE_STYLES[stage];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${s.classes}`}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
});
TransferStageBadge.displayName = 'TransferStageBadge';
