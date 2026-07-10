import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookMarked, GraduationCap, PlayCircle, Shield, Star, Flag, Globe2, Flame, Crown, Lock,
} from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type { PassportStamp, StampCategory, StampTier } from '@/types/passport.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClubBadge } from '@/components/elite/ClubBadge';

interface Props {
  player: PlayerProfile;
  stamps: PassportStamp[];
  passportNumber: string;
  issueDate: string;
  motto: string;
}

const CATEGORY_META: Record<StampCategory, { icon: any; label: string }> = {
  formation: { icon: GraduationCap, label: 'Formation' },
  debut: { icon: PlayCircle, label: 'Débuts' },
  club: { icon: Shield, label: 'Club' },
  individual: { icon: Star, label: 'Individuel' },
  national: { icon: Flag, label: 'National' },
  continental: { icon: Globe2, label: 'Continental' },
  record: { icon: Flame, label: 'Record' },
  legacy: { icon: Crown, label: 'Légende' },
};

const TIER_STYLE: Record<StampTier, { ring: string; glow: string; text: string; label: string }> = {
  bronze:    { ring: '#B08D57', glow: 'rgba(176,141,87,0.35)',  text: '#D9B98A', label: 'Bronze' },
  silver:    { ring: '#B8C4CE', glow: 'rgba(184,196,206,0.35)', text: '#D7E0E6', label: 'Argent' },
  gold:      { ring: '#f59e0b', glow: 'rgba(245,158,11,0.4)',   text: '#FBBF24', label: 'Or' },
  legendary: { ring: '#22C55E', glow: 'rgba(34,197,94,0.45)',   text: '#4ADE80', label: 'Légendaire' },
};

function StampGlyph({ stamp }: { stamp: PassportStamp }) {
  const meta = CATEGORY_META[stamp.category];
  const Icon = stamp.unlocked ? meta.icon : Lock;
  const tier = TIER_STYLE[stamp.tier];

  return (
    <div
      className="relative h-16 w-16 sm:h-[68px] sm:w-[68px] shrink-0 rounded-full grid place-items-center"
      style={{
        background: stamp.unlocked
          ? `radial-gradient(circle at 35% 30%, ${tier.glow}, transparent 70%), hsl(168 35% 15%)`
          : 'hsl(168 25% 13%)',
        border: `2px ${stamp.unlocked ? 'solid' : 'dashed'} ${stamp.unlocked ? tier.ring : 'hsl(168 20% 28%)'}`,
        boxShadow: stamp.unlocked ? `0 0 22px ${tier.glow}` : 'none',
      }}
    >
      <Icon className="h-6 w-6" style={{ color: stamp.unlocked ? tier.ring : 'hsl(168 15% 40%)' }} strokeWidth={stamp.unlocked ? 2 : 1.75} />
      {/* stitched-edge ring for the "stamp" feel */}
      <div
        className="absolute inset-[3px] rounded-full pointer-events-none"
        style={{ border: stamp.unlocked ? `1px dotted ${tier.ring}66` : 'none' }}
      />
    </div>
  );
}

export function PassportStampsSection({ player, stamps, passportNumber, issueDate, motto }: Props) {
  const [active, setActive] = useState<PassportStamp | null>(null);
  const unlockedCount = stamps.filter(s => s.unlocked).length;

  return (
    <section id="passeport" className="scroll-mt-32 py-12 sm:py-16 border-b border-border/30 relative overflow-hidden">
      {/* ambient texture */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="container relative z-10">
        {/* Passport header — official document feel */}
        <div className="rounded-3xl border border-accent/25 bg-gradient-card overflow-hidden mb-8 sm:mb-10">
          <div
            className="px-6 sm:px-10 py-8 sm:py-10 relative"
            style={{ background: 'linear-gradient(135deg, hsl(168 45% 9%) 0%, hsl(168 40% 13%) 60%, hsl(153 60% 15%) 100%)' }}
          >
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(120deg,transparent_40%,white_50%,transparent_60%)] bg-[length:200%_200%]" />
            <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-accent/90 mb-3">
                  <BookMarked className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Passeport Football Officiel</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-wide leading-[1.05]">
                  {player.playerName}
                </h2>
                <p className="text-xs text-muted-foreground mt-2 max-w-md italic">"{motto}"</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">N° Passeport</div>
                <div className="font-display text-base font-bold text-accent tabular-nums">{passportNumber}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">Délivré le</div>
                <div className="text-sm text-foreground/80 tabular-nums">{new Date(issueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 relative z-10">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.round((unlockedCount / stamps.length) * 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--gradient-gold)' }}
                />
              </div>
              <span className="text-xs font-bold text-foreground/80 tabular-nums shrink-0">
                {unlockedCount}/{stamps.length} tampons
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Tampons de Carrière</h3>
            <p className="text-xs text-muted-foreground mt-1">Chaque étape franchie devient un tampon. Le passeport grandit à chaque saison.</p>
          </div>
        </div>

        {/* Stamp grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stamps.map((stamp, i) => {
            const tier = TIER_STYLE[stamp.tier];
            return (
              <motion.button
                key={stamp.id}
                onClick={() => setActive(stamp)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 8) * 0.045, ease: [0.22, 1, 0.36, 1] }}
                className={`group text-left flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                  stamp.unlocked
                    ? 'bg-gradient-card border-border hover:border-white/25 hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-white/[0.015] border-border/40 cursor-default'
                }`}
              >
                <StampGlyph stamp={stamp} />
                <div className="min-w-0">
                  <div className={`text-xs font-bold leading-tight ${stamp.unlocked ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                    {stamp.unlocked ? stamp.title : 'Verrouillé'}
                  </div>
                  {stamp.unlocked ? (
                    <>
                      <div className="text-[10px] text-muted-foreground mt-1">{CATEGORY_META[stamp.category].label}</div>
                      <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: `${tier.ring}18`, color: tier.text }}>
                        {tier.label}
                      </span>
                    </>
                  ) : (
                    <div className="text-[10px] text-muted-foreground/50 mt-1">Milestone à venir</div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={o => !o && setActive(null)}>
        <DialogContent className="max-w-md bg-gradient-card border-border">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <StampGlyph stamp={active} />
                  <div>
                    <DialogTitle className="font-display text-lg uppercase tracking-wide">{active.title}</DialogTitle>
                    {active.date && (
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {new Date(active.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
                <DialogDescription className="text-sm text-foreground/80 leading-relaxed pt-2">
                  {active.story}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: `${TIER_STYLE[active.tier].ring}18`, color: TIER_STYLE[active.tier].text }}>
                  Tampon {TIER_STYLE[active.tier].label}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/[0.06] text-foreground/70">
                  {CATEGORY_META[active.category].label}
                </span>
                {active.club && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/[0.06] text-foreground/70">
                    <ClubBadge club={active.club} size={14} /> {active.club.short}
                  </span>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
