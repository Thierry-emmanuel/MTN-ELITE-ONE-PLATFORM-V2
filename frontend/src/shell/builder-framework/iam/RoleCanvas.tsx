import { useEffect, useMemo, useState } from 'react';
import { Check, Lock, ShieldCheck, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfigFieldsGrid } from '@/shell/builder-framework/configBuilder';
import type { CanvasProps } from '@/shell/registry/types';
import { rolesConfig, type RoleRow } from '@/features/iam/configs/roles.config';
import { iamApi } from '@/features/iam/iam.api';
import type { PermissionCatalog } from '@/features/iam/iam.types';
import { ENTITY_REGISTRY } from '@/features/admin/entityRegistry';

/**
 * RoleCanvas — the bespoke Role Builder surface (same pattern as the
 * Match/Competition canvases: the framework owns the host, this owns the
 * sections). Three sections:
 *
 *   identity     — reuses ConfigFieldsGrid (zero duplicated form code)
 *   permissions  — matrix generated from GET /iam/permissions/catalog
 *   fields       — field-level policies (per-entity denied fields)
 *
 * Permission cells cycle: none → granted → own-only (when the catalog marks
 * the action ownable) → none.
 */
export function RoleCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Partial<RoleRow>>) {
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    iamApi.catalog().then(setCatalog).catch((e) => setLoadError(e?.message ?? 'Erreur de chargement du catalogue'));
  }, []);

  const granted = useMemo(() => new Set(draft.permissions ?? []), [draft.permissions]);

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

  return (
    <div className="space-y-8">
      {/* ── Identity ─────────────────────────────────────────── */}
      <section id="identity" className={cn(activeSection !== 'identity' && activeSection !== '' && 'opacity-90')}>
        <SectionTitle icon={<User2 className="size-4" />} title="Identité du rôle"
          subtitle={draft.isSystem ? 'Rôle système — clé verrouillée, permissions modifiables' : undefined} />
        <ConfigFieldsGrid config={rolesConfig} draft={draft} onChange={onChange}
          fieldKeys={draft.isSystem ? ['name', 'description', 'isDefault'] : ['name', 'key', 'description', 'isDefault']}
          onSelect={onSelect} />
      </section>

      {/* ── Permission matrix ────────────────────────────────── */}
      <section id="permissions">
        <SectionTitle icon={<ShieldCheck className="size-4" />} title="Matrice de permissions"
          subtitle="Cliquez pour accorder — un second clic limite aux enregistrements possédés (quand disponible), un troisième retire." />

        {isAdminWildcard && (
          <div className="mb-3 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-[13px] text-emerald-300">
            Ce rôle possède « * » — accès complet à tous les modules. La matrice est informative.
          </div>
        )}
        {loadError && (
          <div className="mb-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-[13px] text-red-300">
            {loadError}
          </div>
        )}

        {catalog && (
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
                {catalog.modules.map((m) => (
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
      </section>

      {/* ── Field-level policies ─────────────────────────────── */}
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
