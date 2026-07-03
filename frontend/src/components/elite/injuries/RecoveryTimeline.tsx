import { memo } from 'react';
import { motion } from 'framer-motion';
import { recoveryProgress, formatDateShort, daysFromToday } from '@/utils/transfersInjuries.utils';

interface Props {
  injuredAt: string;
  expectedReturn?: string;
  status: 'ACTIVE' | 'RECOVERING' | 'CLEARED';
}

export const RecoveryTimeline = memo(({ injuredAt, expectedReturn, status }: Props) => {
  const progress = status === 'CLEARED' ? 100 : recoveryProgress(injuredAt, expectedReturn);
  const remaining = expectedReturn ? daysFromToday(expectedReturn) : null;

  const barColor =
    status === 'CLEARED' ? 'bg-primary-glow'
    : status === 'RECOVERING' ? 'bg-draw'
    : 'bg-destructive';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
        <span>Blessé le {formatDateShort(injuredAt)}</span>
        <span>
          {status === 'CLEARED'
            ? 'Rétabli'
            : expectedReturn
              ? (remaining !== null && remaining > 0
                  ? `Retour dans ~${remaining} j`
                  : 'Retour imminent')
              : 'Retour à préciser'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress ?? 8}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {expectedReturn && (
        <div className="text-[10px] text-muted-foreground/60 mt-1">
          Reprise estimée · {formatDateShort(expectedReturn)}
        </div>
      )}
    </div>
  );
});
RecoveryTimeline.displayName = 'RecoveryTimeline';
