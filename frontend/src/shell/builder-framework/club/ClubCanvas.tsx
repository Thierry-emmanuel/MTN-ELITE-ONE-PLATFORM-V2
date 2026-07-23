/**
 * Club Builder Canvas — bespoke canvas inside the universal BuilderHost.
 *
 * • Sections "identity", "visuals", "stadium" et "narrative" utilisent le
 *   ConfigFieldsGrid générique.
 * • La section "stadium" affiche les stades RÉELS de la BD.  L'admin peut :
 *     – Choisir un stade existant (liaison directe avec le club)
 *     – Créer un nouveau stade (POST /stadiums) et le lier en une seule action
 * • La section "equipments" affiche les équipements déjà liés au club et
 *   permet d'en ajouter / supprimer rapidement.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Package, Plus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { clubsConfig, type Club } from '@/features/admin/configs/clubs.config';
import { stadiumsConfig, type Stadium } from '@/features/admin/configs/stadiums.config';
import { equipmentsConfig, type Equipment } from '@/features/admin/configs/equipments.config';
import { createEntityApi } from '@/features/admin/services/entityApi';
import { apiClient } from '@/services/api';

type Draft = Partial<Club>;

const stadiumApi = createEntityApi<Stadium>(stadiumsConfig);
const equipmentApi = createEntityApi<Equipment>(equipmentsConfig);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SURFACE_LABELS: Record<string, string> = {
  GRASS: '🌿 Naturelle',
  ARTIFICIAL: '⚙️ Synthétique',
  HYBRID: '🔀 Hybride',
};

const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  JERSEY_HOME: '👕 Maillot Domicile',
  JERSEY_AWAY: '👕 Maillot Extérieur',
  BALL: '⚽ Ballon officiel',
  TRAINING_KIT: '🎽 Kit d\'entraînement',
  OTHER: 'Autre',
};

// ─── Stadium Section ──────────────────────────────────────────────────────────

function StadiumSection({ draft, onChange }: { draft: Draft; onChange: (d: Draft) => void }) {
  const qc = useQueryClient();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newStadium, setNewStadium] = useState<Partial<Stadium>>({
    name: '',
    city: draft.city ?? '',
    capacity: 5000,
    surface: 'GRASS',
    status: 'ACTIVE',
    country: 'Cameroun',
  });

  const { data: stadiumsRaw, isLoading, refetch } = useQuery({
    queryKey: ['stadiums'],
    queryFn: () => apiClient.get('/stadiums', { params: { limit: 200 } }).then((r) => {
      const body = r.data;
      return (Array.isArray(body) ? body : body.data ?? []) as Stadium[];
    }),
    staleTime: 30_000,
  });
  const stadiums: Stadium[] = stadiumsRaw ?? [];

  const createStadiumMutation = useMutation({
    mutationFn: async (payload: Partial<Stadium>) => {
      const res = await apiClient.post<Stadium>('/stadiums', {
        name: payload.name,
        city: payload.city,
        country: payload.country ?? 'Cameroun',
        capacity: Number(payload.capacity),
        surface: payload.surface ?? 'GRASS',
        status: 'ACTIVE',
      });
      return res.data;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['stadiums'] });
      // Link the new stadium to the club
      onChange({ ...draft, stadium: created.name, stadiumCapacity: created.capacity });
      toast.success(`Stade « ${created.name} » créé et lié au club !`);
      setShowNewForm(false);
      setNewStadium({ name: '', city: draft.city ?? '', capacity: 5000, surface: 'GRASS', status: 'ACTIVE', country: 'Cameroun' });
    },
    onError: () => toast.error('Erreur lors de la création du stade.'),
  });

  const selected = stadiums.find((s) => s.name === draft.stadium);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Building2 className="size-5 text-zinc-400" />
        <h3 className="text-[14px] font-bold text-zinc-200">Stade Résidentiel</h3>
        <button onClick={() => refetch()} className="ml-auto p-1 rounded hover:bg-zinc-800 text-zinc-500">
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      {/* Stade sélectionné actuellement */}
      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-3">
          {selected.photoUrl ? (
            <img src={selected.photoUrl} alt="" className="size-12 rounded-lg object-cover border border-zinc-800" />
          ) : (
            <div className="size-12 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center">
              <Building2 className="size-6 text-zinc-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-emerald-400">{selected.name}</p>
            <p className="text-[11px] text-zinc-500">{selected.city} · {selected.capacity?.toLocaleString()} places · {SURFACE_LABELS[selected.surface ?? ''] ?? selected.surface}</p>
          </div>
          <button
            onClick={() => onChange({ ...draft, stadium: undefined, stadiumCapacity: undefined })}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400"
            title="Dissocier"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-zinc-600 italic">Aucun stade sélectionné — choisissez ci-dessous.</p>
      )}

      {/* Liste des stades disponibles */}
      {isLoading ? (
        <p className="text-[12px] text-zinc-600 animate-pulse">Chargement des stades…</p>
      ) : (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Stades disponibles ({stadiums.length})
          </p>
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {stadiums.length === 0 ? (
              <p className="text-[12px] text-zinc-600 italic">Aucun stade dans la base.</p>
            ) : stadiums.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ ...draft, stadium: s.name, stadiumCapacity: s.capacity })}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all text-left ${
                  s.name === draft.stadium
                    ? 'border-emerald-600/50 bg-emerald-600/10'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900'
                }`}
              >
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt="" className="size-10 rounded-lg object-cover border border-zinc-800 shrink-0" />
                ) : (
                  <div className="size-10 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0">
                    <Building2 className="size-5 text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-200 truncate">{s.name}</p>
                  <p className="text-[11px] text-zinc-500">{s.city} · {s.capacity?.toLocaleString()} places · {SURFACE_LABELS[s.surface ?? ''] ?? s.surface}</p>
                </div>
                {s.name === draft.stadium && <Check className="size-4 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nouveau stade rapide */}
      <div className="border-t border-zinc-800 pt-4">
        {!showNewForm ? (
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 px-4 py-2.5 text-[12px] font-semibold text-zinc-400 hover:border-emerald-600 hover:text-emerald-400 transition-all w-full justify-center"
          >
            <Plus className="size-4" /> Créer un nouveau stade et le lier
          </button>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <p className="text-[12px] font-bold text-zinc-300">Nouveau stade — sera créé dans la base et lié au club</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nom du stade *</label>
                <input
                  value={newStadium.name ?? ''}
                  onChange={(e) => setNewStadium((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ex. Stade Municipal de Douala"
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Ville *</label>
                <input
                  value={newStadium.city ?? ''}
                  onChange={(e) => setNewStadium((p) => ({ ...p, city: e.target.value }))}
                  placeholder="ex. Douala"
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Capacité *</label>
                <input
                  type="number"
                  value={newStadium.capacity ?? 5000}
                  onChange={(e) => setNewStadium((p) => ({ ...p, capacity: Number(e.target.value) }))}
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Surface</label>
                <select
                  value={newStadium.surface ?? 'GRASS'}
                  onChange={(e) => setNewStadium((p) => ({ ...p, surface: e.target.value as Stadium['surface'] }))}
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                >
                  <option value="GRASS">🌿 Naturelle</option>
                  <option value="ARTIFICIAL">⚙️ Synthétique</option>
                  <option value="HYBRID">🔀 Hybride</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="flex-1 h-9 rounded-lg border border-zinc-800 text-[12px] text-zinc-400 hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!newStadium.name || !newStadium.city || createStadiumMutation.isPending}
                onClick={() => createStadiumMutation.mutate(newStadium)}
                className="flex-1 h-9 rounded-lg bg-emerald-600 text-[12px] font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                {createStadiumMutation.isPending ? 'Création…' : '✓ Créer & Lier ce stade'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Equipment Section ────────────────────────────────────────────────────────

function EquipmentsSection({ draft }: { draft: Draft }) {
  const qc = useQueryClient();
  const clubId = draft.id;
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEq, setNewEq] = useState<Partial<Equipment>>({
    name: '',
    type: 'JERSEY_HOME',
    brand: '',
    clubId: clubId ?? '',
  });

  const { data: allEquipmentsRaw, isLoading, refetch } = useQuery({
    queryKey: ['equipments'],
    queryFn: () => apiClient.get('/equipments', { params: { clubId: clubId ?? undefined } }).then((r) => {
      const body = r.data;
      return (Array.isArray(body) ? body : body.data ?? []) as Equipment[];
    }),
    staleTime: 30_000,
  });
  const allEquipments: Equipment[] = allEquipmentsRaw ?? [];
  const clubEquipments = allEquipments;

  const createEqMutation = useMutation({
    mutationFn: async (payload: Partial<Equipment>) => {
      const res = await apiClient.post<Equipment>('/equipments', {
        name: payload.name,
        type: payload.type,
        brand: payload.brand,
        clubId: clubId ? Number(clubId) : null,
      });
      return res.data;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['equipments'] });
      toast.success(`Équipement « ${created.name} » ajouté !`);
      setShowNewForm(false);
      setNewEq({ name: '', type: 'JERSEY_HOME', brand: '', clubId: clubId ?? '' });
    },
    onError: () => toast.error('Erreur lors de l\'ajout de l\'équipement.'),
  });

  const deleteEqMutation = useMutation({
    mutationFn: (id: string | number) => apiClient.delete(`/equipments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipments'] });
      toast.success('Équipement supprimé.');
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Package className="size-5 text-zinc-400" />
        <h3 className="text-[14px] font-bold text-zinc-200">Équipements du Club</h3>
        <button onClick={() => refetch()} className="ml-auto p-1 rounded hover:bg-zinc-800 text-zinc-500">
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      {!clubId && (
        <div className="rounded-xl border border-amber-600/30 bg-amber-600/10 px-4 py-3 text-[12px] text-amber-400">
          ⚠️ Publiez le club d'abord pour lier des équipements — le club n'a pas encore d'identifiant backend.
        </div>
      )}

      {isLoading ? (
        <p className="text-[12px] text-zinc-600 animate-pulse">Chargement des équipements…</p>
      ) : clubEquipments.length === 0 ? (
        <p className="text-[12px] text-zinc-600 italic">Aucun équipement lié à ce club.</p>
      ) : (
        <div className="space-y-1.5">
          {clubEquipments.map((eq) => (
            <div key={eq.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
              {eq.imageUrl ? (
                <img src={eq.imageUrl} alt="" className="size-10 rounded-lg object-cover border border-zinc-800 shrink-0" />
              ) : (
                <div className="size-10 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0 text-[18px]">
                  {eq.type === 'JERSEY_HOME' || eq.type === 'JERSEY_AWAY' ? '👕' : eq.type === 'BALL' ? '⚽' : '🎽'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-zinc-200 truncate">{eq.name}</p>
                <p className="text-[11px] text-zinc-500">{EQUIPMENT_TYPE_LABELS[eq.type] ?? eq.type} · {eq.brand}</p>
              </div>
              <button
                onClick={() => {
                  if (eq.id && window.confirm(`Supprimer "${eq.name}" ?`)) {
                    deleteEqMutation.mutate(eq.id);
                  }
                }}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-red-400"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Nouveau équipement */}
      <div className="border-t border-zinc-800 pt-4">
        {!showNewForm ? (
          <button
            type="button"
            disabled={!clubId}
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 px-4 py-2.5 text-[12px] font-semibold text-zinc-400 hover:border-emerald-600 hover:text-emerald-400 transition-all w-full justify-center disabled:opacity-40"
          >
            <Plus className="size-4" /> Ajouter un équipement
          </button>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <p className="text-[12px] font-bold text-zinc-300">Nouvel équipement — sera créé dans la base et lié au club</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nom *</label>
                <input
                  value={newEq.name ?? ''}
                  onChange={(e) => setNewEq((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ex. Maillot Domicile 2026"
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Marque *</label>
                <input
                  value={newEq.brand ?? ''}
                  onChange={(e) => setNewEq((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="ex. Nike, Puma…"
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Type</label>
                <select
                  value={newEq.type ?? 'JERSEY_HOME'}
                  onChange={(e) => setNewEq((p) => ({ ...p, type: e.target.value as Equipment['type'] }))}
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-200 outline-none focus:border-emerald-600"
                >
                  <option value="JERSEY_HOME">👕 Maillot Domicile</option>
                  <option value="JERSEY_AWAY">👕 Maillot Extérieur</option>
                  <option value="BALL">⚽ Ballon officiel</option>
                  <option value="TRAINING_KIT">🎽 Kit d'entraînement</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="flex-1 h-9 rounded-lg border border-zinc-800 text-[12px] text-zinc-400 hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!newEq.name || !newEq.brand || createEqMutation.isPending}
                onClick={() => createEqMutation.mutate(newEq)}
                className="flex-1 h-9 rounded-lg bg-emerald-600 text-[12px] font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                {createEqMutation.isPending ? 'Ajout…' : '✓ Ajouter cet équipement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Club Canvas ─────────────────────────────────────────────────────────

export function ClubCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Draft>) {
  const genericSections = ['identity', 'visuals', 'narrative', 'achievements', 'socials', 'review'];

  return (
    <div className="mx-auto max-w-[760px] p-6">
      {/* Generic sections — powered by ConfigFieldsGrid */}
      {genericSections.includes(activeSection) && (
        <ConfigFieldsGrid
          config={clubsConfig}
          draft={draft}
          onChange={onChange}
          onSelect={onSelect}
          fieldKeys={clubsConfig.builderSteps?.find((s) => s.id === activeSection)?.fieldKeys as (keyof Club)[] | undefined}
        />
      )}

      {/* Stadium Section — fetches real stadiums from DB */}
      {activeSection === 'stadium' && (
        <StadiumSection draft={draft} onChange={onChange} />
      )}

      {/* Equipments Section — fetches real equipments from DB */}
      {activeSection === 'equipments' && (
        <EquipmentsSection draft={draft} />
      )}
    </div>
  );
}
