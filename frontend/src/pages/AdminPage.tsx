import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, CalendarDays, BarChart2, Radio,
  Award, Shield, FileText, CheckCircle2, AlertCircle,
  Plus, Edit3, Trash2, GripVertical, Save, ArrowLeftRight, Flame
} from 'lucide-react';
import AdminLayout from '@/layout/AdminLayout';
import {
  AdminCard, SwitchToggle, FormField,
  AdminButton, DashboardStatCard
} from '@/components/ui/AdminUI';
import { layoutApi, HomepageLayout, HeroBanner, Award as AwardType, Match, Article, HallOfFameLegend, TalentProfile } from '@/services/layoutApi';
import { apiClient } from '@/services/api';

const SECTION_LABELS: Record<string, string> = {
  hero: 'Bannière Hero (Dynamic Slideshow)',
  matches: 'Matchs en direct & récents',
  standings: 'Mini-classement & Actualités',
  stats: 'Saison en chiffres (Statistiques globales)',
  explore: 'Raccourcis d\'exploration (Explorer)',
  awards: 'Votes & Trophées (Ballon d\'or, Equipe de la semaine)',
  halloffame: 'Temple de la renommée (Hall of fame)',
  roadtolions: 'En route vers les Lions (Road to Lions)',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Global Metadata
  const [seasons, setSeasons] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    users: 0,
    clubs: 0,
    players: 0,
    matches: 0,
    votes: 0,
    articles: 0,
  });

  // Section Layout
  const [layout, setLayout] = useState<HomepageLayout>({
    section_order: [],
    section_visibility: {},
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Hero Banners
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);

  // Matches
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingMatch, setEditingMatch] = useState<Partial<Match> | null>(null);

  // Awards
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [editingAward, setEditingAward] = useState<Partial<AwardType> | null>(null);
  const [selectedAwardForNominees, setSelectedAwardForNominees] = useState<AwardType | null>(null);
  const [selectedPlayerForNomination, setSelectedPlayerForNomination] = useState<string>('');

  // Articles / News
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

  // Legends (Hall of Fame)
  const [legends, setLegends] = useState<HallOfFameLegend[]>([]);
  const [editingLegend, setEditingLegend] = useState<Partial<HallOfFameLegend> | null>(null);

  // Talents (Road to Lions / Watchlist)
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [editingTalent, setEditingTalent] = useState<Partial<TalentProfile> | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch Meta & Dashboard Data on mount
  useEffect(() => {
    // 1. Fetch metadata
    layoutApi.getSeasons().then(setSeasons).catch(e => console.error(e));
    layoutApi.getClubs().then(res => setClubs(res.data || res)).catch(e => console.error(e));
    layoutApi.getPlayers().then(res => setPlayers(res.data || res)).catch(e => console.error(e));

    // 2. Fetch stats
    apiClient.get('/admin/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error dashboard stats', err));

    // 3. Fetch layout
    layoutApi.getHomepageLayout().then(setLayout).catch(e => console.error(e));

    // 4. Fetch Hero banners
    layoutApi.getHeroBanners().then(setBanners).catch(e => console.error(e));

    // 5. Fetch matches
    layoutApi.getMatches({ limit: 100 }).then(res => setMatches(res.data || res)).catch(e => console.error(e));

    // 6. Fetch awards
    layoutApi.getAwards().then(setAwards).catch(e => console.error(e));

    // 7. Fetch articles
    layoutApi.getArticles({ limit: 100 }).then(res => setArticles(res.data || res)).catch(e => console.error(e));

    // 8. Fetch Hall of Fame
    layoutApi.getHallOfFame().then(setLegends).catch(e => console.error(e));

    // 9. Fetch Talents
    layoutApi.getTalents().then(setTalents).catch(e => console.error(e));
  }, []);

  // Refresh helper
  const refreshStats = () => {
    apiClient.get('/admin/dashboard-stats').then(res => setStats(res.data)).catch(e => console.error(e));
  };

  // ─── Layout Handlers ───
  const handleSaveLayout = async () => {
    try {
      const updated = await layoutApi.updateHomepageLayout(layout);
      setLayout(updated);
      showToast('Structure de la page d\'accueil mise à jour !');
    } catch (e) {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...layout.section_order];
    const item = newOrder.splice(draggedIndex, 1)[0];
    newOrder.splice(index, 0, item);
    setDraggedIndex(index);
    setLayout({ ...layout, section_order: newOrder });
  };
  const handleDragEnd = () => setDraggedIndex(null);
  const toggleSectionVisibility = (section: string) => {
    setLayout(prev => ({
      ...prev,
      section_visibility: { ...prev.section_visibility, [section]: !prev.section_visibility[section] }
    }));
  };

  // ─── Hero CRUD Handlers ───
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title?.fr || !editingBanner.image_url) {
      showToast('Titre (FR) et URL de l\'image sont requis.', 'error');
      return;
    }
    try {
      const payload = {
        title: editingBanner.title as any,
        subtitle: editingBanner.subtitle || { fr: '', en: '' },
        image_url: editingBanner.image_url,
        link_url: editingBanner.link_url || '',
        priority: editingBanner.priority || 0,
        active: editingBanner.active !== false,
        type: editingBanner.type || 'news',
      };
      if (editingBanner._id) {
        const res = await layoutApi.updateHeroBanner(editingBanner._id, payload);
        setBanners(prev => prev.map(b => b._id === res._id ? res : b));
        showToast('Bannière mise à jour.');
      } else {
        const res = await layoutApi.createHeroBanner(payload);
        setBanners(prev => [...prev, res]);
        showToast('Bannière créée.');
      }
      setEditingBanner(null);
    } catch {
      showToast('Erreur lors de l\'enregistrement de la bannière.', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Supprimer cette bannière ?')) return;
    try {
      await layoutApi.deleteHeroBanner(id);
      setBanners(prev => prev.filter(b => b._id !== id));
      showToast('Bannière supprimée.');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  // ─── Match CRUD Handlers ───
  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch?.homeClubId || !editingMatch?.awayClubId || !editingMatch?.seasonId) {
      showToast('Clubs et Saison requis.', 'error');
      return;
    }
    try {
      const payload = {
        homeClubId: editingMatch.homeClubId,
        awayClubId: editingMatch.awayClubId,
        homeScore: editingMatch.homeScore !== undefined ? Number(editingMatch.homeScore) : undefined,
        awayScore: editingMatch.awayScore !== undefined ? Number(editingMatch.awayScore) : undefined,
        status: editingMatch.status || 'SCHEDULED',
        round: Number(editingMatch.round || 1),
        kickoff: editingMatch.kickoff || new Date().toISOString(),
        venue: editingMatch.venue || 'Stade Municipal',
        seasonId: editingMatch.seasonId,
      };
      if (editingMatch.id) {
        const res = await layoutApi.updateMatch(editingMatch.id, payload);
        setMatches(prev => prev.map(m => m.id === res.id ? res : m));
        showToast('Match mis à jour.');
      } else {
        const res = await layoutApi.createMatch(payload);
        setMatches(prev => [...prev, res]);
        showToast('Match programmé.');
      }
      setEditingMatch(null);
      refreshStats();
    } catch {
      showToast('Erreur lors de l\'enregistrement du match.', 'error');
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm('Supprimer ce match ?')) return;
    try {
      await layoutApi.deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
      showToast('Match supprimé.');
      refreshStats();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  // ─── Award CRUD Handlers ───
  const handleSaveAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAward?.category || !editingAward?.seasonId) {
      showToast('Catégorie et Saison requis.', 'error');
      return;
    }
    try {
      const payload = {
        category: editingAward.category,
        periodStart: editingAward.periodStart || new Date().toISOString(),
        periodEnd: editingAward.periodEnd || new Date().toISOString(),
        status: editingAward.status || 'CLOSED',
        seasonId: editingAward.seasonId,
        winnerId: editingAward.winnerId || null,
      };
      if (editingAward.id) {
        const res = await layoutApi.updateAward(editingAward.id, payload);
        setAwards(prev => prev.map(a => a.id === res.id ? res : a));
        showToast('Award mis à jour.');
      } else {
        const res = await layoutApi.createAward(payload);
        setAwards(prev => [...prev, res]);
        showToast('Award créé.');
      }
      setEditingAward(null);
      refreshStats();
    } catch {
      showToast('Erreur lors de l\'enregistrement de l\'award.', 'error');
    }
  };

  const handleDeleteAward = async (id: string) => {
    if (!confirm('Supprimer cet award ?')) return;
    try {
      await layoutApi.deleteAward(id);
      setAwards(prev => prev.filter(a => a.id !== id));
      showToast('Award supprimé.');
      refreshStats();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const handleAddNomination = async () => {
    if (!selectedAwardForNominees || !selectedPlayerForNomination) return;
    try {
      await layoutApi.addNomination(selectedAwardForNominees.id!, { playerId: selectedPlayerForNomination });
      showToast('Nomination ajoutée !');
      // Refresh current award relations
      const updatedAward = await layoutApi.findOne(selectedAwardForNominees.id!);
      setSelectedAwardForNominees(updatedAward);
      setAwards(prev => prev.map(a => a.id === updatedAward.id ? updatedAward : a));
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de la nomination.', 'error');
    }
  };

  const handleDeleteNomination = async (nominationId: string) => {
    if (!selectedAwardForNominees) return;
    try {
      await layoutApi.deleteNomination(selectedAwardForNominees.id!, nominationId);
      showToast('Nomination retirée.');
      const updatedAward = await layoutApi.findOne(selectedAwardForNominees.id!);
      setSelectedAwardForNominees(updatedAward);
      setAwards(prev => prev.map(a => a.id === updatedAward.id ? updatedAward : a));
    } catch {
      showToast('Erreur lors du retrait.', 'error');
    }
  };

  // ─── News CRUD Handlers ───
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.content) {
      showToast('Titre et contenu requis.', 'error');
      return;
    }
    try {
      const payload = {
        title: editingArticle.title,
        summary: editingArticle.summary || '',
        content: editingArticle.content,
        image_url: editingArticle.image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
        category: editingArticle.category || 'NEWS',
        status: editingArticle.status || 'DRAFT',
        featured: editingArticle.featured || false,
      };
      if (editingArticle._id) {
        const res = await layoutApi.updateArticle(editingArticle._id, payload);
        setArticles(prev => prev.map(a => a._id === res._id ? res : a));
        showToast('Article mis à jour.');
      } else {
        const res = await layoutApi.createArticle(payload);
        setArticles(prev => [...prev, res]);
        showToast('Article publié/enregistré.');
      }
      setEditingArticle(null);
      refreshStats();
    } catch {
      showToast('Erreur lors de l\'enregistrement de l\'article.', 'error');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await layoutApi.deleteArticle(id);
      setArticles(prev => prev.filter(a => a._id !== id));
      showToast('Article supprimé.');
      refreshStats();
    } catch {
      showToast('Erreur de suppression.', 'error');
    }
  };

  // ─── Legends CRUD Handlers ───
  const handleSaveLegend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLegend?.name || !editingLegend?.bio?.fr) {
      showToast('Nom et Biographie (FR) requis.', 'error');
      return;
    }
    try {
      const payload = {
        name: editingLegend.name,
        bio: editingLegend.bio as any,
        era: editingLegend.era || '80',
        achievements: editingLegend.achievements || [],
        image_url: editingLegend.image_url || '',
        club_ids: editingLegend.club_ids || [],
      };
      if (editingLegend._id) {
        const res = await layoutApi.updateHallOfFame(editingLegend._id, payload);
        setLegends(prev => prev.map(l => l._id === res._id ? res : l));
        showToast('Légende mise à jour.');
      } else {
        const res = await layoutApi.createHallOfFame(payload);
        setLegends(prev => [...prev, res]);
        showToast('Légende ajoutée au Hall of Fame.');
      }
      setEditingLegend(null);
    } catch {
      showToast('Erreur de sauvegarde.', 'error');
    }
  };

  const handleDeleteLegend = async (id: string) => {
    if (!confirm('Supprimer cette légende ?')) return;
    try {
      await layoutApi.deleteHallOfFame(id);
      setLegends(prev => prev.filter(l => l._id !== id));
      showToast('Légende supprimée.');
    } catch {
      showToast('Erreur de suppression.', 'error');
    }
  };

  // ─── Talents CRUD Handlers ───
  const handleSaveTalent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTalent?.playerId) {
      showToast('Joueur requis.', 'error');
      return;
    }
    try {
      const payload = {
        playerId: editingTalent.playerId,
        highlightVideoUrl: editingTalent.highlightVideoUrl || '',
        status: editingTalent.status || 'WATCHLIST',
        scoutingNotes: editingTalent.scoutingNotes || '',
        rating: Number(editingTalent.rating || 5),
      };
      if (editingTalent._id) {
        const res = await layoutApi.updateTalent(editingTalent._id, payload);
        setTalents(prev => prev.map(t => t._id === res._id ? res : t));
        showToast('Profil de talent mis à jour.');
      } else {
        const res = await layoutApi.createTalent(payload);
        setTalents(prev => [...prev, res]);
        showToast('Talent ajouté.');
      }
      setEditingTalent(null);
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDeleteTalent = async (id: string) => {
    if (!confirm('Retirer ce talent ?')) return;
    try {
      await layoutApi.deleteTalent(id);
      setTalents(prev => prev.filter(t => t._id !== id));
      showToast('Talent retiré.');
    } catch {
      showToast('Erreur de suppression.', 'error');
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/80 border-red-500/30 text-red-300'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wider text-white">Tableau de bord</h2>
              <p className="text-sm text-white/40">Vue globale des activités et statistiques du championnat</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DashboardStatCard label="Membres inscrits" value={stats.users} icon={Users} color="text-sky-400" index={0} />
              <DashboardStatCard label="Clubs Elite One" value={stats.clubs} icon={Star} color="text-accent" index={1} />
              <DashboardStatCard label="Joueurs enregistrés" value={stats.players} icon={Users} color="text-emerald-400" index={2} />
              <DashboardStatCard label="Matchs de la saison" value={stats.matches} icon={CalendarDays} color="text-red-400" index={3} />
              <DashboardStatCard label="Ballons d'or votés" value={stats.votes} icon={Award} color="text-amber-400" index={4} />
              <DashboardStatCard label="Articles de presse" value={stats.articles} icon={FileText} color="text-purple-400" index={5} />
            </div>
          </div>
        )}

        {/* Tab 2: Dynamic Layout */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Structure de l'accueil</h2>
                <p className="text-sm text-white/40">Gérez l'agencement et la visibilité des sections par drag-and-drop</p>
              </div>
              <AdminButton onClick={handleSaveLayout}><Save className="h-4 w-4" /> Enregistrer la structure</AdminButton>
            </div>
            <AdminCard title="Ordonner les rubriques de la Page d'accueil">
              <div className="space-y-3">
                {layout.section_order.map((section, index) => {
                  const isVisible = layout.section_visibility[section] !== false;
                  return (
                    <div
                      key={section}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        draggedIndex === index
                          ? 'border-accent bg-accent/5 opacity-50 scale-[0.98]'
                          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="cursor-grab active:cursor-grabbing text-white/30"><GripVertical className="h-4 w-4" /></div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{SECTION_LABELS[section] || section}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{section}</p>
                      </div>
                      <SwitchToggle checked={isVisible} onChange={() => toggleSectionVisibility(section)} />
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          </div>
        )}

        {/* Tab 3: Hero Banners */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Diaporamas Hero</h2>
                <p className="text-sm text-white/40">Gérez le défilement dynamique de la bannière principale</p>
              </div>
              {!editingBanner && (
                <AdminButton onClick={() => setEditingBanner({ title: { fr: '', en: '' }, subtitle: { fr: '', en: '' }, image_url: '', link_url: '', priority: 0, active: true, type: 'news' })}>
                  <Plus className="h-4 w-4" /> Nouvelle diapositive
                </AdminButton>
              )}
            </div>

            {editingBanner && (
              <AdminCard title={editingBanner._id ? 'Modifier la Diapositive' : 'Créer une Diapositive'}>
                <form onSubmit={handleSaveBanner} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Titre (FR)" value={editingBanner.title?.fr || ''} onChange={(v) => setEditingBanner(p => ({ ...p, title: { ...p.title, fr: v } as any }))} required />
                    <FormField label="Titre (EN)" value={editingBanner.title?.en || ''} onChange={(v) => setEditingBanner(p => ({ ...p, title: { ...p.title, en: v } as any }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Sous-titre (FR)" type="textarea" value={editingBanner.subtitle?.fr || ''} onChange={(v) => setEditingBanner(p => ({ ...p, subtitle: { ...p.subtitle, fr: v } as any }))} />
                    <FormField label="Sous-titre (EN)" type="textarea" value={editingBanner.subtitle?.en || ''} onChange={(v) => setEditingBanner(p => ({ ...p, subtitle: { ...p.subtitle, en: v } as any }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Image URL" value={editingBanner.image_url || ''} onChange={(v) => setEditingBanner(p => ({ ...p, image_url: v }))} required />
                    <FormField label="Lien de redirection" value={editingBanner.link_url || ''} onChange={(v) => setEditingBanner(p => ({ ...p, link_url: v }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <FormField label="Type" type="select" value={editingBanner.type || 'news'} onChange={(v) => setEditingBanner(p => ({ ...p, type: v }))} options={[{ value: 'match', label: 'Match' }, { value: 'player', label: 'Joueur' }, { value: 'news', label: 'Actualité' }]} />
                    <FormField label="Priorité" type="number" value={editingBanner.priority || 0} onChange={(v) => setEditingBanner(p => ({ ...p, priority: Number(v) }))} />
                    <div className="pb-3"><SwitchToggle label="Actif" checked={editingBanner.active !== false} onChange={(v) => setEditingBanner(p => ({ ...p, active: v }))} /></div>
                  </div>
                  <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditingBanner(null)}>Annuler</AdminButton><AdminButton type="submit">Sauvegarder</AdminButton></div>
                </form>
              </AdminCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b._id} className="bg-[#151D24] border border-white/5 rounded-2xl overflow-hidden shadow-xl p-4 flex gap-4 items-center">
                  <img src={b.image_url} alt={b.title.fr} className="h-16 w-16 object-cover rounded-xl shrink-0 bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{b.title.fr}</p>
                    <p className="text-[10px] text-white/40 truncate">{b.subtitle?.fr}</p>
                    <span className="text-[9px] text-accent font-semibold">{b.type} · Priority: {b.priority}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingBanner(b)} className="p-1.5 bg-white/5 border border-white/10 hover:text-accent rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteBanner(b._id!)} className="p-1.5 bg-white/5 border border-white/10 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Matches CRUD */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Matchs & Calendrier</h2>
                <p className="text-sm text-white/40">Programmez et mettez à jour les matchs en direct</p>
              </div>
              {!editingMatch && (
                <AdminButton onClick={() => setEditingMatch({ homeClubId: '', awayClubId: '', homeScore: 0, awayScore: 0, status: 'SCHEDULED', round: 1, kickoff: new Date().toISOString(), venue: '', seasonId: seasons[0]?.id || '' })}>
                  <Plus className="h-4 w-4" /> Planifier un Match
                </AdminButton>
              )}
            </div>

            {editingMatch && (
              <AdminCard title={editingMatch.id ? 'Modifier Match' : 'Planifier un Match'}>
                <form onSubmit={handleSaveMatch} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Club Domicile" type="select" value={editingMatch.homeClubId || ''} onChange={(v) => setEditingMatch(p => ({ ...p, homeClubId: v }))} options={clubs.map(c => ({ value: c.id, label: c.name }))} required />
                    <FormField label="Club Extérieur" type="select" value={editingMatch.awayClubId || ''} onChange={(v) => setEditingMatch(p => ({ ...p, awayClubId: v }))} options={clubs.map(c => ({ value: c.id, label: c.name }))} required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Score Domicile" type="number" value={editingMatch.homeScore ?? 0} onChange={(v) => setEditingMatch(p => ({ ...p, homeScore: v }))} />
                    <FormField label="Score Extérieur" type="number" value={editingMatch.awayScore ?? 0} onChange={(v) => setEditingMatch(p => ({ ...p, awayScore: v }))} />
                    <FormField label="Statut" type="select" value={editingMatch.status || 'SCHEDULED'} onChange={(v) => setEditingMatch(p => ({ ...p, status: v as any }))} options={[{ value: 'SCHEDULED', label: 'Programmé' }, { value: 'LIVE', label: 'En Cours (LIVE)' }, { value: 'HT', label: 'Mi-Temps' }, { value: 'FT', label: 'Terminé' }, { value: 'POSTPONED', label: 'Reporté' }]} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Journée (Round)" type="number" value={editingMatch.round || 1} onChange={(v) => setEditingMatch(p => ({ ...p, round: v }))} />
                    <FormField label="Coup d'envoi (Kickoff)" value={editingMatch.kickoff || ''} onChange={(v) => setEditingMatch(p => ({ ...p, kickoff: v }))} placeholder="YYYY-MM-DD HH:MM:SS" />
                    <FormField label="Stade / Lieu" value={editingMatch.venue || ''} onChange={(v) => setEditingMatch(p => ({ ...p, venue: v }))} />
                  </div>
                  <FormField label="Saison" type="select" value={editingMatch.seasonId || ''} onChange={(v) => setEditingMatch(p => ({ ...p, seasonId: v }))} options={seasons.map(s => ({ value: s.id, label: `${s.name} (${s.year})` }))} />
                  <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditingMatch(null)}>Annuler</AdminButton><AdminButton type="submit">Sauvegarder</AdminButton></div>
                </form>
              </AdminCard>
            )}

            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="bg-[#151D24] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-3 items-center text-center gap-2">
                    <div className="text-right text-xs font-bold text-white">{m.homeClub?.name || 'Home'}</div>
                    <div className="bg-white/5 border border-white/10 rounded px-3 py-1 font-display text-sm font-bold text-accent inline-block mx-auto">
                      {m.status === 'SCHEDULED' ? 'VS' : `${m.homeScore} - ${m.awayScore}`}
                    </div>
                    <div className="text-left text-xs font-bold text-white">{m.awayClub?.name || 'Away'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-white/40 block">J{m.round} · {m.venue}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-live text-white animate-pulse' : 'bg-white/5 text-white/55'}`}>{m.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingMatch(m)} className="p-1.5 bg-white/5 border border-white/10 hover:text-accent rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteMatch(m.id!)} className="p-1.5 bg-white/5 border border-white/10 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Awards & Ballon d'Or */}
        {activeTab === 'awards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Awards, Ballon d'Or & Nominations</h2>
                <p className="text-sm text-white/40">Gérez les campagnes de distinctions individuelles</p>
              </div>
              {!editingAward && !selectedAwardForNominees && (
                <AdminButton onClick={() => setEditingAward({ category: '', status: 'CLOSED', seasonId: seasons[0]?.id || '' })}>
                  <Plus className="h-4 w-4" /> Créer une Distinction
                </AdminButton>
              )}
            </div>

            {editingAward && (
              <AdminCard title={editingAward.id ? 'Modifier Distinction' : 'Créer une Distinction'}>
                <form onSubmit={handleSaveAward} className="space-y-4">
                  <FormField label="Catégorie (ex: Ballon d'Or, Entraîneur de la Semaine)" value={editingAward.category || ''} onChange={(v) => setEditingAward(p => ({ ...p, category: v }))} required />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Début des votes" value={editingAward.periodStart || ''} onChange={(v) => setEditingAward(p => ({ ...p, periodStart: v }))} />
                    <FormField label="Fin des votes" value={editingAward.periodEnd || ''} onChange={(v) => setEditingAward(p => ({ ...p, periodEnd: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Statut" type="select" value={editingAward.status || 'CLOSED'} onChange={(v) => setEditingAward(p => ({ ...p, status: v as any }))} options={[{ value: 'OPEN', label: 'Votes Ouverts' }, { value: 'CLOSED', label: 'Votes Fermés' }, { value: 'ANNOUNCED', label: 'Vainqueur Annoncé' }]} />
                    <FormField label="Saison" type="select" value={editingAward.seasonId || ''} onChange={(v) => setEditingAward(p => ({ ...p, seasonId: v }))} options={seasons.map(s => ({ value: s.id, label: s.name }))} />
                  </div>
                  <FormField label="Vainqueur (Optionnel)" type="select" value={editingAward.winnerId || ''} onChange={(v) => setEditingAward(p => ({ ...p, winnerId: v }))} options={[{ value: '', label: 'Aucun' }, ...players.map(p => ({ value: p.id, label: p.name }))]} />
                  <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditingAward(null)}>Annuler</AdminButton><AdminButton type="submit">Sauvegarder</AdminButton></div>
                </form>
              </AdminCard>
            )}

            {selectedAwardForNominees && (
              <AdminCard title={`Gestion des Nominations - ${selectedAwardForNominees.category}`} action={<AdminButton variant="secondary" onClick={() => setSelectedAwardForNominees(null)}>Retour</AdminButton>}>
                <div className="space-y-4">
                  <div className="flex gap-3 items-end">
                    <FormField label="Sélectionner un Joueur Nommé" type="select" value={selectedPlayerForNomination} onChange={setSelectedPlayerForNomination} options={[{ value: '', label: 'Choisissez...' }, ...players.map(p => ({ value: p.id, label: `${p.name} (${p.club?.short || ''})` }))]} />
                    <AdminButton onClick={handleAddNomination} disabled={!selectedPlayerForNomination}><Plus className="h-4 w-4" /> Ajouter</AdminButton>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs uppercase font-bold text-white/50">Candidats actuels</h4>
                    {selectedAwardForNominees.nominations?.map((nom: any) => (
                      <div key={nom.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                        <div>
                          <p className="font-semibold text-white">{nom.player?.name}</p>
                          <p className="text-[10px] text-white/30">{nom.player?.club?.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-display font-bold text-accent tabular-nums">{nom.voteCount} votes</span>
                          <button onClick={() => handleDeleteNomination(nom.id)} className="p-1 hover:text-red-500 bg-white/5 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminCard>
            )}

            {!selectedAwardForNominees && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {awards.map((a) => (
                  <div key={a.id} className="bg-[#151D24] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white">{a.category}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${a.status === 'OPEN' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-white/5 text-white/40'}`}>{a.status}</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Candidats: {a.nominations?.length || 0}</p>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 justify-end">
                      <AdminButton variant="secondary" onClick={() => setSelectedAwardForNominees(a)} className="text-[10px] py-1 px-3">Gérer Nommés</AdminButton>
                      <button onClick={() => setEditingAward(a)} className="p-1.5 bg-white/5 border border-white/10 hover:text-accent rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDeleteAward(a.id!)} className="p-1.5 bg-white/5 border border-white/10 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: News / Articles */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Articles & Presse</h2>
                <p className="text-sm text-white/40">Gérez le fil d\'actualités et les communiqués de presse</p>
              </div>
              {!editingArticle && (
                <AdminButton onClick={() => setEditingArticle({ title: '', summary: '', content: '', image_url: '', category: 'NEWS', status: 'DRAFT', featured: false })}>
                  <Plus className="h-4 w-4" /> Rédiger un Article
                </AdminButton>
              )}
            </div>

            {editingArticle && (
              <AdminCard title={editingArticle._id ? 'Modifier l\'Article' : 'Rédiger un Article'}>
                <form onSubmit={handleSaveArticle} className="space-y-4">
                  <FormField label="Titre" value={editingArticle.title || ''} onChange={(v) => setEditingArticle(p => ({ ...p, title: v }))} required />
                  <FormField label="Résumé court" value={editingArticle.summary || ''} onChange={(v) => setEditingArticle(p => ({ ...p, summary: v }))} />
                  <FormField label="Contenu de l'article" type="textarea" value={editingArticle.content || ''} onChange={(v) => setEditingArticle(p => ({ ...p, content: v }))} required />
                  <FormField label="Image URL" value={editingArticle.image_url || ''} onChange={(v) => setEditingArticle(p => ({ ...p, image_url: v }))} />
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <FormField label="Catégorie" type="select" value={editingArticle.category || 'NEWS'} onChange={(v) => setEditingArticle(p => ({ ...p, category: v }))} options={[{ value: 'NEWS', label: 'Actualité' }, { value: 'MATCH_REPORT', label: 'Compte-rendu' }, { value: 'NATIONAL_TEAM', label: 'Lions Indomptables' }]} />
                    <FormField label="Statut" type="select" value={editingArticle.status || 'DRAFT'} onChange={(v) => setEditingArticle(p => ({ ...p, status: v as any }))} options={[{ value: 'DRAFT', label: 'Brouillon' }, { value: 'PUBLISHED', label: 'Publié' }]} />
                    <div className="pb-3"><SwitchToggle label="À la une (Featured)" checked={editingArticle.featured || false} onChange={(v) => setEditingArticle(p => ({ ...p, featured: v }))} /></div>
                  </div>
                  <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditingArticle(null)}>Annuler</AdminButton><AdminButton type="submit">Sauvegarder</AdminButton></div>
                </form>
              </AdminCard>
            )}

            <div className="space-y-3">
              {articles.map((art) => (
                <div key={art._id} className="bg-[#151D24] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white truncate">{art.title}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${art.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40'}`}>{art.status}</span>
                      {art.featured && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">A LA UNE</span>}
                    </div>
                    <p className="text-[10px] text-white/40 truncate mt-1">{art.summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingArticle(art)} className="p-1.5 bg-white/5 border border-white/10 hover:text-accent rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteArticle(art._id!)} className="p-1.5 bg-white/5 border border-white/10 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Legends & Talents */}
        {activeTab === 'halloffame' && (
          <div className="space-y-8">
            {/* Legends */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-wider text-white">Temple de la renommée (Hall of Fame)</h2>
                  <p className="text-sm text-white/40">Consacrez les figures historiques du football camerounais</p>
                </div>
                {!editingLegend && (
                  <AdminButton onClick={() => setEditingLegend({ name: '', bio: { fr: '', en: '' }, era: '80', achievements: [], image_url: '', club_ids: [] })}>
                    <Plus className="h-4 w-4" /> Introniser une Légende
                  </AdminButton>
                )}
              </div>

              {editingLegend && (
                <AdminCard title={editingLegend._id ? 'Modifier Légende' : 'Introniser une Légende'}>
                  <form onSubmit={handleSaveLegend} className="space-y-4">
                    <FormField label="Nom de la Légende" value={editingLegend.name || ''} onChange={(v) => setEditingLegend(p => ({ ...p, name: v }))} required />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Bio (FR)" type="textarea" value={editingLegend.bio?.fr || ''} onChange={(v) => setEditingLegend(p => ({ ...p, bio: { ...p.bio, fr: v } as any }))} required />
                      <FormField label="Bio (EN)" type="textarea" value={editingLegend.bio?.en || ''} onChange={(v) => setEditingLegend(p => ({ ...p, bio: { ...p.bio, en: v } as any }))} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField label="Époque (ex: 80, 90)" value={editingLegend.era || ''} onChange={(v) => setEditingLegend(p => ({ ...p, era: v }))} />
                      <FormField label="Palmarès principaux (Séparés par virgule)" placeholder="Ligue des Champions, Ballon d'or" value={editingLegend.achievements?.join(', ') || ''} onChange={(v) => setEditingLegend(p => ({ ...p, achievements: v.split(',').map(s => s.trim()) }))} />
                      <FormField label="Image URL" value={editingLegend.image_url || ''} onChange={(v) => setEditingLegend(p => ({ ...p, image_url: v }))} />
                    </div>
                    <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditingLegend(null)}>Annuler</AdminButton><AdminButton type="submit">Sauvegarder</AdminButton></div>
                  </form>
                </AdminCard>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {legends.map((l) => (
                  <div key={l._id} className="bg-[#151D24] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{l.name}</p>
                      <p className="text-[10px] text-white/40">Époque: {l.era}s</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingLegend(l)} className="p-1.5 bg-white/5 border border-white/10 hover:text-accent rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDeleteLegend(l._id!)} className="p-1.5 bg-white/5 border border-white/10 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talents Watchlist */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-wider text-white">Jeunes Talents & Road to Lions</h2>
                  <p className="text-sm text-white/40">Suivez et configurez les espoirs locaux et leur statut</p>
                </div>
                {!editingTalent && (
                  <AdminButton onClick={() => setEditingTalent({ playerId: '', highlightVideoUrl: '', status: 'WATCHLIST', scoutingNotes: '', rating: 5 })}>
                    <Plus className="h-4 w-4" /> Suivre un Nouveau Talent
                  </AdminButton>
                )}
              </div>

              {editingTalent && (
                <AdminCard title={editingTalent._id ? 'Modifier Talent' : 'Suivre un Talent'}>
                  <form onSubmit={handleSaveTalent} className="space-y-4">
                    <FormField label="Joueur" type="select" value={editingTalent.playerId || ''} onChange={(v) => setEditingTalent(p => ({ ...p, playerId: v }))} options={players.map(pl => ({ value: pl.id, label: pl.name }))} required />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField label="Statut de promotion" type="select" value={editingTalent.status || 'WATCHLIST'} onChange={(v) => setEditingTalent(p => ({ ...p, status: v as any }))} options={[{ value: 'WATCHLIST', label: 'Watchlist Espoirs' }, { value: 'PROMOTED', label: 'Promu d\'Élite' }, { value: 'NATIONAL_TEAM', label: 'Convoqué chez les Lions 🇨🇲' }]} />
                      <FormField label="Note globale (1-10)" type="number" value={editingTalent.rating || 5} onChange={(v) => setEditingTalent(p => ({ ...p, rating: Number(v) }))} />
                      <FormField label="Lien vidéo Highlights" value={editingTalent.highlightVideoUrl || ''} onChange={(v) => setEditingTalent(p => ({ ...p, highlightVideoUrl: v }))} />
                    </div>
                    <FormField label="Notes d'observation de scouting" type="textarea" value={editingTalent.scoutingNotes || ''} onChange={(v) => setEditingTalent(p => ({ ...p, scoutingNotes: v }))} />
                    <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditingTalent(null)}>Annuler</AdminButton><AdminButton type="submit">Sauvegarder</AdminButton></div>
                  </form>
                </AdminCard>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {talents.map((t) => (
                  <div key={t._id} className="bg-[#151D24] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{t.player?.name || 'Joueur'}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-accent`}>{t.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingTalent(t)} className="p-1.5 bg-white/5 border border-white/10 hover:text-accent rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDeleteTalent(t._id!)} className="p-1.5 bg-white/5 border border-white/10 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
