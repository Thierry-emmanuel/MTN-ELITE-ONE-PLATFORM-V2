import { Repeat, ArrowRight, HeartPulse, CalendarClock } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { clubs } from '@/components/elite/data';
import { TransferKindBadge } from '@/components/elite/transfers/TransferBadges';
import { InjurySeverityBadge, InjuryStatusBadge } from '@/components/elite/injuries/InjuryBadges';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

function formatFee(fee?: number): string {
  if (!fee) return 'Non communiqué';
  return `${(fee / 1_000_000).toFixed(fee % 1_000_000 === 0 ? 0 : 1)} M FCFA`;
}

export function TransfersInjuriesSection({ player }: Props) {
  const homeClub = clubs[player.clubId];

  return (
    <section id="transferts" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={Repeat} title="Transferts & Historique médical" subtitle="Mouvements de carrière et suivi des blessures" />

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Transfers */}
          <div className="bg-gradient-card border border-border rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Repeat className="h-3.5 w-3.5" /> Historique des transferts
            </h3>
            <div className="space-y-4">
              {player.transferHistory.map(t => (
                <div key={t.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <TransferKindBadge kind={t.kind} />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t.windowLabel}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {t.fromClub ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <ClubBadge club={t.fromClub} size={26} />
                        <span className="text-xs text-muted-foreground truncate">{t.fromClub.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Centre de formation</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <ClubBadge club={t.toClub} size={26} />
                      <span className="text-xs font-semibold text-foreground truncate">{t.toClub.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                    <span className="text-xs text-muted-foreground">{new Date(t.transferDate).toLocaleDateString('fr-FR')}</span>
                    <span className="text-sm font-display font-bold text-[#FCD116]">{formatFee(t.fee)}</span>
                  </div>
                </div>
              ))}
              {homeClub && (
                <p className="text-[11px] text-muted-foreground/70 italic pt-1">
                  Sous contrat avec {homeClub.name} jusqu'en {new Date(player.contractExpiry).getFullYear()}.
                </p>
              )}
            </div>
          </div>

          {/* Injuries */}
          <div className="bg-gradient-card border border-border rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <HeartPulse className="h-3.5 w-3.5" /> Historique des blessures
            </h3>
            <div className="space-y-3">
              {player.injuryHistory.map(inj => (
                <div key={inj.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">{inj.diagnosis}</span>
                    <InjurySeverityBadge severity={inj.severity} />
                  </div>
                  <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> {new Date(inj.injuredAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-white/15">•</span>
                    <span>{inj.bodyPart}</span>
                    <span className="text-white/15">•</span>
                    <span>{inj.gamesMissed} match{inj.gamesMissed > 1 ? 's' : ''} manqué{inj.gamesMissed > 1 ? 's' : ''}</span>
                  </div>
                  <div className="mt-2.5">
                    <InjuryStatusBadge status={inj.status} size="sm" />
                  </div>
                </div>
              ))}
              {player.injuryHistory.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Aucun antécédent médical significatif recensé.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
