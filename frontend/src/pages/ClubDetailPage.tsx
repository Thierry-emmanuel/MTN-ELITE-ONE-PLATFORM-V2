import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Shield, Calendar, Users, Trophy, BarChart2,
  ArrowLeft
} from 'lucide-react';
import { useClub, useClubSquad, useClubMatches } from '@/hooks/useFootball';
import { ClubLogo } from '@/components/elite/FootballPrimitives';

type Tab = 'overview' | 'squad' | 'matches' | 'stats' | 'history';

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: club, isLoading: clubLoading } = useClub(id || '');
  const { data: squad, isLoading: squadLoading } = useClubSquad(id || '');
  const { data: matches, isLoading: matchesLoading } = useClubMatches(id || '');

  if (clubLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground mt-4 uppercase tracking-widest">Chargement du club...</span>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Club introuvable</h2>
        <Link to="/clubs" className="text-accent hover:underline mt-2 text-sm flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour aux clubs
        </Link>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: "Vue d'ensemble", icon: <Shield className="h-3.5 w-3.5" /> },
    { id: 'squad', label: "Effectif", icon: <Users className="h-3.5 w-3.5" /> },
    { id: 'matches', label: "Matchs", icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'stats', label: "Stats", icon: <BarChart2 className="h-3.5 w-3.5" /> },
    { id: 'history', label: "Histoire & Palmarès", icon: <Trophy className="h-3.5 w-3.5" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Club Premium Header */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-[hsl(168,45%,8%)] to-background/50 py-12">
        {/* Background glow matching club color */}
        <div
          className="absolute inset-0 opacity-10 blur-[100px] pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${club.color || '#FCD116'}, transparent 70%)`
          }}
        />

        <div className="container relative z-10">
          <Link to="/clubs" className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors mb-6 uppercase tracking-wider font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la liste
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0 h-32 w-32 bg-white/[0.02] border border-white/10 rounded-3xl flex items-center justify-center p-4 shadow-xl">
              <ClubLogo club={club} size={96} />
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider">
                  MTN Elite One
                </span>
                <span className="text-xs text-white/35 font-mono">ID: {club.short}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white leading-none">
                {club.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{club.city}, Cameroun</span>
                <span className="text-white/10">•</span>
                <span>Stade: {club.city === 'Garoua' ? 'Roumdé Adjia' : club.city === 'Yaoundé' ? 'Ahmadou Ahidjo' : 'Stade Municipal'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-border/40 sticky top-[60px] bg-background/95 backdrop-blur z-20">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                    active
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-white/[0.02] text-muted-foreground border border-border/30 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* 1 · OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* General Bio */}
                  <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">A propos du Club</h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {club.name} est l'une des institutions de football les plus respectées du Cameroun. Fondé pour représenter l'excellence et la fierté régionale de {club.city}, le club s'est constamment battu au plus haut niveau de la ligue MTN Elite One, cultivant des talents locaux de classe mondiale.
                    </p>
                  </div>

                  {/* Recent Fixtures / Results Preview */}
                  <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">Dernières Rencontres</h3>
                    {matchesLoading ? (
                      <div className="space-y-3">
                        <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
                        <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
                      </div>
                    ) : !matches || matches.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Aucun match disponible.</p>
                    ) : (
                      <div className="space-y-3">
                        {matches.slice(0, 3).map((m: any, idx: number) => {
                          const isHome = m.homeClub.id === club.id;
                          return (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-border/40 rounded-2xl text-xs hover:border-white/20 transition-all">
                              <span className="text-muted-foreground uppercase font-mono">{m.round ? `J${m.round}` : 'Amical'}</span>
                              <div className="flex items-center gap-3 font-semibold">
                                <span className={isHome ? 'text-accent' : ''}>{m.homeClub.name}</span>
                                <span className="px-2 py-0.5 rounded bg-white/5 text-xs font-mono">
                                  {m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : 'vs'}
                                </span>
                                <span className={!isHome ? 'text-accent' : ''}>{m.awayClub.name}</span>
                              </div>
                              <span className="text-muted-foreground/50">{m.status === 'FT' ? 'Terminé' : 'À venir'}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Info Card */}
                <div className="space-y-6">
                  <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.04] to-transparent p-6 space-y-4">
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider border-b border-border/50 pb-2">Informations Clés</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ville</span>
                        <span className="font-semibold">{club.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stade</span>
                        <span className="font-semibold">{club.city === 'Garoua' ? 'Roumdé Adjia' : 'Ahmadou Ahidjo'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Couleurs</span>
                        <span className="font-semibold flex items-center gap-1.5">
                          <span className="h-3.5 w-3.5 rounded border border-white/20" style={{ backgroundColor: club.color }} />
                          {club.color}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position actuelle</span>
                        <span className="font-semibold text-accent">
                          {club.id === 'cot' ? '1er' : club.id === 'cnk' ? '2e' : 'En lice'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2 · SQUAD TAB */}
            {activeTab === 'squad' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">Liste de l'Effectif</h3>
                {squadLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : !squad || squad.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun joueur répertorié pour ce club.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {squad.map((player: any) => (
                      <Link
                        to={`/players/${player.playerId || player.id}`}
                        key={player.playerId || player.id}
                        className="group flex items-center justify-between p-4 bg-white/[0.02] border border-border/50 rounded-2xl hover:border-white/20 transition-all hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center font-display text-sm font-bold text-accent">
                            {player.position}
                          </div>
                          <div>
                            <div className="text-sm font-bold group-hover:text-accent transition-colors">
                              {player.playerName || player.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              Age: {player.age || '—'} ans · {player.nationality || 'CMR'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white/50 block">Goals</span>
                          <span className="text-sm font-bold text-white">{player.goals ?? 0}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3 · MATCHES TAB */}
            {activeTab === 'matches' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">Calendrier de la Saison</h3>
                {matchesLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-white/5 rounded-xl" />
                    <div className="h-12 bg-white/5 rounded-xl" />
                  </div>
                ) : !matches || matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun match disponible.</p>
                ) : (
                  <div className="grid gap-3">
                    {matches.map((m: any, idx: number) => {
                      const isHome = m.homeClub.id === club.id;
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-border/50 rounded-2xl hover:border-white/25 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground uppercase">J{m.round}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className={isHome ? 'text-accent' : ''}>{m.homeClub.name}</span>
                            <span className="px-3 py-1 rounded-xl bg-white/5 font-mono text-xs">
                              {m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : 'vs'}
                            </span>
                            <span className={!isHome ? 'text-accent' : ''}>{m.awayClub.name}</span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-wide ${m.status === 'LIVE' ? 'text-destructive animate-pulse' : 'text-muted-foreground/60'}`}>
                            {m.status === 'FT' ? 'Terminé' : m.status === 'LIVE' ? 'En direct' : 'À venir'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4 · STATS TAB */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-white/[0.02] border border-border/50 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Buts Marqués</span>
                  <div className="text-3xl font-display font-black text-accent">{club.id === 'cot' ? '38' : club.id === 'cnk' ? '30' : '—'}</div>
                </div>
                <div className="p-5 bg-white/[0.02] border border-border/50 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Buts Encaissés</span>
                  <div className="text-3xl font-display font-black text-white">{club.id === 'cot' ? '16' : club.id === 'cnk' ? '16' : '—'}</div>
                </div>
                <div className="p-5 bg-white/[0.02] border border-border/50 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Clean Sheets</span>
                  <div className="text-3xl font-display font-black text-[#10B981]">{club.id === 'cot' ? '8' : club.id === 'cnk' ? '6' : '—'}</div>
                </div>
                <div className="p-5 bg-white/[0.02] border border-border/50 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Possession Moy.</span>
                  <div className="text-3xl font-display font-black text-white">{club.id === 'cot' ? '54%' : club.id === 'cnk' ? '52%' : '—'}</div>
                </div>
              </div>
            )}

            {/* 5 · HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Histoire & Origines
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Le club est né de la passion locale pour le football camerounais et a grandi pour devenir un emblème de son peuple. À travers les décennies, il a participé à d'immenses campagnes de coupe continentale et a enrichi les sélections nationales de joueurs mythiques.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
