import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import type { TransferRecord } from '@/types/transfersInjuries.types';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { PlayerAvatar } from '@/components/elite/PlayerAvatar';
import { formatFee, formatDateShort } from '@/utils/transfersInjuries.utils';
import { TransferKindBadge, TransferStageBadge } from './TransferBadges';
import { ConfidenceMeter } from './ConfidenceMeter';

const FREE_AGENT_CLUB = { id: 'free', name: 'Agent libre', short: 'FA', color: '#6B7280', city: '' };

export const TransferCard = memo(({ transfer, index = 0 }: { transfer: TransferRecord; index?: number }) => {
  const fromClub = transfer.fromClub ?? FREE_AGENT_CLUB;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03 }}
      className="p-4 sm:p-5 hover:bg-surface-elevated/40 transition-colors"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <PlayerAvatar name={transfer.playerName} photoUrl={transfer.playerPhotoUrl} size={44} ring={transfer.toClub.color} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to={`/players/${transfer.playerId}`}
              className="font-semibold text-sm sm:text-[15px] truncate hover:text-accent transition-colors"
            >
              {transfer.playerName}
            </Link>
            <span className="text-[11px] text-muted-foreground/60">{transfer.age} ans</span>
            <TransferStageBadge stage={transfer.stage} />
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ClubBadge club={fromClub} size={18} />
              <span>{fromClub.short}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-accent shrink-0" />
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <ClubBadge club={transfer.toClub} size={18} />
              <span>{transfer.toClub.short}</span>
            </div>
            <TransferKindBadge kind={transfer.kind} />
          </div>

          {transfer.quote && (
            <div className="flex items-start gap-1.5 mt-2.5 text-xs text-foreground/70">
              <Quote className="h-3 w-3 mt-0.5 text-muted-foreground/40 shrink-0" />
              <span className="italic">{transfer.quote}</span>
            </div>
          )}

          {transfer.stage !== 'CONFIRMED' && (
            <div className="mt-2.5">
              <ConfidenceMeter level={transfer.confidence} />
            </div>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 text-right">
          <span className="font-display text-sm text-accent">{formatFee(transfer.fee)}</span>
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            {formatDateShort(transfer.transferDate)}
          </span>
          {transfer.source && (
            <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">{transfer.source}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
TransferCard.displayName = 'TransferCard';
