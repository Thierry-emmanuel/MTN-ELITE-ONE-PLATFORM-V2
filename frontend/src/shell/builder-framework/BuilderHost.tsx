import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, CircleCheck, CircleDashed, Eye, History as HistoryIcon, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BuilderDefinition, BuilderSelection, EntityStatus, OSEntity } from '../registry/types';
import { StatusBadge, EntityChip } from '../components/EntityPrimitives';
import { useInspector } from '../stores/inspector.store';
import { useDrafts } from '../stores/drafts.store';
import { ShortcutRegistry } from '../navigation/shortcuts';
import { useT } from '../i18n';

interface Version<T> { at: string; snapshot: T }

/**
 * BuilderHost — the universal Builder Framework (Phase 1: framework only).
 * Every future Builder inherits the eight regions by providing a
 * BuilderDefinition; the module writes ONLY the Canvas (③) and its
 * inspector tabs. The framework owns: draft lifecycle + autosave,
 * history, selection routing, preview mode, the publish pipeline,
 * and builder-scoped keyboard shortcuts.
 */
export function BuilderHost<T>({ def, entity }: { def: BuilderDefinition<T>; entity: OSEntity }) {
  const t = useT();
  const [draft, setDraft] = useState<T>(() => def.emptyDraft());
  const [status, setStatus] = useState<EntityStatus>(entity.status ?? 'draft');
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [selection, setSelection] = useState<BuilderSelection | null>(null);
  const [activeSection, setActiveSection] = useState(def.sections[0]?.id ?? '');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [versions, setVersions] = useState<Version<T>[]>([]);
  const upsertDraft = useDrafts((s) => s.upsert);
  const setInspectorTabs = useInspector((s) => s.setTabs);
  const setInspectorOpen = useInspector((s) => s.setOpen);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── ⑦ framework-owned autosave (debounced 800ms) + history versions ──────
  const save = useCallback((snapshot: T) => {
    setVersions((v) => [{ at: new Date().toISOString(), snapshot }, ...v].slice(0, 20));
    setSavedAt(new Date());
    setDirty(false);
    upsertDraft({ ...entity, status: 'draft', updatedAt: new Date().toISOString() });
  }, [entity, upsertDraft]);

  const onChange = useCallback((next: T) => {
    setDraft(next);
    setDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), 800);
  }, [save]);

  // ── ④/⑤ selection → inspector routing (framework-owned) ─────────────────
  useEffect(() => {
    setInspectorTabs([
      ...def.inspectorTabs.map((tab) => ({
        id: tab.id, label: tab.label, content: tab.render(draft, selection),
      })),
      ...(def.relations?.length
        ? [{
            id: '__relations', label: 'Relations',
            content: (
              <div className="space-y-4">
                {def.relations.map((r) => (
                  <div key={r.label}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{r.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.entities.map((e) => <EntityChip key={`${e.type}:${e.id}`} entity={e} />)}
                    </div>
                  </div>
                ))}
              </div>
            ),
          }]
        : []),
    ]);
    return () => setInspectorTabs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, selection]);

  const onSelect = useCallback((sel: BuilderSelection | null) => {
    setSelection(sel);
    if (sel) setInspectorOpen(true);
  }, [setInspectorOpen]);

  // ── ⑧ publish pipeline: validate → confirm → action → toast ─────────────
  const validation = useMemo(() => def.publishing.validate(draft), [def, draft]);
  const publish = () => {
    setStatus('published');
    setPublishOpen(false);
    toast.success('Publié', { description: `${entity.title} est maintenant publié.` });
  };

  // ── builder-scoped shortcuts (framework-owned) ──────────────────────────
  useEffect(() => {
    const off = ShortcutRegistry.registerMany([
      { keys: 'mod+s', scope: 'builder', description: 'Forcer l’enregistrement', allowInInput: true, handler: () => save(draft) },
      { keys: 'mod+enter', scope: 'builder', description: 'Publier', allowInInput: true, handler: () => setPublishOpen(true) },
      { keys: 'mod+p', scope: 'builder', description: 'Aperçu', allowInInput: true, handler: () => setPreviewId((p) => (p ? null : def.previews?.[0]?.id ?? null)) },
      ...(def.shortcuts ?? []),
    ]);
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const preview = def.previews?.find((p) => p.id === previewId);

  return (
    <div className="flex h-full flex-col">
      {/* ① BUILDER HEADER */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 px-4">
        <span className="grid size-7 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
          <def.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-sans text-[14px] font-bold tracking-tight text-zinc-100">{entity.title}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-[11px] text-zinc-600" aria-live="polite">
            {dirty ? 'Modifications en cours…' : savedAt ? `${t('builder.saved')} · ${savedAt.toLocaleTimeString()}` : t('builder.draft')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}
            className="h-8 gap-1.5 text-[13px] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
            <HistoryIcon className="size-3.5" /> {t('builder.history')}
          </Button>
          {(def.previews?.length ?? 0) > 0 && (
            <Button variant="ghost" size="sm"
              onClick={() => setPreviewId((p) => (p ? null : def.previews![0].id))}
              className={cn('h-8 gap-1.5 text-[13px]', previewId ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200')}>
              <Eye className="size-3.5" /> {t('builder.preview')}
            </Button>
          )}
          <div className="flex">
            <Button size="sm" onClick={() => setPublishOpen(true)}
              className="h-8 rounded-r-none bg-emerald-600 text-[13px] font-medium text-white hover:bg-emerald-500">
              {t('builder.publish')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" aria-label="Options de publication"
                  className="h-8 rounded-l-none border-l border-emerald-700 bg-emerald-600 px-1.5 text-white hover:bg-emerald-500">
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                <DropdownMenuItem className="text-[13px] focus:bg-zinc-800" onSelect={() => setPublishOpen(true)}>Publier maintenant</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] focus:bg-zinc-800" onSelect={() => { setStatus('scheduled'); toast.success('Programmé'); }}>Programmer…</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] focus:bg-zinc-800" onSelect={() => { setStatus('draft'); toast('Dépublié'); }}>Dépublier</DropdownMenuItem>
                {def.publishing.actions?.map((a) => (
                  <DropdownMenuItem key={a.id} className="text-[13px] focus:bg-zinc-800" onSelect={() => a.run()}>{a.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ② BUILDER SIDEBAR — outline of THIS entity */}
        <aside className="hidden w-[200px] shrink-0 border-r border-zinc-800/70 p-2 lg:block" aria-label="Sections">
          <nav className="space-y-0.5">
            {def.sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]',
                  activeSection === s.id ? 'bg-zinc-900 font-medium text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300')}>
                {s.complete
                  ? <CircleCheck className="size-3.5 text-emerald-500" />
                  : <CircleDashed className="size-3.5 text-zinc-600" />}
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ③ CANVAS — the only truly module-owned surface / ⑥ PREVIEW mode */}
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            {preview ? (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="h-full">
                <div className="flex items-center justify-between border-b border-zinc-800/70 bg-zinc-900/40 px-4 py-2">
                  <span className="text-[12px] font-medium text-zinc-300">{t('builder.preview')} — {preview.label}</span>
                  <button onClick={() => setPreviewId(null)} aria-label="Fermer l'aperçu"
                    className="grid size-6 place-items-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="p-4">{preview.render(draft)}</div>
              </motion.div>
            ) : (
              <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="h-full">
                <def.Canvas draft={draft} onChange={onChange} onSelect={onSelect} activeSection={activeSection} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ⑦ HISTORY panel */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-[14px]">{t('builder.history')}</DialogTitle>
            <DialogDescription className="text-[12px] text-zinc-500">
              Chaque enregistrement automatique crée une version. Restaurer remplace le brouillon courant.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[320px]">
            {versions.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-zinc-500">Aucune version pour l’instant — modifiez le canevas.</p>
            ) : (
              <ul className="space-y-1">
                {versions.map((v, i) => (
                  <li key={v.at} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-zinc-900">
                    <span className="text-[13px] text-zinc-300">
                      Version {versions.length - i}
                      <span className="ml-2 text-[11px] text-zinc-600">{new Date(v.at).toLocaleTimeString()}</span>
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      onClick={() => { setDraft(v.snapshot); setHistoryOpen(false); toast('Version restaurée'); }}>
                      Restaurer
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ⑧ PUBLISHING — one pipeline: validate → confirm → action → toast */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Publier « {entity.title} »</DialogTitle>
            <DialogDescription className="text-[12px] text-zinc-500">Rapport de validation avant publication.</DialogDescription>
          </DialogHeader>
          {validation.ok ? (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-[13px] text-emerald-400">
              <CircleCheck className="size-4" /> Prêt à publier — aucune erreur détectée.
            </p>
          ) : (
            <ul className="space-y-1 rounded-lg border border-red-950 bg-red-950/20 px-3 py-2">
              {validation.issues.map((iss) => (
                <li key={iss.field} className="text-[13px] text-red-400">
                  <span className="font-medium">{iss.field}</span> — {iss.message}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setPublishOpen(false)} className="text-zinc-400 hover:bg-zinc-900">Annuler</Button>
            <Button size="sm" disabled={!validation.ok} onClick={publish} className="bg-emerald-600 text-white hover:bg-emerald-500">
              {t('builder.publish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
