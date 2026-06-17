import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Star, Trophy, Zap, Users } from 'lucide-react';
import { useTeamOfWeek } from '@/hooks/useAwards';
import { FormationPitch } from '@/components/elite/awards/FormationPitch';

// ─── Position colour map ──────────────────────────────────────────────────────
const POS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  GK:  { bg: 'bg-[#7C3AED]/15 border-[#A78BFA]/30 text-[#A78BFA]', text: 'text-[#A78BFA]', label: 'Gardien'    },
  DEF: { bg: 'bg-[#1F8A4C]/15 border-[#34D399]/30 text-[#34D399]', text: 'text-[#34D399]', label: 'Défenseurs' },
  MID: { bg: 'bg-[#1E3A8A]/15 border-[#60A5FA]/30 text-[#60A5FA]', text: 'text-[#60A5FA]', label: 'Milieux'    },
  FWD: { bg: 'bg-[#CE1126]/15 border-[#F87171]/30 text-[#F87171]', text: 'text-[#F87171]', label: 'Attaquants' },
};

// ─── Player row in composition list ──────────────────────────────────────────
const PlayerListRow = ({ player, index }: { player: any; index: number }) => {
  const col = POS_COLOR[player.position] ?? POS_COLOR.MID;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
    >
      {/* Photo */}
      <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white/5">
        {player.photoUrl
          ? <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover object-top" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-white/40">
              {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
        }
      </div>

      {/* Name + club */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate">
          {player.name}
        </p>
        <p className="text-[10px] text-white/35 truncate">{player.clubName}</p>
      </div>

      {/* Position badge */}
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wide shrink-0 ${col.bg}`}>
        {player.position}
      </span>

      {/* Highlight stat */}
      <div className="text-right shrink-0 ml-1">
        <p className="font-display text-sm tabular-nums text-white/80">{player.highlightStat.value}</p>
        <p className="text-[9px] text-white/30 uppercase">{player.highlightStat.label}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 shrink-0">
        <Star className="h-3 w-3 text-[#FCD116]" fill="currentColor" />
        <span className="text-sm font-display font-bold text-[#FCD116] tabular-nums">{player.rating.toFixed(1)}</span>
      </div>
    </motion.div>
  );
};

// ─── Stats summary strip ──────────────────────────────────────────────────────
const StatsSummary = ({ players }: { players: any[] }) => {
  const avgRating  = (players.reduce((s, p) => s + p.rating, 0) / (players.length || 1)).toFixed(1);
  const topScorer  = [...players].filter(p => p.highlightStat.label === 'Buts').sort((a, b) => Number(b.highlightStat.value) - Number(a.highlightStat.value))[0];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-3 gap-3"
    >
      {[
        { icon: <Star className="h-4 w-4 text-[#FCD116]" fill="currentColor" />, value: avgRating, label: 'Note moy.' },
        { icon: <Users className="h-4 w-4 text-[#34D399]" />,                    value: players.length, label: 'Joueurs' },
        { icon: <Trophy className="h-4 w-4 text-[#FCD116]" />,                   value: topScorer ? topScorer.highlightStat.value : '—', label: 'Top perf.' },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 280 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"
        >
          <div className="flex justify-center mb-1">{s.icon}</div>
          <p className="font-display text-xl font-black text-white/90 tabular-nums">{s.value}</p>
          <p className="text-[9px] text-white/30 uppercase tracking-wide">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ─── Animated hero banner ────────────────────────────────────────────────────
const TeamOfWeekHero = ({ period, formation, totalVotes }: { period: string; formation: string; totalVotes: number }) => (
  <div className="relative rounded-2xl overflow-hidden border border-[#FCD116]/15 bg-[#060606] p-6 mb-6">
    {/* Background glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(252,209,22,0.07)_0%,transparent_65%)] pointer-events-none" />
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/40 to-transparent" />

    {/* Floating particles */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-0.5 w-0.5 rounded-full bg-[#FCD116] pointer-events-none"
        style={{ left: `${15 + Math.random() * 70}%`, top: `${20 + Math.random() * 60}%` }}
        animate={{ opacity: [0, 0.6, 0], y: [0, -20, -40] }}
        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
      />
    ))}

    <div className="relative z-10 flex items-center gap-4">
      <motion.div
        animate={{ y: [0, -8, 0], filter: ['drop-shadow(0 0 12px rgba(252,209,22,0.3))', 'drop-shadow(0 0 30px rgba(252,209,22,0.6))', 'drop-shadow(0 0 12px rgba(252,209,22,0.3))'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-4xl shrink-0"
      >
        🛡️
      </motion.div>
      <div>
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black text-[#FCD116]/60 uppercase tracking-[.2em]"
        >
          Équipe de la semaine
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-2xl font-black text-white"
        >
          {period}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/35 mt-0.5"
        >
          Formation {formation} · {totalVotes.toLocaleString('fr-FR')} votes
        </motion.p>
      </div>
    </div>
  </div>
);

// ─── TeamOfWeekPage ───────────────────────────────────────────────────────────
export default function TeamOfWeekPage() {
  const { data: tow, isLoading } = useTeamOfWeek();

  if (isLoading || !tow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 0 transparent)', 'drop-shadow(0 0 20px rgba(252,209,22,0.5))', 'drop-shadow(0 0 0 transparent)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl text-center"
          >
            ⚽
          </motion.div>
          <motion.p
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="text-white/40 text-sm uppercase tracking-widest"
          >
            Chargement…
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const groupedByPos: Record<string, typeof tow.players> = {};
  tow.players.forEach(p => {
    if (!groupedByPos[p.position]) groupedByPos[p.position] = [];
    groupedByPos[p.position].push(p);
  });

  let rowIndex = 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-xl mx-auto">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/awards" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition-colors group mb-6">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour aux récompenses
          </Link>
        </motion.div>

        {/* Hero */}
        <TeamOfWeekHero period={tow.period} formation={tow.formation} totalVotes={tow.totalVotes} />

        {/* Stats summary */}
        <StatsSummary players={tow.players} />

        {/* Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <FormationPitch teamOfWeek={tow} />
        </motion.div>

        {/* Player list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-[#FCD116]" /> Composition
          </p>

          {['GK', 'DEF', 'MID', 'FWD'].map(pos => {
            const players = groupedByPos[pos];
            if (!players?.length) return null;
            const col = POS_COLOR[pos];

            return (
              <div key={pos} className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${col.text}`}>{col.label}</span>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>
                {players.map(p => {
                  const ri = rowIndex++;
                  return <PlayerListRow key={p.id} player={p} index={ri} />;
                })}
              </div>
            );
          })}
        </motion.div>

        {/* Coach */}
        {tow.coach && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex items-center gap-3 px-3 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]"
          >
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-base">
              📋
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/25 uppercase tracking-wider">Entraîneur</p>
              <p className="text-sm font-bold text-white/90">{tow.coach.name}</p>
              <p className="text-[10px] text-white/35">{tow.coach.clubName}</p>
            </div>
            <Trophy className="h-4 w-4 text-white/15 shrink-0" />
          </motion.div>
        )}
      </div>
    </div>
  );
}