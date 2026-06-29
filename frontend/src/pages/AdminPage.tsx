import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, CalendarDays, BarChart2, Radio,
  Award, Shield, FileText, CheckCircle2, AlertCircle,
  Plus, Edit3, Trash2, GripVertical, Save, ArrowLeftRight
} from 'lucide-react';
import AdminLayout from '@/layout/AdminLayout';
import {
  AdminCard, SwitchToggle, FormField,
  AdminButton, DashboardStatCard
} from '@/components/ui/AdminUI';
import { layoutApi, HomepageLayout, HeroBanner } from '@/services/layoutApi';
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

  // Stats
  const [stats, setStats] = useState({
    users: 0,
    clubs: 0,
    players: 0,
    matches: 0,
    votes: 0,
    articles: 0,
  });

  // Layout state
  const [layout, setLayout] = useState<HomepageLayout>({
    section_order: [],
    section_visibility: {},
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Hero banners state
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch initial data
  useEffect(() => {
    // Fetch stats
    apiClient.get('/admin/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching dashboard stats', err));

    // Fetch layout
    layoutApi.getHomepageLayout()
      .then(res => setLayout(res))
      .catch(err => console.error('Error fetching layout', err));

    // Fetch hero banners
    layoutApi.getHeroBanners()
      .then(res => setBanners(res))
      .catch(err => console.error('Error fetching banners', err));
  }, []);

  // Layout save handler
  const handleSaveLayout = async () => {
    try {
      const updated = await layoutApi.updateHomepageLayout(layout);
      setLayout(updated);
      showToast('Structure de la page d\'accueil mise à jour !');
    } catch (e) {
      showToast('Erreur lors de l\'enregistrement de la structure.', 'error');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...layout.section_order];
    const item = newOrder.splice(draggedIndex, 1)[0];
    newOrder.splice(index, 0, item);
    setDraggedIndex(index);
    setLayout({ ...layout, section_order: newOrder });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleSectionVisibility = (section: string) => {
    setLayout(prev => ({
      ...prev,
      section_visibility: {
        ...prev.section_visibility,
        [section]: !prev.section_visibility[section],
      }
    }));
  };

  // Hero CRUD Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title?.fr || !editingBanner?.image_url) {
      showToast('Titre et URL de l\'image sont obligatoires.', 'error');
      return;
    }

    try {
      const payload = {
        title: editingBanner.title as { fr: string; en: string },
        subtitle: editingBanner.subtitle as { fr: string; en: string } || { fr: '', en: '' },
        image_url: editingBanner.image_url,
        link_url: editingBanner.link_url || '',
        priority: editingBanner.priority || 0,
        active: editingBanner.active !== false,
        type: editingBanner.type || 'news',
      };

      if (editingBanner._id) {
        // Update
        const res = await layoutApi.updateHeroBanner(editingBanner._id, payload);
        setBanners(prev => prev.map(b => b._id === res._id ? res : b));
        showToast('Bannière mise à jour avec succès.');
      } else {
        // Create
        const res = await layoutApi.createHeroBanner(payload);
        setBanners(prev => [...prev, res]);
        showToast('Nouvelle bannière ajoutée.');
      }
      setEditingBanner(null);
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement de la bannière.', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Supprimer définitivement cette bannière ?')) return;
    try {
      await layoutApi.deleteHeroBanner(id);
      setBanners(prev => prev.filter(b => b._id !== id));
      showToast('Bannière supprimée.');
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Toast Alert */}
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
        {/* TAB 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wider text-white">Tableau de bord</h2>
              <p className="text-sm text-white/40">Vue globale des activités et statistiques du championnat</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DashboardStatCard label="Membres inscrits" value={stats.users} icon={Users} color="text-sky-400" index={0} />
              <DashboardStatCard label="Clubs Elite One" value={stats.clubs} icon={Star} color="text-accent" index={1} />
              <DashboardStatCard label="Joueurs enregistrés" value={stats.players} icon={Users} color="text-emerald-400" index={2} />
              <DashboardStatCard label="Matchs de la saison" value={stats.matches} icon={CalendarDays} color="text-red-400" index={3} />
              <DashboardStatCard label="Ballons d'or votés" value={stats.votes} icon={Award} color="text-amber-400" index={4} />
              <DashboardStatCard label="Articles de presse" value={stats.articles} icon={FileText} color="text-purple-400" index={5} />
            </div>

            <AdminCard title="Activité Récente" subtitle="Dernières actions enregistrées sur la plateforme">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-white/90">Mise à jour du classement</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Calculé après la clôture de la 18ème journée</p>
                  </div>
                  <span className="text-white/30 text-[10px]">Il y a 2h</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-white/90">Vote Ballon d'Or initialisé</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Ouverture officielle de la phase de poule des votes</p>
                  </div>
                  <span className="text-white/30 text-[10px]">Hier</span>
                </div>
              </div>
            </AdminCard>
          </div>
        )}

        {/* TAB 2: Drag and Drop Layout Manager */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Structure de l'accueil</h2>
                <p className="text-sm text-white/40">Gérez l'agencement et la visibilité des sections par drag-and-drop</p>
              </div>
              <AdminButton onClick={handleSaveLayout}>
                <Save className="h-4 w-4" /> Enregistrer la structure
              </AdminButton>
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
                      <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/70">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{SECTION_LABELS[section] || section}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{section}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isVisible ? 'text-accent' : 'text-white/20'}`}>
                          {isVisible ? 'Actif' : 'Masqué'}
                        </span>
                        <SwitchToggle
                          checked={isVisible}
                          onChange={() => toggleSectionVisibility(section)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          </div>
        )}

        {/* TAB 3: Hero Banner CMS */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-white">Diaporamas Hero</h2>
                <p className="text-sm text-white/40">Gérez le défilement dynamique de la bannière principale</p>
              </div>
              {!editingBanner && (
                <AdminButton onClick={() => setEditingBanner({
                  title: { fr: '', en: '' },
                  subtitle: { fr: '', en: '' },
                  image_url: '',
                  link_url: '',
                  priority: 0,
                  active: true,
                  type: 'news'
                })}>
                  <Plus className="h-4 w-4" /> Nouvelle diapositive
                </AdminButton>
              )}
            </div>

            {/* Editing / Creating slide form */}
            {editingBanner && (
              <AdminCard
                title={editingBanner._id ? 'Modifier la Diapositive' : 'Créer une Diapositive'}
                subtitle="Renseignez les détails traduits et les visuels"
              >
                <form onSubmit={handleSaveBanner} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Titre (FR)"
                      value={editingBanner.title?.fr || ''}
                      onChange={(val) => setEditingBanner(prev => ({
                        ...prev,
                        title: { ...prev.title, fr: val } as any
                      }))}
                      required
                    />
                    <FormField
                      label="Titre (EN)"
                      value={editingBanner.title?.en || ''}
                      onChange={(val) => setEditingBanner(prev => ({
                        ...prev,
                        title: { ...prev.title, en: val } as any
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Sous-titre (FR)"
                      type="textarea"
                      value={editingBanner.subtitle?.fr || ''}
                      onChange={(val) => setEditingBanner(prev => ({
                        ...prev,
                        subtitle: { ...prev.subtitle, fr: val } as any
                      }))}
                    />
                    <FormField
                      label="Sous-titre (EN)"
                      type="textarea"
                      value={editingBanner.subtitle?.en || ''}
                      onChange={(val) => setEditingBanner(prev => ({
                        ...prev,
                        subtitle: { ...prev.subtitle, en: val } as any
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <FormField
                        label="Image URL"
                        placeholder="https://ex.com/hero.jpg"
                        value={editingBanner.image_url || ''}
                        onChange={(val) => setEditingBanner(prev => ({ ...prev, image_url: val }))}
                        required
                      />
                    </div>
                    <FormField
                      label="Lien ciblé"
                      placeholder="/awards"
                      value={editingBanner.link_url || ''}
                      onChange={(val) => setEditingBanner(prev => ({ ...prev, link_url: val }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField
                      label="Type de contenu"
                      type="select"
                      value={editingBanner.type || 'news'}
                      onChange={(val) => setEditingBanner(prev => ({ ...prev, type: val }))}
                      options={[
                        { value: 'match', label: 'Match' },
                        { value: 'player', label: 'Joueur' },
                        { value: 'news', label: 'Actualité' },
                        { value: 'halloffame', label: 'Légende' },
                      ]}
                    />
                    <FormField
                      label="Priorité (Ordre de tri)"
                      type="number"
                      value={editingBanner.priority || 0}
                      onChange={(val) => setEditingBanner(prev => ({ ...prev, priority: Number(val) }))}
                    />
                    <div className="pb-3">
                      <SwitchToggle
                        label="Activer la diapositive"
                        checked={editingBanner.active !== false}
                        onChange={(val) => setEditingBanner(prev => ({ ...prev, active: val }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <AdminButton variant="secondary" onClick={() => setEditingBanner(null)}>
                      Annuler
                    </AdminButton>
                    <AdminButton type="submit">
                      Sauvegarder
                    </AdminButton>
                  </div>
                </form>
              </AdminCard>
            )}

            {/* List of current slides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="bg-[#151D24] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative"
                >
                  <div className="h-40 relative bg-black/40 overflow-hidden shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title.fr}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button
                        onClick={() => setEditingBanner(banner)}
                        className="h-7 w-7 rounded-lg bg-black/60 border border-white/10 hover:border-accent hover:text-accent transition-all grid place-items-center"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner._id!)}
                        className="h-7 w-7 rounded-lg bg-black/60 border border-white/10 hover:border-red-500 hover:text-red-500 transition-all grid place-items-center"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 border border-white/10 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${banner.active ? 'bg-emerald-500' : 'bg-white/20'}`} />
                      {banner.type || 'Slide'} · Priorité {banner.priority}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{banner.title.fr}</p>
                      {banner.subtitle?.fr && (
                        <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{banner.subtitle.fr}</p>
                      )}
                    </div>
                    {banner.link_url && (
                      <p className="text-[9px] text-accent/60 font-semibold tracking-wide uppercase mt-3">
                        Lien: {banner.link_url}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Awards & Legends Management */}
        {activeTab === 'awards' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wider text-white">Trophées & Légendes</h2>
              <p className="text-sm text-white/40">Paramétrage global des sections de distinctions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminCard
                title="Ballon d'Or & Récompenses"
                subtitle="Statut de la campagne de distinction et votes"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-white">Phase Active</p>
                      <p className="text-[9px] text-white/30 mt-0.5">Campagne 2025/2026</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase text-[9px]">
                      Votes Ouverts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Total de votes enregistrés:</span>
                    <span className="font-bold text-white tabular-nums">{stats.votes}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <AdminButton variant="secondary" className="w-full">
                      Clôturer les votes
                    </AdminButton>
                    <AdminButton className="w-full">
                      Ajouter une Nomination
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>

              <AdminCard
                title="Temple de la renommée (Legends)"
                subtitle="Gérer les grands visages de l'histoire du football local"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-white">Légendes Intronisées</p>
                      <p className="text-[9px] text-white/30 mt-0.5">Thomas Nkono, Roger Milla, etc.</p>
                    </div>
                    <span className="font-bold text-white text-xs">8 profiles</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <AdminButton variant="secondary" className="w-full">
                      Gérer la liste
                    </AdminButton>
                    <AdminButton className="w-full">
                      Introniser une légende
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
