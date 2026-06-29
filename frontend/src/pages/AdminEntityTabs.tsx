/**
 * AdminEntityTabs.tsx
 * Five professional admin tabs: Seasons · Clubs · Players · Coaches · Users
 * Each tab: full CRUD + DataTable + BulkImportExport + Paginator
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Play, StopCircle, RefreshCw,
  UserCheck, UserX, Shield, Users, Zap,
} from 'lucide-react';
import {
  AdminCard, FormField, AdminButton, DataTable,
  StatusBadge, SectionHeader, BulkImportExport, Paginator, SwitchToggle
} from '@/components/ui/AdminUI';
import { layoutApi } from '@/services/layoutApi';

/* ─── Shared Toast ────────────────────────────────────────────────────────── */
type ToastFn = (msg: string, type?: 'success' | 'error' | 'info') => void;

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SEASONS TAB                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export function SeasonsTab({ showToast }: { showToast: ToastFn }) {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [editing, setEditing]   = useState<any | null>(null);
  const [loading, setLoading]   = useState(false);

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
    const dto = {
      name:      editing.name,
      startDate: editing.startDate,
      endDate:   editing.endDate,
      status:    editing.status || 'UPCOMING',
    };
    if (editing.id) {
      const r = await layoutApi.updateSeason(editing.id, dto);
      setSeasons(p => p.map(s => s.id === r.id ? r : s));
      showToast('Saison mise à jour.');
    } else {
      const r = await layoutApi.createSeason(dto);
      setSeasons(p => [...p, r]);
      showToast('Saison créée !');
    }
    setEditing(null);
  }); };

  const activate = (id: string) => run(async () => {
    const r = await layoutApi.activateSeason(id);
    setSeasons(p => p.map(s => s.id === id ? r : (s.status === 'ONGOING' ? { ...s, status: 'COMPLETED' } : s)));
    showToast('Saison activée — statut ONGOING.');
  });

  const close = (id: string) => run(async () => {
    const r = await layoutApi.closeSeason(id);
    setSeasons(p => p.map(s => s.id === id ? r : s));
    showToast('Saison clôturée.');
  });

  const initStandings = (id: string) => run(async () => {
    const r = await layoutApi.initStandings(id);
    showToast(r.message || 'Classements initialisés.', 'info');
  });

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer la saison "${name}" ?`)) return;
    run(async () => {
      await layoutApi.deleteSeason(id);
      setSeasons(p => p.filter(s => s.id !== id));
      showToast('Saison supprimée.');
    });
  };

  const STATUS_COLOR: Record<string, string> = {
    UPCOMING:  'text-sky-400',
    ONGOING:   'text-emerald-400',
    COMPLETED: 'text-white/30',
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestion des Saisons"
        subtitle="Créez, configurez et gérez le cycle de vie de chaque saison"
        actions={
          <AdminButton onClick={() => setEditing({ name: '', startDate: '', endDate: '', status: 'UPCOMING' })}>
            <Plus className="h-3.5 w-3.5" /> Nouvelle Saison
          </AdminButton>
        }
      />

      {editing && (
        <AdminCard title={editing.id ? 'Modifier la Saison' : 'Créer une Saison'} accent>
          <form onSubmit={save} className="space-y-4">
            <FormField label="Nom de la saison (ex: Saison 2025/2026)" value={editing.name || ''} onChange={v => setEditing((p: any) => ({ ...p, name: v }))} required hint="Ce nom sera affiché publiquement sur le site." />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date de début" type="date" value={editing.startDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, startDate: v }))} required />
              <FormField label="Date de fin" type="date" value={editing.endDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, endDate: v }))} required />
            </div>
            {editing.id && (
              <FormField label="Statut" type="select" value={editing.status || 'UPCOMING'}
                onChange={v => setEditing((p: any) => ({ ...p, status: v }))}
                options={[{ value: 'UPCOMING', label: 'À venir' }, { value: 'ONGOING', label: 'En cours' }, { value: 'COMPLETED', label: 'Terminée' }]}
              />
            )}
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

            {/* Season Status Indicator */}
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${s.status === 'ONGOING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : s.status === 'UPCOMING' ? 'bg-sky-500' : 'bg-white/15'}`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-white/90 text-sm">{s.name}</p>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${STATUS_COLOR[s.status]}`}>{s.status === 'UPCOMING' ? 'À venir' : s.status === 'ONGOING' ? 'En cours' : 'Terminée'}</span>
              </div>
              <p className="text-[10px] text-white/35 mt-0.5">
                {s.startDate ? new Date(s.startDate).toLocaleDateString('fr-FR') : '—'} → {s.endDate ? new Date(s.endDate).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
              {s.status === 'UPCOMING' && (
                <AdminButton size="sm" variant="success" onClick={() => activate(s.id)} loading={loading}>
                  <Play className="h-3 w-3" /> Activer
                </AdminButton>
              )}
              {s.status === 'ONGOING' && (
                <>
                  <AdminButton size="sm" variant="secondary" onClick={() => initStandings(s.id)} loading={loading}>
                    <RefreshCw className="h-3 w-3" /> Init Classements
                  </AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => close(s.id)} loading={loading}>
                    <StopCircle className="h-3 w-3" /> Clôturer
                  </AdminButton>
                </>
              )}
              <AdminButton size="sm" variant="ghost" onClick={() => setEditing(s)}><Edit3 className="h-3 w-3" /></AdminButton>
              {s.status !== 'ONGOING' && (
                <AdminButton size="sm" variant="danger" onClick={() => remove(s.id, s.name)}><Trash2 className="h-3 w-3" /></AdminButton>
              )}
            </div>
          </motion.div>
        ))}
        {!seasons.length && <p className="text-center text-white/25 text-sm py-12">Aucune saison créée</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CLUBS TAB                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export function ClubsTab({ showToast }: { showToast: ToastFn }) {
  const [clubs, setClubs]     = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

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

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = {
      name: editing.name, city: editing.city, stadium: editing.stadium,
      foundedYear: Number(editing.foundedYear), logoUrl: editing.logoUrl || '',
      description: editing.description || '', primaryColor: editing.primaryColor || '#fcd116',
      secondaryColor: editing.secondaryColor || '#007a5e', status: editing.status || 'ACTIVE',
    };
    if (editing.id) {
      const r = await layoutApi.updateClub(editing.id, dto);
      setClubs(p => p.map(c => c.id === r.id ? r : c));
      showToast('Club mis à jour.');
    } else {
      const r = await layoutApi.createClub(dto);
      setClubs(p => [...p, r]); setTotal(t => t + 1);
      showToast('Club créé !');
    }
    setEditing(null);
  }); };

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer le club "${name}" ?`)) return;
    run(async () => {
      await layoutApi.deleteClub(id);
      setClubs(p => p.filter(c => c.id !== id)); setTotal(t => t - 1);
      showToast('Club supprimé.');
    });
  };

  const importClubs = async (rows: any[]) => {
    setImporting(true); let ok = 0;
    for (const row of rows) {
      try { await layoutApi.createClub({ ...row, foundedYear: Number(row.foundedYear) }); ok++; }
      catch { /* skip */ }
    }
    await load(); showToast(`${ok} club(s) importé(s).`); setImporting(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestion des Clubs"
        subtitle="Créez et gérez les clubs participant au championnat"
        actions={
          <div className="flex items-center gap-2">
            <BulkImportExport
              entityName="Clubs" data={clubs}
              templateFields={['name','city','stadium','foundedYear','logoUrl','primaryColor','secondaryColor','status']}
              onImport={importClubs} importLoading={importing}
            />
            <AdminButton onClick={() => setEditing({ name: '', city: '', stadium: '', foundedYear: new Date().getFullYear(), status: 'ACTIVE' })}>
              <Plus className="h-3.5 w-3.5" /> Créer un Club
            </AdminButton>
          </div>
        }
      />

      {editing && (
        <AdminCard title={editing.id ? `Modifier — ${editing.name}` : 'Créer un Nouveau Club'} accent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nom du club" value={editing.name || ''} onChange={v => setEditing((p: any) => ({ ...p, name: v }))} required />
              <FormField label="Ville" value={editing.city || ''} onChange={v => setEditing((p: any) => ({ ...p, city: v }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Stade domicile" value={editing.stadium || ''} onChange={v => setEditing((p: any) => ({ ...p, stadium: v }))} required hint="Nom du stade utilisé pour les matchs à domicile" />
              <FormField label="Année de fondation" type="number" value={editing.foundedYear || ''} onChange={v => setEditing((p: any) => ({ ...p, foundedYear: v }))} required />
            </div>
            <FormField label="Logo URL" value={editing.logoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, logoUrl: v }))} hint="URL de l'image du logo officiel" />
            <FormField label="Description / Histoire du club" type="textarea" value={editing.description || ''} onChange={v => setEditing((p: any) => ({ ...p, description: v }))} />
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Couleur principale</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={editing.primaryColor || '#fcd116'} onChange={e => setEditing((p: any) => ({ ...p, primaryColor: e.target.value }))}
                    className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                  <span className="text-xs text-white/40 font-mono">{editing.primaryColor || '#fcd116'}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Couleur secondaire</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={editing.secondaryColor || '#007a5e'} onChange={e => setEditing((p: any) => ({ ...p, secondaryColor: e.target.value }))}
                    className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                  <span className="text-xs text-white/40 font-mono">{editing.secondaryColor || '#007a5e'}</span>
                </div>
              </div>
              <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))} options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }]} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
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
            {/* Color bar */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${c.primaryColor || '#fcd116'}, ${c.secondaryColor || '#007a5e'})` }} />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt={c.name} className="h-10 w-10 object-contain rounded-lg bg-white/5 mb-2" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/8 grid place-items-center mb-2">
                      <Shield className="h-5 w-5 text-white/20" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-white/85 leading-tight">{c.name}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{c.city} · {c.stadium}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-[9px] text-white/25 font-medium">Fondé en {c.foundedYear}</p>
              <div className="flex gap-1.5 pt-1 border-t border-white/[0.05]">
                <AdminButton size="sm" variant="secondary" onClick={() => setEditing(c)} className="flex-1"><Edit3 className="h-3 w-3" /> Modifier</AdminButton>
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

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PLAYERS TAB                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export function PlayersTab({ clubs, showToast }: { clubs: any[]; showToast: ToastFn }) {
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [filterClub, setFilterClub] = useState('');
  const [filterPos, setFilterPos]   = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferClub, setTransferClub] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const LIMIT = 20;

  const load = useCallback(async () => {
    const params: any = { page, limit: LIMIT };
    if (filterClub) params.clubId  = filterClub;
    if (filterPos)  params.position = filterPos;
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

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = {
      firstName: editing.firstName, lastName: editing.lastName,
      position: editing.position, nationality: editing.nationality,
      birthDate: editing.birthDate, jerseyNumber: editing.jerseyNumber ? Number(editing.jerseyNumber) : null,
      photoUrl: editing.photoUrl || '', marketValue: editing.marketValue ? Number(editing.marketValue) : null,
      isActive: editing.isActive !== false, clubId: editing.clubId || null,
    };
    if (editing.id) {
      const r = await layoutApi.updatePlayer(editing.id, dto);
      setPlayers(p => p.map(pl => pl.id === r.id ? r : pl));
      showToast('Joueur mis à jour.');
    } else {
      const r = await layoutApi.createPlayer(dto);
      setPlayers(p => [r, ...p]); setTotal(t => t + 1);
      showToast('Joueur enregistré !');
    }
    setEditing(null);
  }); };

  const doTransfer = () => run(async () => {
    if (!transferId || !transferClub) return;
    const r = await layoutApi.transferPlayer(transferId, transferClub);
    setPlayers(p => p.map(pl => pl.id === r.id ? r : pl));
    setTransferId(null); setTransferClub('');
    showToast('Transfert effectué.');
  });

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return;
    run(async () => {
      await layoutApi.deletePlayer(id);
      setPlayers(p => p.filter(pl => pl.id !== id)); setTotal(t => t - 1);
      showToast('Joueur supprimé.');
    });
  };

  const importPlayers = async (rows: any[]) => {
    setImporting(true); let ok = 0;
    for (const row of rows) {
      try { await layoutApi.createPlayer({ ...row, jerseyNumber: row.jerseyNumber ? Number(row.jerseyNumber) : null, isActive: row.isActive !== 'false' }); ok++; }
      catch { /* skip */ }
    }
    await load(); showToast(`${ok} joueur(s) importé(s).`); setImporting(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestion des Joueurs"
        subtitle="Enregistrez, modifiez et transférez les joueurs du championnat"
        actions={
          <div className="flex items-center gap-2">
            <BulkImportExport
              entityName="Players" data={players}
              templateFields={['firstName','lastName','position','nationality','birthDate','jerseyNumber','clubId','marketValue','photoUrl']}
              onImport={importPlayers} importLoading={importing}
            />
            <AdminButton onClick={() => setEditing({ firstName: '', lastName: '', position: 'FWD', nationality: 'Camerounais', birthDate: '', isActive: true })}>
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
            <div className="flex-1">
              <FormField label="Nouveau Club" type="select" value={transferClub} onChange={setTransferClub}
                options={[{ value: '', label: 'Choisir un club...' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
            </div>
            <AdminButton onClick={doTransfer} loading={loading} disabled={!transferClub}><Zap className="h-3.5 w-3.5" /> Transférer</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setTransferId(null); setTransferClub(''); }}>Annuler</AdminButton>
          </div>
        </AdminCard>
      )}

      {editing && (
        <AdminCard title={editing.id ? `Modifier — ${editing.firstName} ${editing.lastName}` : 'Enregistrer un Joueur'} accent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prénom" value={editing.firstName || ''} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
              <FormField label="Nom de famille" value={editing.lastName || ''} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Poste" type="select" value={editing.position || 'FWD'} onChange={v => setEditing((p: any) => ({ ...p, position: v }))}
                options={[{ value: 'GK', label: 'Gardien' }, { value: 'DEF', label: 'Défenseur' }, { value: 'MID', label: 'Milieu' }, { value: 'FWD', label: 'Attaquant' }]} />
              <FormField label="Nationalité" value={editing.nationality || ''} onChange={v => setEditing((p: any) => ({ ...p, nationality: v }))} required />
              <FormField label="Date de naissance" type="date" value={editing.birthDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, birthDate: v }))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Numéro de maillot" type="number" value={editing.jerseyNumber || ''} onChange={v => setEditing((p: any) => ({ ...p, jerseyNumber: v }))} />
              <FormField label="Valeur marchande (FCFA)" type="number" value={editing.marketValue || ''} onChange={v => setEditing((p: any) => ({ ...p, marketValue: v }))} hint="Valeur en millions" />
              <FormField label="Club actuel" type="select" value={editing.clubId || ''} onChange={v => setEditing((p: any) => ({ ...p, clubId: v || null }))}
                options={[{ value: '', label: 'Sans club' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
            </div>
            <FormField label="Photo URL" value={editing.photoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, photoUrl: v }))} hint="URL portrait officiel" />
            <SwitchToggle label="Joueur actif" checked={editing.isActive !== false} onChange={v => setEditing((p: any) => ({ ...p, isActive: v }))} />
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
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
            { key: 'name', label: 'Joueur', render: r => <span className="font-semibold text-white/85">{r.firstName} {r.lastName}</span> },
            { key: 'position', label: 'Poste', align: 'center', render: r => <span className={`text-[10px] font-bold uppercase tracking-wider ${r.position === 'GK' ? 'text-amber-400' : r.position === 'DEF' ? 'text-sky-400' : r.position === 'MID' ? 'text-emerald-400' : 'text-red-400'}`}>{r.position}</span> },
            { key: 'club', label: 'Club', render: r => <span className="text-white/50 text-[11px]">{r.club?.name || <span className="text-white/20">—</span>}</span> },
            { key: 'jersey', label: '#', align: 'center', render: r => <span className="font-display font-bold text-white/60">{r.jerseyNumber || '—'}</span> },
            { key: 'nationality', label: 'Nat.', render: r => <span className="text-white/40 text-[10px]">{r.nationality}</span> },
            { key: 'isActive', label: 'Statut', align: 'center', render: r => <StatusBadge status={r.isActive ? 'PUBLISHED' : 'DRAFT'} /> },
          ]}
          data={players}
          keyField="id"
          onEdit={r => setEditing(r)}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex items-center justify-between">
          <button onClick={() => transferId ? setTransferId(null) : null}
            className="text-[10px] text-white/30 hover:text-accent font-medium transition-colors">
            Sélectionnez un joueur → Modifier → Transférer
          </button>
          <Paginator page={page} total={total} limit={LIMIT} onChange={setPage} />
        </div>
      </AdminCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COACHES TAB                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export function CoachesTab({ clubs, showToast }: { clubs: any[]; showToast: ToastFn }) {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const LIMIT = 20;

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

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const dto = {
      firstName: editing.firstName, lastName: editing.lastName,
      nationality: editing.nationality, birthDate: editing.birthDate || null,
      qualification: editing.qualification || '', photoUrl: editing.photoUrl || '',
      clubId: editing.clubId || null, status: editing.status || 'ACTIVE', notes: editing.notes || '',
    };
    if (editing.id) {
      const r = await layoutApi.updateCoach(editing.id, dto);
      setCoaches(p => p.map(c => c.id === r.id ? r : c));
      showToast('Entraîneur mis à jour.');
    } else {
      const r = await layoutApi.createCoach(dto);
      setCoaches(p => [r, ...p]); setTotal(t => t + 1);
      showToast('Entraîneur enregistré !');
    }
    setEditing(null);
  }); };

  const assignCoach = (coachId: string, clubId: string) => run(async () => {
    const r = await layoutApi.assignCoach(coachId, clubId);
    setCoaches(p => p.map(c => c.id === r.id ? r : c));
    showToast('Entraîneur assigné au club.');
  });

  const unassign = (coachId: string) => run(async () => {
    const r = await layoutApi.unassignCoach(coachId);
    setCoaches(p => p.map(c => c.id === r.id ? r : c));
    showToast('Entraîneur libéré du club.');
  });

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return;
    run(async () => {
      await layoutApi.deleteCoach(id);
      setCoaches(p => p.filter(c => c.id !== id)); setTotal(t => t - 1);
      showToast('Entraîneur supprimé.');
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Staff Technique & Entraîneurs"
        subtitle="Gérez le corps technique — affectation aux clubs et licences d'entraîneur"
        actions={
          <AdminButton onClick={() => setEditing({ firstName: '', lastName: '', nationality: 'Camerounais', qualification: 'CAF A', status: 'ACTIVE' })}>
            <Plus className="h-3.5 w-3.5" /> Ajouter un Entraîneur
          </AdminButton>
        }
      />

      {editing && (
        <AdminCard title={editing.id ? 'Modifier Entraîneur' : 'Enregistrer un Entraîneur'} accent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prénom" value={editing.firstName || ''} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
              <FormField label="Nom" value={editing.lastName || ''} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Nationalité" value={editing.nationality || ''} onChange={v => setEditing((p: any) => ({ ...p, nationality: v }))} required />
              <FormField label="Date de naissance" type="date" value={editing.birthDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, birthDate: v }))} />
              <FormField label="Licence / Qualification" value={editing.qualification || ''} onChange={v => setEditing((p: any) => ({ ...p, qualification: v }))} hint="Ex: UEFA Pro, CAF A, CAF B" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Club actuel" type="select" value={editing.clubId || ''} onChange={v => setEditing((p: any) => ({ ...p, clubId: v || null }))}
                options={[{ value: '', label: 'Sans club' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
              <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))}
                options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }]} />
            </div>
            <FormField label="Photo URL" value={editing.photoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, photoUrl: v }))} />
            <FormField label="Notes internes" type="textarea" value={editing.notes || ''} onChange={v => setEditing((p: any) => ({ ...p, notes: v }))} />
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
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
            { key: 'name', label: 'Entraîneur', render: r => <span className="font-semibold text-white/85">{r.firstName} {r.lastName}</span> },
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
          data={coaches}
          keyField="id"
          onEdit={r => setEditing(r)}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end">
          <Paginator page={page} total={total} limit={LIMIT} onChange={setPage} />
        </div>
      </AdminCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  USERS TAB                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export function UsersTab({ showToast }: { showToast: ToastFn }) {
  const [users, setUsers]     = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch]   = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState<any>({ email: '', password: '', firstName: '', lastName: '', role: 'user', phone: '' });
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const LIMIT = 25;

  const load = useCallback(async () => {
    const params: any = { page, limit: LIMIT };
    if (filterRole) params.role = filterRole;
    if (search)     params.search = search;
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
    const r = await layoutApi.updateUser(editing.id, { firstName: editing.firstName, lastName: editing.lastName, phone: editing.phone, role: editing.role });
    setUsers(p => p.map(u => u.id === r.id ? r : u));
    setEditing(null); showToast('Profil mis à jour.');
  }); };

  const toggle = (id: string) => run(async () => {
    const r = await layoutApi.toggleUserActive(id);
    setUsers(p => p.map(u => u.id === r.id ? r : u));
    showToast(r.isActive ? 'Compte réactivé.' : 'Compte désactivé.');
  });

  const approve = (id: string) => run(async () => {
    const r = await layoutApi.approveEditor(id);
    setUsers(p => p.map(u => u.id === r.id ? r : u));
    showToast('Éditeur approuvé !');
  });

  const doReset = () => run(async () => {
    await layoutApi.resetUserPassword(resetId!, newPassword);
    setResetId(null); setNewPassword('');
    showToast('Mot de passe réinitialisé.');
  });

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer le compte de ${name} ?`)) return;
    run(async () => {
      await layoutApi.deleteUser(id);
      setUsers(p => p.filter(u => u.id !== id)); setTotal(t => t - 1);
      showToast('Compte supprimé.');
    });
  };

  const ROLE_COLOR: Record<string, string> = {
    admin:  'text-accent font-bold',
    editor: 'text-purple-400',
    user:   'text-white/40',
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestion des Utilisateurs"
        subtitle="Administrez comptes, rôles, droits d'accès éditeur et sécurité"
        actions={
          <AdminButton onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" /> Créer un Compte
          </AdminButton>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text" placeholder="Rechercher par nom / email…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 w-56 transition-all"
        />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prénom" value={editing.firstName} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
              <FormField label="Nom" value={editing.lastName} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Téléphone" value={editing.phone || ''} onChange={v => setEditing((p: any) => ({ ...p, phone: v }))} />
              <FormField label="Rôle" type="select" value={editing.role} onChange={v => setEditing((p: any) => ({ ...p, role: v }))}
                options={[{ value: 'user', label: 'Utilisateur' }, { value: 'editor', label: 'Éditeur' }, { value: 'admin', label: 'Administrateur' }]} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
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
            <div className="flex-1">
              <FormField label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} hint="Min. 8 caractères" />
            </div>
            <AdminButton onClick={doReset} loading={loading} disabled={newPassword.length < 8}><Shield className="h-3.5 w-3.5" /> Appliquer</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setResetId(null); setNewPassword(''); }}>Annuler</AdminButton>
          </div>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'avatar', label: '', render: r => (
              <div className={`h-8 w-8 rounded-full border grid place-items-center text-[10px] font-bold shrink-0 ${r.role === 'admin' ? 'bg-accent/10 border-accent/30 text-accent' : r.role === 'editor' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/8 text-white/40'}`}>
                {(r.firstName?.[0] || '?')}{(r.lastName?.[0] || '')}
              </div>
            )},
            { key: 'name', label: 'Utilisateur', render: r => (
              <div>
                <p className="text-xs font-semibold text-white/85">{r.firstName} {r.lastName}</p>
                <p className="text-[9px] text-white/30">{r.email}</p>
              </div>
            )},
            { key: 'role', label: 'Rôle', render: r => <span className={`text-[10px] uppercase tracking-widest ${ROLE_COLOR[r.role] || 'text-white/40'}`}>{r.role}</span> },
            { key: 'status', label: 'Statut', render: r => (
              <div className="flex items-center gap-1.5">
                {r.isActive ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/15" />}
                <span className={`text-[10px] font-medium ${r.isActive ? 'text-emerald-400' : 'text-white/30'}`}>{r.isActive ? 'Actif' : 'Inactif'}</span>
              </div>
            )},
            { key: 'editor', label: 'Éditeur', align: 'center', render: r => r.role === 'editor' ? (
              r.editorApproved
                ? <span className="text-[9px] text-emerald-400 font-bold">✓ Approuvé</span>
                : <button onClick={() => approve(r.id)} className="text-[9px] text-amber-400 font-bold hover:text-amber-300 transition-colors">Approuver →</button>
            ) : <span className="text-white/15">—</span> },
            { key: 'actions', label: '', render: r => (
              <div className="flex gap-1">
                <button onClick={() => toggle(r.id)} title={r.isActive ? 'Désactiver' : 'Réactiver'}
                  className={`h-6 w-6 rounded-lg grid place-items-center transition-all border ${r.isActive ? 'bg-red-500/5 border-red-500/10 text-red-400/50 hover:text-red-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/50 hover:text-emerald-400'}`}>
                  {r.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                </button>
                <button onClick={() => setResetId(r.id)} title="Réinitialiser le mot de passe"
                  className="h-6 w-6 rounded-lg grid place-items-center bg-white/5 border border-white/8 text-white/30 hover:text-white transition-all">
                  <Shield className="h-3 w-3" />
                </button>
              </div>
            )},
          ]}
          data={users}
          keyField="id"
          onEdit={r => setEditing(r)}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end">
          <Paginator page={page} total={total} limit={LIMIT} onChange={setPage} />
        </div>
      </AdminCard>
    </div>
  );
}
