import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Shield, Award, BarChart2 } from 'lucide-react';
import { usePlayer } from '@/hooks/useFootball';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: player, isLoading } = usePlayer(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground mt-4 uppercase tracking-widest">Chargement du joueur...</span>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Joueur introuvable</h2>
        <Link to="/players" className="text-accent hover:underline mt-2 text-sm flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour aux joueurs
        </Link>
      </div>
    );
  }

  // Map mock stats to skills chart representation
  const skillData = [
    { subject: 'Vitesse (PAC)', A: player.position === 'FW' ? 88 : player.position === 'MF' ? 76 : 60 },
    { subject: 'Tir (SHO)', A: player.position === 'FW' ? 86 : player.position === 'MF' ? 70 : 45 },
    { subject: 'Passe (PAS)', A: player.position === 'MF' ? 85 : player.position === 'FW' ? 72 : 55 },
    { subject: 'Dribble (DRI)', A: player.position === 'FW' ? 84 : player.position === 'MF' ? 80 : 50 },
    { subject: 'Défense (DEF)', A: player.position === 'DF' ? 88 : player.position === 'MF' ? 68 : 35 },
    { subject: 'Physique (PHY)', A: player.position === 'DF' ? 84 : player.position === 'FW' ? 78 : 74 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Player Header */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-[hsl(168,45%,8%)] to-background/50 py-12">
        <div className="container relative z-10">
          <Link to="/players" className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors mb-6 uppercase tracking-wider font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la liste
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0 h-32 w-32 bg-white/[0.02] border border-white/10 rounded-3xl flex items-center justify-center text-5xl shadow-xl">
              🦁
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider">
                  {player.position}
                </span>
                <span className="text-xs text-white/35 font-mono">{player.nationality || 'CMR'}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white leading-none">
                {player.playerName}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="font-bold text-accent">{player.clubName}</span>
                <span className="text-white/10">•</span>
                <span>Age: {player.age || '—'} ans</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Detailed Statistics Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-accent" />
                Statistiques de Saison
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-white/[0.02] border border-border/40 rounded-2xl text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Matches</span>
                  <div className="text-2xl font-display font-black text-white">{player.appearances}</div>
                </div>
                <div className="p-4 bg-white/[0.02] border border-border/40 rounded-2xl text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Minutes</span>
                  <div className="text-2xl font-display font-black text-white">{player.minutesPlayed}</div>
                </div>
                <div className="p-4 bg-white/[0.02] border border-border/40 rounded-2xl text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Buts</span>
                  <div className="text-2xl font-display font-black text-accent">{player.goals}</div>
                </div>
                <div className="p-4 bg-white/[0.02] border border-border/40 rounded-2xl text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assists</span>
                  <div className="text-2xl font-display font-black text-[#10B981]">{player.assists}</div>
                </div>
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider border-b border-border/55 pb-2">Mesures de Performance</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tirs Totaux (Cadrés)</span>
                  <span className="font-semibold text-white/80">{player.shots} ({player.shotsOnTarget})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buts Attendus (xG)</span>
                  <span className="font-semibold text-white/80">{player.xG || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Précision Passes</span>
                  <span className="font-semibold text-white/80">{player.passAccuracy || '—'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cartons Jaunes / Rouges</span>
                  <span className="font-semibold text-white/80">{player.yellowCards} / {player.redCards}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Radar Chart */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 flex flex-col items-center">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">Profil de Compétences</h3>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name={player.playerName} dataKey="A" stroke="#FCD116" fill="#FCD116" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Awards & Career */}
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.04] to-transparent p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider border-b border-border/50 pb-2">Récompenses & Distinctions</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="font-bold text-white/80">Nommé Ballon d'Or Cameroun 2025</span>
                </div>
                {player.goals > 8 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="font-bold text-white/80">Membre de l'Équipe de la Semaine</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
