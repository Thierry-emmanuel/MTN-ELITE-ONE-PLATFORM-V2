import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BuilderDefinition, EntityTypeDefinition } from '../registry/types';

interface DemoDraft { name: string; notes: string }

/**
 * The Phase-1 placeholder canvas. It exists to PROVE the framework —
 * autosave, history, selection→inspector, preview, publish pipeline —
 * without implementing any football logic. Phase 2 replaces this per
 * entity (LegacyFormCanvas wraps the existing EntityCrudEngine first).
 */
export function demoBuilderFor(typeDef: EntityTypeDefinition): BuilderDefinition<DemoDraft> {
  return {
    entityType: typeDef.type,
    icon: typeDef.icon,
    emptyDraft: () => ({ name: '', notes: '' }),
    sections: [
      { id: 'identity', label: 'Identité', complete: false },
      { id: 'details', label: 'Détails', complete: false },
      { id: 'media', label: 'Médias', complete: false },
    ],
    Canvas: ({ draft, onChange, onSelect, activeSection }) => (
      <div className="mx-auto max-w-[720px] space-y-5 p-6">
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-[12px] leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-400">Canevas de démonstration</span> — section
            active : <span className="text-emerald-500">{activeSection}</span>. Ce canevas prouve le
            cadre (autosave, historique, sélection → inspecteur, aperçu, publication). Le vrai
            canevas « {typeDef.labelSingular} » arrive en Phase 2.
          </p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-zinc-400">Nom</span>
          <Input
            value={draft.name}
            onFocus={() => onSelect({ kind: 'field', ref: 'name', label: 'Champ : Nom' })}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            placeholder={`Nom du ${typeDef.labelSingular.toLowerCase()}…`}
            className="border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-zinc-400">Notes</span>
          <Textarea
            value={draft.notes}
            onFocus={() => onSelect({ kind: 'field', ref: 'notes', label: 'Champ : Notes' })}
            onChange={(e) => onChange({ ...draft, notes: e.target.value })}
            rows={5}
            placeholder="Tapez pour déclencher l'autosave (800 ms) et créer des versions…"
            className="border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
      </div>
    ),
    inspectorTabs: [
      {
        id: 'properties', label: 'Propriétés',
        render: (draft, selection) => (
          <div className="space-y-3 text-[13px] text-zinc-300">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Sélection</p>
              <p className="mt-1">{selection ? selection.label : 'Aucune — cliquez un champ du canevas.'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Nom</p>
              <p className="mt-1 text-zinc-400">{draft.name || '—'}</p>
            </div>
          </div>
        ),
      },
    ],
    previews: [
      {
        id: 'public', label: 'Site public',
        render: (draft) => (
          <div className="rounded-xl bg-stone-50 p-6 text-stone-900">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">Aperçu — rendu public</p>
            <h2 className="mt-2 font-sans text-2xl font-black tracking-tight">{draft.name || 'Sans titre'}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-stone-600">{draft.notes || 'Aucune note.'}</p>
          </div>
        ),
      },
    ],
    relations: [],
    publishing: {
      validate: (draft) => ({
        ok: draft.name.trim().length > 0,
        issues: draft.name.trim() ? [] : [{ field: 'Nom', message: 'requis avant publication.' }],
      }),
    },
  };
}
