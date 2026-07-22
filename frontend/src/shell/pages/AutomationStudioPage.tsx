/**
 * Automation Studio — the VISUAL management layer over the existing
 * automation channel (competitions.config.automation, Phase 5). Pipelines
 * are persisted as configuration (trigger → ordered steps → enabled) via the
 * same entityApi PATCH as every builder; the step catalog maps to REAL
 * platform capabilities and says plainly which run natively today (standings
 * recalculation, intelligence cache refresh) and which await the
 * orchestrator. No parallel engine is created here.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, Play, Plus, Save, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { createEntityApi } from '@/features/admin/services/entityApi';
import { competitionsConfig, type Competition } from '@/features/admin/configs/competitions.config';

interface Pipeline { id: string; label: string; trigger: string; steps: string[]; enabled: boolean }

const TRIGGERS = [
  { id: 'MATCH_FINISHED', label: 'Match terminé (sifflet final)' },
  { id: 'MATCH_PUBLISHED', label: 'Match publié' },
  { id: 'STORY_PUBLISHED', label: 'Story publiée' },
  { id: 'TRANSFER_CONFIRMED', label: 'Transfert confirmé' },
];

/** Catalogue of steps = existing platform capabilities, honestly labelled. */
const STEPS: Record<string, { label: string; native?: boolean }> = {
  RECALC_STANDINGS: { label: 'Recalculer le classement', native: true },
  REFRESH_INTELLIGENCE: { label: 'Rafraîchir Football Intelligence', native: true },
  UPDATE_PASSPORT: { label: 'Mettre à jour les passeports joueurs', native: true },
  GENERATE_POSTER: { label: 'Générer l’affiche (Studio de présentation)' },
  GENERATE_PDF: { label: 'Générer le PDF' },
  UPDATE_WEBSITE: { label: 'Mettre à jour le site public' },
  SEND_NOTIFICATIONS: { label: 'Notifier les administrateurs' },
  NOTIFY_SUBSCRIBERS: { label: 'Notifier les abonnés' },
};

const DEFAULT_PIPELINE: Pipeline = {
  id: 'matchday',
  label: 'Après chaque match',
  trigger: 'MATCH_FINISHED',
  steps: ['RECALC_STANDINGS', 'GENERATE_POSTER', 'GENERATE_PDF', 'UPDATE_WEBSITE', 'SEND_NOTIFICATIONS', 'REFRESH_INTELLIGENCE', 'NOTIFY_SUBSCRIBERS'],
  enabled: true,
};

