import { useEffect, useMemo, useState } from 'react';
import { Check, FileText, LayoutGrid, Lock, Search, ShieldAlert, ShieldCheck, Sliders, Table as TableIcon, Trash2, Trophy, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfigFieldsGrid } from '@/shell/builder-framework/configBuilder';
import type { CanvasProps } from '@/shell/registry/types';
import { rolesConfig, type RoleRow } from '@/features/iam/configs/roles.config';
import { iamApi } from '@/features/iam/iam.api';
import type { PermissionCatalog } from '@/features/iam/iam.types';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';

export function RoleCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Partial<RoleRow>>) {
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  useEffect(() => {
    iamApi.catalog().then(setCatalog).catch((e) => setLoadError(e?.message ?? 'Erreur de chargement du catalogue'));
  }, []);

  const granted = useMemo(() => new Set(draft.permissions ?? []), [draft.permissions]);

  const handleRoleChange = (next: Partial<RoleRow>) => {
    const oldName = draft.name || '';
    const newName = next.name || '';
    if (newName !== oldName) {
      const slugifiedOld = oldName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const currentKey = next.key || '';
      if (!currentKey || currentKey === slugifiedOld) {
        next.key = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
    onChange(next);
  };

  const setPermissions = (next: Set<string>) =>
    onChange({ ...draft, permissions: [...next].sort() });

  const cycle = (mod: string, action: string, ownable: boolean) => {
    const full = `${mod}.${action}`;
    const own = `${full}:own`;
    const next = new Set(granted);
    if (next.has(full)) {
      next.delete(full);
      if (ownable) next.add(own);
    } else if (next.has(own)) {
      next.delete(own);
    } else {
      next.add(full);
    }
    setPermissions(next);
    onSelect({ kind: 'permission', ref: full, label: `${mod} · ${action}` });
  };

  const toggleModule = (mod: string, actions: string[]) => {
    const next = new Set(granted);
    const allOn = actions.every((a) => next.has(`${mod}.${a}`));
    actions.forEach((a) => {
      next.delete(`${mod}.${a}`); next.delete(`${mod}.${a}:own`);
      if (!allOn) next.add(`${mod}.${a}`);
    });
    setPermissions(next);
  };

  const applyPreset = (preset: 'match-builder' | 'editor' | 'admin' | 'clear') => {
    let perms: string[] = [];
    if (preset === 'admin') perms = ['*'];
    else if (preset === 'match-builder') {
      perms = [
        'matches.view', 'matches.create', 'matches.update', 'matches.delete', 'matches.publish',
        'seasons.view', 'seasons.create', 'seasons.update', 'seasons.delete', 'seasons.configure',
        'stadiums.view', 'stadiums.create', 'stadiums.update', 'stadiums.delete',
        'referees.view', 'referees.create', 'referees.update', 'referees.delete', 'referees.assign',
        'clubs.view', 'players.view', 'standings.view', 'standings.update',
      ];
    } else if (preset === 'editor') {
      perms = [
        'articles.view', 'articles.create', 'articles.update:own', 'articles.delete:own', 'articles.publish:own',
        'media.view', 'media.create', 'media.import', 'uploads.create',
      ];
    }
    setPermissions(new Set(perms));
  };

  // ── Field policies ────────────────────────────────────────────
  const fieldPolicies = draft.fieldPolicies ?? {};
  const [policyEntity, setPolicyEntity] = useState('articles');
  const entityFields: { key: string; label: string }[] = useMemo(() => {
    const cfg = ENTITY_REGISTRY[policyEntity];
    return cfg ? cfg.fields.map((f: { key: unknown; label: string }) => ({ key: String(f.key), label: f.label })) : [];
  }, [policyEntity]);

  const toggleDeniedField = (fieldKey: string) => {
    const current = new Set(fieldPolicies[policyEntity]?.deny ?? []);
    if (current.has(fieldKey)) current.delete(fieldKey); else current.add(fieldKey);
    onChange({
      ...draft,
      fieldPolicies: { ...fieldPolicies, [policyEntity]: { deny: [...current].sort() } },
    });
  };

  const isAdminWildcard = granted.has('*');

  const filteredModules = useMemo(() => {
    if (!catalog) return [];
    if (!search.trim()) return catalog.modules;
    const term = search.toLowerCase().trim();
    return catalog.modules.filter((m) =>
      m.label.toLowerCase().includes(term) ||
      m.key.toLowerCase().includes(term) ||
      m.actions.some((a) => a.toLowerCase().includes(term))
    );
  }, [catalog, search]);

  const [currentTab, setCurrentTab] = useState<'identity' | 'permissions' | 'fields'>(
    (activeSection as 'identity' | 'permissions' | 'fields') || 'identity'
  );

  useEffect(() => {
    if (activeSection && ['identity', 'permissions', 'fields'].includes(activeSection)) {
      setCurrentTab(activeSection as 'identity' | 'permissions' | 'fields');
    }
  }, [activeSection]);

  const selectTab = (tab: 'identity' | 'permissions' | 'fields') => {
    setCurrentTab(tab);
    onSelect({ kind: 'section', ref: tab, label: tab === 'identity' ? 'Identité' : tab === 'permissions' ? 'Permissions' : 'Champs' });
  };

  return (
    <div className="space-y-6">
      {/* ── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-zinc-800 pb-2 gap-2">
        <button
          type="button"
          onClick={() => selectTab('identity')}
          className={cn(
            'px-4 py-2 text-[13px] font-medium rounded-lg transition-colors flex items-center gap-2',
            currentTab === 'identity'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          )}
        >
          <User2 className="size-4" />
          Identité du rôle
        </button>
        <button
          type="button"
          onClick={() => selectTab('permissions')}
          className={cn(
            'px-4 py-2 text-[13px] font-medium rounded-lg transition-colors flex items-center gap-2',
            currentTab === 'permissions'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          )}
        >
          <ShieldCheck className="size-4" />
          Permissions ({(draft.permissions ?? []).length})
        </button>
        <button
          type="button"
          onClick={() => selectTab('fields')}
          className={cn(
            'px-4 py-2 text-[13px] font-medium rounded-lg transition-colors flex items-center gap-2',
            currentTab === 'fields'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          )}
        >
          <Lock className="size-4" />
          Politiques par champ
        </button>
      </div>

      {/* ── Identity ─────────────────────────────────────────── */}
      {currentTab === 'identity' && (
        <section id="identity">
          <SectionTitle icon={<User2 className="size-4" />} title="Identité du rôle"
            subtitle={draft.isSystem ? 'Rôle système — clé verrouillée, permissions modifiables' : undefined} />
          <ConfigFieldsGrid config={rolesConfig} draft={draft} onChange={handleRoleChange}
            fieldKeys={draft.isSystem ? ['name', 'description', 'isDefault'] : ['name', 'key', 'description', 'isDefault']}
            onSelect={onSelect} />
        </section>
      )}

      {/* ── Permission matrix & Selector ────────────────────── */}
      {currentTab === 'permissions' && (
        <section id="permissions" className="space-y-5">
          <SectionTitle icon={<ShieldCheck className="size-4" />} title="Attribution des permissions"
            subtitle="Accordez les permissions par module, utilisez un modèle prédéfini ou saisissez des permissions personnalisées." />

          {/* ── Presets Bar ──────────────────────────────────── */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
                <Sliders className="size-3.5 text-emerald-500" /> Modèles prédéfinis de rôles
              </div>
              <button
                type="button"
                onClick={() => applyPreset('clear')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] hover:bg-red-900/40 transition-colors"
              >
                <Trash2 className="size-3.5" /> Réinitialiser
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => applyPreset('match-builder')}
                className="flex flex-col items-start text-left p-3 rounded-xl border border-emerald-800/40 bg-emerald-950/10 hover:bg-emerald-950/20 transition-all group"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-400 mb-1">
                  <Trophy className="size-4" /> Match Builder
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Gestion des championnats, planification des matchs, affectation des arbitres et stades.
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => applyPreset('editor')}
                className="flex flex-col items-start text-left p-3 rounded-xl border border-blue-800/40 bg-blue-950/10 hover:bg-blue-950/20 transition-all group"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold text-blue-400 mb-1">
                  <FileText className="size-4" /> Éditeur de Contenu
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Rédaction et publication d'articles de presse, gestion de la galerie média.
                </p>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('admin')}
                className="flex flex-col items-start text-left p-3 rounded-xl border border-purple-800/40 bg-purple-950/10 hover:bg-purple-950/20 transition-all group"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold text-purple-400 mb-1">
                  <ShieldAlert className="size-4" /> Administrateur
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Accès complet et illimité à tous les modules et configurations système.
                </p>
              </button>
            </div>
          </div>

          {isAdminWildcard && (
            <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-[13px] text-emerald-300">
              Ce rôle possède « * » — accès complet à tous les modules.
            </div>
          )}
          {loadError && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-[13px] text-red-300">
              {loadError}
            </div>
          )}

          {/* ── Search & View Mode Switcher ────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filtrer les modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!catalog) return;
                    const all: string[] = [];
                    catalog.modules.forEach((m) => m.actions.forEach((a) => all.push(`${m.key}.${a}`)));
                    setPermissions(new Set(all));
                  }}
                  className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                >
                  Tout cocher
                </button>
                <button
                  type="button"
                  onClick={() => setPermissions(new Set())}
                  className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all"
                >
                  Tout décocher
                </button>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                    viewMode === 'cards' ? 'bg-emerald-600/30 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <LayoutGrid className="size-3.5" /> Cartes
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                    viewMode === 'matrix' ? 'bg-emerald-600/30 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <TableIcon className="size-3.5" /> Tableau
                </button>
              </div>
            </div>
          </div>

          {/* ── Module Cards View Mode ────────────────────────── */}
          {catalog && viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules.map((m) => {
                const allOn = m.actions.every((a) => granted.has(`${m.key}.${a}`));
                const grantedCount = m.actions.filter((a) => granted.has(`${m.key}.${a}`) || granted.has(`${m.key}.${a}:own`)).length;
                return (
                  <div key={m.key} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700">
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-800/50 pb-2">
                      <div>
                        <h4 className="text-[13px] font-semibold text-zinc-100 flex items-center gap-2">
                          {m.label}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-normal border border-zinc-800">
                            {grantedCount}/{m.actions.length}
                          </span>
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-mono">{m.key}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModule(m.key, m.actions)}
                        className={cn(
                          'text-[11px] px-2 py-0.5 rounded border transition-colors',
                          allOn
                            ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                        )}
                      >
                        {allOn ? <span className="flex items-center gap-1"><Check className="size-3 text-emerald-400" /> Tout accordé</span> : 'Tout accorder'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {m.actions.map((a) => {
                        const full = `${m.key}.${a}`;
                        const state = isAdminWildcard || granted.has(full) ? 'yes'
                          : granted.has(`${full}:own`) ? 'own' : 'no';
                        const ownable = (m.ownable ?? []).includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => cycle(m.key, a, ownable)}
                            className={cn(
                              'px-2.5 py-1 rounded-md text-[11px] border transition-colors flex items-center gap-1',
                              state === 'yes' && 'border-emerald-600 bg-emerald-600/20 text-emerald-300 font-medium',
                              state === 'own' && 'border-amber-600 bg-amber-600/20 text-amber-300 font-medium',
                              state === 'no' && 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                            )}
                          >
                            {state === 'yes' && <Check className="size-3 text-emerald-400" />}
                            {state === 'own' && <span className="text-[9px] text-amber-400 font-mono">OWN</span>}
                            <span className="capitalize">{a}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Table Matrix View Mode ────────────────────────── */}
          {catalog && viewMode === 'matrix' && (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[760px] border-collapse text-[12px]">
                <thead>
                  <tr className="bg-zinc-900/70 text-zinc-400">
                    <th className="sticky left-0 bg-zinc-900/95 px-3 py-2 text-left font-medium">Module</th>
                    {catalog.actions.map((a) => (
                      <th key={a} className="px-2 py-2 text-center font-medium capitalize">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((m) => (
                    <tr key={m.key} className="border-t border-zinc-800/70 hover:bg-zinc-900/40">
                      <td className="sticky left-0 bg-zinc-950/95 px-3 py-1.5">
                        <button type="button" onClick={() => toggleModule(m.key, m.actions)}
                          className="text-left text-zinc-300 hover:text-emerald-400" title="Tout basculer">
                          {m.label}
                        </button>
                      </td>
                      {catalog.actions.map((a) => {
                        const supported = m.actions.includes(a);
                        if (!supported) return <td key={a} className="px-2 py-1.5 text-center text-zinc-800">—</td>;
                        const full = `${m.key}.${a}`;
                        const state = isAdminWildcard || granted.has(full) ? 'yes'
                          : granted.has(`${full}:own`) ? 'own' : 'no';
                        const ownable = (m.ownable ?? []).includes(a);
                        return (
                          <td key={a} className="px-2 py-1.5 text-center">
                            <button type="button" onClick={() => cycle(m.key, a, ownable)}
                              aria-label={`${m.label} ${a}: ${state}`}
                              className={cn(
                                'inline-flex size-6 items-center justify-center rounded-md border text-[10px] transition-colors',
                                state === 'yes' && 'border-emerald-600 bg-emerald-600/20 text-emerald-400',
                                state === 'own' && 'border-amber-600 bg-amber-600/20 text-amber-400',
                                state === 'no' && 'border-zinc-800 text-zinc-700 hover:border-zinc-600',
                              )}>
                              {state === 'yes' && <Check className="size-3.5" />}
                              {state === 'own' && 'own'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 text-[12px] text-zinc-500">
            {granted.size} permission{granted.size > 1 ? 's' : ''} accordée{granted.size > 1 ? 's' : ''}
            {draft.version ? ` · version v${draft.version} (incrémentée à chaque changement de permissions)` : ''}
          </p>

          {/* ── Custom Permissions Input ───────────────────────── */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <h4 className="text-[13px] font-semibold text-zinc-200 mb-1">Permissions personnalisées & Liste complète</h4>
            <p className="text-[12px] text-zinc-500 mb-3">
              Ajoutez de nouvelles permissions spécifiques ou gérez la liste des permissions attribuées à ce rôle.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[...granted].map((perm) => (
                <span key={perm} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px]">
                  {perm}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Set(granted);
                      next.delete(perm);
                      setPermissions(next);
                    }}
                    className="text-emerald-400 hover:text-red-400 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="Ajouter une nouvelle permission (Ex: matches.custom_action) + Entrée"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const next = new Set(granted);
                      next.add(val);
                      setPermissions(next);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Field-level policies ─────────────────────────────── */}
      {currentTab === 'fields' && (
        <section id="fields">
          <SectionTitle icon={<Lock className="size-4" />} title="Permissions au niveau des champs"
            subtitle="Champs que les détenteurs de ce rôle ne peuvent PAS modifier — appliqué côté serveur avant chaque écriture." />
          <div className="mb-3 flex items-center gap-2">
            <label className="text-[13px] text-zinc-400">Entité :</label>
            <select value={policyEntity} onChange={(e) => setPolicyEntity(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-[13px] text-zinc-200">
              {Object.keys(ENTITY_REGISTRY).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entityFields.map((f) => {
              const denied = (fieldPolicies[policyEntity]?.deny ?? []).includes(f.key);
              return (
                <button key={f.key} type="button" onClick={() => toggleDeniedField(f.key)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[12px] transition-colors',
                    denied
                      ? 'border-red-800 bg-red-950/40 text-red-300'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                  )}>
                  {denied && <Lock className="mr-1 inline size-3" />}{f.label}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-[14px] font-semibold text-zinc-100">
        <span className="text-emerald-500">{icon}</span>{title}
      </h2>
      {subtitle && <p className="mt-1 text-[12px] text-zinc-500">{subtitle}</p>}
    </div>
  );
}
