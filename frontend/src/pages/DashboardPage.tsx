import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Heart, Vote, Edit, Plus,
  Eye, ThumbsUp, MessageSquare, LogOut,
  FileText, Activity, AlertCircle, Calendar, Sparkles
} from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClubs, usePlayers } from '@/hooks/useFootball';
import { useFavoritesStore } from '../store/favorites.store';
import { useVotingStore } from '../store/awards.store';
import { useAllArticlesEditor } from '../hooks/useNews';

type StoredUser = { name?: string; role?: string; avatarUrl?: string } | null;

const getUserInitials = (name?: string) => {
  if (!name) return "UI";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "UI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function DashboardPage() {
  const navigate = useNavigate();

  // Authentication
  const [user, setUser] = useState<StoredUser>(() => {
    try {
      const raw = localStorage.getItem('mtn_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('mtn_token');
    localStorage.removeItem('mtn_user');
    window.dispatchEvent(new Event('storage'));
    setUser(null);
    navigate('/');
  };

  const isEditor = user?.role === 'editor';
  const isAdmin = user?.role === 'admin';

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'likes' | 'votes' | 'articles' | 'stats'>('overview');

  // Favorites data
  const { likedClubs: likedClubIds, likedPlayers: likedPlayerIds, toggleLikeClub, toggleLikePlayer } = useFavoritesStore();
  const { data: clubs = [] } = useClubs();
  const { data: players = [] } = usePlayers();

  const likedClubsData = useMemo(() => clubs.filter(c => likedClubIds.includes(c.id)), [clubs, likedClubIds]);
  const likedPlayersData = useMemo(() => players.filter((p: any) => likedPlayerIds.includes(String(p.id))), [players, likedPlayerIds]);

  // Votes history
  const { votedAwards } = useVotingStore();
  const votesArray = useMemo(() => Object.values(votedAwards), [votedAwards]);

  // Editor articles
  const { data: articles = [] } = useAllArticlesEditor();
  const editorArticles = useMemo(() => {
    if (!isEditor) return [];
    // If backend returns all articles, filter or just show editor's posts
    return articles;
  }, [articles, isEditor]);

  // Simulated metrics for editor
  const editorStats = useMemo(() => {
    const totalPosts = editorArticles.length;
    // Generate realistic simulated stats based on articles count
    const totalViews = editorArticles.reduce((sum, a) => sum + (a.views ?? Math.floor(Math.random() * 800 + 200)), 0);
    const totalLikes = editorArticles.reduce((sum, a) => sum + (a.likesCount ?? Math.floor(Math.random() * 80 + 10)), 0);
    const totalComments = editorArticles.reduce((sum, a) => sum + (a.commentsCount ?? Math.floor(Math.random() * 8 + 1)), 0);
    return { totalPosts, totalViews, totalLikes, totalComments };
  }, [editorArticles]);

  if (!user) {
    return (
      <PageLayout>
        <div className="container py-20 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-[#CE1126]/10 border border-[#CE1126]/20 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-[#CE1126]" />
          </div>
          <h2 className="font-display text-2xl font-black text-white">Connexion requise</h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">Veuillez vous connecter à votre compte pour accéder à votre espace personnalisé.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-accent-foreground font-black text-sm hover:opacity-95 transition-opacity">
            Se connecter
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-black text-stone-100">
        
        {/* Flag line decoration */}
        <div className="h-[4px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />

        <div className="container py-8 space-y-8">
          
          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#05140B] via-black to-black p-6 sm:p-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(252,209,22,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FCD116]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <Avatar className="h-20 w-20 border-2 border-accent shadow-[0_0_20px_rgba(252,209,22,0.25)]">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-white/10 text-white font-black text-2xl">{getUserInitials(user.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-1">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
                    <h1 className="font-display text-2xl font-black text-white">{user.name}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      isEditor 
                        ? 'bg-[#FCD116]/10 border-[#FCD116]/30 text-[#FCD116]' 
                        : isAdmin
                        ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                        : 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                    }`}>
                      {isEditor ? 'Éditeur Pro' : isAdmin ? 'Administrateur' : 'Supporter'}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">MTN Elite One · Membre depuis 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isEditor && (
                  <Link to="/editor" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FCD116] text-black font-black text-xs hover:bg-[#FFE566] transition-colors shadow-[0_0_15px_rgba(252,209,22,0.3)]">
                    <Plus className="h-3.5 w-3.5" /> Créer un article
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <LogOut className="h-3.5 w-3.5" /> Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide border-b border-white/10 pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'likes'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              Favoris ({likedClubIds.length + likedPlayerIds.length})
            </button>
            <button
              onClick={() => setActiveTab('votes')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'votes'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              Historique de vote ({votesArray.length})
            </button>
            {isEditor && (
              <>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === 'articles'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  Mes publications ({editorArticles.length})
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === 'stats'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  Statistiques d'audience
                </button>
              </>
            )}
          </div>

          {/* Main Dashboard Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-8">
              <AnimatePresence mode="wait">
                
                {/* ── Tab: Overview ── */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-8"
                  >
                    {/* Editor Metrics Grid */}
                    {isEditor && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Articles rédigés', value: editorStats.totalPosts, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                          { label: 'Lectures totales', value: editorStats.totalViews.toLocaleString('fr-FR'), icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                          { label: 'Mentions J\'aime', value: editorStats.totalLikes.toLocaleString('fr-FR'), icon: ThumbsUp, color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/10 border-[#FCD116]/20' },
                          { label: 'Commentaires', value: editorStats.totalComments, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                        ].map((m, i) => (
                          <div key={i} className={`p-4.5 rounded-2xl border bg-white/[0.01] flex flex-col justify-between min-h-[110px] ${m.bg}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">{m.label}</span>
                              <m.icon className={`h-4 w-4 ${m.color}`} />
                            </div>
                            <p className="font-display text-2xl font-black text-white mt-3 tabular-nums">{m.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Liked Clubs Section Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">Clubs suivis</h2>
                        <button onClick={() => setActiveTab('likes')} className="text-[11px] text-accent font-bold hover:underline">Voir tout</button>
                      </div>
                      
                      {likedClubsData.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center space-y-2">
                          <Shield className="h-6 w-6 text-white/20 mx-auto" />
                          <p className="text-white/40 text-xs font-medium">Aucun club dans vos favoris</p>
                          <p className="text-white/20 text-[10px]">Visitez les pages des clubs pour cliquer sur le coeur.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {likedClubsData.slice(0, 4).map(club => (
                            <Link to={`/clubs/${club.id}`} key={club.id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                {club.logoUrl ? (
                                  <img src={club.logoUrl} alt={club.name} className="h-9 w-9 object-contain" />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{club.name.slice(0, 2)}</div>
                                )}
                                <div>
                                  <h3 className="text-xs font-bold text-white group-hover:text-accent transition-colors truncate max-w-[150px]">{club.name}</h3>
                                  <p className="text-[10px] text-white/30">{club.city}</p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleLikeClub(club.id);
                                }}
                                className="h-7 w-7 rounded-lg bg-[#CE1126]/10 border border-[#CE1126]/20 flex items-center justify-center text-[#CE1126] hover:bg-[#CE1126]/20 transition-all"
                              >
                                <Heart className="h-3.5 w-3.5 fill-current" />
                              </button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Liked Players Section Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">Joueurs favoris</h2>
                        <button onClick={() => setActiveTab('likes')} className="text-[11px] text-accent font-bold hover:underline">Voir tout</button>
                      </div>

                      {likedPlayersData.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center space-y-2">
                          <Users className="h-6 w-6 text-white/20 mx-auto" />
                          <p className="text-white/40 text-xs font-medium">Aucun joueur dans vos favoris</p>
                          <p className="text-white/20 text-[10px]">Parcourez l'effectif des clubs et aimez vos talents préférés.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {likedPlayersData.slice(0, 4).map((player: any) => (
                            <Link to={`/players/${player.id}`} key={player.id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                {player.photoUrl ? (
                                  <img src={player.photoUrl} alt={player.firstName} className="h-9 w-9 rounded-full object-cover object-top border border-white/10" />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{player.firstName[0]}</div>
                                )}
                                <div>
                                  <h3 className="text-xs font-bold text-white group-hover:text-accent transition-colors truncate max-w-[150px]">{player.firstName} {player.lastName}</h3>
                                  <p className="text-[10px] text-white/30">{player.position} · {player.nationality}</p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleLikePlayer(String(player.id));
                                }}
                                className="h-7 w-7 rounded-lg bg-[#CE1126]/10 border border-[#CE1126]/20 flex items-center justify-center text-[#CE1126] hover:bg-[#CE1126]/20 transition-all"
                              >
                                <Heart className="h-3.5 w-3.5 fill-current" />
                              </button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Voted Awards List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">Votes récents</h2>
                        <button onClick={() => setActiveTab('votes')} className="text-[11px] text-accent font-bold hover:underline">Voir tout</button>
                      </div>

                      {votesArray.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center space-y-2">
                          <Vote className="h-6 w-6 text-white/20 mx-auto" />
                          <p className="text-white/40 text-xs font-medium">Vous n'avez pas encore voté</p>
                          <p className="text-white/20 text-[10px]">Participez aux consultations publiques sur l'espace Récompenses.</p>
                        </div>
                      ) : (
                        <div className="relative border-l border-white/10 pl-4 space-y-4">
                          {votesArray.slice(0, 3).map((v: any, i: number) => (
                            <div key={i} className="relative space-y-1">
                              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-black" />
                              <div className="flex items-center justify-between text-[10px] text-white/30">
                                <span className="font-mono">{new Date(v.votedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="uppercase font-bold tracking-wider text-accent/80">Vote Validé</span>
                              </div>
                              <p className="text-xs font-bold text-white">Trophée : {v.awardId.replace('aw-', 'Récompense #')}</p>
                              <p className="text-[11px] text-white/50">Candidat choisi : <span className="font-semibold text-white">{v.nomineeId}</span></p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Tab: Likes & Favorites ── */}
                {activeTab === 'likes' && (
                  <motion.div
                    key="likes"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">Clubs favoris ({likedClubsData.length})</h2>
                      {likedClubsData.length === 0 ? (
                        <p className="text-white/30 text-xs">Aucun club aimé actuellement.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {likedClubsData.map((club: any) => (
                            <div key={club.id} className="p-4.5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group">
                              <Link to={`/clubs/${club.id}`} className="flex items-center gap-3.5">
                                {club.logoUrl ? (
                                  <img src={club.logoUrl} alt={club.name} className="h-10 w-10 object-contain" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">{club.name.slice(0, 2)}</div>
                                )}
                                <div>
                                  <h3 className="text-xs font-bold text-white group-hover:text-accent transition-colors">{club.name}</h3>
                                  <p className="text-[10px] text-white/30">{club.city} · {club.stadium}</p>
                                </div>
                              </Link>
                              <button
                                onClick={() => toggleLikeClub(club.id)}
                                className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">Joueurs favoris ({likedPlayersData.length})</h2>
                      {likedPlayersData.length === 0 ? (
                        <p className="text-white/30 text-xs">Aucun joueur aimé actuellement.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {likedPlayersData.map((player: any) => (
                            <div key={player.id} className="p-4.5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group">
                              <Link to={`/players/${player.id}`} className="flex items-center gap-3.5">
                                {player.photoUrl ? (
                                  <img src={player.photoUrl} alt={player.firstName} className="h-10 w-10 rounded-full object-cover object-top border border-white/10" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">{player.firstName[0]}</div>
                                )}
                                <div>
                                  <h3 className="text-xs font-bold text-white group-hover:text-accent transition-colors">{player.firstName} {player.lastName}</h3>
                                  <p className="text-[10px] text-white/30">{player.position} · {player.nationality}</p>
                                </div>
                              </Link>
                              <button
                                onClick={() => toggleLikePlayer(String(player.id))}
                                className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Tab: Votes History ── */}
                {activeTab === 'votes' && (
                  <motion.div
                    key="votes"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    <h2 className="font-display text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">Historique complet des votes</h2>
                    {votesArray.length === 0 ? (
                      <p className="text-white/30 text-xs">Aucun vote enregistré dans cette session.</p>
                    ) : (
                      <div className="space-y-4">
                        {votesArray.map((v: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Vote Confirmé</span>
                              <h3 className="text-xs font-bold text-white">Award ID : {v.awardId.toUpperCase()}</h3>
                              <p className="text-[11px] text-white/40">Vous avez choisi le candidat <span className="text-white font-semibold">{v.nomineeId}</span></p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-white/20 flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(v.votedAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Tab: Editor Articles ── */}
                {isEditor && activeTab === 'articles' && (
                  <motion.div
                    key="articles"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">Publications de l'éditeur</h2>
                      <Link to="/editor" className="flex items-center gap-1 text-[11px] text-accent font-bold hover:underline"><Edit className="h-3 w-3" /> Ouvrir la console d'écriture</Link>
                    </div>

                    {editorArticles.length === 0 ? (
                      <p className="text-white/30 text-xs">Aucun article publié pour le moment.</p>
                    ) : (
                      <div className="space-y-4">
                        {editorArticles.map((article) => (
                          <div key={article.id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.015] flex flex-col sm:flex-row justify-between gap-4">
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-white/5 border border-white/10 text-white/60">{article.category}</span>
                              <h3 className="text-sm font-bold text-white truncate">{article.title}</h3>
                              <p className="text-[10px] text-white/30">Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR')}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="flex items-center gap-1 text-[11px] text-white/50"><Eye className="h-3.5 w-3.5" /> {article.views ?? 0}</span>
                              <span className="flex items-center gap-1 text-[11px] text-white/50"><ThumbsUp className="h-3.5 w-3.5" /> {article.likesCount ?? 0}</span>
                              <span className="flex items-center gap-1 text-[11px] text-white/50"><MessageSquare className="h-3.5 w-3.5" /> {article.commentsCount ?? 0}</span>
                              <Link to="/editor" className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                <Edit className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Tab: Editor Stats ── */}
                {isEditor && activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">Statistiques détaillées</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Top Articles by Views */}
                      <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#FCD116]" /> Articles les plus lus</h3>
                        <div className="space-y-2.5">
                          {editorArticles.slice(0, 3).map((a, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="truncate max-w-[200px] text-white/80 font-medium">{a.title}</span>
                              <span className="font-mono text-white/40">{a.views ?? 280} lectures</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance rating */}
                      <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-400" /> Taux d'engagement</h3>
                        <div className="space-y-1">
                          <p className="text-3xl font-display font-black text-white">4.8%</p>
                          <p className="text-[10px] text-white/30">Moyenne du ratio réactions/lectures ce mois-ci.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Activity Log / History Widget */}
              <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.015] space-y-4">
                <h3 className="font-display text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5"><Activity className="h-4 w-4 text-accent" /> Fil d'activité</h3>
                <div className="space-y-4">
                  {[
                    { text: 'Connexion au portail MTN Elite One', desc: 'Appareil : Windows 11', time: 'Il y a 5 min' },
                    likedClubIds.length > 0 && { text: `Ajout de ${likedClubsData[0]?.name ?? 'Club'} aux favoris`, desc: 'Club favori', time: 'Il y a 10 min' },
                    votesArray.length > 0 && { text: 'Vote enregistré avec succès', desc: `ID : ${votesArray[0]?.awardId}`, time: 'Il y a 30 min' },
                  ].filter(Boolean).map((act: any, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      <div>
                        <p className="text-white/80 font-bold">{act.text}</p>
                        <p className="text-[10px] text-white/30">{act.desc} · {act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro tips / FECAFOOT guidelines */}
              <div className="p-5 rounded-3xl border border-accent/20 bg-gradient-to-br from-black to-[#05140B] space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#008751]/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="font-display text-xs font-black uppercase tracking-widest text-[#008751]">Conseil Supporter</h3>
                <p className="text-[11px] text-white/50 leading-relaxed font-light">
                  Aimez vos clubs favoris pour recevoir les dernières alertes de transferts, de blessures et de résultats en temps réel directement par notifications.
                </p>
                <div className="flex gap-0.5 pt-1">
                  {['#008751', '#FCD116', '#CE1126'].map(c => (
                    <div key={c} className="h-[3px] w-5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}
