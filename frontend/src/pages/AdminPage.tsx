import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Star, CalendarDays, FileText, Plus, Edit3,
  Trash2, GripVertical, Save, TrendingUp, CheckCircle2,
  Target, Flame, ShieldCheck, Medal, Flag, Trophy,
  RefreshCw, Eye, Play, StopCircle,
} from 'lucide-react';
import AdminLayout from '@/layout/AdminLayout';
import {
  AdminCard, SwitchToggle, FormField, AdminButton,
  DashboardStatCard, BulkImportExport, DataTable,
  StatusBadge, SectionHeader, Toast, StatBar, Paginator,
  MediaUploader
} from '@/components/ui/AdminUI';
import { layoutApi, HomepageLayout, HeroBanner, Award as AwardType, Match, Article, HallOfFameLegend, TalentProfile } from '@/services/layoutApi';
import { apiClient } from '@/services/api';
import { SeasonsTab, PlayersTab, UsersTab } from './AdminEntityTabs';
import { EntityCrudEngine } from '@/features/admin/engine/EntityCrudEngine';
import { GuidedBuilderEngine } from '@/features/admin/engine/GuidedBuilderEngine';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';
import { playersConfig, type Player } from '@/features/admin/configs/players.config';
import { clubsConfig, type Club } from '@/features/admin/configs/clubs.config';
import { coachesConfig, type Coach } from '@/features/admin/configs/coaches.config';
import { transfersConfig, type Transfer } from '@/features/admin/configs/transfers.config';
import { injuriesConfig, type Injury } from '@/features/admin/configs/injuries.config';
import { selectionsConfig, type Selection } from '@/features/admin/configs/selections.config';
import { bigMomentsConfig, type BigMoment } from '@/features/admin/configs/bigMoments.config';
import { stadiumsConfig, type Stadium } from '@/features/admin/configs/stadiums.config';
import { equipmentsConfig, type Equipment } from '@/features/admin/configs/equipments.config';
import { sponsorsConfig, type Sponsor } from '@/features/admin/configs/sponsors.config';
import { PlayerPreviewCard } from '@/features/admin/components/PlayerPreviewCard';
import { CommandPalette } from '@/features/admin/components/CommandPalette';
import { useAwardLiveVotes } from '@/hooks/useAwardLiveVotes';
import { Sparkles } from 'lucide-react';

// BF-06.1 — the three MVP award categories. Kept as plain strings (matches
// the existing `category: string` column, no migration needed) but
// constrained to a select here instead of free text.
const AWARD_CATEGORIES = [
  { value: "Joueur de la Semaine", label: "Joueur de la Semaine" },
  { value: "Joueur du Mois", label: "Joueur du Mois" },
  { value: "Ballon d'Or", label: "Ballon d'Or" },
];

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type ToastState = { msg: string; type: 'success' | 'error' | 'info' };

const SECTION_LABELS: Record<string, string> = {
  hero: 'Bannière Hero',
  matches: 'Matchs en direct',
  standings: 'Mini-classement',
  stats: 'Saison en chiffres',
  explore: 'Explorer',
  awards: 'Awards & Votes',
  halloffame: 'Hall of Fame',
  roadtolions: 'Road to Lions',
};

