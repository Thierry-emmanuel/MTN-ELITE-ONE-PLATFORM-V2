/**
 * AdminEntityTabs.tsx
 * Professional admin tabs: Seasons · Clubs · Players · Coaches · Users
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Play, StopCircle, RefreshCw,
  UserCheck, UserX, Shield, Users, Zap, Globe, Instagram,
  Twitter, Youtube, Flag,
} from 'lucide-react';
import {
  AdminCard, FormField, AdminButton, DataTable,
  StatusBadge, SectionHeader, BulkImportExport, Paginator, SwitchToggle,
  MediaUploader,
} from '@/components/ui/AdminUI';
import { layoutApi } from '@/services/layoutApi';

type ToastFn = (msg: string, type?: 'success' | 'error' | 'info') => void;

/* ─── Shared multi-tab form helper ───────────────────────────────────────── */
function FormTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-white/[0.06] mb-4 -mx-1 px-1">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-t-lg ${active === t ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-white/30 hover:text-white/60'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

/* ─── Tag input ──────────────────────────────────────────────────────────── */
function TagInput({ label, value, onChange, placeholder, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</label>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || 'Ajouter…'}
          className="flex-1 h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 transition-colors" />
        <button type="button" onClick={add} className="px-3 h-8 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold hover:bg-accent/20 transition-all">+</button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[10px] text-white/60">
              {v}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400 transition-colors ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      {hint && <span className="text-[9px] text-white/25">{hint}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SEASONS TAB                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function SeasonsTab({ showToast }: { showToast: ToastFn }) {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await layoutApi.getSeasons(); setSeasons(res);
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) { showToast(e?.response?.data?.message || e.message, 'error'); }
    finally { setLoading(false); }
  };

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = { name: editing.name, startDate: editing.startDate, endDate: editing.endDate, status: editing.status || 'UPCOMING' };
    if (editing.id) {
      const r = await layoutApi.updateSeason(editing.id, dto);
      setSeasons(p => p.map(s => s.id === r.id ? r : s)); showToast('Saison mise à jour.');
    } else {
      const r = await layoutApi.createSeason(dto);
      setSeasons(p => [...p, r]); showToast('Saison créée !');
    }
    setEditing(null);
  }); };

  const activate = (id: string) => run(async () => { const r = await layoutApi.activateSeason(id); setSeasons(p => p.map(s => s.id === id ? r : (s.status === 'ONGOING' ? { ...s, status: 'COMPLETED' } : s))); showToast('Saison activée.'); });
  const close = (id: string) => run(async () => { const r = await layoutApi.closeSeason(id); setSeasons(p => p.map(s => s.id === id ? r : s)); showToast('Saison clôturée.'); });
  const initStandings = (id: string) => run(async () => { const r = await layoutApi.initStandings(id); showToast(r.message || 'Classements initialisés.', 'info'); });
  const remove = (id: string, name: string) => { if (!confirm(`Supprimer "${name}" ?`)) return; run(async () => { await layoutApi.deleteSeason(id); setSeasons(p => p.filter(s => s.id !== id)); showToast('Saison supprimée.'); }); };

  const STATUS_COLOR: Record<string, string> = { UPCOMING: 'text-sky-400', ONGOING: 'text-emerald-400', COMPLETED: 'text-white/30' };

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Saisons" subtitle="Créez et gérez le cycle de vie de chaque saison"
        actions={<AdminButton onClick={() => setEditing({ name: '', startDate: '', endDate: '', status: 'UPCOMING' })}><Plus className="h-3.5 w-3.5" /> Nouvelle Saison</AdminButton>} />
      {editing && (
        <AdminCard title={editing.id ? 'Modifier la Saison' : 'Créer une Saison'} accent>
          <form onSubmit={save} className="space-y-4">
            <FormField label="Nom de la saison" value={editing.name || ''} onChange={v => setEditing((p: any) => ({ ...p, name: v }))} required hint="Ex: Saison 2025/2026" />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date de début" type="date" value={editing.startDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, startDate: v }))} required />
              <FormField label="Date de fin" type="date" value={editing.endDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, endDate: v }))} required />
            </div>
            {editing.id && (<FormField label="Statut" type="select" value={editing.status || 'UPCOMING'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))} options={[{ value: 'UPCOMING', label: 'À venir' }, { value: 'ONGOING', label: 'En cours' }, { value: 'COMPLETED', label: 'Terminée' }]} />)}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}
      <div className="space-y-3">
        {seasons.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 p-5 bg-[#111820] border border-white/[0.06] rounded-2xl hover:border-white/12 transition-all group">
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${s.status === 'ONGOING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : s.status === 'UPCOMING' ? 'bg-sky-500' : 'bg-white/15'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-white/90 text-sm">{s.name}</p>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${STATUS_COLOR[s.status]}`}>{s.status === 'UPCOMING' ? 'À venir' : s.status === 'ONGOING' ? 'En cours' : 'Terminée'}</span>
              </div>
              <p className="text-[10px] text-white/35 mt-0.5">{s.startDate ? new Date(s.startDate).toLocaleDateString('fr-FR') : '—'} → {s.endDate ? new Date(s.endDate).toLocaleDateString('fr-FR') : '—'}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
              {s.status === 'UPCOMING' && (<AdminButton size="sm" variant="success" onClick={() => activate(s.id)} loading={loading}><Play className="h-3 w-3" /> Activer</AdminButton>)}
              {s.status === 'ONGOING' && (<><AdminButton size="sm" variant="secondary" onClick={() => initStandings(s.id)} loading={loading}><RefreshCw className="h-3 w-3" /> Init Classements</AdminButton><AdminButton size="sm" variant="danger" onClick={() => close(s.id)} loading={loading}><StopCircle className="h-3 w-3" /> Clôturer</AdminButton></>)}
              <AdminButton size="sm" variant="ghost" onClick={() => setEditing(s)}><Edit3 className="h-3 w-3" /></AdminButton>
              {s.status !== 'ONGOING' && (<AdminButton size="sm" variant="danger" onClick={() => remove(s.id, s.name)}><Trash2 className="h-3 w-3" /></AdminButton>)}
            </div>
          </motion.div>
        ))}
        {!seasons.length && <p className="text-center text-white/25 text-sm py-12">Aucune saison créée</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CLUBS TAB                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function ClubsTab({ showToast }: { showToast: ToastFn }) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('Identité');
  const LIMIT = 16;

  const load = useCallback(async () => {
    const res = await layoutApi.getClubs({ page, limit: LIMIT });
    setClubs(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) { showToast(e?.response?.data?.message || e.message, 'error'); }
    finally { setLoading(false); }
  };

  const emptyClub = () => ({
    name: '', nickname: '', city: '', region: '', foundedYear: new Date().getFullYear(), status: 'ACTIVE',
    websiteUrl: '', logoUrl: '', bannerUrl: '', videoUrl: '',
    primaryColor: '#fcd116', secondaryColor: '#007a5e',
    stadium: '', stadiumCapacity: '', stadiumPhotoUrl: '',
    description: '', history: '',
    palmares: [] as string[],
    presidentName: '', presidentPhotoUrl: '', budget: '',
    achievements: { league: 0, cup: 0, regional: 0, african: 0 },
    socialMedia: { twitter: '', instagram: '', facebook: '', youtube: '', tiktok: '' },
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = {
      ...editing,
      foundedYear: Number(editing.foundedYear),
      stadiumCapacity: editing.stadiumCapacity ? Number(editing.stadiumCapacity) : undefined,
      budget: editing.budget ? Number(editing.budget) : undefined,
    };
    if (editing.id) {
      const r = await layoutApi.updateClub(editing.id, dto);
      setClubs(p => p.map(c => c.id === r.id ? r : c)); showToast('Club mis à jour.');
    } else {
      const r = await layoutApi.createClub(dto);
      setClubs(p => [...p, r]); setTotal(t => t + 1); showToast('Club créé !');
    }
    setEditing(null);
  }); };

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    run(async () => { await layoutApi.deleteClub(id); setClubs(p => p.filter(c => c.id !== id)); setTotal(t => t - 1); showToast('Club supprimé.'); });
  };

  const importClubs = async (rows: any[]) => {
    setImporting(true); let ok = 0;
    for (const row of rows) { try { await layoutApi.createClub({ ...row, foundedYear: Number(row.foundedYear) }); ok++; } catch { /* skip */ } }
    await load(); showToast(`${ok} club(s) importé(s).`); setImporting(false);
  };

  const TABS = ['Identité', 'Stade', 'Palmarès', 'Direction', 'Médias', 'Réseaux'];

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Clubs" subtitle="Profils complets — identité, stade, palmarès, direction, médias"
        actions={
          <div className="flex items-center gap-2">
            <BulkImportExport entityName="Clubs" data={clubs}
              templateFields={['name','nickname','city','region','foundedYear','stadium','logoUrl','primaryColor','secondaryColor','status']}
              onImport={importClubs} importLoading={importing} />
            <AdminButton onClick={() => { setEditing(emptyClub()); setActiveTab('Identité'); }}>
              <Plus className="h-3.5 w-3.5" /> Créer un Club
            </AdminButton>
          </div>
        }
      />

      {editing && (
        <AdminCard title={editing.id ? `Modifier — ${editing.name}` : 'Créer un Nouveau Club'} accent>
          <form onSubmit={save} className="space-y-4">
            <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

            {/* ── Identité ── */}
            {activeTab === 'Identité' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nom officiel du club *" value={editing.name || ''} onChange={v => setEditing((p: any) => ({ ...p, name: v }))} required />
                  <FormField label="Surnom / Alias" value={editing.nickname || ''} onChange={v => setEditing((p: any) => ({ ...p, nickname: v }))} hint="Ex: Les Diables Noirs" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Ville" value={editing.city || ''} onChange={v => setEditing((p: any) => ({ ...p, city: v }))} required />
                  <FormField label="Région" value={editing.region || ''} onChange={v => setEditing((p: any) => ({ ...p, region: v }))} hint="Ex: Centre, Littoral, Ouest" />
                  <FormField label="Année de fondation" type="number" value={editing.foundedYear || ''} onChange={v => setEditing((p: any) => ({ ...p, foundedYear: v }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Site officiel" value={editing.websiteUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, websiteUrl: v }))} hint="https://…" />
                  <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))} options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Couleur principale</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={editing.primaryColor || '#fcd116'} onChange={e => setEditing((p: any) => ({ ...p, primaryColor: e.target.value }))} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                      <span className="text-xs text-white/40 font-mono">{editing.primaryColor || '#fcd116'}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Couleur secondaire</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={editing.secondaryColor || '#007a5e'} onChange={e => setEditing((p: any) => ({ ...p, secondaryColor: e.target.value }))} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                      <span className="text-xs text-white/40 font-mono">{editing.secondaryColor || '#007a5e'}</span>
                    </div>
                  </div>
                </div>
                <FormField label="Description courte" type="textarea" value={editing.description || ''} onChange={v => setEditing((p: any) => ({ ...p, description: v }))} hint="Résumé affiché sur les cartes club" />
                <FormField label="Histoire complète du club" type="textarea" value={editing.history || ''} onChange={v => setEditing((p: any) => ({ ...p, history: v }))} hint="Historique détaillé — origines, moments clés, évolution" />
              </div>
            )}

            {/* ── Stade ── */}
            {activeTab === 'Stade' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nom du stade *" value={editing.stadium || ''} onChange={v => setEditing((p: any) => ({ ...p, stadium: v }))} required hint="Stade domicile officiel" />
                  <FormField label="Capacité (spectateurs)" type="number" value={editing.stadiumCapacity || ''} onChange={v => setEditing((p: any) => ({ ...p, stadiumCapacity: v }))} />
                </div>
                <MediaUploader label="Photo du stade" value={editing.stadiumPhotoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, stadiumPhotoUrl: v }))} acceptType="image" hint="Vue aérienne ou panoramique du stade" />
              </div>
            )}

            {/* ── Palmarès ── */}
            {activeTab === 'Palmarès' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Titres Championnat" type="number" value={editing.achievements?.league ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, league: Number(v) } }))} />
                  <FormField label="Coupes nationales" type="number" value={editing.achievements?.cup ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, cup: Number(v) } }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Trophées régionaux" type="number" value={editing.achievements?.regional ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, regional: Number(v) } }))} />
                  <FormField label="Trophées africains" type="number" value={editing.achievements?.african ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, african: Number(v) } }))} />
                </div>
                <TagInput label="Liste des titres remportés" value={editing.palmares || []} onChange={v => setEditing((p: any) => ({ ...p, palmares: v }))}
                  placeholder="Ex: MTN Elite One 2010" hint="Appuyez Entrée ou + pour ajouter chaque titre" />
              </div>
            )}

            {/* ── Direction ── */}
            {activeTab === 'Direction' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 items-end">
                  <FormField label="Nom du président" value={editing.presidentName || ''} onChange={v => setEditing((p: any) => ({ ...p, presidentName: v }))} />
                  <FormField label="Budget annuel (FCFA)" type="number" value={editing.budget || ''} onChange={v => setEditing((p: any) => ({ ...p, budget: v }))} hint="Ex: 150000000" />
                </div>
                <MediaUploader label="Photo du président" value={editing.presidentPhotoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, presidentPhotoUrl: v }))} acceptType="image" hint="Portrait officiel du président du club" />
              </div>
            )}

            {/* ── Médias ── */}
            {activeTab === 'Médias' && (
              <div className="space-y-4">
                <MediaUploader label="Logo officiel" value={editing.logoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, logoUrl: v }))} acceptType="image" hint="Logo du club en PNG/WEBP avec transparence" />
                <MediaUploader label="Image bannière (hero)" value={editing.bannerUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, bannerUrl: v }))} acceptType="image" hint="Image de couverture haute résolution pour la page club" />
                <MediaUploader label="Vidéo de présentation" value={editing.videoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, videoUrl: v }))} acceptType="video" hint="Vidéo promo / intro du club (MP4, MOV)" />
              </div>
            )}

            {/* ── Réseaux sociaux ── */}
            {activeTab === 'Réseaux' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} hint="@handle ou URL complète" /></div>
                  <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-400 shrink-0" /><FormField label="Facebook" value={editing.socialMedia?.facebook || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, facebook: v } }))} /></div>
                  <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400 shrink-0" /><FormField label="YouTube" value={editing.socialMedia?.youtube || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: v } }))} /></div>
                </div>
                <FormField label="TikTok" value={editing.socialMedia?.tiktok || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, tiktok: v } }))} />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05] mt-4">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Club Cards Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {clubs.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            className="bg-[#111820] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/14 transition-all group">
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${c.primaryColor || '#fcd116'}, ${c.secondaryColor || '#007a5e'})` }} />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {c.logoUrl ? (<img src={c.logoUrl} alt={c.name} className="h-10 w-10 object-contain rounded-lg bg-white/5 mb-2" />) : (<div className="h-10 w-10 rounded-lg bg-white/5 border border-white/8 grid place-items-center mb-2"><Shield className="h-5 w-5 text-white/20" /></div>)}
                  <p className="text-xs font-bold text-white/85 leading-tight">{c.name}</p>
                  {c.nickname && <p className="text-[9px] text-accent/70 font-medium">{c.nickname}</p>}
                  <p className="text-[10px] text-white/35 mt-0.5">{c.city}{c.region ? ` · ${c.region}` : ''}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.stadium && <p className="text-[9px] text-white/25 font-medium truncate">{c.stadium}{c.stadiumCapacity ? ` · ${c.stadiumCapacity.toLocaleString()} places` : ''}</p>}
              <p className="text-[9px] text-white/25">Fondé en {c.foundedYear}</p>
              {(c.achievements?.league || c.achievements?.cup) ? (
                <div className="flex gap-2 text-[9px]">
                  {c.achievements.league > 0 && <span className="text-amber-400 font-bold">🏆 {c.achievements.league}</span>}
                  {c.achievements.cup > 0 && <span className="text-sky-400 font-bold">🥇 {c.achievements.cup}</span>}
                </div>
              ) : null}
              <div className="flex gap-1.5 pt-1 border-t border-white/[0.05]">
                <AdminButton size="sm" variant="secondary" onClick={() => { setEditing(c); setActiveTab('Identité'); }} className="flex-1"><Edit3 className="h-3 w-3" /> Modifier</AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => remove(c.id, c.name)}><Trash2 className="h-3 w-3" /></AdminButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <Paginator page={page} total={total} limit={LIMIT} onChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PLAYERS TAB                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function PlayersTab({ clubs, showToast }: { clubs: any[]; showToast: ToastFn }) {
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterClub, setFilterClub] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferClub, setTransferClub] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('Identité');
  const LIMIT = 20;
  const TABS = ['Identité', 'Physique', 'Carrière', 'Stats', 'Contrat', 'Médias', 'Réseaux'];

  const load = useCallback(async () => {
    const params: any = { page, limit: LIMIT };
    if (filterClub) params.clubId = filterClub;
    if (filterPos) params.position = filterPos;
    const res = await layoutApi.getPlayers(params);
    setPlayers(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page, filterClub, filterPos]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) { showToast(e?.response?.data?.message || e.message, 'error'); }
    finally { setLoading(false); }
  };

  const emptyPlayer = () => ({
    firstName: '', lastName: '', nickname: '', position: 'FWD',
    nationality: '', secondNationality: '', birthDate: '', birthPlace: '',
    jerseyNumber: '', height: '', weight: '', preferredFoot: '',
    photoUrl: '', secondaryPhotoUrl: '', videoUrl: '',
    biography: '', formerClubs: [] as string[],
    marketValue: '', contractExpiry: '', agentName: '',
    appearances: 0, goals: 0, assists: 0, internationalCaps: 0, internationalGoals: 0,
    status: 'ACTIVE', isActive: true,
    socialMedia: { twitter: '', instagram: '', youtube: '', tiktok: '' },
    clubId: '',
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = {
      ...editing,
      jerseyNumber: editing.jerseyNumber ? Number(editing.jerseyNumber) : null,
      height: editing.height ? Number(editing.height) : undefined,
      weight: editing.weight ? Number(editing.weight) : undefined,
      marketValue: editing.marketValue ? Number(editing.marketValue) : null,
      appearances: Number(editing.appearances || 0),
      goals: Number(editing.goals || 0),
      assists: Number(editing.assists || 0),
      internationalCaps: Number(editing.internationalCaps || 0),
      internationalGoals: Number(editing.internationalGoals || 0),
      clubId: editing.clubId || null,
    };
    if (editing.id) {
      const r = await layoutApi.updatePlayer(editing.id, dto);
      setPlayers(p => p.map(pl => pl.id === r.id ? r : pl)); showToast('Joueur mis à jour.');
    } else {
      const r = await layoutApi.createPlayer(dto);
      setPlayers(p => [r, ...p]); setTotal(t => t + 1); showToast('Joueur enregistré !');
    }
    setEditing(null);
  }); };

  const doTransfer = () => run(async () => {
    if (!transferId || !transferClub) return;
    const r = await layoutApi.transferPlayer(transferId, transferClub);
    setPlayers(p => p.map(pl => pl.id === r.id ? r : pl));
    setTransferId(null); setTransferClub(''); showToast('Transfert effectué.');
  });

  const remove = (id: string, name: string) => { if (!confirm(`Supprimer ${name} ?`)) return; run(async () => { await layoutApi.deletePlayer(id); setPlayers(p => p.filter(pl => pl.id !== id)); setTotal(t => t - 1); showToast('Joueur supprimé.'); }); };
  const importPlayers = async (rows: any[]) => { setImporting(true); let ok = 0; for (const row of rows) { try { await layoutApi.createPlayer({ ...row, jerseyNumber: row.jerseyNumber ? Number(row.jerseyNumber) : null, isActive: row.isActive !== 'false' }); ok++; } catch { /* skip */ } } await load(); showToast(`${ok} joueur(s) importé(s).`); setImporting(false); };

  const STATUS_COLORS: Record<string, string> = { ACTIVE: 'text-emerald-400', INJURED: 'text-red-400', SUSPENDED: 'text-amber-400', LOANED: 'text-sky-400', RETIRED: 'text-white/30' };

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Joueurs" subtitle="Profils complets — identité, physique, carrière, statistiques, contrat"
        actions={
          <div className="flex items-center gap-2">
            <BulkImportExport entityName="Players" data={players}
              templateFields={['firstName','lastName','position','nationality','birthDate','jerseyNumber','clubId','marketValue','photoUrl','status']}
              onImport={importPlayers} importLoading={importing} />
            <AdminButton onClick={() => { setEditing(emptyPlayer()); setActiveTab('Identité'); }}>
              <Plus className="h-3.5 w-3.5" /> Nouveau Joueur
            </AdminButton>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterPos} onChange={e => { setFilterPos(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white/70 outline-none focus:border-accent/40">
          <option value="">Toutes positions</option>
          <option value="GK">Gardien (GK)</option>
          <option value="DEF">Défenseur (DEF)</option>
          <option value="MID">Milieu (MID)</option>
          <option value="FWD">Attaquant (FWD)</option>
        </select>
        <select value={filterClub} onChange={e => { setFilterClub(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white/70 outline-none focus:border-accent/40">
          <option value="">Tous les clubs</option>
          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Transfer Modal */}
      {transferId && (
        <AdminCard title="Transfert de Joueur" accent>
          <div className="flex items-end gap-3">
            <div className="flex-1"><FormField label="Nouveau Club" type="select" value={transferClub} onChange={setTransferClub} options={[{ value: '', label: 'Choisir un club...' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} /></div>
            <AdminButton onClick={doTransfer} loading={loading} disabled={!transferClub}><Zap className="h-3.5 w-3.5" /> Transférer</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setTransferId(null); setTransferClub(''); }}>Annuler</AdminButton>
          </div>
        </AdminCard>
      )}

      {editing && (
        <AdminCard title={editing.id ? `Modifier — ${editing.firstName} ${editing.lastName}` : 'Enregistrer un Joueur'} accent>
          <form onSubmit={save} className="space-y-4">
            <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

            {/* ── Identité ── */}
            {activeTab === 'Identité' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Prénom *" value={editing.firstName || ''} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
                  <FormField label="Nom *" value={editing.lastName || ''} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
                  <FormField label="Surnom" value={editing.nickname || ''} onChange={v => setEditing((p: any) => ({ ...p, nickname: v }))} hint="Ex: Le Bison" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Poste *" type="select" value={editing.position || 'FWD'} onChange={v => setEditing((p: any) => ({ ...p, position: v }))}
                    options={[{ value: 'GK', label: 'Gardien' }, { value: 'DEF', label: 'Défenseur' }, { value: 'MID', label: 'Milieu' }, { value: 'FWD', label: 'Attaquant' }]} />
                  <FormField label="Nationalité *" value={editing.nationality || ''} onChange={v => setEditing((p: any) => ({ ...p, nationality: v }))} required />
                  <FormField label="2e nationalité" value={editing.secondNationality || ''} onChange={v => setEditing((p: any) => ({ ...p, secondNationality: v }))} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Date de naissance" type="date" value={editing.birthDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, birthDate: v }))} />
                  <FormField label="Lieu de naissance" value={editing.birthPlace || ''} onChange={v => setEditing((p: any) => ({ ...p, birthPlace: v }))} />
                  <FormField label="Numéro de maillot" type="number" value={editing.jerseyNumber || ''} onChange={v => setEditing((p: any) => ({ ...p, jerseyNumber: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Club actuel" type="select" value={editing.clubId || ''} onChange={v => setEditing((p: any) => ({ ...p, clubId: v || null }))}
                    options={[{ value: '', label: 'Sans club' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
                  <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))}
                    options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INJURED', label: 'Blessé' }, { value: 'SUSPENDED', label: 'Suspendu' }, { value: 'LOANED', label: 'Prêté' }, { value: 'RETIRED', label: 'Retraité' }]} />
                </div>
                <FormField label="Biographie" type="textarea" value={editing.biography || ''} onChange={v => setEditing((p: any) => ({ ...p, biography: v }))} hint="Parcours, style de jeu, points forts" />
                <TagInput label="Clubs précédents" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Ex: Real Madrid, Chelsea…" />
                <SwitchToggle label="Joueur actif" checked={editing.isActive !== false} onChange={v => setEditing((p: any) => ({ ...p, isActive: v }))} />
              </div>
            )}

            {/* ── Physique ── */}
            {activeTab === 'Physique' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Taille (cm)" type="number" value={editing.height || ''} onChange={v => setEditing((p: any) => ({ ...p, height: v }))} hint="Ex: 182" />
                  <FormField label="Poids (kg)" type="number" value={editing.weight || ''} onChange={v => setEditing((p: any) => ({ ...p, weight: v }))} hint="Ex: 75" />
                  <FormField label="Pied préféré" type="select" value={editing.preferredFoot || ''} onChange={v => setEditing((p: any) => ({ ...p, preferredFoot: v }))}
                    options={[{ value: '', label: 'Non spécifié' }, { value: 'RIGHT', label: 'Droit' }, { value: 'LEFT', label: 'Gauche' }, { value: 'BOTH', label: 'Les deux' }]} />
                </div>
              </div>
            )}

            {/* ── Carrière ── */}
            {activeTab === 'Carrière' && (
              <div className="space-y-4">
                <TagInput label="Anciens clubs" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Nom du club précédent" hint="Appuyez Entrée pour ajouter chaque club" />
              </div>
            )}

            {/* ── Stats ── */}
            {activeTab === 'Stats' && (
              <div className="space-y-4">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Statistiques de carrière (cumulatives)</p>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Matchs joués" type="number" value={editing.appearances || 0} onChange={v => setEditing((p: any) => ({ ...p, appearances: Number(v) }))} />
                  <FormField label="Buts marqués" type="number" value={editing.goals || 0} onChange={v => setEditing((p: any) => ({ ...p, goals: Number(v) }))} />
                  <FormField label="Passes décisives" type="number" value={editing.assists || 0} onChange={v => setEditing((p: any) => ({ ...p, assists: Number(v) }))} />
                </div>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider pt-2">Sélection nationale</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Sélections internationales" type="number" value={editing.internationalCaps || 0} onChange={v => setEditing((p: any) => ({ ...p, internationalCaps: Number(v) }))} />
                  <FormField label="Buts internationaux" type="number" value={editing.internationalGoals || 0} onChange={v => setEditing((p: any) => ({ ...p, internationalGoals: Number(v) }))} />
                </div>
              </div>
            )}

            {/* ── Contrat ── */}
            {activeTab === 'Contrat' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Valeur marchande (FCFA)" type="number" value={editing.marketValue || ''} onChange={v => setEditing((p: any) => ({ ...p, marketValue: v }))} hint="En millions de FCFA" />
                  <FormField label="Expiration du contrat" type="date" value={editing.contractExpiry?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, contractExpiry: v }))} />
                </div>
                <FormField label="Nom de l'agent" value={editing.agentName || ''} onChange={v => setEditing((p: any) => ({ ...p, agentName: v }))} hint="Agent / représentant du joueur" />
              </div>
            )}

            {/* ── Médias ── */}
            {activeTab === 'Médias' && (
              <div className="space-y-4">
                <MediaUploader label="Photo officielle (portrait)" value={editing.photoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, photoUrl: v }))} acceptType="image" hint="Photo portrait officielle du joueur" />
                <MediaUploader label="Photo action" value={editing.secondaryPhotoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, secondaryPhotoUrl: v }))} acceptType="image" hint="Photo en action sur le terrain" />
                <MediaUploader label="Vidéo highlights" value={editing.videoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, videoUrl: v }))} acceptType="video" hint="Compilation de highlights du joueur (MP4)" />
              </div>
            )}

            {/* ── Réseaux ── */}
            {activeTab === 'Réseaux' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} /></div>
                  <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400 shrink-0" /><FormField label="YouTube" value={editing.socialMedia?.youtube || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: v } }))} /></div>
                  <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-white/40 shrink-0" /><FormField label="TikTok" value={editing.socialMedia?.tiktok || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, tiktok: v } }))} /></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'photo', label: '', render: r => r.photoUrl ? <img src={r.photoUrl} className="h-8 w-8 rounded-full object-cover bg-white/5" alt={r.firstName} /> : <div className="h-8 w-8 rounded-full bg-white/5 border border-white/8 grid place-items-center"><Users className="h-4 w-4 text-white/20" /></div> },
            { key: 'name', label: 'Joueur', render: r => <div><p className="font-semibold text-white/85">{r.firstName} {r.lastName}</p>{r.nickname && <p className="text-[9px] text-accent/70">{r.nickname}</p>}</div> },
            { key: 'position', label: 'Poste', align: 'center', render: r => <span className={`text-[10px] font-bold uppercase tracking-wider ${r.position === 'GK' ? 'text-amber-400' : r.position === 'DEF' ? 'text-sky-400' : r.position === 'MID' ? 'text-emerald-400' : 'text-red-400'}`}>{r.position}</span> },
            { key: 'club', label: 'Club', render: r => <span className="text-white/50 text-[11px]">{r.club?.name || <span className="text-white/20">—</span>}</span> },
            { key: 'jersey', label: '#', align: 'center', render: r => <span className="font-display font-bold text-white/60">{r.jerseyNumber || '—'}</span> },
            { key: 'status', label: 'Statut', align: 'center', render: r => <span className={`text-[9px] font-bold uppercase ${STATUS_COLORS[r.status] || 'text-white/40'}`}>{r.status || 'ACTIVE'}</span> },
          ]}
          data={players} keyField="id"
          onEdit={r => { setEditing(r); setActiveTab('Identité'); }}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end"><Paginator page={page} total={total} limit={LIMIT} onChange={setPage} /></div>
      </AdminCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  COACHES TAB                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function CoachesTab({ clubs, showToast }: { clubs: any[]; showToast: ToastFn }) {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Identité');
  const LIMIT = 20;
  const TABS = ['Identité', 'Qualifications', 'Staff', 'Carrière', 'Médias', 'Réseaux'];

  const load = useCallback(async () => {
    const res = await layoutApi.getCoaches({ page, limit: LIMIT });
    setCoaches(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) { showToast(e?.response?.data?.message || e.message, 'error'); }
    finally { setLoading(false); }
  };

  const emptyCoach = () => ({
    firstName: '', lastName: '', nationality: 'Camerounais',
    birthDate: '', birthPlace: '', photoUrl: '', bannerUrl: '',
    qualification: '', specialization: '', contractExpiry: '',
    biography: '', formerClubs: [] as string[], trophies: [] as string[],
    assistantCoachName: '', fitnessCoachName: '', goalkeeperCoachName: '', analystName: '',
    socialMedia: { twitter: '', instagram: '', linkedin: '' },
    clubId: '', status: 'ACTIVE', notes: '',
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = { ...editing, clubId: editing.clubId || null };
    if (editing.id) {
      const r = await layoutApi.updateCoach(editing.id, dto);
      setCoaches(p => p.map(c => c.id === r.id ? r : c)); showToast('Entraîneur mis à jour.');
    } else {
      const r = await layoutApi.createCoach(dto);
      setCoaches(p => [r, ...p]); setTotal(t => t + 1); showToast('Entraîneur enregistré !');
    }
    setEditing(null);
  }); };

  const assignCoach = (coachId: string, clubId: string) => run(async () => { const r = await layoutApi.assignCoach(coachId, clubId); setCoaches(p => p.map(c => c.id === r.id ? r : c)); showToast('Entraîneur assigné au club.'); });
  const unassign = (coachId: string) => run(async () => { const r = await layoutApi.unassignCoach(coachId); setCoaches(p => p.map(c => c.id === r.id ? r : c)); showToast('Entraîneur libéré du club.'); });
  const remove = (id: string, name: string) => { if (!confirm(`Supprimer ${name} ?`)) return; run(async () => { await layoutApi.deleteCoach(id); setCoaches(p => p.filter(c => c.id !== id)); setTotal(t => t - 1); showToast('Entraîneur supprimé.'); }); };

  return (
    <div className="space-y-6">
      <SectionHeader title="Staff Technique & Entraîneurs" subtitle="Profils complets — qualifications, staff, carrière, palmarès"
        actions={<AdminButton onClick={() => { setEditing(emptyCoach()); setActiveTab('Identité'); }}><Plus className="h-3.5 w-3.5" /> Ajouter un Entraîneur</AdminButton>} />

      {editing && (
        <AdminCard title={editing.id ? 'Modifier Entraîneur' : 'Enregistrer un Entraîneur'} accent>
          <form onSubmit={save} className="space-y-4">
            <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'Identité' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Prénom *" value={editing.firstName || ''} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
                  <FormField label="Nom *" value={editing.lastName || ''} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Nationalité *" value={editing.nationality || ''} onChange={v => setEditing((p: any) => ({ ...p, nationality: v }))} required />
                  <FormField label="Date de naissance" type="date" value={editing.birthDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, birthDate: v }))} />
                  <FormField label="Lieu de naissance" value={editing.birthPlace || ''} onChange={v => setEditing((p: any) => ({ ...p, birthPlace: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Club actuel" type="select" value={editing.clubId || ''} onChange={v => setEditing((p: any) => ({ ...p, clubId: v || null }))}
                    options={[{ value: '', label: 'Sans club' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
                  <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))}
                    options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }]} />
                </div>
                <FormField label="Biographie" type="textarea" value={editing.biography || ''} onChange={v => setEditing((p: any) => ({ ...p, biography: v }))} hint="Parcours, philosophie de jeu, accomplissements" />
                <FormField label="Notes internes" type="textarea" value={editing.notes || ''} onChange={v => setEditing((p: any) => ({ ...p, notes: v }))} hint="Notes confidentielles (non publiques)" />
              </div>
            )}

            {activeTab === 'Qualifications' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Licence / Qualification" value={editing.qualification || ''} onChange={v => setEditing((p: any) => ({ ...p, qualification: v }))} hint="Ex: UEFA Pro, CAF A, CAF B" />
                  <FormField label="Spécialisation" value={editing.specialization || ''} onChange={v => setEditing((p: any) => ({ ...p, specialization: v }))} hint="Ex: Offensif, Défensif, Gardiens" />
                </div>
                <FormField label="Expiration du contrat" type="date" value={editing.contractExpiry?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, contractExpiry: v }))} />
                <TagInput label="Clubs entraînés précédemment" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Nom du club précédent" />
                <TagInput label="Palmarès en tant qu'entraîneur" value={editing.trophies || []} onChange={v => setEditing((p: any) => ({ ...p, trophies: v }))} placeholder="Ex: MTN Elite One 2021" />
              </div>
            )}

            {activeTab === 'Staff' && (
              <div className="space-y-4">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Staff technique sous sa direction</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Entraîneur adjoint" value={editing.assistantCoachName || ''} onChange={v => setEditing((p: any) => ({ ...p, assistantCoachName: v }))} />
                  <FormField label="Préparateur physique" value={editing.fitnessCoachName || ''} onChange={v => setEditing((p: any) => ({ ...p, fitnessCoachName: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Entraîneur des gardiens" value={editing.goalkeeperCoachName || ''} onChange={v => setEditing((p: any) => ({ ...p, goalkeeperCoachName: v }))} />
                  <FormField label="Analyste vidéo" value={editing.analystName || ''} onChange={v => setEditing((p: any) => ({ ...p, analystName: v }))} />
                </div>
              </div>
            )}

            {activeTab === 'Carrière' && (
              <div className="space-y-4">
                <TagInput label="Clubs entraînés" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Nom du club" />
                <TagInput label="Trophées remportés" value={editing.trophies || []} onChange={v => setEditing((p: any) => ({ ...p, trophies: v }))} placeholder="Ex: Coupe du Cameroun 2019" />
              </div>
            )}

            {activeTab === 'Médias' && (
              <div className="space-y-4">
                <MediaUploader label="Photo officielle" value={editing.photoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, photoUrl: v }))} acceptType="image" hint="Portrait officiel de l'entraîneur" />
                <MediaUploader label="Image bannière" value={editing.bannerUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, bannerUrl: v }))} acceptType="image" hint="Image de couverture pour la page profil" />
              </div>
            )}

            {activeTab === 'Réseaux' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} /></div>
                <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-400 shrink-0" /><FormField label="LinkedIn" value={editing.socialMedia?.linkedin || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, linkedin: v } }))} /></div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'photo', label: '', render: r => r.photoUrl ? <img src={r.photoUrl} className="h-8 w-8 rounded-full object-cover bg-white/5" alt={r.firstName} /> : <div className="h-8 w-8 rounded-full bg-white/5 border border-white/8 grid place-items-center"><Users className="h-4 w-4 text-white/20" /></div> },
            { key: 'name', label: 'Entraîneur', render: r => <div><p className="font-semibold text-white/85">{r.firstName} {r.lastName}</p>{r.specialization && <p className="text-[9px] text-white/35">{r.specialization}</p>}</div> },
            { key: 'qualification', label: 'Licence', render: r => <span className="text-accent text-[10px] font-bold">{r.qualification || '—'}</span> },
            { key: 'club', label: 'Club', render: r => <span className="text-white/50 text-[11px]">{r.club?.name || <span className="italic text-white/20">Sans club</span>}</span> },
            { key: 'nationality', label: 'Nat.', render: r => <span className="text-white/40 text-[10px]">{r.nationality}</span> },
            { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
            { key: 'assign', label: 'Affecter', render: r => (
              <select value={r.clubId || ''} onChange={e => { if (e.target.value) assignCoach(r.id, e.target.value); else unassign(r.id); }}
                className="h-7 px-2 rounded-lg bg-white/[0.04] border border-white/8 text-[10px] text-white/60 outline-none max-w-[130px]">
                <option value="">Sans club</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )},
          ]}
          data={coaches} keyField="id"
          onEdit={r => { setEditing(r); setActiveTab('Identité'); }}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end"><Paginator page={page} total={total} limit={LIMIT} onChange={setPage} /></div>
      </AdminCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  USERS TAB                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function UsersTab({ showToast }: { showToast: ToastFn }) {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState<any>({ email: '', password: '', firstName: '', lastName: '', role: 'user', phone: '' });
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Profil');
  const LIMIT = 25;
  const TABS = ['Profil', 'Préférences', 'Réseaux', 'Sécurité'];

  const load = useCallback(async () => {
    const params: any = { page, limit: LIMIT };
    if (filterRole) params.role = filterRole;
    if (search) params.search = search;
    const res = await layoutApi.getUsers(params);
    setUsers(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page, filterRole, search]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) { showToast(e?.response?.data?.message || e.message, 'error'); }
    finally { setLoading(false); }
  };

  const createUser = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const r = await layoutApi.createAdminUser(newUser);
    setUsers(p => [r, ...p]); setTotal(t => t + 1);
    setCreating(false); setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'user', phone: '' });
    showToast('Compte créé avec succès !');
  }); };

  const update = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const r = await layoutApi.updateUser(editing.id, {
      firstName: editing.firstName, lastName: editing.lastName,
      phone: editing.phone, role: editing.role,
      avatarUrl: editing.avatarUrl, bio: editing.bio,
      city: editing.city, country: editing.country,
      occupation: editing.occupation, favoriteClubId: editing.favoriteClubId || null,
      language: editing.language, notificationsEnabled: editing.notificationsEnabled,
      socialMedia: editing.socialMedia,
    });
    setUsers(p => p.map(u => u.id === r.id ? r : u));
    setEditing(null); showToast('Profil mis à jour.');
  }); };

  const toggle = (id: string) => run(async () => { const r = await layoutApi.toggleUserActive(id); setUsers(p => p.map(u => u.id === r.id ? r : u)); showToast(r.isActive ? 'Compte réactivé.' : 'Compte désactivé.'); });
  const approve = (id: string) => run(async () => { const r = await layoutApi.approveEditor(id); setUsers(p => p.map(u => u.id === r.id ? r : u)); showToast('Éditeur approuvé !'); });
  const doReset = () => run(async () => { await layoutApi.resetUserPassword(resetId!, newPassword); setResetId(null); setNewPassword(''); showToast('Mot de passe réinitialisé.'); });
  const remove = (id: string, name: string) => { if (!confirm(`Supprimer le compte de ${name} ?`)) return; run(async () => { await layoutApi.deleteUser(id); setUsers(p => p.filter(u => u.id !== id)); setTotal(t => t - 1); showToast('Compte supprimé.'); }); };

  const ROLE_COLOR: Record<string, string> = { admin: 'text-accent font-bold', editor: 'text-purple-400', user: 'text-white/40' };

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Utilisateurs" subtitle="Administrez comptes, rôles, droits d'accès éditeur et profils complets"
        actions={<AdminButton onClick={() => setCreating(true)}><Plus className="h-3.5 w-3.5" /> Créer un Compte</AdminButton>} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Rechercher par nom / email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 w-56 transition-all" />
        {['', 'admin', 'editor', 'user'].map(r => (
          <button key={r} onClick={() => { setFilterRole(r); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterRole === r ? 'bg-accent text-black' : 'bg-white/5 border border-white/8 text-white/40 hover:text-white'}`}>
            {r || 'Tous'}
          </button>
        ))}
      </div>

      {/* Create User */}
      {creating && (
        <AdminCard title="Créer un Nouveau Compte" accent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prénom" value={newUser.firstName} onChange={v => setNewUser((p: any) => ({ ...p, firstName: v }))} required />
              <FormField label="Nom" value={newUser.lastName} onChange={v => setNewUser((p: any) => ({ ...p, lastName: v }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Adresse email" type="email" value={newUser.email} onChange={v => setNewUser((p: any) => ({ ...p, email: v }))} required />
              <FormField label="Téléphone" value={newUser.phone || ''} onChange={v => setNewUser((p: any) => ({ ...p, phone: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Mot de passe temporaire" value={newUser.password} onChange={v => setNewUser((p: any) => ({ ...p, password: v }))} required hint="Min. 8 caractères, 1 majuscule, 1 chiffre" />
              <FormField label="Rôle" type="select" value={newUser.role} onChange={v => setNewUser((p: any) => ({ ...p, role: v }))}
                options={[{ value: 'user', label: 'Utilisateur' }, { value: 'editor', label: 'Éditeur' }, { value: 'admin', label: 'Administrateur' }]} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setCreating(false)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Créer le Compte</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Edit User */}
      {editing && (
        <AdminCard title={`Modifier — ${editing.firstName} ${editing.lastName}`} accent>
          <form onSubmit={update} className="space-y-4">
            <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'Profil' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Prénom" value={editing.firstName} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
                  <FormField label="Nom" value={editing.lastName} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Téléphone" value={editing.phone || ''} onChange={v => setEditing((p: any) => ({ ...p, phone: v }))} />
                  <FormField label="Rôle" type="select" value={editing.role} onChange={v => setEditing((p: any) => ({ ...p, role: v }))}
                    options={[{ value: 'user', label: 'Utilisateur' }, { value: 'editor', label: 'Éditeur' }, { value: 'admin', label: 'Administrateur' }]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Ville" value={editing.city || ''} onChange={v => setEditing((p: any) => ({ ...p, city: v }))} />
                  <FormField label="Pays" value={editing.country || 'Cameroun'} onChange={v => setEditing((p: any) => ({ ...p, country: v }))} />
                </div>
                <FormField label="Profession / Occupation" value={editing.occupation || ''} onChange={v => setEditing((p: any) => ({ ...p, occupation: v }))} />
                <FormField label="Biographie / À propos" type="textarea" value={editing.bio || ''} onChange={v => setEditing((p: any) => ({ ...p, bio: v }))} hint="Bio publique de l'utilisateur" />
                <MediaUploader label="Photo de profil (avatar)" value={editing.avatarUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, avatarUrl: v }))} acceptType="image" hint="Photo de profil — sera visible publiquement" />
              </div>
            )}

            {activeTab === 'Préférences' && (
              <div className="space-y-4">
                <FormField label="Langue préférée" type="select" value={editing.language || 'fr'} onChange={v => setEditing((p: any) => ({ ...p, language: v }))}
                  options={[{ value: 'fr', label: '🇫🇷 Français' }, { value: 'en', label: '🇬🇧 English' }]} />
                <FormField label="Club favori" value={editing.favoriteClubId || ''} onChange={v => setEditing((p: any) => ({ ...p, favoriteClubId: v }))} hint="ID UUID du club favori" />
                <SwitchToggle label="Recevoir les notifications" checked={editing.notificationsEnabled !== false} onChange={v => setEditing((p: any) => ({ ...p, notificationsEnabled: v }))} />
              </div>
            )}

            {activeTab === 'Réseaux' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} /></div>
                <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400 shrink-0" /><FormField label="YouTube" value={editing.socialMedia?.youtube || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: v } }))} /></div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-white/40 shrink-0" /><FormField label="TikTok" value={editing.socialMedia?.tiktok || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, tiktok: v } }))} /></div>
              </div>
            )}

            {activeTab === 'Sécurité' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <p className="text-xs text-amber-400 font-semibold mb-1">⚠️ Zone sécurisée</p>
                  <p className="text-[10px] text-white/40">Pour réinitialiser le mot de passe, utilisez le bouton dédié dans le tableau ci-dessous.</p>
                </div>
                <div className="space-y-2 text-[10px] text-white/30">
                  <p><span className="text-white/50 font-medium">Email :</span> {editing.email}</p>
                  <p><span className="text-white/50 font-medium">Vérifié :</span> {editing.isVerified ? '✅ Oui' : '❌ Non'}</p>
                  <p><span className="text-white/50 font-medium">Compte créé :</span> {editing.createdAt ? new Date(editing.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                  <p><span className="text-white/50 font-medium">Dernière connexion :</span> {editing.lastLoginAt ? new Date(editing.lastLoginAt).toLocaleString('fr-FR') : '—'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <AdminCard title="Réinitialiser le Mot de Passe" accent>
          <div className="flex items-end gap-3">
            <div className="flex-1"><FormField label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} hint="Min. 8 caractères" /></div>
            <AdminButton onClick={doReset} loading={loading} disabled={newPassword.length < 8}><Shield className="h-3.5 w-3.5" /> Appliquer</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setResetId(null); setNewPassword(''); }}>Annuler</AdminButton>
          </div>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'avatar', label: '', render: r => (
              r.avatarUrl
                ? <img src={r.avatarUrl} className="h-8 w-8 rounded-full object-cover" alt={r.firstName} />
                : <div className={`h-8 w-8 rounded-full border grid place-items-center text-[10px] font-bold shrink-0 ${r.role === 'admin' ? 'bg-accent/10 border-accent/30 text-accent' : r.role === 'editor' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/8 text-white/40'}`}>
                  {(r.firstName?.[0] || '?')}{(r.lastName?.[0] || '')}
                </div>
            )},
            { key: 'name', label: 'Utilisateur', render: r => (<div><p className="text-xs font-semibold text-white/85">{r.firstName} {r.lastName}</p><p className="text-[9px] text-white/30">{r.email}</p>{r.occupation && <p className="text-[9px] text-white/20">{r.occupation}</p>}</div>) },
            { key: 'role', label: 'Rôle', render: r => <span className={`text-[10px] uppercase tracking-widest ${ROLE_COLOR[r.role] || 'text-white/40'}`}>{r.role}</span> },
            { key: 'status', label: 'Statut', render: r => (<div className="flex items-center gap-1.5">{r.isActive ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/15" />}<span className={`text-[10px] font-medium ${r.isActive ? 'text-emerald-400' : 'text-white/30'}`}>{r.isActive ? 'Actif' : 'Inactif'}</span></div>) },
            { key: 'editor', label: 'Éditeur', align: 'center', render: r => r.role === 'editor' ? (r.editorApproved ? <span className="text-[9px] text-emerald-400 font-bold">✓ Approuvé</span> : <button onClick={() => approve(r.id)} className="text-[9px] text-amber-400 font-bold hover:text-amber-300 transition-colors">Approuver →</button>) : <span className="text-white/15">—</span> },
            { key: 'actions', label: '', render: r => (<div className="flex gap-1"><button onClick={() => toggle(r.id)} title={r.isActive ? 'Désactiver' : 'Réactiver'} className={`h-6 w-6 rounded-lg grid place-items-center transition-all border ${r.isActive ? 'bg-red-500/5 border-red-500/10 text-red-400/50 hover:text-red-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/50 hover:text-emerald-400'}`}>{r.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}</button><button onClick={() => setResetId(r.id)} title="Réinitialiser le mot de passe" className="h-6 w-6 rounded-lg grid place-items-center bg-white/5 border border-white/8 text-white/30 hover:text-white transition-all"><Shield className="h-3 w-3" /></button></div>) },
          ]}
          data={users} keyField="id"
          onEdit={r => { setEditing(r); setActiveTab('Profil'); }}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end"><Paginator page={page} total={total} limit={LIMIT} onChange={setPage} /></div>
      </AdminCard>
    </div>
  );
}
