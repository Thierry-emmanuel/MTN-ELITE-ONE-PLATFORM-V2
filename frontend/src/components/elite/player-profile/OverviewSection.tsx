import { Link } from 'react-router-dom';
import {
  User, Quote, Cake, MapPin, Ruler, Weight, Footprints, FileSignature,
  Briefcase, Flag, Shield, ArrowRight, Sparkles, ShieldAlert,
} from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import { clubs } from '@/components/elite/data';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

// Position → normalized (x%, y%) on a vertical pitch, goal at top
const POSITION_ZONES: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 8 }, DF: { x: 50, y: 30 }, MF: { x: 50, y: 55 }, FW: { x: 50, y: 82 }, ALL: { x: 50, y: 50 },
};

function PositionPitch({ position }: { position: string }) {
  const zone = POSITION_ZONES[position] ?? POSITION_ZONES.MF;
  return (
    <div className="relative w-full aspect-[3/4] max-w-[180px] mx-auto rounded-xl overflow-hidden border border-white/10 bg-[hsl(160,45%,10%)]">
      <svg viewBox="0 0 100 133" className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="129" fill="none" stroke="white" strokeWidth="0.6" />
        <line x1="2" y1="66.5" x2="98" y2="66.5" stroke="white" strokeWidth="0.6" />
        <circle cx="50" cy="66.5" r="10" fill="none" stroke="white" strokeWidth="0.6" />
        <rect x="22" y="2" width="56" height="18" fill="none" stroke="white" strokeWidth="0.6" />
        <rect x="22" y="113" width="56" height="18" fill="none" stroke="white" strokeWidth="0.6" />
      </svg>
      <div
        className="absolute h-4 w-4 rounded-full bg-accent shadow-[0_0_0_5px_rgba(252,209,22,0.2)] -translate-x-1/2 -translate-y-1/2 animate-pulse"
        style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
      />
    </div>
  );
}

export function OverviewSection({ player }: Props) {
  const club = clubs[player.clubId];
  const sinceYear = new Date(player.sinceClubDate).getFullYear();

  return (
    <section id="apercu" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={User} title="Aperçu" subtitle="Biographie, profil physique et informations contractuelles" />

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Bio + strengths */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-gradient-card border border-border rounded-2xl p-6 relative overflow-hidden">
              <Quote className="absolute top-4 right-5 h-10 w-10 text-white/[0.04]" />
              <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/85 relative z-10">
                {player.bio}
              </p>

              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/[0.06]">
                {player.strengthTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-primary-glow/12 text-primary-glow border border-primary-glow/25"
                  >
                    <Sparkles className="h-3 w-3" /> {tag}
                  </span>
                ))}
                {player.weaknessTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-white/[0.04] text-muted-foreground border border-white/10"
                  >
                    <ShieldAlert className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card border border-border rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Informations clés</h3>
              <div className="grid sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <InfoRow icon={Cake} label="Date de naissance" value={player.birthDate ? new Date(player.birthDate).toLocaleDateString('fr-FR') : '—'} />
                  <InfoRow icon={MapPin} label="Lieu de naissance" value={player.birthPlace ?? '—'} />
                  <InfoRow icon={Flag} label="Nationalité" value={player.nationality ?? 'Cameroun'} />
                  <InfoRow icon={Ruler} label="Taille" value={`${player.heightCm} cm`} />
                </div>
                <div>
                  <InfoRow icon={Weight} label="Poids" value={`${player.weightKg} kg`} />
                  <InfoRow icon={Footprints} label="Pied fort" value={player.preferredFoot} />
                  <InfoRow icon={FileSignature} label="Contrat jusqu'en" value={new Date(player.contractExpiry).getFullYear().toString()} />
                  <InfoRow icon={Briefcase} label="Agent" value={player.agentName ?? 'Non renseigné'} />
                </div>
              </div>
            </div>
          </div>

          {/* Club + position */}
          <div className="space-y-5">
            {club && (
              <div className="bg-gradient-card border border-border rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Club actuel
                </h3>
                <div className="flex items-center gap-3">
                  <ClubBadge club={club} size={48} />
                  <div className="min-w-0">
                    <div className="font-display text-base font-bold text-foreground truncate">{club.name}</div>
                    <div className="text-xs text-muted-foreground">{club.city} · depuis {sinceYear}</div>
                  </div>
                </div>
                <Link
                  to={`/clubs/${club.id}`}
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:text-accent/80 transition-colors bg-accent/10 hover:bg-accent/15 rounded-xl py-2.5"
                >
                  Voir le club <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="bg-gradient-card border border-border rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Position préférée</h3>
              <PositionPitch position={player.position} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
