import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import type { InjuryRecord } from '@/types/transfersInjuries.types';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { PlayerAvatar } from '@/components/elite/PlayerAvatar';
import { InjurySeverityBadge, InjuryStatusBadge } from './InjuryBadges';
import { RecoveryTimeline } from './RecoveryTimeline';

const POSITION_LABEL: Record<InjuryRecord['position'], string> = {
  GK: 'Gardien', DF: 'Défenseur', MF: 'Milieu', FW: 'Attaquant',
};

export const InjuryRow = memo(({ injury, index = 0 }: { injury: InjuryRecord; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03 }}
    className="group p-4 sm:p-5 hover:bg-surface-elevated/40 transition-colors"
  >
    <div className="flex items-start gap-3 sm:gap-4">
      <PlayerAvatar name={injury.playerName} photoUrl={injury.playerPhotoUrl} size={44} ring={injury.club.color} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to={`/players/${injury.playerId}`}
            className="font-semibold text-sm sm:text-[15px] truncate hover:text-accent transition-colors"
          >
            {injury.playerName}
          </Link>
          <InjuryStatusBadge status={injury.status} size="sm" />
        </div>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <ClubBadge club={injury.club} size={16} />
          <span>{injury.club.short}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{POSITION_LABEL[injury.position]}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-xs text-foreground/80">
          <Stethoscope className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          <span className="truncate">{injury.diagnosis}</span>
        </div>

        <div className="mt-3 max-w-md">
          <RecoveryTimeline
            injuredAt={injury.injuredAt}
            expectedReturn={injury.expectedReturn}
            status={injury.status}
          />
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
        <InjurySeverityBadge severity={injury.severity} />
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
          {injury.gamesMissed} match{injury.gamesMissed > 1 ? 's' : ''} manqué{injury.gamesMissed > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  </motion.div>
));
InjuryRow.displayName = 'InjuryRow';
