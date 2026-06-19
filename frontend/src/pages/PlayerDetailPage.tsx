import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Shield, Award, BarChart2, User } from 'lucide-react';
import { usePlayer } from '@/hooks/useFootball';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import PageLayout from '@/layout/PageLayout';

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: player, isLoading } = usePlayer(id || '');

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground mt-4 uppercase tracking-widest">Chargement du joueur...</span>
        </div>
      </PageLayout>
    );
  }

  if (!player) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <Shield className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Joueur introuvable</h2>
          <Link to="/players" className="text-accent hover:underline mt-2 text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour aux joueurs
          </Link>
        </div>
      </PageLayout>
    );
  }

  const skillData = [
    { subject: 'Vitesse', A: player.position === 'FW' ? 88 : player.position === 'MF' ? 76 : 60 },
    { subject: 'Tir',     A: player.position === 'FW' ? 86 : player.position === 'MF' ? 70 : 45 },
    { subject: 'Passe',   A: player.position === 'MF' ? 85 : player.position === 'FW' ? 72 : 55 },
    { subject: 'Dribble', A: player.position === 'FW' ? 84 : player.position === 'MF' ? 80 : 50 },
    { subject: 'Défense', A: player.position === 'DF' ? 88 : player.position === 'MF' ? 68 : 35 },
    { subject: 'Physique',A: player.position === 'DF' ? 84 : player.position === 'FW' ? 78 : 74 },
  ];

  return (
    <PageLayout>
      {/* ─── Player Header ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-[hsl(168,45%,8%)] to-background/50 py-12">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_50%,hsl(153_100%_27%/0.08),transparent_65%)] pointer-events-none" />

        <div className="container relative z-10">
          <Link
            to="/players"
            className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors mb-6 uppercase tracking-wider font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la liste
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar — hexagonal feel with icon */}
            <div className="shrink-0 h-32 w-32 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(153_100%_27%/0.15)] to-transparent" />
              <User className="h-16 w-16 text-white/20 relative z-10" strokeWidth={1} />
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

      {/* ─── Body ─────────────────────────────────────────────────────── */}
      <div className="container py-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-accent" />
                Statistiques de Saison
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { label: 'Matches',  value: player.appearances,    color: 'text-white' },
                  { label: 'Minutes',  value: player.minutesPlayed,  color: 'text-white' },
                  { label: 'Buts',     value: player.goals,          color: 'text-accent' },
                  { label: 'Assists',  value: player.assists,        color: 'text-[#10B981]' },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-white/[0.02] border border-border/40 rounded-2xl text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</span>
                    <div className={`text-2xl font-display font-black ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider border-b border-border/55 pb-2">
                Mesures de Performance
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Tirs Totaux (Cadrés)',    value: `${player.shots} (${player.shotsOnTarget})` },
                  { label: 'Buts Attendus (xG)',       value: player.xG || '—' },
                  { label: 'Précision Passes',         value: `${player.passAccuracy || '—'}%` },
                  { label: 'Cartons Jaunes / Rouges',  value: `${player.yellowCards} / ${player.redCards}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold text-white/80">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Radar + Awards */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 flex flex-col items-center">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">
                Profil de Compétences
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name={player.playerName} dataKey="A" stroke="#FCD116" fill="#FCD116" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.04] to-transparent p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider border-b border-border/50 pb-2">
                Récompenses &amp; Distinctions
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <Award className="h-4 w-4 text-accent shrink-0" />
                  <span className="font-bold text-white/80">Nommé Ballon d&apos;Or Cameroun 2025</span>
                </div>
                {player.goals > 8 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Star className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-bold text-white/80">Membre de l&apos;Équipe de la Semaine</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