export default function AutomationStudioPage() {
  const api = useMemo(() => createEntityApi(competitionsConfig), []);
  const qc = useQueryClient();
  const { data: competitions = [] } = useQuery({
    queryKey: ['competitions'], queryFn: () => api.list(), staleTime: 30_000,
  });
  const [competitionId, setCompetitionId] = useState<string>('');
  const competition = (competitions as Competition[]).find((c) => String(c.id) === competitionId) ?? (competitions as Competition[])[0];
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = (competition?.config as { automation?: { pipelines?: Pipeline[] } } | undefined)?.automation?.pipelines;
    setPipelines(stored?.length ? stored : [DEFAULT_PIPELINE]);
  }, [competition?.id]);

  useShellPage({
    title: 'Automation Studio',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Opérations', href: `${SHELL_BASE}/operations` },
      { label: 'Automatisations' },
    ],
  });

  const persist = async () => {
    if (!competition) return;
    setSaving(true);
    try {
      await api.update(String(competition.id), {
        config: { ...(competition.config ?? {}), automation: { ...(competition.config?.automation ?? {}), pipelines } },
      } as Partial<Competition>);
      qc.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Automatisations enregistrées', { description: 'competitions.config.automation.pipelines (backend)' });
    } catch {
      toast.error('Échec de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const mutate = (id: string, fn: (p: Pipeline) => Pipeline) =>
    setPipelines((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));

  return (
    <div className="mx-auto max-w-[820px] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select value={String(competition?.id ?? '')} onChange={(e) => setCompetitionId(e.target.value)}
            className="h-8 rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[12px] text-zinc-200 outline-none focus:border-emerald-700">
            {(competitions as Competition[]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="text-[12px] text-zinc-600">Les recettes vivent dans la configuration de la compétition.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPipelines((ps) => [...ps, {
            id: `pipeline-${Date.now()}`, label: 'Nouvelle automatisation', trigger: 'MATCH_PUBLISHED', steps: [], enabled: false,
          }])} className="h-8 gap-1.5 border-zinc-800 bg-transparent text-[13px] text-zinc-200 hover:bg-zinc-900">
            <Plus className="size-3.5" /> Pipeline
          </Button>
          <Button size="sm" onClick={persist} disabled={saving}
            className="h-8 gap-1.5 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500">
            <Save className="size-3.5" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {pipelines.map((p) => (
          <section key={p.id} className={cn('rounded-xl border p-4', p.enabled ? 'border-emerald-900/60 bg-emerald-950/10' : 'border-zinc-800 bg-zinc-950/60')}>
            <header className="mb-3 flex flex-wrap items-center gap-2">
              <Zap className={cn('size-4', p.enabled ? 'text-emerald-500' : 'text-zinc-600')} />
               <input value={p.label ?? ''} onChange={(e) => mutate(p.id, (x) => ({ ...x, label: e.target.value }))}
                className="min-w-0 flex-1 bg-transparent font-sans text-[14px] font-bold text-zinc-100 outline-none" />
              <select value={p.trigger} onChange={(e) => mutate(p.id, (x) => ({ ...x, trigger: e.target.value }))}
                className="h-7 rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[12px] text-zinc-300 outline-none">
                {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <button onClick={() => mutate(p.id, (x) => ({ ...x, enabled: !x.enabled }))}
                className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold',
                  p.enabled ? 'border-emerald-700 bg-emerald-950 text-emerald-400' : 'border-zinc-800 text-zinc-500')}>
                {p.enabled ? 'Activée' : 'Désactivée'}
              </button>
              <button onClick={() => setPipelines((ps) => ps.filter((x) => x.id !== p.id))}
                className="rounded p-1 text-zinc-700 hover:bg-zinc-900 hover:text-red-400" aria-label="Supprimer">
                <Trash2 className="size-3.5" />
              </button>
            </header>

            {/* Vertical flow */}
            <div className="ml-1.5 space-y-0">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-zinc-300">
                <Play className="size-3.5 text-emerald-500" />
                {TRIGGERS.find((t) => t.id === p.trigger)?.label}
              </div>
              {p.steps.map((stepId, i) => (
                <div key={`${stepId}-${i}`}>
                  <ArrowDown className="ml-0.5 my-0.5 size-3.5 text-zinc-700" />
                  <div className="group flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
                    <span className="flex-1 text-[13px] text-zinc-200">{STEPS[stepId]?.label ?? stepId}</span>
                    {STEPS[stepId]?.native
                      ? <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">natif</span>
                      : <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">orchestrateur</span>}
                    <button onClick={() => mutate(p.id, (x) => ({ ...x, steps: x.steps.filter((_, idx) => idx !== i) }))}
                      className="text-zinc-700 opacity-0 hover:text-red-400 group-hover:opacity-100" aria-label="Retirer">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
              <ArrowDown className="ml-0.5 my-0.5 size-3.5 text-zinc-800" />
              <select value="" onChange={(e) => e.target.value && mutate(p.id, (x) => ({ ...x, steps: [...x.steps, e.target.value] }))}
                className="h-8 rounded-lg border border-dashed border-zinc-800 bg-transparent px-2 text-[12px] text-zinc-500 outline-none hover:border-zinc-700">
                <option value="">+ Ajouter une étape…</option>
                {Object.entries(STEPS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
              </select>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-zinc-600">
        Étapes « natif » : déjà exécutées par le backend (classement au sifflet final,
        passeports au transfert) ou par l'invalidation de cache (Intelligence). Étapes
        « orchestrateur » : décrites ici comme configuration — l'exécuteur serveur les
        consommera sans changer ce studio.
      </p>
    </div>
  );
}
