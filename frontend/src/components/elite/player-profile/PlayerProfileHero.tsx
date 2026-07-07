import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Ruler, Weight, Footprints,
  TrendingUp, Star,
} from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import { clubs } from '@/components/elite/data';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { PlayerAvatar } from '@/components/elite/PlayerAvatar';
import { RatingBadge } from '@/components/elite/stats/RatingBadge';
import { computeRating } from '@/lib/statsRating';
import { flagFor, shade } from '@/lib/playerVisuals';
import { formatFcfa, POSITION_LABEL } from '@/data/playerProfile.mock';

const POSITION_COLOR: Record<string, string> = {
  GK: '#FCD116', DF: '#3B82F6', MF: '#22C55E', FW: '#EF4444', ALL: '#A78BFA',
};

function computeAge(birthDate?: string, fallback?: number): number | undefined {
  if (!birthDate) return fallback;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

interface Props {
  player: PlayerProfile;
}

export function PlayerProfileHero({ player }: Props) {
  const club = clubs[player.clubId];
  const rating = computeRating(player);
  const age = computeAge(player.birthDate, player.age);
  const posColor = POSITION_COLOR[player.position] ?? '#FCD116';

  const stats = [
    { label: 'Matchs', value: player.appearances },
    { label: 'Buts', value: player.goals },
    { label: 'Passes D.', value: player.assists },
    { label: 'Minutes', value: player.minutesPlayed.toLocaleString('fr-FR') },
  ];

  return (
    <div
      className="relative overflow-hidden border-b border-border/40 pt-10 pb-8 sm:pt-14 sm:pb-10"
      style={{
        background: `linear-gradient(150deg, ${shade(club?.color ?? posColor, -0.72)} 0%, ${shade(club?.color ?? posColor, -0.5)} 45%, hsl(168 45% 8%) 100%)`,
      }}
    >
      {/* Ambient club-colour glow */}
      <div
        className="absolute inset-0 opacity-[0.18] blur-[130px] pointer-events-none"
        style={{ background: `radial-gradient(circle at 18% 15%, ${club?.color ?? posColor}, transparent 65%)` }}
      />
      <div
        className="absolute inset-0 opacity-10 blur-[130px] pointer-events-none"
        style={{ background: `radial-gradient(circle at 85% 80%, ${posColor}, transparent 60%)` }}
      />
      {/* Faint pitch-line texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:24px_24px]" />
      {/* Giant watermark jersey number */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 font-display italic font-black text-[220px] sm:text-[300px] leading-none text-white/[0.05] select-none pointer-events-none hidden sm:block">
        {player.jerseyNumber}
      </div>

      <div className="container relative z-10">
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-6 uppercase tracking-wider font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux joueurs
        </Link>

        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative shrink-0"
          >
            <div
              className="absolute -inset-3 rounded-full blur-2xl opacity-40"
              style={{ background: `radial-gradient(circle, ${posColor}, transparent 70%)` }}
            />
            <PlayerAvatar
              name={player.playerName}
              photoUrl={player.photoUrl}
              size={148}
              ring={posColor}
              className="relative text-4xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] ring-4 ring-white/[0.06]"
            />
            <div
              className="absolute -bottom-1 -right-1 h-11 w-11 rounded-2xl grid place-items-center font-display font-black text-base shadow-lg border-2 border-background"
              style={{ background: posColor, color: '#0B2B18' }}
              title="Numéro de maillot"
            >
              {player.jerseyNumber}
            </div>
          </motion.div>

          {/* Identity */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-center lg:text-left space-y-3 min-w-0"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
                style={{ background: `${posColor}18`, color: posColor, borderColor: `${posColor}40` }}
              >
                {POSITION_LABEL[player.position]}
              </span>
              {player.nickname && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 uppercase tracking-wider">
                  « {player.nickname} »
                </span>
              )}
              {player.nationality && (
                <span className="text-xs text-white/60 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                  <span className="text-sm leading-none">{flagFor(player.nationality)}</span> {player.nationality}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[0.98] break-words">
              {player.playerName}
            </h1>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {club && (
                <Link to={`/clubs/${club.id}`} className="flex items-center gap-2 hover:text-white transition-colors group">
                  <ClubBadge club={club} size={22} />
                  <span className="font-semibold text-foreground/90 group-hover:text-white">{club.name}</span>
                </Link>
              )}
              {age !== undefined && (
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {age} ans</span>
              )}
              {player.birthPlace && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {player.birthPlace}</span>
              )}
              <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {player.heightCm} cm</span>
              <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" /> {player.weightKg} kg</span>
              <span className="flex items-center gap-1"><Footprints className="h-3.5 w-3.5" /> Pied {player.preferredFoot.toLowerCase()}</span>
            </div>
          </motion.div>

          {/* Market value + rating */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-3 shrink-0"
          >
            <div className="text-center lg:text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1 justify-center lg:justify-end mb-1">
                <TrendingUp className="h-3 w-3" /> Valeur marchande
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-[#FCD116] tabular-nums">
                {formatFcfa(player.marketValueFcfa)}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
              <Star className="h-3.5 w-3.5 text-[#FCD116]" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Note</span>
              <RatingBadge rating={rating} size="md" />
            </div>
          </motion.div>
        </div>

        {/* Quick stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-9"
        >
          {stats.map(s => (
            <div
              key={s.label}
              className="bg-gradient-card border border-border rounded-2xl px-4 py-3.5 text-center sm:text-left hover:border-white/20 transition-colors"
            >
              <div className="font-display text-2xl sm:text-3xl text-foreground tabular-nums leading-none">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
