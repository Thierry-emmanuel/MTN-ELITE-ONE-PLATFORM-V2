import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { useTeamOfWeek } from '@/hooks/useAwards';
import { FormationPitch } from '@/components/elite/awards/FormationPitch';

export default function TeamOfWeekPage() {
  const { data: tow, isLoading } = useTeamOfWeek();

  if (isLoading || !tow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⚽</div>
          <p className="text-muted-foreground/50">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-xl mx-auto">
        {/* Back */}
        <Link to="/awards" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Retour aux récompenses
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-accent" fill="currentColor" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Équipe de la semaine</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">{tow.period}</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {tow.players.length} joueurs · Formation {tow.formation}
          </p>
        </motion.div>

        {/* Pitch */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <FormationPitch teamOfWeek={tow} />
        </motion.div>

        {/* Player list below pitch */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-2"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Composition</p>
          {['GK','DEF','MID','FWD'].map(pos => {
            const players = tow.players.filter(p => p.position === pos);
            if (players.length === 0) return null;
            const posLabel = pos === 'GK' ? 'Gardien' : pos === 'DEF' ? 'Défenseurs' : pos === 'MID' ? 'Milieux' : 'Attaquants';
            return (
              <div key={pos}>
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider px-1 mb-1">{posLabel}</p>
                {players.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-muted-foreground/70 shrink-0">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground/90 truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground/50 truncate">{p.clubName}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 text-[#FCD116]" fill="currentColor" />
                      <span className="text-sm font-display font-bold text-[#FCD116] tabular-nums">{p.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-display text-sm tabular-nums text-foreground/80">{p.highlightStat.value}</p>
                      <p className="text-[9px] text-muted-foreground/40 uppercase">{p.highlightStat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}