/* ─── ContactsPanel ─────────────────────────────────────────────────────────── */
function ContactsPanel({ showToast }: { showToast: (msg: string, type?: 'success'|'error'|'info') => void }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);
      const data = await layoutApi.getContacts();
      setContacts(data);
    } catch {
      showToast('Erreur lors du chargement des messages.', 'error');
    } finally {
      setLoadingContacts(false);
    }
  }, [showToast]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await layoutApi.updateContactStatus(id, status);
      await fetchContacts();
      showToast(`Statut mis à jour : ${status}`, 'success');
    } catch { showToast('Erreur', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await layoutApi.deleteContact(id);
      await fetchContacts();
      showToast('Message supprimé.', 'success');
    } catch { showToast('Erreur', 'error'); }
  };

  const STATUS_COLORS: Record<string, string> = {
    pending:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    read:     'bg-blue-500/15 text-blue-400 border-blue-500/20',
    resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Messages reçus" subtitle={`${contacts.length} message(s) dans la boîte de réception`} />
      {loadingContacts ? (
        <div className="text-center py-16 text-white/30 text-sm">Chargement…</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">Aucun message reçu.</div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <AdminCard key={c.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <span className="text-xs text-white/30">&lt;{c.email}&gt;</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[c.status] ?? STATUS_COLORS.pending}`}>
                      {c.status ?? 'pending'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-accent/80 mb-1">{c.subject}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{c.message}</p>
                  <p className="text-[10px] text-white/25 mt-2">{new Date(c.createdAt ?? c.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {c.status !== 'read' && (
                    <AdminButton variant="secondary" onClick={() => handleStatus(c.id, 'read')}>
                      <Eye className="h-3.5 w-3.5" /> Lu
                    </AdminButton>
                  )}
                  {c.status !== 'resolved' && (
                    <AdminButton onClick={() => handleStatus(c.id, 'resolved')}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Résolu
                    </AdminButton>
                  )}
                  <AdminButton variant="danger" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SettingsPanel ─────────────────────────────────────────────────────────── */
function SettingsPanel({ showToast }: { showToast: (msg: string, type?: 'success'|'error'|'info') => void }) {
  const [settings, setSettings] = useState({ logo_url: '', contact_email: '', contact_phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    layoutApi.getSystemSettings().then(setSettings).catch(() => null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await layoutApi.updateSystemSettings(settings);
      showToast('Paramètres sauvegardés avec succès !', 'success');
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <SectionHeader title="Paramètres système" subtitle="Logo, email et téléphone affichés sur le site public" />
      <AdminCard>
        <div className="space-y-4">
          <FormField
            label="URL du logo"
            hint="URL Cloudinary ou autre URL publique de l'image du logo"
            value={settings.logo_url}
            onChange={(v) => setSettings((s) => ({ ...s, logo_url: v }))}
            placeholder="https://res.cloudinary.com/…/logo.png"
          />
          {settings.logo_url && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Aperçu :</span>
              <img src={settings.logo_url} alt="Logo preview" className="h-10 w-10 object-contain rounded-lg border border-white/10 bg-white/5 p-1" />
            </div>
          )}
          <FormField
            label="Email de contact"
            type="email"
            value={settings.contact_email}
            onChange={(v) => setSettings((s) => ({ ...s, contact_email: v }))}
            placeholder="contact@mtneliteone.cm"
          />
          <FormField
            label="Téléphone de contact"
            type="text"
            value={settings.contact_phone}
            onChange={(v) => setSettings((s) => ({ ...s, contact_phone: v }))}
            placeholder="+237 6XX XXX XXX"
          />
          <div className="flex justify-end pt-2">
            <AdminButton onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </AdminButton>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

/* ─── Main AdminPage ─────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loading, setLoading] = useState(false);

  /* League Studio — Builder overlays for all entities */
  const [playerBuilderRecord, setPlayerBuilderRecord] = useState<Partial<Player> | null>(null);
  const [playersRefreshKey, setPlayersRefreshKey] = useState(0);
  const [clubBuilderRecord, setClubBuilderRecord] = useState<Partial<Club> | null>(null);
  const [clubsBuilderRefreshKey, setClubsBuilderRefreshKey] = useState(0);
  const [coachBuilderRecord, setCoachBuilderRecord] = useState<Partial<Coach> | null>(null);
  const [coachesBuilderRefreshKey, setCoachesBuilderRefreshKey] = useState(0);
  const [stadiumBuilderRecord, setStadiumBuilderRecord] = useState<Partial<Stadium> | null>(null);
  const [equipmentBuilderRecord, setEquipmentBuilderRecord] = useState<Partial<Equipment> | null>(null);
  const [sponsorBuilderRecord, setSponsorBuilderRecord] = useState<Partial<Sponsor> | null>(null);
  const [actionBuilderRecord, setActionBuilderRecord] = useState<Partial<BigMoment> | null>(null);
  const [transferBuilderRecord, setTransferBuilderRecord] = useState<Partial<Transfer> | null>(null);
  const [injuryBuilderRecord, setInjuryBuilderRecord] = useState<Partial<Injury> | null>(null);
  const [selectionBuilderRecord, setSelectionBuilderRecord] = useState<Partial<Selection> | null>(null);
  const [bigMomentBuilderRecord, setBigMomentBuilderRecord] = useState<Partial<BigMoment> | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* Metadata */
  const [seasons, setSeasons] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentSeasonId, setCurrentSeasonId] = useState('');

  /* Dashboard */
  const [stats, setStats] = useState({ users: 0, clubs: 0, players: 0, matches: 0, votes: 0, articles: 0 });

  /* Layout */
  const [layout, setLayout] = useState<HomepageLayout>({ section_order: [], section_visibility: {} });
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  /* Hero Banners */
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);
  const [importingBanners, setImportingBanners] = useState(false);

  /* Matches */
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchPage, setMatchPage] = useState(1);
  const [matchTotal, setMatchTotal] = useState(0);
  const [matchStatus, setMatchStatus] = useState('');
  const [editingMatch, setEditingMatch] = useState<Partial<Match> | null>(null);
  const [importingMatches, setImportingMatches] = useState(false);

  /* Awards */
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [editingAward, setEditingAward] = useState<Partial<AwardType> | null>(null);
  const [selectedAward, setSelectedAward] = useState<AwardType | null>(null);
  const [nomineePlayerId, setNomineePlayerId] = useState('');
  const [importingAwards, setImportingAwards] = useState(false);

  /* Articles */
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlePage, setArticlePage] = useState(1);
  const [articleTotal, setArticleTotal] = useState(0);
  const [articleStatus, setArticleStatus] = useState('');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [importingArticles, setImportingArticles] = useState(false);

  /* Legends */
  const [legends, setLegends] = useState<HallOfFameLegend[]>([]);
  const [editingLegend, setEditingLegend] = useState<Partial<HallOfFameLegend> | null>(null);

  /* Talents */
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [editingTalent, setEditingTalent] = useState<Partial<TalentProfile> | null>(null);

  /* Stats Panel */
  const [topScorers, setTopScorers]   = useState<any[]>([]);
  const [topAssisters, setTopAssisters] = useState<any[]>([]);
  const [seasonSummary, setSeasonSummary] = useState<any>(null);
  const [teamStats, setTeamStats]     = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  /* ─── Helpers ─────────────────────────────────────────────────────────────── */
  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || e.message || 'Erreur.'), 'error');
    }
    finally { setLoading(false); }
  };

  /* ─── Initial Load ────────────────────────────────────────────────────────── */
  useEffect(() => {
    // Metadata
    layoutApi.getSeasons().then(res => {
      setSeasons(res);
      const current = res.find((s: any) => s.status === 'ONGOING') || res[0];
      if (current) setCurrentSeasonId(current.id);
    }).catch(console.error);

    layoutApi.getClubs({ limit: 100 }).then(res => setClubs(res.data ?? res)).catch(console.error);
    layoutApi.getPlayers({ limit: 500 }).then(res => setPlayers(res.data ?? res)).catch(console.error);

    // Dashboard stats
    apiClient.get('/admin/dashboard-stats').then(r => setStats(r.data)).catch(console.error);

    // Layout
    layoutApi.getHomepageLayout().then(setLayout).catch(console.error);

    // Banners
    layoutApi.getHeroBanners().then(setBanners).catch(console.error);

    // Awards
    layoutApi.getAwards().then(setAwards).catch(console.error);

    // Legends & Talents
    layoutApi.getHallOfFame().then(setLegends).catch(console.error);
    layoutApi.getTalents().then(setTalents).catch(console.error);
  }, []);

  /* ─── Load Matches (with filters / pagination) ────────────────────────────── */
  useEffect(() => {
    if (activeTab !== 'matches') return;
    layoutApi.getMatches({ page: matchPage, limit: 20, ...(matchStatus ? { status: matchStatus } : {}) })
      .then(res => { setMatches(res.data ?? res); setMatchTotal(res.total ?? res.length ?? 0); })
      .catch(console.error);
  }, [activeTab, matchPage, matchStatus]);

  /* ─── Load Articles ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== 'news') return;
    layoutApi.getArticles({ page: articlePage, limit: 20, ...(articleStatus ? { status: articleStatus } : {}) })
      .then(res => { setArticles(res.data ?? res); setArticleTotal(res.total ?? res.length ?? 0); })
      .catch(console.error);
  }, [activeTab, articlePage, articleStatus]);

  /* ─── Load Stats ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== 'stats' || !currentSeasonId) return;
    setStatsLoading(true);
    Promise.all([
      apiClient.get(`/stats/season/${currentSeasonId}/summary`),
      apiClient.get(`/stats/top-scorers?seasonId=${currentSeasonId}&limit=10`),
      apiClient.get(`/stats/top-assisters?seasonId=${currentSeasonId}&limit=10`),
      apiClient.get(`/stats/teams?seasonId=${currentSeasonId}`),
    ]).then(([summary, scorers, assisters, teams]) => {
      setSeasonSummary(summary.data);
      setTopScorers(scorers.data ?? []);
      setTopAssisters(assisters.data ?? []);
      setTeamStats(teams.data ?? []);
    }).catch(console.error)
      .finally(() => setStatsLoading(false));
  }, [activeTab, currentSeasonId]);

  /* ─── Layout Handlers ─────────────────────────────────────────────────────── */
  const saveLayout = () => withLoading(async () => {
    const updated = await layoutApi.updateHomepageLayout(layout);
    setLayout(updated);
    showToast('Structure de la page d\'accueil sauvegardée !');
  });

  const handleDragStart = (i: number) => setDraggedIdx(i);
  const handleDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === i) return;
    const order = [...layout.section_order];
    const [item] = order.splice(draggedIdx, 1);
    order.splice(i, 0, item);
    setDraggedIdx(i);
    setLayout(p => ({ ...p, section_order: order }));
  };

  /* ─── Banner Handlers ─────────────────────────────────────────────────────── */
  const saveBanner = (e: React.FormEvent) => { e.preventDefault(); withLoading(async () => {
    const p = {
      title:    editingBanner!.title    as any,
      subtitle: editingBanner!.subtitle || { fr: '', en: '' },
      image_url: editingBanner!.image_url!,
      link_url:  editingBanner!.link_url || '',
      priority:  editingBanner!.priority || 0,
      active:    editingBanner!.active !== false,
      type:      editingBanner!.type || 'news',
    };
    if (editingBanner!._id) {
      const r = await layoutApi.updateHeroBanner(editingBanner!._id, p);
      setBanners(prev => prev.map(b => b._id === r._id ? r : b));
    } else {
      const r = await layoutApi.createHeroBanner(p);
      setBanners(prev => [...prev, r]);
    }
    setEditingBanner(null);
    showToast(editingBanner?._id ? 'Bannière mise à jour.' : 'Bannière créée.');
  }); };

  const deleteBanner = (id: string) => { if (!confirm('Supprimer cette bannière ?')) return; withLoading(async () => {
    await layoutApi.deleteHeroBanner(id);
    setBanners(prev => prev.filter(b => b._id !== id));
    showToast('Bannière supprimée.');
  }); };

  const importBanners = async (rows: any[]) => {
    setImportingBanners(true);
    let ok = 0;
    for (const row of rows) {
      try {
        await layoutApi.createHeroBanner({ ...row, title: typeof row.title === 'string' ? { fr: row.title, en: row.title } : row.title, subtitle: { fr: row.subtitle || '', en: '' }, active: row.active !== 'false', priority: Number(row.priority || 0) });
        ok++;
      } catch { /* skip invalid row */ }
    }
    const res = await layoutApi.getHeroBanners();
    setBanners(res);
    showToast(`${ok} bannière(s) importée(s).`);
    setImportingBanners(false);
  };

  /* ─── Match Handlers ──────────────────────────────────────────────────────── */
  const saveMatch = (e: React.FormEvent) => { e.preventDefault(); withLoading(async () => {
    const p = {
      homeClubId: String(editingMatch!.homeClubId!),
      awayClubId: String(editingMatch!.awayClubId!),
      homeScore:  (editingMatch!.homeScore !== undefined && String(editingMatch!.homeScore) !== '') ? Number(editingMatch!.homeScore) : undefined,
      awayScore:  (editingMatch!.awayScore !== undefined && String(editingMatch!.awayScore) !== '') ? Number(editingMatch!.awayScore) : undefined,
      status:     editingMatch!.status || 'SCHEDULED',
      round:      Number(editingMatch!.round || 1),
      // Backend expects scheduledAt; kickoff is the legacy local state key
      scheduledAt: editingMatch!.kickoff || (editingMatch as any).scheduledAt || new Date().toISOString(),
      venue:      editingMatch!.venue || '',
      seasonId:   String(editingMatch!.seasonId || currentSeasonId),
    };
    if (editingMatch!.id) {
      const r = await layoutApi.updateMatch(editingMatch!.id, p);
      setMatches(prev => prev.map(m => m.id === r.id ? r : m));
    } else {
      const r = await layoutApi.createMatch(p);
      setMatches(prev => [r, ...prev]);
    }
    setEditingMatch(null);
    showToast(editingMatch?.id ? 'Match mis à jour.' : 'Match programmé.');
    apiClient.get('/admin/dashboard-stats').then(r => setStats(r.data)).catch(() => {});
  }); };

  const deleteMatch = (id: string) => { if (!confirm('Supprimer ce match ?')) return; withLoading(async () => {
    await layoutApi.deleteMatch(id);
    setMatches(prev => prev.filter(m => m.id !== id));
    showToast('Match supprimé.');
  }); };

  const importMatches = async (rows: any[]) => {
    setImportingMatches(true);
    let ok = 0;
    for (const row of rows) {
      try {
        await layoutApi.createMatch({
          homeClubId: row.homeClubId, awayClubId: row.awayClubId,
          status: row.status || 'SCHEDULED', round: Number(row.round || 1),
          kickoff: row.kickoff, venue: row.venue, seasonId: row.seasonId || currentSeasonId,
          homeScore: row.homeScore !== undefined ? Number(row.homeScore) : undefined,
          awayScore: row.awayScore !== undefined ? Number(row.awayScore) : undefined,
        }); ok++;
      } catch { /* skip */ }
    }
    layoutApi.getMatches({ page: 1, limit: 20 }).then(r => { setMatches(r.data ?? r); setMatchTotal(r.total ?? r.length ?? 0); });
    showToast(`${ok} match(s) importé(s).`);
    setImportingMatches(false);
  };

  /* ─── Award Handlers ──────────────────────────────────────────────────────── */
  const saveAward = (e: React.FormEvent) => { e.preventDefault(); withLoading(async () => {
    const p = {
      category:    editingAward!.category!,
      periodStart: editingAward!.periodStart || new Date().toISOString(),
      periodEnd:   editingAward!.periodEnd   || new Date().toISOString(),
      status:      editingAward!.status      || 'CLOSED',
      seasonId:    String(editingAward!.seasonId || currentSeasonId),
      winnerId:    editingAward!.winnerId ? String(editingAward!.winnerId) : null,
    };
    if (editingAward!.id) {
      const r = await layoutApi.updateAward(editingAward!.id, p as any);
      setAwards(prev => prev.map(a => a.id === r.id ? r : a));
    } else {
      const r = await layoutApi.createAward(p as any);
      setAwards(prev => [...prev, r]);
    }
    setEditingAward(null);
    showToast(editingAward?.id ? 'Award mis à jour.' : 'Award créé.');
  }); };

  const deleteAward = (id: string) => { if (!confirm('Supprimer cet award ?')) return; withLoading(async () => {
    await layoutApi.deleteAward(id);
    setAwards(prev => prev.filter(a => a.id !== id));
    showToast('Award supprimé.');
  }); };

  // BF-10.4 — one-click period lifecycle, mirrors SeasonsTab's activate()/close().
  const openAwardVote = (id: string) => withLoading(async () => {
    const r = await apiClient.post(`/awards/${id}/open`);
    setAwards(prev => prev.map(a => a.id === id ? r.data : a));
    if (selectedAward?.id === id) setSelectedAward(r.data);
    showToast('Vote ouvert.');
  });

  const closeAwardVote = (id: string) => withLoading(async () => {
    const r = await apiClient.post(`/awards/${id}/close`);
    setAwards(prev => prev.map(a => a.id === id ? r.data : a));
    if (selectedAward?.id === id) setSelectedAward(r.data);
    const winnerName = players.find(p => p.id === r.data.winnerId)?.name;
    showToast(winnerName ? `Vote clôturé — vainqueur : ${winnerName}` : 'Vote clôturé.');
  });

  // BF-06.3 — live tally while the nominations panel for an OPEN award is open.
  useAwardLiveVotes(
    selectedAward?.status === 'OPEN' ? Number(selectedAward.id) : null,
    ({ nominationId, voteCount }) => {
      setSelectedAward(prev => prev && ({
        ...prev,
        nominations: prev.nominations?.map((n: any) =>
          n.id === nominationId ? { ...n, voteCount } : n),
      }));
    },
    ({ status, winnerId }) => {
      setSelectedAward(prev => prev && ({ ...prev, status: status as any, winnerId: winnerId ? String(winnerId) : null }));
      setAwards(prev => prev.map(a => a.id === selectedAward?.id ? { ...a, status: status as any, winnerId: winnerId ? String(winnerId) : null } as AwardType : a));
    },
  );

  const addNomination = () => withLoading(async () => {
    if (!selectedAward || !nomineePlayerId) return;
    await layoutApi.addNomination(selectedAward.id!, { playerId: nomineePlayerId });
    const res = await apiClient.get(`/awards/${selectedAward.id}`);
    const updated = res.data;
    setSelectedAward(updated);
    setAwards(prev => prev.map(a => a.id === updated.id ? updated : a));
    setNomineePlayerId('');
    showToast('Nomination ajoutée.');
  });

  const removeNomination = (nomId: string) => withLoading(async () => {
    if (!selectedAward) return;
    await layoutApi.deleteNomination(selectedAward.id!, nomId);
    const res = await apiClient.get(`/awards/${selectedAward.id}`);
    const updated = res.data;
    setSelectedAward(updated);
    setAwards(prev => prev.map(a => a.id === updated.id ? updated : a));
    showToast('Nomination retirée.');
  });

  const importAwards = async (rows: any[]) => {
    setImportingAwards(true);
    let ok = 0;
    for (const row of rows) {
      try {
        await layoutApi.createAward({ category: row.category, periodStart: row.periodStart, periodEnd: row.periodEnd, status: row.status || 'CLOSED', seasonId: row.seasonId || currentSeasonId });
        ok++;
      } catch { /* skip */ }
    }
    layoutApi.getAwards().then(setAwards);
    showToast(`${ok} award(s) importé(s).`);
    setImportingAwards(false);
  };

  /* ─── Article Handlers ────────────────────────────────────────────────────── */
  const [articleTab, setArticleTab] = useState('Contenu');

  const emptyArticle = (): Partial<Article> => ({
    articleType: 'STANDARD', category: 'CLUB_NEWS',
    title: { fr: '', en: '' }, subtitle: { fr: '', en: '' },
    body: { fr: '', en: '' }, author: '',
    slug: '', tags: [], gallery: [], cover_image: '', videoUrl: '',
    relatedMatchId: '', relatedClubIds: [], relatedPlayerIds: [],
    metaDescription: { fr: '', en: '' }, location: '', sourceCredit: '',
    status: 'DRAFT', featured: false, isPremium: false, isBreaking: false, read_time: 3,
  });

  const saveArticle = (e: React.FormEvent) => { e.preventDefault(); withLoading(async () => {
    const p: any = {
      articleType:    editingArticle!.articleType || 'STANDARD',
      category:       editingArticle!.category || 'CLUB_NEWS',
      title:          editingArticle!.title,
      subtitle:       editingArticle!.subtitle,
      body:           editingArticle!.body,
      author:         editingArticle!.author || 'Rédaction',
      slug:           editingArticle!.slug || `article-${Date.now()}`,
      cover_image:    editingArticle!.cover_image || editingArticle!.image_url || '',
      gallery:        editingArticle!.gallery || [],
      videoUrl:       editingArticle!.videoUrl || '',
      tags:           editingArticle!.tags || [],
      relatedMatchId: editingArticle!.relatedMatchId || undefined,
      relatedClubIds: editingArticle!.relatedClubIds || [],
      relatedPlayerIds: editingArticle!.relatedPlayerIds || [],
      metaDescription: editingArticle!.metaDescription,
      location:       editingArticle!.location || '',
      sourceCredit:   editingArticle!.sourceCredit || '',
      status:         editingArticle!.status || 'DRAFT',
      featured:       editingArticle!.featured || false,
      isPremium:      editingArticle!.isPremium || false,
      isBreaking:     editingArticle!.isBreaking || false,
      read_time:      editingArticle!.read_time || 3,
    };
    if (editingArticle!._id) {
      const r = await layoutApi.updateArticle(editingArticle!._id, p);
      setArticles(prev => prev.map(a => a._id === r._id ? r : a));
    } else {
      const r = await layoutApi.createArticle(p);
      setArticles(prev => [r, ...prev]);
    }
    setEditingArticle(null);
    showToast(editingArticle?._id ? 'Article mis à jour.' : 'Article enregistré.');
    apiClient.get('/admin/dashboard-stats').then(r => setStats(r.data)).catch(() => {});
  }); };

  const deleteArticle = (id: string) => { if (!confirm('Supprimer cet article ?')) return; withLoading(async () => {
    await layoutApi.deleteArticle(id);
    setArticles(prev => prev.filter(a => a._id !== id));
    showToast('Article supprimé.');
  }); };

  const importArticles = async (rows: any[]) => {
    setImportingArticles(true);
    let ok = 0;
    for (const row of rows) {
      try {
        await layoutApi.createArticle({
          title: row.title, body: row.body || { fr: row.content || '', en: '' },
          slug: row.slug || `import-${Date.now()}`, author: row.author || 'Import',
          category: row.category || 'CLUB_NEWS', status: row.status || 'DRAFT',
        } as any); ok++;
      } catch { /* skip */ }
    }
    layoutApi.getArticles({ page: 1, limit: 20 }).then(r => { setArticles(r.data ?? r); setArticleTotal(r.total ?? r.length ?? 0); });
    showToast(`${ok} article(s) importé(s).`);
    setImportingArticles(false);
  };


  /* ─── Legend Handlers ─────────────────────────────────────────────────────── */
  const saveLegend = (e: React.FormEvent) => { e.preventDefault(); withLoading(async () => {
    const p = { name: editingLegend!.name!, bio: editingLegend!.bio as any, era: editingLegend!.era || '80', achievements: editingLegend!.achievements || [], image_url: editingLegend!.image_url || '', club_ids: editingLegend!.club_ids || [] };
    if (editingLegend!._id) {
      const r = await layoutApi.updateHallOfFame(editingLegend!._id, p);
      setLegends(prev => prev.map(l => l._id === r._id ? r : l));
    } else {
      const r = await layoutApi.createHallOfFame(p);
      setLegends(prev => [...prev, r]);
    }
    setEditingLegend(null);
    showToast(editingLegend?._id ? 'Légende mise à jour.' : 'Légende intronisée.');
  }); };

  const deleteLegend = (id: string) => { if (!confirm('Supprimer ?')) return; withLoading(async () => {
    await layoutApi.deleteHallOfFame(id);
    setLegends(prev => prev.filter(l => l._id !== id));
    showToast('Légende supprimée.');
  }); };

  /* ─── Talent Handlers ─────────────────────────────────────────────────────── */
  const saveTalent = (e: React.FormEvent) => { e.preventDefault(); withLoading(async () => {
    const p = { playerId: editingTalent!.playerId!, highlightVideoUrl: editingTalent!.highlightVideoUrl || '', status: editingTalent!.status || 'WATCHLIST', scoutingNotes: editingTalent!.scoutingNotes || '', rating: Number(editingTalent!.rating || 5) };
    if (editingTalent!._id) {
      const r = await layoutApi.updateTalent(editingTalent!._id, p);
      setTalents(prev => prev.map(t => t._id === r._id ? r : t));
    } else {
      const r = await layoutApi.createTalent(p);
      setTalents(prev => [...prev, r]);
    }
    setEditingTalent(null);
    showToast(editingTalent?._id ? 'Profil mis à jour.' : 'Talent ajouté.');
  }); };

  const deleteTalent = (id: string) => { if (!confirm('Retirer ce talent ?')) return; withLoading(async () => {
    await layoutApi.deleteTalent(id);
    setTalents(prev => prev.filter(t => t._id !== id));
    showToast('Talent retiré.');
  }); };

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} onOpenPalette={() => setPaletteOpen(true)}>
      <Toast message={toast?.msg || ''} type={toast?.type || 'success'} visible={!!toast} />

      {/* ── DASHBOARD ──────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <SectionHeader
            title="Tableau de bord"
            subtitle="Vue globale des activités et statistiques du championnat"
            icon={LayoutDashboard_}
            actions={
              <AdminButton size="sm" variant="secondary" onClick={() => apiClient.get('/admin/dashboard-stats').then(r => setStats(r.data))}>
                <RefreshCw className="h-3 w-3" /> Actualiser
              </AdminButton>
            }
          />
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            <DashboardStatCard label="Membres inscrits"   value={stats.users}    icon={Users}       color="text-sky-400"     index={0} subtitle="Comptes enregistrés" />
            <DashboardStatCard label="Clubs Elite One"    value={stats.clubs}    icon={ShieldCheck} color="text-accent"      index={1} subtitle="16 clubs actifs" />
            <DashboardStatCard label="Joueurs"            value={stats.players}  icon={Users}       color="text-emerald-400" index={2} subtitle="Sous contrat" />
            <DashboardStatCard label="Matchs de saison"   value={stats.matches}  icon={CalendarDays} color="text-red-400"   index={3} subtitle="Saison 2024/25" />
            <DashboardStatCard label="Votes Ballon d'Or"  value={stats.votes}    icon={Medal}       color="text-amber-400"   index={4} subtitle="Depuis ouverture" />
            <DashboardStatCard label="Articles de presse" value={stats.articles} icon={FileText}    color="text-purple-400"  index={5} subtitle="Publiés + brouillons" />
          </div>

          {/* Quick Sections Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AdminCard title="Sections de l'accueil" subtitle="Statut de visibilité actuel">
              <div className="space-y-2">
                {layout.section_order.slice(0, 6).map((s) => (
                  <div key={s} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-white/60 font-medium">{SECTION_LABELS[s] || s}</span>
                    <StatusBadge status={layout.section_visibility[s] !== false ? 'PUBLISHED' : 'DRAFT'} />
                  </div>
                ))}
              </div>
            </AdminCard>
            <AdminCard title="Awards actifs" subtitle="Campagnes de votes en cours">
              <div className="space-y-2">
                {awards.filter(a => a.status === 'OPEN').map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-white/60 font-medium">{a.category}</span>
                    <span className="text-[10px] text-accent font-bold">{a.nominations?.length || 0} nommés</span>
                  </div>
                ))}
                {awards.filter(a => a.status === 'OPEN').length === 0 && (
                  <p className="text-xs text-white/25 text-center py-4">Aucun vote ouvert actuellement</p>
                )}
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {/* ── LAYOUT ─────────────────────────────────────────────────────────── */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <SectionHeader
            title="Structure de l'accueil"
            subtitle="Ordonnez et activez les rubriques par drag-and-drop"
            icon={Layers_}
            actions={<AdminButton onClick={saveLayout} loading={loading}><Save className="h-3.5 w-3.5" /> Enregistrer</AdminButton>}
          />
          <AdminCard title="Rubriques de la Page d'accueil" subtitle="Glissez-déposez pour réordonner · Toggle pour activer/désactiver">
            <div className="space-y-2">
              {layout.section_order.map((section, index) => {
                const visible = layout.section_visibility[section] !== false;
                return (
                  <div
                    key={section}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIdx(null)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing ${
                      draggedIdx === index
                        ? 'border-accent/30 bg-accent/5 opacity-60 scale-[0.99]'
                        : visible
                          ? 'border-white/[0.07] bg-white/[0.025] hover:border-white/12'
                          : 'border-white/[0.03] bg-transparent opacity-50'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-white/20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80">{SECTION_LABELS[section] || section}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5 font-mono">{section}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${visible ? 'text-emerald-400' : 'text-white/20'}`}>{visible ? 'Visible' : 'Masqué'}</span>
                      <SwitchToggle checked={visible} onChange={() => setLayout(p => ({ ...p, section_visibility: { ...p.section_visibility, [section]: !p.section_visibility[section] } }))} />
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── HERO BANNERS ───────────────────────────────────────────────────── */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <SectionHeader
            title="Bannières Hero"
            subtitle="Gérez le diaporama principal de la page d'accueil"
            icon={Image_}
            actions={
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <BulkImportExport
                  entityName="Hero Banners"
                  data={banners}
                  templateFields={['title_fr','title_en','subtitle_fr','subtitle_en','image_url','link_url','type','priority','active']}
                  onImport={importBanners}
                  importLoading={importingBanners}
                />
                <AdminButton onClick={() => setEditingBanner({ title: { fr: '', en: '' }, subtitle: { fr: '', en: '' }, image_url: '', link_url: '', priority: 0, active: true, type: 'news' })}>
                  <Plus className="h-3.5 w-3.5" /> Nouvelle diapositive
                </AdminButton>
              </div>
            }
          />

          {editingBanner && (
            <AdminCard title={editingBanner._id ? 'Modifier la Diapositive' : 'Créer une Diapositive'} accent>
              <form onSubmit={saveBanner} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Titre (Français)" value={editingBanner.title?.fr || ''} onChange={(v) => setEditingBanner(p => ({ ...p, title: { ...(p?.title as any), fr: v } }))} required />
                  <FormField label="Titre (Anglais)" value={editingBanner.title?.en || ''} onChange={(v) => setEditingBanner(p => ({ ...p, title: { ...(p?.title as any), en: v } }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Sous-titre (FR)" type="textarea" value={editingBanner.subtitle?.fr || ''} onChange={(v) => setEditingBanner(p => ({ ...p, subtitle: { ...(p?.subtitle as any), fr: v } }))} />
                  <FormField label="Sous-titre (EN)" type="textarea" value={editingBanner.subtitle?.en || ''} onChange={(v) => setEditingBanner(p => ({ ...p, subtitle: { ...(p?.subtitle as any), en: v } }))} />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <MediaUploader label="Image de la bannière" value={editingBanner.image_url || ''} onChange={(v) => setEditingBanner(p => ({ ...p, image_url: v }))} acceptType="image" hint="Image de la diapositive (PNG, JPEG, WEBP)" />
                  <FormField label="URL de redirection" value={editingBanner.link_url || ''} onChange={(v) => setEditingBanner(p => ({ ...p, link_url: v }))} hint="Lien au clic (optionnel)" />
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <FormField label="Type de contenu" type="select" value={editingBanner.type || 'news'} onChange={(v) => setEditingBanner(p => ({ ...p, type: v }))} options={[{value:'match',label:'Match'},{value:'player',label:'Joueur'},{value:'news',label:'Actualité'},{value:'award',label:'Award'}]} />
                  <FormField label="Priorité d'affichage" type="number" value={editingBanner.priority || 0} onChange={(v) => setEditingBanner(p => ({ ...p, priority: Number(v) }))} hint="Plus élevé = affiché en premier" />
                  <div className="pb-2"><SwitchToggle label="Diapositive active" checked={editingBanner.active !== false} onChange={(v) => setEditingBanner(p => ({ ...p, active: v }))} /></div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                  <AdminButton variant="secondary" onClick={() => setEditingBanner(null)}>Annuler</AdminButton>
                  <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                </div>
              </form>
            </AdminCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {banners.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group bg-[#111820] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/12 transition-all">
                <div className="relative h-28 bg-white/[0.03]">
                  <img src={b.image_url} alt={b.title.fr} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{b.title.fr}</p>
                      <p className="text-[10px] text-white/60 truncate">{b.subtitle?.fr}</p>
                    </div>
                    <StatusBadge status={b.active ? 'PUBLISHED' : 'DRAFT'} />
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-white/35">
                    <span className="capitalize font-semibold text-white/50">{b.type}</span>
                    <span>Priorité: {b.priority}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <AdminButton size="sm" variant="secondary" onClick={() => setEditingBanner(b)}><Edit3 className="h-3 w-3" /></AdminButton>
                    <AdminButton size="sm" variant="danger" onClick={() => deleteBanner(b._id!)}><Trash2 className="h-3 w-3" /></AdminButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── MATCHES ────────────────────────────────────────────────────────── */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <SectionHeader
            title="Matchs & Résultats"
            subtitle="Planifiez et gérez tous les matchs de la saison"
            icon={Calendar_}
            actions={
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <BulkImportExport
                  entityName="Matches"
                  data={matches}
                  templateFields={['homeClubId','awayClubId','kickoff','venue','round','status','homeScore','awayScore','seasonId']}
                  onImport={importMatches}
                  importLoading={importingMatches}
                />
                <AdminButton onClick={() => setEditingMatch({ homeClubId: '', awayClubId: '', status: 'SCHEDULED', round: 1, kickoff: new Date().toISOString(), venue: '', seasonId: currentSeasonId })}>
                  <Plus className="h-3.5 w-3.5" /> Planifier un Match
                </AdminButton>
              </div>
            }
          />

          {/* Filter bar */}
          <div className="flex items-center gap-3">
            {['', 'SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'].map(s => (
              <button key={s} onClick={() => { setMatchStatus(s); setMatchPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${matchStatus === s ? 'bg-accent text-black' : 'bg-white/5 border border-white/8 text-white/40 hover:text-white'}`}>
                {s === 'FINISHED' ? 'Terminé' : (s || 'Tous')}
              </button>
            ))}
          </div>

          {editingMatch && (
            <AdminCard title={editingMatch.id ? 'Modifier Match' : 'Planifier un Match'} accent>
              <form onSubmit={saveMatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Club Domicile" type="select" value={editingMatch.homeClubId || ''} onChange={v => setEditingMatch(p => ({ ...p, homeClubId: v }))} options={clubs.map(c => ({ value: c.id, label: c.name }))} required />
                  <FormField label="Club Extérieur" type="select" value={editingMatch.awayClubId || ''} onChange={v => setEditingMatch(p => ({ ...p, awayClubId: v }))} options={clubs.map(c => ({ value: c.id, label: c.name }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Score Domicile" type="number" value={editingMatch.homeScore ?? ''} onChange={v => setEditingMatch(p => ({ ...p, homeScore: v }))} />
                  <FormField label="Score Extérieur" type="number" value={editingMatch.awayScore ?? ''} onChange={v => setEditingMatch(p => ({ ...p, awayScore: v }))} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Statut" type="select" value={editingMatch.status || 'SCHEDULED'} onChange={v => setEditingMatch(p => ({ ...p, status: v as any }))} options={[{value:'SCHEDULED',label:'Programmé'},{value:'LIVE',label:'LIVE'},{value:'FINISHED',label:'Terminé'},{value:'POSTPONED',label:'Reporté'},{value:'CANCELLED',label:'Annulé'}]} />
                  <FormField label="Journée" type="number" value={editingMatch.round || 1} onChange={v => setEditingMatch(p => ({ ...p, round: v }))} />
                  <FormField label="Coup d'envoi" type="datetime-local" value={(editingMatch.kickoff || '').replace('Z','').slice(0,16)} onChange={v => setEditingMatch(p => ({ ...p, kickoff: new Date(v).toISOString() }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Stade / Lieu" value={editingMatch.venue || ''} onChange={v => setEditingMatch(p => ({ ...p, venue: v }))} />
                  <FormField label="Saison" type="select" value={editingMatch.seasonId || ''} onChange={v => setEditingMatch(p => ({ ...p, seasonId: v }))} options={seasons.map(s => ({ value: s.id, label: s.name }))} />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                  <AdminButton variant="secondary" onClick={() => setEditingMatch(null)}>Annuler</AdminButton>
                  <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                </div>
              </form>
            </AdminCard>
          )}

          <AdminCard noPadding>
            <DataTable
              columns={[
                { key: 'round', label: 'J.', align: 'center', render: r => <span className="font-display font-bold text-white/70">{r.round}</span> },
                { key: 'home', label: 'Domicile', render: r => <span className="font-semibold text-white/80">{r.homeClub?.name || '—'}</span> },
                { key: 'score', label: 'Score', align: 'center', render: r => (
                  <span className={`font-display font-bold ${r.status === 'LIVE' ? 'text-red-400' : 'text-white'}`}>
                    {r.status === 'SCHEDULED' ? 'VS' : `${r.homeScore ?? '?'} – ${r.awayScore ?? '?'}`}
                  </span>
                )},
                { key: 'away', label: 'Extérieur', render: r => <span className="font-semibold text-white/80">{r.awayClub?.name || '—'}</span> },
                { key: 'venue', label: 'Stade' },
                { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
                { key: 'kickoff', label: 'Coup d\'envoi', render: r => <span className="text-white/40 text-[10px]">{(r.scheduledAt || r.kickoff) ? new Date(r.scheduledAt || r.kickoff).toLocaleDateString('fr-FR') : '—'}</span> },
              ]}
              data={matches}
              keyField="id"
              onEdit={r => setEditingMatch(r)}
              onDelete={r => deleteMatch(r.id!)}
            />
            <div className="px-4 pb-4"><Paginator page={matchPage} total={matchTotal} limit={20} onChange={setMatchPage} /></div>
          </AdminCard>
        </div>
      )}

      {/* ── AWARDS ─────────────────────────────────────────────────────────── */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          <SectionHeader
            title="Awards & Ballon d'Or"
            subtitle="Gérez les campagnes de votes et les distinctions individuelles"
            icon={Trophy_}
            actions={
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <BulkImportExport
                  entityName="Awards"
                  data={awards}
                  templateFields={['category','periodStart','periodEnd','status','seasonId']}
                  onImport={importAwards}
                  importLoading={importingAwards}
                />
                {!selectedAward && <AdminButton onClick={() => setEditingAward({ category: '', status: 'CLOSED', seasonId: currentSeasonId })}>
                  <Plus className="h-3.5 w-3.5" /> Créer un Award
                </AdminButton>}
              </div>
            }
          />

          {editingAward && (
            <AdminCard title={editingAward.id ? 'Modifier Award' : 'Créer un Award'} accent>
              <form onSubmit={saveAward} className="space-y-4">
                <FormField label="Catégorie" type="select" value={editingAward.category || ''} onChange={v => setEditingAward(p => ({ ...p, category: v }))} options={[{ value: '', label: 'Choisissez une catégorie...' }, ...AWARD_CATEGORIES]} required />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Début des votes" type="datetime-local" value={(editingAward.periodStart || '').replace('Z','').slice(0,16)} onChange={v => setEditingAward(p => ({ ...p, periodStart: new Date(v).toISOString() }))} />
                  <FormField label="Fin des votes" type="datetime-local" value={(editingAward.periodEnd || '').replace('Z','').slice(0,16)} onChange={v => setEditingAward(p => ({ ...p, periodEnd: new Date(v).toISOString() }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Statut" type="select" value={editingAward.status || 'CLOSED'} onChange={v => setEditingAward(p => ({ ...p, status: v as any }))} options={[{value:'OPEN',label:'Votes Ouverts'},{value:'CLOSED',label:'Votes Fermés'},{value:'ANNOUNCED',label:'Vainqueur Annoncé'}]} />
                  <FormField label="Saison" type="select" value={editingAward.seasonId || ''} onChange={v => setEditingAward(p => ({ ...p, seasonId: v }))} options={seasons.map(s => ({ value: s.id, label: s.name }))} />
                </div>
                <FormField label="Vainqueur (optionnel)" type="select" value={editingAward.winnerId || ''} onChange={v => setEditingAward(p => ({ ...p, winnerId: v || null }))} options={[{value:'',label:'Non encore désigné'},...players.map(p => ({value:p.id,label:p.name}))]} />
                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                  <AdminButton variant="secondary" onClick={() => setEditingAward(null)}>Annuler</AdminButton>
                  <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                </div>
              </form>
            </AdminCard>
          )}

          {/* Nominee management panel */}
          {selectedAward && (
            <AdminCard
              title={`Nominations — ${selectedAward.category}`}
              subtitle={`${selectedAward.nominations?.length || 0} candidats • Statut: ${selectedAward.status}`}
              action={
                <div className="flex items-center gap-3">
                  {selectedAward.status === 'OPEN' && (
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                  )}
                  <AdminButton variant="secondary" size="sm" onClick={() => setSelectedAward(null)}>← Retour</AdminButton>
                </div>
              }
              accent>
              <div className="space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <FormField label="Ajouter un joueur nommé" type="select" value={nomineePlayerId} onChange={setNomineePlayerId} options={[{value:'',label:'Choisissez un joueur...'},...players.map(p => ({value:p.id,label:`${p.name} • ${p.club?.name || ''}`}))]} />
                  </div>
                  <AdminButton onClick={addNomination} disabled={!nomineePlayerId} loading={loading}><Plus className="h-3.5 w-3.5" /> Nommer</AdminButton>
                </div>
                <div className="space-y-1 mt-2">
                  {(selectedAward.nominations || []).sort((a: any, b: any) => b.voteCount - a.voteCount).map((nom: any, i: number) => (
                    <div key={nom.id} className="flex items-center gap-3 p-3 bg-white/[0.025] rounded-xl border border-white/[0.04]">
                      <span className={`text-[11px] font-display font-bold w-5 text-center ${i < 3 ? 'text-accent' : 'text-white/25'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{nom.player?.name}</p>
                        <p className="text-[10px] text-white/35">{nom.player?.club?.name}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-display font-bold text-accent text-sm tabular-nums">{nom.voteCount}</p>
                        <p className="text-[9px] text-white/25">votes</p>
                      </div>
                      <AdminButton size="sm" variant="danger" onClick={() => removeNomination(nom.id)}><Trash2 className="h-3 w-3" /></AdminButton>
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>
          )}

          {!selectedAward && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {awards.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-[#111820] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/12 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white/85 leading-tight">{a.category}</p>
                      <p className="text-[10px] text-white/30 mt-1">{a.nominations?.length || 0} candidats</p>
                      {a.status === 'ANNOUNCED' && a.winnerId && (
                        <p className="text-[10px] text-accent font-semibold mt-1">
                          🏆 {players.find(p => p.id === a.winnerId)?.name || '—'}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/[0.05] flex-wrap">
                    {a.status === 'CLOSED' && (
                      <AdminButton size="sm" variant="success" onClick={() => openAwardVote(a.id!)} loading={loading}><Play className="h-3 w-3" /> Ouvrir le vote</AdminButton>
                    )}
                    {a.status === 'OPEN' && (
                      <AdminButton size="sm" variant="danger" onClick={() => closeAwardVote(a.id!)} loading={loading}><StopCircle className="h-3 w-3" /> Clôturer</AdminButton>
                    )}
                    <AdminButton size="sm" variant="secondary" onClick={() => setSelectedAward(a)} className="flex-1">Nominations</AdminButton>
                    <AdminButton size="sm" variant="ghost" onClick={() => setEditingAward(a)}><Edit3 className="h-3 w-3" /></AdminButton>
                    <AdminButton size="sm" variant="danger" onClick={() => deleteAward(a.id!)}><Trash2 className="h-3 w-3" /></AdminButton>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STATISTICS ─────────────────────────────────────────────────────── */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <SectionHeader
            title="Statistiques de la Saison"
            subtitle="Vue analytique des performances — Meilleurs buteurs, passeurs, clubs"
            icon={BarChart2_}
            actions={
              <div className="flex items-center gap-2">
                <FormField label="" type="select" value={currentSeasonId} onChange={v => setCurrentSeasonId(v)}
                  options={seasons.map(s => ({ value: s.id, label: s.name }))} />
                <AdminButton size="sm" variant="secondary" onClick={() => { /* triggers useEffect */ setCurrentSeasonId(s => s); }}><RefreshCw className="h-3 w-3" /></AdminButton>
              </div>
            }
          />

          {/* Season Summary Cards */}
          {seasonSummary && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: 'Matchs joués', val: seasonSummary.matchesPlayed, icon: CalendarDays, color: 'text-sky-400' },
                { label: 'Buts marqués', val: seasonSummary.totalGoals,    icon: Target,      color: 'text-accent' },
                { label: 'Buts / match', val: seasonSummary.avgGoalsPerMatch?.toFixed(1), icon: Flame, color: 'text-red-400' },
                { label: 'Cartons rouges', val: seasonSummary.totalRedCards, icon: Flag,     color: 'text-orange-400' },
              ].map((item, i) => (
                <DashboardStatCard key={item.label} label={item.label} value={item.val ?? '—'} icon={item.icon} color={item.color} index={i} />
              ))}
            </div>
          )}

          {statsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[0,1].map(i => <div key={i} className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Scorers */}
              <AdminCard title="Classement Buteurs" subtitle={`Top ${topScorers.length} de la saison`}>
                <div className="space-y-2">
                  {topScorers.map((p: any, i) => (
                    <div key={p.playerId || i} className="flex items-center gap-3">
                      <span className={`text-[11px] font-display font-bold w-5 text-center ${i < 3 ? 'text-accent' : 'text-white/25'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/80 truncate">{p.playerName || p.name}</p>
                        <p className="text-[9px] text-white/30 truncate">{p.clubName}</p>
                      </div>
                      <StatBar label="" value={p.goals} max={topScorers[0]?.goals || 1} color={i === 0 ? 'bg-accent' : 'bg-sky-500'} />
                      <span className="w-8 text-right font-display font-bold text-white tabular-nums text-sm">{p.goals}</span>
                    </div>
                  ))}
                  {!topScorers.length && <p className="text-center text-white/25 text-xs py-8">Aucune donnée disponible</p>}
                </div>
              </AdminCard>

              {/* Top Assisters */}
              <AdminCard title="Classement Passeurs" subtitle={`Top ${topAssisters.length} de la saison`}>
                <div className="space-y-2">
                  {topAssisters.map((p: any, i) => (
                    <div key={p.playerId || i} className="flex items-center gap-3">
                      <span className={`text-[11px] font-display font-bold w-5 text-center ${i < 3 ? 'text-accent' : 'text-white/25'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/80 truncate">{p.playerName || p.name}</p>
                        <p className="text-[9px] text-white/30 truncate">{p.clubName}</p>
                      </div>
                      <StatBar label="" value={p.assists} max={topAssisters[0]?.assists || 1} color="bg-emerald-500" />
                      <span className="w-8 text-right font-display font-bold text-white tabular-nums text-sm">{p.assists}</span>
                    </div>
                  ))}
                  {!topAssisters.length && <p className="text-center text-white/25 text-xs py-8">Aucune donnée disponible</p>}
                </div>
              </AdminCard>

              {/* Team Stats table */}
              <AdminCard title="Statistiques des Clubs" subtitle="Buts, victoires, défaites" className="lg:col-span-2" noPadding>
                <DataTable
                  columns={[
                    { key: 'name',      label: 'Club',       render: r => <span className="font-semibold text-white/80">{r.name}</span> },
                    { key: 'goalsFor',   label: 'Buts marqués', align: 'center', render: r => <span className="font-display font-bold text-accent tabular-nums">{r.goalsFor ?? r.goals_for ?? '—'}</span> },
                    { key: 'goalsAgainst', label: 'Buts encaissés', align: 'center', render: r => <span className="tabular-nums text-red-400/80 font-bold">{r.goalsAgainst ?? r.goals_against ?? '—'}</span> },
                    { key: 'wins',   label: 'V', align: 'center', render: r => <span className="text-emerald-400 font-bold">{r.wins ?? '—'}</span> },
                    { key: 'draws',  label: 'N', align: 'center', render: r => <span className="text-white/50 font-bold">{r.draws ?? '—'}</span> },
                    { key: 'losses', label: 'D', align: 'center', render: r => <span className="text-red-400 font-bold">{r.losses ?? '—'}</span> },
                  ]}
                  data={teamStats}
                  keyField="clubId"
                  emptyMessage="Aucune stat d'équipe pour cette saison."
                />
              </AdminCard>
            </div>
          )}
        </div>
      )}

      {/* ── NEWS / ARTICLES ─────────────────────────────────────────────────── */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <SectionHeader
            title="Actualités & Presse"
            subtitle="Rédigez, publiez et gérez les articles avec galerie, vidéo et SEO complet"
            icon={FileText_}
            actions={
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <BulkImportExport
                  entityName="Articles"
                  data={articles}
                  templateFields={['title_fr','title_en','body_fr','body_en','author','slug','category','articleType','status','cover_image','featured']}
                  onImport={importArticles}
                  importLoading={importingArticles}
                />
                {!editingArticle && (
                  <AdminButton onClick={() => { setEditingArticle(emptyArticle()); setArticleTab('Contenu'); }}>
                    <Plus className="h-3.5 w-3.5" /> Rédiger un Article
                  </AdminButton>
                )}
              </div>
            }
          />

          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {[['', 'Tous'], ['PUBLISHED', 'Publiés'], ['DRAFT', 'Brouillons'], ['ARCHIVED', 'Archivés']].map(([s, label]) => (
              <button key={s} onClick={() => { setArticleStatus(s); setArticlePage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${articleStatus === s ? 'bg-accent text-black' : 'bg-white/5 border border-white/8 text-white/40 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>

          {editingArticle && (
            <AdminCard title={editingArticle._id ? 'Modifier l\'Article' : 'Rédiger un Article'} accent>
              <form onSubmit={saveArticle} className="space-y-4">
                {/* Tab nav */}
                <div className="flex gap-1 border-b border-white/[0.06] mb-4 -mx-1 px-1">
                  {['Contenu', 'Médias', 'SEO & Meta', 'Relations', 'Publication'].map(t => (
                    <button key={t} type="button" onClick={() => setArticleTab(t)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-t-lg ${
                        articleTab === t ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-white/30 hover:text-white/60'
                      }`}>{t}</button>
                  ))}
                </div>

                {/* ── Contenu ── */}
                {articleTab === 'Contenu' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Type d'article" type="select" value={editingArticle.articleType || 'STANDARD'}
                        onChange={v => setEditingArticle(p => ({ ...p, articleType: v as any }))}
                        options={[
                          { value: 'STANDARD', label: '📰 Standard' },
                          { value: 'BREAKING', label: '🔴 Breaking News' },
                          { value: 'OPINION', label: '💬 Opinion' },
                          { value: 'VIDEO', label: '🎥 Vidéo' },
                          { value: 'PHOTO_GALLERY', label: '📸 Galerie photo' },
                          { value: 'LIVE_BLOG', label: '📡 Live Blog' },
                        ]} />
                      <FormField label="Catégorie" type="select" value={editingArticle.category || 'CLUB_NEWS'}
                        onChange={v => setEditingArticle(p => ({ ...p, category: v }))}
                        options={[
                          { value: 'CLUB_NEWS', label: 'Actualité Club' },
                          { value: 'MATCH_REPORT', label: 'Compte-rendu match' },
                          { value: 'TRANSFERS', label: 'Transferts' },
                          { value: 'NATIONAL_TEAM', label: 'Lions Indomptables' },
                          { value: 'INTERVIEW', label: 'Interview' },
                          { value: 'ANALYSIS', label: 'Analyse tactique' },
                          { value: 'OPINION', label: 'Tribune / Opinion' },
                          { value: 'FEATURE', label: 'Grand format' },
                        ]} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Auteur" value={editingArticle.author || ''} onChange={v => setEditingArticle(p => ({ ...p, author: v }))} hint="Nom du journaliste ou 'Rédaction'" />
                      <FormField label="Slug (URL)" value={editingArticle.slug || ''} onChange={v => setEditingArticle(p => ({ ...p, slug: v }))} hint="Ex: canon-bousculant-coton-sport" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Titre (Français) *" value={editingArticle.title?.fr || ''} onChange={v => setEditingArticle(p => ({ ...p, title: { ...(p?.title as any), fr: v } }))} required />
                      <FormField label="Titre (Anglais)" value={editingArticle.title?.en || ''} onChange={v => setEditingArticle(p => ({ ...p, title: { ...(p?.title as any), en: v } }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Sous-titre / Deck (FR)" value={editingArticle.subtitle?.fr || ''} onChange={v => setEditingArticle(p => ({ ...p, subtitle: { ...(p?.subtitle as any), fr: v } }))} hint="Ligne d'accroche sous le titre" />
                      <FormField label="Sous-titre / Deck (EN)" value={editingArticle.subtitle?.en || ''} onChange={v => setEditingArticle(p => ({ ...p, subtitle: { ...(p?.subtitle as any), en: v } }))} />
                    </div>
                    <FormField label="Corps de l'article (Français) *" type="textarea" value={editingArticle.body?.fr || ''} onChange={v => setEditingArticle(p => ({ ...p, body: { ...(p?.body as any), fr: v } }))} required />
                    <FormField label="Corps de l'article (Anglais)" type="textarea" value={editingArticle.body?.en || ''} onChange={v => setEditingArticle(p => ({ ...p, body: { ...(p?.body as any), en: v } }))} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Lieu de l'événement" value={editingArticle.location || ''} onChange={v => setEditingArticle(p => ({ ...p, location: v }))} hint="Ex: Douala, Stade Omnisports" />
                      <FormField label="Crédit source" value={editingArticle.sourceCredit || ''} onChange={v => setEditingArticle(p => ({ ...p, sourceCredit: v }))} hint="Ex: Source: FECAFOOT, AFP" />
                    </div>
                    <FormField label="Temps de lecture estimé (minutes)" type="number" value={editingArticle.read_time || 3} onChange={v => setEditingArticle(p => ({ ...p, read_time: Number(v) }))} />
                  </div>
                )}

                {/* ── Médias ── */}
                {articleTab === 'Médias' && (
                  <div className="space-y-4">
                    <MediaUploader label="Image de couverture principale" value={editingArticle.cover_image || editingArticle.image_url || ''}
                      onChange={v => setEditingArticle(p => ({ ...p, cover_image: v, image_url: v }))} acceptType="image" hint="Image hero de l'article (16:9 recommandé)" />
                    <MediaUploader label="Vidéo principale" value={editingArticle.videoUrl || ''}
                      onChange={v => setEditingArticle(p => ({ ...p, videoUrl: v }))} acceptType="video" hint="Vidéo embarquée dans l'article (MP4, MOV)" />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Galerie d'images supplémentaires</label>
                      <p className="text-[9px] text-white/25">Ajoutez jusqu'à 10 images pour créer une galerie photo dans l'article</p>
                      {(editingArticle.gallery || []).map((img, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <MediaUploader label={`Photo ${i + 1}`} value={img}
                            onChange={v => setEditingArticle(p => { const g = [...(p?.gallery || [])]; g[i] = v; return { ...p, gallery: g }; })}
                            acceptType="image" />
                          <button type="button" onClick={() => setEditingArticle(p => ({ ...p, gallery: (p?.gallery || []).filter((_, j) => j !== i) }))}
                            className="h-8 w-8 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-all text-xs flex-shrink-0">×</button>
                        </div>
                      ))}
                      {(editingArticle.gallery || []).length < 10 && (
                        <AdminButton size="sm" variant="secondary" type="button"
                          onClick={() => setEditingArticle(p => ({ ...p, gallery: [...(p?.gallery || []), ''] }))}>
                          <Plus className="h-3 w-3" /> Ajouter une photo
                        </AdminButton>
                      )}
                    </div>
                  </div>
                )}

                {/* ── SEO & Meta ── */}
                {articleTab === 'SEO & Meta' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Méta-description (FR)" type="textarea" value={editingArticle.metaDescription?.fr || ''}
                        onChange={v => setEditingArticle(p => ({ ...p, metaDescription: { ...(p?.metaDescription as any), fr: v } }))}
                        hint="160 caractères max — affiché dans les résultats Google" />
                      <FormField label="Méta-description (EN)" type="textarea" value={editingArticle.metaDescription?.en || ''}
                        onChange={v => setEditingArticle(p => ({ ...p, metaDescription: { ...(p?.metaDescription as any), en: v } }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Tags / Mots-clés</label>
                      <div className="flex gap-2">
                        <input id="tag-input" placeholder="Ex: Canon Yaoundé, Championnat…"
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const v = (e.target as HTMLInputElement).value.trim(); if (v) { setEditingArticle(p => ({ ...p, tags: [...(p?.tags || []), v] })); (e.target as HTMLInputElement).value = ''; } } }}
                          className="flex-1 h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 transition-colors" />
                        <AdminButton size="sm" variant="secondary" type="button"
                          onClick={() => { const el = document.getElementById('tag-input') as HTMLInputElement; if (el?.value.trim()) { setEditingArticle(p => ({ ...p, tags: [...(p?.tags || []), el.value.trim()] })); el.value = ''; } }}>+</AdminButton>
                      </div>
                      {(editingArticle.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(editingArticle.tags || []).map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent">
                              {tag}
                              <button type="button" onClick={() => setEditingArticle(p => ({ ...p, tags: (p?.tags || []).filter((_, j) => j !== i) }))} className="hover:text-red-400 transition-colors">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Relations ── */}
                {articleTab === 'Relations' && (
                  <div className="space-y-4">
                    <FormField label="ID du match lié" value={editingArticle.relatedMatchId || ''}
                      onChange={v => setEditingArticle(p => ({ ...p, relatedMatchId: v || undefined }))} hint="UUID du match PostgreSQL (optionnel)" />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Clubs associés</label>
                      <select onChange={e => { const v = e.target.value; if (v && !(editingArticle.relatedClubIds || []).includes(v)) setEditingArticle(p => ({ ...p, relatedClubIds: [...(p?.relatedClubIds || []), v] })); e.target.value = ''; }}
                        className="w-full h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white/70 outline-none focus:border-accent/40">
                        <option value="">Sélectionner un club…</option>
                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <div className="flex flex-wrap gap-1.5">
                        {(editingArticle.relatedClubIds || []).map((id, i) => {
                          const club = clubs.find(c => c.id === id);
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] text-sky-400">
                              {club?.name || id}
                              <button type="button" onClick={() => setEditingArticle(p => ({ ...p, relatedClubIds: (p?.relatedClubIds || []).filter((_, j) => j !== i) }))} className="hover:text-red-400">×</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Joueurs associés</label>
                      <select onChange={e => { const v = e.target.value; if (v && !(editingArticle.relatedPlayerIds || []).includes(v)) setEditingArticle(p => ({ ...p, relatedPlayerIds: [...(p?.relatedPlayerIds || []), v] })); e.target.value = ''; }}
                        className="w-full h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white/70 outline-none focus:border-accent/40">
                        <option value="">Sélectionner un joueur…</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.firstName || ''} {p.lastName || p.name || ''} — {p.club?.name || ''}</option>)}
                      </select>
                      <div className="flex flex-wrap gap-1.5">
                        {(editingArticle.relatedPlayerIds || []).map((id, i) => {
                          const player = players.find(p => p.id === id);
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400">
                              {player ? `${player.firstName || ''} ${player.lastName || player.name || ''}` : id}
                              <button type="button" onClick={() => setEditingArticle(p => ({ ...p, relatedPlayerIds: (p?.relatedPlayerIds || []).filter((_, j) => j !== i) }))} className="hover:text-red-400">×</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Publication ── */}
                {articleTab === 'Publication' && (
                  <div className="space-y-4">
                    <FormField label="Statut de publication" type="select" value={editingArticle.status || 'DRAFT'}
                      onChange={v => setEditingArticle(p => ({ ...p, status: v as any }))}
                      options={[{ value: 'DRAFT', label: '📝 Brouillon' }, { value: 'PUBLISHED', label: '✅ Publié' }, { value: 'ARCHIVED', label: '📦 Archivé' }]} />
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <SwitchToggle label="À la une (Featured)" checked={editingArticle.featured || false} onChange={v => setEditingArticle(p => ({ ...p, featured: v }))} />
                      <SwitchToggle label="🔴 Breaking News" checked={editingArticle.isBreaking || false} onChange={v => setEditingArticle(p => ({ ...p, isBreaking: v }))} />
                      <SwitchToggle label="⭐ Contenu Premium" checked={editingArticle.isPremium || false} onChange={v => setEditingArticle(p => ({ ...p, isPremium: v }))} />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05] mt-4">
                  <AdminButton variant="secondary" onClick={() => setEditingArticle(null)}>Annuler</AdminButton>
                  <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                </div>
              </form>
            </AdminCard>
          )}

          <AdminCard noPadding>
            <DataTable
              columns={[
                { key: 'type', label: 'Type', render: r => {
                  const icons: Record<string, string> = { BREAKING: '🔴', VIDEO: '🎥', PHOTO_GALLERY: '📸', OPINION: '💬', LIVE_BLOG: '📡', STANDARD: '📰' };
                  return <span className="text-[11px]">{icons[r.articleType || 'STANDARD'] || '📰'}</span>;
                }},
                { key: 'title', label: 'Titre', render: r => <span className="font-semibold text-white/85">{r.title?.fr || r.title || '—'}</span> },
                { key: 'author', label: 'Auteur', render: r => <span className="text-white/40 text-[10px]">{r.author || '—'}</span> },
                { key: 'category', label: 'Catégorie', render: r => <span className="text-white/45 text-[10px] font-medium uppercase">{r.category}</span> },
                { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
                { key: 'flags', label: 'Drapeaux', align: 'center', render: r => (
                  <div className="flex gap-1 justify-center">
                    {r.featured && <span title="Featured" className="text-accent text-[10px] font-bold">✦</span>}
                    {r.isBreaking && <span title="Breaking" className="text-red-400 text-[10px] font-bold">⚡</span>}
                    {r.isPremium && <span title="Premium" className="text-amber-400 text-[10px] font-bold">★</span>}
                    {!r.featured && !r.isBreaking && !r.isPremium && <span className="text-white/15">—</span>}
                  </div>
                )},
              ]}
              data={articles}
              keyField="_id"
              onEdit={r => { setEditingArticle(r); setArticleTab('Contenu'); }}
              onDelete={r => deleteArticle(r._id!)}
            />
            <div className="px-4 pb-4"><Paginator page={articlePage} total={articleTotal} limit={20} onChange={setArticlePage} /></div>
          </AdminCard>
        </div>
      )}

      {/* ── HALL OF FAME & TALENTS ──────────────────────────────────────────── */}
      {activeTab === 'halloffame' && (
        <div className="space-y-10">
          {/* Legends */}
          <div className="space-y-5">
            <SectionHeader
              title="Temple de la Renommée"
              subtitle="Consacrez les figures historiques du football camerounais"
              icon={Star_}
              actions={
                <AdminButton onClick={() => setEditingLegend({ name: '', bio: { fr: '', en: '' }, era: '80', achievements: [], image_url: '', club_ids: [] })}>
                  <Plus className="h-3.5 w-3.5" /> Introniser une Légende
                </AdminButton>
              }
            />

            {editingLegend && (
              <AdminCard title={editingLegend._id ? 'Modifier Légende' : 'Introniser une Légende'} accent>
                <form onSubmit={saveLegend} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Nom de la légende" value={editingLegend.name || ''} onChange={v => setEditingLegend(p => ({ ...p, name: v }))} required />
                    <FormField label="Époque (ex: 80, 90, 2000)" value={editingLegend.era || ''} onChange={v => setEditingLegend(p => ({ ...p, era: v }))} hint="Décennie de gloire" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Biographie (Français)" type="textarea" value={editingLegend.bio?.fr || ''} onChange={v => setEditingLegend(p => ({ ...p, bio: { ...(p?.bio as any), fr: v } }))} required />
                    <FormField label="Biographie (Anglais)" type="textarea" value={editingLegend.bio?.en || ''} onChange={v => setEditingLegend(p => ({ ...p, bio: { ...(p?.bio as any), en: v } }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <FormField label="Palmarès (séparés par virgule)" value={editingLegend.achievements?.join(', ') || ''} onChange={v => setEditingLegend(p => ({ ...p, achievements: v.split(',').map((s: string) => s.trim()).filter(Boolean) }))} hint="Ex: CAN 2000, Coupe du Cameroun x3" />
                    <MediaUploader label="Photo" value={editingLegend.image_url || ''} onChange={v => setEditingLegend(p => ({ ...p, image_url: v }))} acceptType="image" hint="Portrait de la légende (PNG, JPEG, WEBP)" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                    <AdminButton variant="secondary" onClick={() => setEditingLegend(null)}>Annuler</AdminButton>
                    <AdminButton type="submit" loading={loading}>Introniser</AdminButton>
                  </div>
                </form>
              </AdminCard>
            )}

            <AdminCard noPadding>
              <DataTable
                columns={[
                  { key: 'name', label: 'Légende', render: r => (
                    <div className="flex items-center gap-3">
                      {r.image_url && <img src={r.image_url} className="h-8 w-8 rounded-full object-cover bg-white/5" alt={r.name} />}
                      <span className="font-semibold text-white/85">{r.name}</span>
                    </div>
                  )},
                  { key: 'era', label: 'Époque', render: r => <span className="text-accent font-bold text-[10px]">{r.era}s</span> },
                  { key: 'achievements', label: 'Palmarès', render: r => <span className="text-white/40 text-[10px]">{r.achievements?.slice(0,2).join(' · ')}</span> },
                ]}
                data={legends}
                keyField="_id"
                onEdit={r => setEditingLegend(r)}
                onDelete={r => deleteLegend(r._id!)}
              />
            </AdminCard>
          </div>

          {/* Talents */}
          <div className="space-y-5 pt-6 border-t border-white/[0.05]">
            <SectionHeader
              title="Jeunes Talents & Road to Lions"
              subtitle="Suivez les espoirs locaux et gérez leur statut de promotion"
              icon={TrendingUp_}
              actions={
                <AdminButton onClick={() => setEditingTalent({ playerId: '', highlightVideoUrl: '', status: 'WATCHLIST', scoutingNotes: '', rating: 5 })}>
                  <Plus className="h-3.5 w-3.5" /> Suivre un Talent
                </AdminButton>
              }
            />

            {editingTalent && (
              <AdminCard title={editingTalent._id ? 'Modifier Profil Talent' : 'Suivre un Nouveau Talent'} accent>
                <form onSubmit={saveTalent} className="space-y-4">
                  <FormField label="Joueur" type="select" value={editingTalent.playerId || ''} onChange={v => setEditingTalent(p => ({ ...p, playerId: v }))} options={[{value:'',label:'Sélectionner un joueur'},...players.map(p => ({value:p.id,label:`${p.name} • ${p.club?.name || ''}`}))]} required />
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <FormField label="Statut" type="select" value={editingTalent.status || 'WATCHLIST'} onChange={v => setEditingTalent(p => ({ ...p, status: v as any }))} options={[{value:'WATCHLIST',label:'Watchlist Espoirs'},{value:'PROMOTED',label:'Promu d\'Élite'},{value:'NATIONAL_TEAM',label:'Convoqué Lions 🇨🇲'}]} />
                    <FormField label="Note globale (1–10)" type="number" value={editingTalent.rating || 5} onChange={v => setEditingTalent(p => ({ ...p, rating: Number(v) }))} />
                    <MediaUploader label="Vidéo highlights" value={editingTalent.highlightVideoUrl || ''} onChange={v => setEditingTalent(p => ({ ...p, highlightVideoUrl: v }))} acceptType="video" hint="Vidéo de highlights (MP4, MOV, AVI)" />
                  </div>
                  <FormField label="Notes d'observation (Scout notes)" type="textarea" value={editingTalent.scoutingNotes || ''} onChange={v => setEditingTalent(p => ({ ...p, scoutingNotes: v }))} />
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                    <AdminButton variant="secondary" onClick={() => setEditingTalent(null)}>Annuler</AdminButton>
                    <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                  </div>
                </form>
              </AdminCard>
            )}

            <AdminCard noPadding>
              <DataTable
                columns={[
                  { key: 'player', label: 'Joueur', render: r => <span className="font-semibold text-white/85">{r.player?.name || '—'}</span> },
                  { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
                  { key: 'rating', label: 'Note', align: 'center', render: r => <span className="font-display font-bold text-accent tabular-nums">{r.rating}/10</span> },
                  { key: 'scoutingNotes', label: 'Observations', render: r => <span className="text-white/35 text-[10px] line-clamp-1">{r.scoutingNotes || '—'}</span> },
                ]}
                data={talents}
                keyField="_id"
                onEdit={r => setEditingTalent(r)}
                onDelete={r => deleteTalent(r._id!)}
              />
            </AdminCard>
          </div>
        </div>
      )}

      {/* ── SEASONS ────────────────────────────────────────────────────────── */}
      {activeTab === 'seasons' && (
        <SeasonsTab showToast={showToast} />
      )}

      {/* ── CLUBS ──────────────────────────────────────────────────────────── */}
      {activeTab === 'clubs' && (
        <EntityCrudEngine
          key={clubsBuilderRefreshKey}
          config={ENTITY_REGISTRY.clubs}
          showToast={showToast}
          onOpenBuilder={(r) => setClubBuilderRecord(r)}
        />
      )}

      {/* ── PLAYERS ────────────────────────────────────────────────────────── */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <AdminButton onClick={() => setPlayerBuilderRecord(playersConfig.emptyRecord())}>
              <Sparkles className="h-3.5 w-3.5" /> Nouveau joueur — Builder guidé
            </AdminButton>
          </div>
          <PlayersTab key={playersRefreshKey} clubs={clubs} showToast={showToast} />
        </div>
      )}

      {/* ── COACHES ────────────────────────────────────────────────────────── */}
      {activeTab === 'coaches' && (
        <EntityCrudEngine
          key={coachesBuilderRefreshKey}
          config={ENTITY_REGISTRY.coaches}
          showToast={showToast}
          lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
          onOpenBuilder={(r) => setCoachBuilderRecord(r)}
        />
      )}

      {/* ── USERS ──────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <UsersTab showToast={showToast} />
      )}

      {/* ── STADIUMS ───────────────────────────────────────────────────────── */}
      {activeTab === 'stadiums' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.stadiums}
          showToast={showToast}
          lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
          onOpenBuilder={(r) => setStadiumBuilderRecord(r)}
        />
      )}

      {/* ── EQUIPMENTS ─────────────────────────────────────────────────────── */}
      {activeTab === 'equipments' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.equipments}
          showToast={showToast}
          lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
          onOpenBuilder={(r) => setEquipmentBuilderRecord(r)}
        />
      )}

      {/* ── SPONSORS ───────────────────────────────────────────────────────── */}
      {activeTab === 'sponsors' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.sponsors}
          showToast={showToast}
          onOpenBuilder={(r) => setSponsorBuilderRecord(r)}
        />
      )}

      {/* ── ACTIONS ────────────────────────────────────────────────────────── */}
      {activeTab === 'actions' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.actions}
          showToast={showToast}
          lookupOptions={{
            clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })),
            players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
          }}
          onOpenBuilder={(r) => setActionBuilderRecord(r)}
        />
      )}

      {/* ── TRANSFERS ──────────────────────────────────────────────────────── */}
      {activeTab === 'transfers' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.transfers}
          showToast={showToast}
          lookupOptions={{
            clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })),
            players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
          }}
          onOpenBuilder={(r) => setTransferBuilderRecord(r)}
        />
      )}

      {/* ── INJURIES ───────────────────────────────────────────────────────── */}
      {activeTab === 'injuries' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.injuries}
          showToast={showToast}
          lookupOptions={{
            players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
          }}
          onOpenBuilder={(r) => setInjuryBuilderRecord(r)}
        />
      )}

      {/* ── SELECTIONS ─────────────────────────────────────────────────────── */}
      {activeTab === 'selections' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY.selections}
          showToast={showToast}
          lookupOptions={{
            players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
          }}
          onOpenBuilder={(r) => setSelectionBuilderRecord(r)}
        />
      )}

      {/* ── BIG MOMENTS ────────────────────────────────────────────────────── */}
      {activeTab === 'big-moments' && (
        <EntityCrudEngine
          config={ENTITY_REGISTRY['big-moments']}
          showToast={showToast}
          onOpenBuilder={(r) => setBigMomentBuilderRecord(r)}
        />
      )}

      {/* ── SCOUTING (Young Talent Watch) ───────────────────────────────────── */}
      {activeTab === 'scouting' && (
        <div className="space-y-8">
          <SectionHeader
            title="Young Talent Watch — Scouting Centre"
            subtitle="Gérez les profils de talents émergents, leur progression et leur chemin vers l'Élite"
            icon={TrendingUp_}
            actions={
              <AdminButton onClick={() => setEditingTalent({ playerId: '', highlightVideoUrl: '', status: 'WATCHLIST', scoutingNotes: '', rating: 5 })}>
                <Plus className="h-3.5 w-3.5" /> Suivre un Talent
              </AdminButton>
            }
          />

          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-4">
            <DashboardStatCard label="Watchlist" value={talents.filter(t => t.status === 'WATCHLIST').length} icon={Eye} color="text-blue-400" index={0} />
            <DashboardStatCard label="Promus Élite" value={talents.filter(t => t.status === 'PROMOTED').length} icon={TrendingUp} color="text-emerald-400" index={1} />
            <DashboardStatCard label="Convoqués Lions" value={talents.filter(t => t.status === 'NATIONAL_TEAM').length} icon={Flag} color="text-amber-400" index={2} />
            <DashboardStatCard label="Total Suivis" value={talents.length} icon={Users} color="text-purple-400" index={3} />
          </div>

          {/* Formulaire d'édition */}
          {editingTalent && (
            <AdminCard title={editingTalent._id ? 'Modifier Profil Talent' : 'Suivre un Nouveau Talent'} accent>
              <form onSubmit={saveTalent} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Joueur"
                    type="select"
                    value={editingTalent.playerId || ''}
                    onChange={v => setEditingTalent(p => ({ ...p, playerId: v }))}
                    options={[{ value: '', label: 'Sélectionner un joueur' }, ...players.map(p => ({ value: p.id, label: `${p.name} • ${p.club?.name || ''}` }))]}
                    required
                  />
                  <FormField
                    label="Statut du talent"
                    type="select"
                    value={editingTalent.status || 'WATCHLIST'}
                    onChange={v => setEditingTalent(p => ({ ...p, status: v as any }))}
                    options={[
                      { value: 'WATCHLIST', label: '👁️ Watchlist Espoirs' },
                      { value: 'PROMOTED', label: '🚀 Promu d\'Élite' },
                      { value: 'NATIONAL_TEAM', label: '🇨🇲 Convoqué Indomptables' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <FormField
                    label="Note globale (1–10)"
                    type="number"
                    value={editingTalent.rating || 5}
                    onChange={v => setEditingTalent(p => ({ ...p, rating: Number(v) }))}
                    hint="Évaluation du potentiel"
                  />
                  <FormField
                    label="Position sur le terrain"
                    type="select"
                    value={(editingTalent as any).position || ''}
                    onChange={v => setEditingTalent(p => ({ ...p, position: v } as any))}
                    options={[
                      { value: '', label: 'Poste' },
                      { value: 'GK', label: 'Gardien (GK)' },
                      { value: 'CB', label: 'Défenseur central (CB)' },
                      { value: 'LB', label: 'Arrière gauche (LB)' },
                      { value: 'RB', label: 'Arrière droit (RB)' },
                      { value: 'CDM', label: 'Milieu défensif (CDM)' },
                      { value: 'CM', label: 'Milieu central (CM)' },
                      { value: 'CAM', label: 'Milieu offensif (CAM)' },
                      { value: 'LW', label: 'Ailier gauche (LW)' },
                      { value: 'RW', label: 'Ailier droit (RW)' },
                      { value: 'ST', label: 'Attaquant (ST)' },
                    ]}
                  />
                  <FormField
                    label="Âge du joueur"
                    type="number"
                    value={(editingTalent as any).age || ''}
                    onChange={v => setEditingTalent(p => ({ ...p, age: Number(v) } as any))}
                    hint="Âge actuel"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <MediaUploader
                    label="Vidéo de highlights"
                    value={editingTalent.highlightVideoUrl || ''}
                    onChange={v => setEditingTalent(p => ({ ...p, highlightVideoUrl: v }))}
                    acceptType="video"
                    hint="Vidéo (MP4, MOV)"
                  />
                  <FormField
                    label="Potentiel (ex: 85, 90…)"
                    type="number"
                    value={(editingTalent as any).potential || ''}
                    onChange={v => setEditingTalent(p => ({ ...p, potential: Number(v) } as any))}
                    hint="Note de potentiel FIFA-like"
                  />
                </div>
                <FormField
                  label="Notes du scout (observations détaillées)"
                  type="textarea"
                  value={editingTalent.scoutingNotes || ''}
                  onChange={v => setEditingTalent(p => ({ ...p, scoutingNotes: v }))}
                  hint="Observations tactiques, physiques, techniques du joueur"
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                  <AdminButton variant="secondary" onClick={() => setEditingTalent(null)}>Annuler</AdminButton>
                  <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                </div>
              </form>
            </AdminCard>
          )}

          {/* Table des talents */}
          <AdminCard noPadding>
            <DataTable
              columns={[
                {
                  key: 'player', label: 'Joueur', render: r => (
                    <div className="flex items-center gap-3">
                      {r.player?.profileImageUrl && <img src={r.player.profileImageUrl} className="h-8 w-8 rounded-full object-cover bg-white/5" alt={r.player?.name} />}
                      <div>
                        <p className="font-semibold text-white/85 text-[11px]">{r.player?.name || '—'}</p>
                        <p className="text-white/35 text-[10px]">{r.player?.club?.name || ''}</p>
                      </div>
                    </div>
                  )
                },
                { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
                { key: 'rating', label: 'Note', align: 'center', render: r => <span className="font-display font-bold text-accent tabular-nums">{r.rating}/10</span> },
                { key: 'potential', label: 'Potentiel', align: 'center', render: r => <span className="text-emerald-400 font-bold text-[11px]">{(r as any).potential || '—'}</span> },
                { key: 'scoutingNotes', label: 'Observations', render: r => <span className="text-white/35 text-[10px] line-clamp-1">{r.scoutingNotes || '—'}</span> },
              ]}
              data={talents}
              keyField="_id"
              onEdit={r => setEditingTalent(r)}
              onDelete={r => deleteTalent(r._id!)}
            />
          </AdminCard>
        </div>
      )}

      {/* ── LIONS CENTRE (National Team) ────────────────────────────────────── */}
      {activeTab === 'lions' && (
        <div className="space-y-8">
          <SectionHeader
            title="Centre des Lions — Indomptables"
            subtitle="Gérez les profils des joueurs du championnat convoqués en équipe nationale"
            icon={Trophy_}
          />

          {/* Carte d'info */}
          <div className="grid grid-cols-3 gap-4">
            <AdminCard>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 border border-green-500/20 grid place-items-center shrink-0">
                  <Flag className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Joueurs convoqués</p>
                  <p className="text-2xl font-display font-bold text-white">{talents.filter(t => t.status === 'NATIONAL_TEAM').length}</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 grid place-items-center shrink-0">
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Talents surveillés</p>
                  <p className="text-2xl font-display font-bold text-white">{talents.filter(t => t.status === 'WATCHLIST').length}</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 grid place-items-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Promus cette saison</p>
                  <p className="text-2xl font-display font-bold text-white">{talents.filter(t => t.status === 'PROMOTED').length}</p>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Sélection nationale actuelle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Sélection Nationale Actuelle</h3>
              <AdminButton onClick={() => setEditingTalent({ playerId: '', highlightVideoUrl: '', status: 'NATIONAL_TEAM', scoutingNotes: '', rating: 8 })}>
                <Plus className="h-3.5 w-3.5" /> Ajouter un Lion
              </AdminButton>
            </div>

            {editingTalent && (
              <AdminCard title="Profil Lion — Indomptable" accent>
                <form onSubmit={saveTalent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Joueur du championnat"
                      type="select"
                      value={editingTalent.playerId || ''}
                      onChange={v => setEditingTalent(p => ({ ...p, playerId: v }))}
                      options={[{ value: '', label: 'Sélectionner un joueur' }, ...players.map(p => ({ value: p.id, label: `${p.name} • ${p.club?.name || ''}` }))]}
                      required
                    />
                    <FormField
                      label="Statut Lions"
                      type="select"
                      value={editingTalent.status || 'NATIONAL_TEAM'}
                      onChange={v => setEditingTalent(p => ({ ...p, status: v as any }))}
                      options={[
                        { value: 'NATIONAL_TEAM', label: '🇨🇲 Titulaire Indomptables' },
                        { value: 'PROMOTED', label: '🟡 Prétendant à la sélection' },
                        { value: 'WATCHLIST', label: '👁️ Sous surveillance des Lions' },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Caps nationaux" type="number" value={(editingTalent as any).caps || ''} onChange={v => setEditingTalent(p => ({ ...p, caps: Number(v) } as any))} hint="Nombre de sélections" />
                    <FormField label="Buts en sélection" type="number" value={(editingTalent as any).nationalGoals || ''} onChange={v => setEditingTalent(p => ({ ...p, nationalGoals: Number(v) } as any))} />
                    <FormField label="Note Lions (1–10)" type="number" value={editingTalent.rating || 8} onChange={v => setEditingTalent(p => ({ ...p, rating: Number(v) }))} />
                  </div>
                  <FormField
                    label="Parcours & Histoire (chemin vers les Lions)"
                    type="textarea"
                    value={editingTalent.scoutingNotes || ''}
                    onChange={v => setEditingTalent(p => ({ ...p, scoutingNotes: v }))}
                    hint="Description du parcours du joueur depuis l'académie jusqu'aux Lions"
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                    <AdminButton variant="secondary" onClick={() => setEditingTalent(null)}>Annuler</AdminButton>
                    <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
                  </div>
                </form>
              </AdminCard>
            )}

            <AdminCard noPadding>
              <DataTable
                columns={[
                  {
                    key: 'player', label: 'Lion', render: r => (
                      <div className="flex items-center gap-3">
                        {r.player?.profileImageUrl && <img src={r.player.profileImageUrl} className="h-9 w-9 rounded-full object-cover border border-green-500/30" alt={r.player?.name} />}
                        <div>
                          <p className="font-bold text-white/90 text-[11px]">{r.player?.name || '—'}</p>
                          <p className="text-white/35 text-[10px]">{r.player?.club?.name || ''}</p>
                        </div>
                      </div>
                    )
                  },
                  { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
                  { key: 'caps', label: 'Caps', align: 'center', render: r => <span className="font-bold text-accent text-[11px]">{(r as any).caps ?? '—'}</span> },
                  { key: 'nationalGoals', label: 'Buts', align: 'center', render: r => <span className="font-bold text-emerald-400 text-[11px]">{(r as any).nationalGoals ?? '—'}</span> },
                  { key: 'rating', label: 'Note', align: 'center', render: r => <span className="font-display font-bold text-amber-400 tabular-nums text-[11px]">{r.rating}/10</span> },
                ]}
                data={talents}
                keyField="_id"
                onEdit={r => setEditingTalent(r)}
                onDelete={r => deleteTalent(r._id!)}
              />
            </AdminCard>
          </div>

          {/* Configuration de la page Lions */}
          <AdminCard title="Configuration de la page Lions" accent>
            <div className="space-y-4">
              <p className="text-[11px] text-white/40">Paramètres d'affichage et de contenu de la section Road to Lions</p>
              <div className="grid grid-cols-2 gap-4">
                <SwitchToggle label="Afficher le compte à rebours tournoi" checked={false} onChange={() => {}} />
                <SwitchToggle label="Activer le vote meilleur Lion du mois" checked={false} onChange={() => {}} />
                <SwitchToggle label="Afficher la timeline historique" checked={true} onChange={() => {}} />
                <SwitchToggle label="Afficher les stats internationales" checked={true} onChange={() => {}} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Prochain tournoi / compétition" value="" onChange={() => {}} hint="Ex: CHAN 2025, CAN 2026" />
                <FormField label="Date du prochain match Lions" type="date" value="" onChange={() => {}} />
              </div>
              <div className="flex justify-end pt-2 border-t border-white/[0.05]">
                <AdminButton onClick={() => showToast('Configuration Lions sauvegardée !')}>
                  <Save className="h-3.5 w-3.5" /> Sauvegarder
                </AdminButton>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── MUSEUM & ARCHIVES ────────────────────────────────────────────────── */}
      {activeTab === 'museum' && (
        <div className="space-y-8">
          <SectionHeader
            title="Musée & Archives — Heritage Centre"
            subtitle="Administrez le musée digital officiel du football camerounais"
            icon={Trophy_}
          />

          {/* Vue d'ensemble */}
          <div className="grid grid-cols-4 gap-4">
            <DashboardStatCard label="Saisons archivées" value={seasons.length} icon={CalendarDays} color="text-blue-400" index={0} />
            <DashboardStatCard label="Légendes Hall of Fame" value={legends.length} icon={Star} color="text-amber-400" index={1} />
            <DashboardStatCard label="Records enregistrés" value={12} icon={Trophy} color="text-emerald-400" index={2} />
            <DashboardStatCard label="Moments historiques" value={8} icon={Flag} color="text-purple-400" index={3} />
          </div>

          {/* Hall of Fame — gestion des légendes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Hall of Fame — Légendes</h3>
                <p className="text-[11px] text-white/35 mt-1">Intronisez et gérez les figures légendaires du football camerounais</p>
              </div>
              <AdminButton onClick={() => setEditingLegend({ name: '', bio: { fr: '', en: '' }, era: '90', achievements: [], image_url: '', club_ids: [] })}>
                <Plus className="h-3.5 w-3.5" /> Introniser une Légende
              </AdminButton>
            </div>

            {editingLegend && (
              <AdminCard title={editingLegend._id ? 'Modifier Légende' : 'Introniser une Légende'} accent>
                <form onSubmit={saveLegend} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Nom de la légende" value={editingLegend.name || ''} onChange={v => setEditingLegend(p => ({ ...p, name: v }))} required />
                    <FormField label="Époque (ex: 80, 90, 2000)" value={editingLegend.era || ''} onChange={v => setEditingLegend(p => ({ ...p, era: v }))} hint="Décennie de gloire" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Biographie (Français)" type="textarea" value={editingLegend.bio?.fr || ''} onChange={v => setEditingLegend(p => ({ ...p, bio: { ...(p?.bio as any), fr: v } }))} required />
                    <FormField label="Biographie (Anglais)" type="textarea" value={editingLegend.bio?.en || ''} onChange={v => setEditingLegend(p => ({ ...p, bio: { ...(p?.bio as any), en: v } }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Poste occupé" value={(editingLegend as any).position || ''} onChange={v => setEditingLegend(p => ({ ...p, position: v } as any))} hint="Ex: Attaquant, Milieu" />
                    <FormField label="Nationalité" value={(editingLegend as any).nationality || 'Cameroun'} onChange={v => setEditingLegend(p => ({ ...p, nationality: v } as any))} />
                    <FormField label="Club emblématique" value={(editingLegend as any).iconicClub || ''} onChange={v => setEditingLegend(p => ({ ...p, iconicClub: v } as any))} hint="Club de cœur" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <FormField label="Palmarès (séparés par virgule)" value={editingLegend.achievements?.join(', ') || ''} onChange={v => setEditingLegend(p => ({ ...p, achievements: v.split(',').map((s: string) => s.trim()).filter(Boolean) }))} hint="Ex: CAN 2000, Coupe du Cameroun x3" />
                    <MediaUploader label="Photo de la légende" value={editingLegend.image_url || ''} onChange={v => setEditingLegend(p => ({ ...p, image_url: v }))} acceptType="image" hint="Portrait (PNG, JPEG, WEBP)" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                    <AdminButton variant="secondary" onClick={() => setEditingLegend(null)}>Annuler</AdminButton>
                    <AdminButton type="submit" loading={loading}>Introniser</AdminButton>
                  </div>
                </form>
              </AdminCard>
            )}

            <AdminCard noPadding>
              <DataTable
                columns={[
                  {
                    key: 'name', label: 'Légende', render: r => (
                      <div className="flex items-center gap-3">
                        {r.image_url && <img src={r.image_url} className="h-9 w-9 rounded-full object-cover bg-white/5 border border-amber-500/20" alt={r.name} />}
                        <div>
                          <p className="font-bold text-white/90 text-[11px]">{r.name}</p>
                          <p className="text-white/35 text-[10px]">{(r as any).iconicClub || ''}</p>
                        </div>
                      </div>
                    )
                  },
                  { key: 'era', label: 'Époque', render: r => <span className="text-accent font-bold text-[10px]">{r.era}s</span> },
                  { key: 'position', label: 'Poste', render: r => <span className="text-white/40 text-[10px]">{(r as any).position || '—'}</span> },
                  { key: 'achievements', label: 'Palmarès', render: r => <span className="text-white/40 text-[10px]">{r.achievements?.slice(0, 2).join(' · ')}</span> },
                ]}
                data={legends}
                keyField="_id"
                onEdit={r => setEditingLegend(r)}
                onDelete={r => deleteLegend(r._id!)}
              />
            </AdminCard>
          </div>

          {/* Archives de saisons */}
          <div className="space-y-4 pt-6 border-t border-white/[0.05]">
            <div>
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Archives des Saisons</h3>
              <p className="text-[11px] text-white/35 mt-1">Chaque saison disponible dans les archives du musée</p>
            </div>
            <AdminCard noPadding>
              <DataTable
                columns={[
                  { key: 'name', label: 'Saison', render: r => <span className="font-bold text-white/85 text-[11px]">{r.name || r.year || '—'}</span> },
                  { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
                  { key: 'champion', label: 'Champion', render: r => <span className="text-accent font-semibold text-[10px]">{r.champion || '—'}</span> },
                  { key: 'archived', label: 'Archivée', align: 'center', render: r => <span className={`text-[10px] font-bold ${r.status === 'COMPLETED' ? 'text-emerald-400' : 'text-white/25'}`}>{r.status === 'COMPLETED' ? '✓' : '—'}</span> },
                ]}
                data={seasons}
                keyField="id"
                onEdit={() => {}}
              />
            </AdminCard>
          </div>

          {/* Configuration du musée */}
          <AdminCard title="Configuration du Musée Digital" accent>
            <div className="space-y-4">
              <p className="text-[11px] text-white/40">Paramètres d'affichage de la section Heritage & Archives</p>
              <div className="grid grid-cols-2 gap-4">
                <SwitchToggle label="Afficher le Hall of Champions" checked={true} onChange={() => {}} />
                <SwitchToggle label="Activer les Archives de Saisons" checked={true} onChange={() => {}} />
                <SwitchToggle label="Afficher les Records Centre" checked={true} onChange={() => {}} />
                <SwitchToggle label="Afficher l'Évolution de la Ligue" checked={true} onChange={() => {}} />
                <SwitchToggle label="Afficher l'histoire des Derbies" checked={true} onChange={() => {}} />
                <SwitchToggle label="Afficher les Finales Historiques" checked={false} onChange={() => {}} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Titre de la section musée" value="Musée & Archives" onChange={() => {}} hint="Affiché dans la navigation" />
                <FormField label="Sous-titre éditorial" value="Le patrimoine du football camerounais" onChange={() => {}} />
              </div>
              <div className="flex justify-end pt-2 border-t border-white/[0.05]">
                <AdminButton onClick={() => showToast('Configuration musée sauvegardée !')}>
                  <Save className="h-3.5 w-3.5" /> Sauvegarder
                </AdminButton>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── Contacts panel ────────────────────────────────────────────────────── */}
      {activeTab === 'contacts' && (
        <ContactsPanel showToast={showToast} />
      )}

      {/* ── System Settings panel ────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <SettingsPanel showToast={showToast} />
      )}
    </AdminLayout>

    {/* ── League Studio: Player Builder overlay ─────────────────────────── */}
    {playerBuilderRecord && (
      <GuidedBuilderEngine
        config={playersConfig}
        record={playerBuilderRecord}
        lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
        showToast={showToast}
        renderPreview={(data) => (
          <PlayerPreviewCard
            data={data}
            clubOptions={clubs.map((c: any) => ({ value: c.id, label: c.name }))}
          />
        )}
        onClose={() => {
          setPlayerBuilderRecord(null);
          setPlayersRefreshKey((k) => k + 1);
        }}
      />
    )}

    {/* ── League Studio: Club Builder overlay ───────────────────────────── */}
    {clubBuilderRecord && (
      <GuidedBuilderEngine
        config={clubsConfig}
        record={clubBuilderRecord}
        showToast={showToast}
        onClose={() => {
          setClubBuilderRecord(null);
          setClubsBuilderRefreshKey((k) => k + 1);
        }}
      />
    )}

    {/* ── League Studio: Coach Builder overlay ──────────────────────────── */}
    {coachBuilderRecord && (
      <GuidedBuilderEngine
        config={coachesConfig}
        record={coachBuilderRecord}
        lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
        showToast={showToast}
        onClose={() => {
          setCoachBuilderRecord(null);
          setCoachesBuilderRefreshKey((k) => k + 1);
        }}
      />
    )}

    {/* ── League Studio: Stadium Builder overlay ────────────────────────── */}
    {stadiumBuilderRecord && (
      <GuidedBuilderEngine
        config={stadiumsConfig}
        record={stadiumBuilderRecord}
        lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
        showToast={showToast}
        onClose={() => setStadiumBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Equipment Builder overlay ──────────────────────── */}
    {equipmentBuilderRecord && (
      <GuidedBuilderEngine
        config={equipmentsConfig}
        record={equipmentBuilderRecord}
        lookupOptions={{ clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })) }}
        showToast={showToast}
        onClose={() => setEquipmentBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Sponsor Builder overlay ────────────────────────── */}
    {sponsorBuilderRecord && (
      <GuidedBuilderEngine
        config={sponsorsConfig}
        record={sponsorBuilderRecord}
        showToast={showToast}
        onClose={() => setSponsorBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Action (Big Moment) Builder overlay ────────────── */}
    {actionBuilderRecord && (
      <GuidedBuilderEngine
        config={ENTITY_REGISTRY.actions}
        record={actionBuilderRecord}
        lookupOptions={{
          clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })),
          players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
        }}
        showToast={showToast}
        onClose={() => setActionBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Transfer Builder overlay ───────────────────────── */}
    {transferBuilderRecord && (
      <GuidedBuilderEngine
        config={transfersConfig}
        record={transferBuilderRecord}
        lookupOptions={{
          clubs: clubs.map((c: any) => ({ value: c.id, label: c.name })),
          players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
        }}
        showToast={showToast}
        onClose={() => setTransferBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Injury Builder overlay ─────────────────────────── */}
    {injuryBuilderRecord && (
      <GuidedBuilderEngine
        config={injuriesConfig}
        record={injuryBuilderRecord}
        lookupOptions={{
          players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
        }}
        showToast={showToast}
        onClose={() => setInjuryBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Selection Builder overlay ──────────────────────── */}
    {selectionBuilderRecord && (
      <GuidedBuilderEngine
        config={selectionsConfig}
        record={selectionBuilderRecord}
        lookupOptions={{
          players: players.map((p: any) => ({ value: p.id, label: `${p.firstName ?? ''} ${p.lastName ?? p.name ?? ''}`.trim() })),
        }}
        showToast={showToast}
        onClose={() => setSelectionBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: Big Moment Builder overlay ─────────────────────── */}
    {bigMomentBuilderRecord && (
      <GuidedBuilderEngine
        config={bigMomentsConfig}
        record={bigMomentBuilderRecord}
        showToast={showToast}
        onClose={() => setBigMomentBuilderRecord(null)}
      />
    )}

    {/* ── League Studio: global Command Palette (⌘K) ────────────────────── */}
    <CommandPalette
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      onNavigate={(tab) => setActiveTab(tab)}
      onCreatePlayer={() => setPlayerBuilderRecord(playersConfig.emptyRecord())}
      onCreateClub={() => setClubBuilderRecord(clubsConfig.emptyRecord())}
      onCreateSeason={() => {
        // Triggers the custom wizard in SeasonsTab
        setActiveTab('seasons');
        setPaletteOpen(false);
      }}
      onCreateMatch={() => setEditingMatch({ homeClubId: '', awayClubId: '', status: 'SCHEDULED', round: 1, kickoff: new Date().toISOString(), venue: '', seasonId: currentSeasonId })}
      onCreateCoach={() => setCoachBuilderRecord(coachesConfig.emptyRecord())}
      onCreateStadium={() => setStadiumBuilderRecord(stadiumsConfig.emptyRecord())}
      onCreateAward={() => setEditingAward({ category: 'Joueur de la Semaine', periodStart: new Date().toISOString(), periodEnd: new Date().toISOString(), status: 'CLOSED', seasonId: Number(currentSeasonId) as any })}
    />
    </>
  );
}

/* ─── Stub icon aliases (avoid import duplication for layoutId motion) ─────── */
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LucideProps } from 'lucide-react';
type LucideIconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

import {
  LayoutDashboard, Layers, Image, Calendar, Trophy as TrophyIcon,
  BarChart2 as BarChart2Icon, FileText as FileTextIcon, Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

const LayoutDashboard_: LucideIconType = LayoutDashboard;
const Layers_: LucideIconType          = Layers;
const Image_: LucideIconType           = Image;
const Calendar_: LucideIconType        = Calendar;
const Trophy_: LucideIconType          = TrophyIcon;
const BarChart2_: LucideIconType       = BarChart2Icon;
const FileText_: LucideIconType        = FileTextIcon;
const Star_: LucideIconType            = StarIcon;
const TrendingUp_: LucideIconType      = TrendingUpIcon;