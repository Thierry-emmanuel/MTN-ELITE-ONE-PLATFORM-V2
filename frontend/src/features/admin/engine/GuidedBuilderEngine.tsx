import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, X, Sparkles, Monitor, Smartphone,
  CircleDashed, CircleCheck, AlertCircle, Loader2, Rocket,
} from 'lucide-react';
import { AdminButton } from '@/components/ui/AdminUI';
import { renderEntityField } from './renderField';
import { createEntityHooks } from '../hooks/useEntityCrud';
import type { BuilderStepDef, EntityConfig, SelectOption } from './entityConfig.types';

interface Props<T extends { id?: string; _id?: string }> {
  config: EntityConfig<T>;
  record: Partial<T>;
  lookupOptions?: Record<string, SelectOption[]>;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  /** Renders the public-facing preview of the record-in-progress. Falls
   *  back to a plain field list when omitted. */
  renderPreview?: (record: Partial<T>) => React.ReactNode;
}

function isStepComplete<T extends { id?: string; _id?: string }>(
  step: BuilderStepDef<T>,
  data: Partial<T>,
  fields: EntityConfig<T>['fields'],
) {
  const required = fields.filter((f) => step.fieldKeys.includes(f.key) && f.required);
  return required.every((f) => {
    const v = (data as Record<string, unknown>)[f.key as string];
    return v !== undefined && v !== null && v !== '';
  });
}

export function GuidedBuilderEngine<T extends { id?: string; _id?: string }>({
  config, record, lookupOptions = {}, onClose, showToast, renderPreview,
}: Props<T>) {
  const steps = config.builderSteps ?? [];
  const { useMutations } = createEntityHooks(config);
  const { create, update, isSaving } = useMutations();

  const [data, setData] = useState<Partial<T>>(record);
  const [stepIdx, setStepIdx] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isNew = (data as any).id == null && (data as any)._id == null;
  const idOf = () => String(config.idField === '_id' ? (data as any)._id : (data as any).id);

  const activeStep = steps[stepIdx];
  const fieldsByKey = useMemo(() => new Map(config.fields.map((f) => [String(f.key), f])), [config.fields]);

  const setField = (key: keyof T, v: unknown) => setData((prev) => ({ ...prev, [key]: v }));

  const completion = useMemo(
    () => steps.map((s) => isStepComplete(s, data, config.fields)),
    [steps, data, config.fields],
  );
  const progressPct = steps.length ? Math.round((completion.filter(Boolean).length / steps.length) * 100) : 0;
  const missingInActiveStep = activeStep
    ? config.fields.filter((f) => activeStep.fieldKeys.includes(f.key) && f.required)
        .filter((f) => {
          const v = (data as Record<string, unknown>)[f.key as string];
          return v === undefined || v === null || v === '';
        })
    : [];

  // Lightweight autosave (draft only, in-memory→backend) — mirrors the
  // "never lose work" principle from the spec without needing a separate
  // draft storage layer: every 4s of inactivity we persist as a draft if
  // there's already an id, so refreshing/navigating away never loses data.
  useEffect(() => {
    if (isNew) return; // don't create phantom records before the editor commits step 1
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      update.mutate({ id: idOf(), payload: data }, { onSuccess: () => setSavedAt(new Date()) });
    }, 4000);
    return () => clearTimeout(autosaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const persist = (extra?: Partial<T>) => {
    const payload = { ...data, ...extra };
    const action = isNew
      ? create.mutateAsync(payload).then((created: any) => {
          setData((prev) => ({ ...prev, ...created, ...extra }));
        })
      : update.mutateAsync({ id: idOf(), payload }).then(() => setData((prev) => ({ ...prev, ...extra })));
    return action;
  };

  const handleNext = async () => {
    if (missingInActiveStep.length > 0) {
      showToast(`Complétez d'abord : ${missingInActiveStep.map((f) => f.label).join(', ')}`, 'error');
      return;
    }
    try {
      await persist();
      setSavedAt(new Date());
      if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
    } catch {
      showToast('Erreur lors de l’enregistrement.', 'error');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await persist();
      setSavedAt(new Date());
      showToast(`${config.labelSingular} enregistré(e) en brouillon.`);
    } catch {
      showToast('Erreur lors de l’enregistrement.', 'error');
    }
  };

  const handlePublish = async () => {
    const allComplete = completion.every(Boolean);
    if (!allComplete) {
      showToast('Complétez toutes les étapes avant de publier.', 'error');
      return;
    }
    const extra: Partial<T> = {};
    if ('isActive' in config.emptyRecord()) (extra as any).isActive = true;
    if ('status' in config.emptyRecord()) (extra as any).status = 'ACTIVE';
    try {
      await persist(extra);
      showToast(`${config.labelSingular} publié(e) avec succès.`);
      onClose();
    } catch {
      showToast('Erreur lors de la publication.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E14] flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-white/[0.06] bg-[#0D1219]/90 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg grid place-items-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent/80">
              {isNew ? `Nouveau ${config.labelSingular}` : `Modifier ${config.labelSingular}`}
            </p>
            <p className="text-sm font-display font-bold text-white truncate">
              {(data as any).firstName || (data as any).name || (data as any).title || `${config.labelSingular} sans titre`}
              {(data as any).lastName ? ` ${(data as any).lastName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/25 font-medium">
            {isSaving ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…</>
            ) : savedAt ? (
              <><CircleCheck className="h-3 w-3 text-emerald-500" /> Enregistré à {savedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>
            ) : (
              <><CircleDashed className="h-3 w-3" /> Brouillon non enregistré</>
            )}
          </div>
          <div className="h-4 w-px bg-white/8" />
          <AdminButton variant="secondary" size="sm" onClick={handleSaveDraft} loading={isSaving}>
            Enregistrer le brouillon
          </AdminButton>
          <AdminButton size="sm" onClick={handlePublish} loading={isSaving}>
            <Rocket className="h-3.5 w-3.5" /> Publier
          </AdminButton>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* ── Step rail ─────────────────────────────────────────────────── */}
        <aside className="w-72 border-r border-white/[0.06] flex flex-col shrink-0 bg-[#0B0F16]">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Progression</span>
              <span className="text-[10px] font-bold text-accent">{progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {steps.map((step, i) => {
              const done = completion[i];
              const active = i === stepIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => setStepIdx(i)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-start gap-3 ${
                    active ? 'bg-accent/10 border border-accent/25' : 'border border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {done ? (
                      <CircleCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className={`h-4 w-4 rounded-full border grid place-items-center text-[9px] font-bold ${
                        active ? 'border-accent text-accent' : 'border-white/20 text-white/30'
                      }`}>{i + 1}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[12px] font-semibold truncate ${active ? 'text-white' : 'text-white/60'}`}>
                      {step.label}
                    </span>
                    {step.description && (
                      <span className="block text-[10px] text-white/25 mt-0.5 leading-snug">{step.description}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Step content ──────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep?.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto px-8 py-10"
            >
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent/70 mb-1.5">
                  Étape {stepIdx + 1} / {steps.length}
                </p>
                <h2 className="text-xl font-display font-bold text-white">{activeStep?.label}</h2>
                {activeStep?.description && (
                  <p className="text-xs text-white/35 mt-1.5">{activeStep.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                {activeStep?.fieldKeys.map((key) => {
                  const field = fieldsByKey.get(String(key));
                  if (!field) return null;
                  const value = (data as Record<string, unknown>)[String(key)] ?? '';
                  const wrapClass = field.span === 2 ? 'col-span-2' : field.span === 3 ? 'col-span-2' : '';
                  return renderEntityField(field, value, (v) => setField(key, v), lookupOptions, wrapClass);
                })}
              </div>

              {missingInActiveStep.length > 0 && (
                <div className="mt-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    Requis pour continuer : {missingInActiveStep.map((f) => f.label).join(', ')}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
                <AdminButton
                  variant="secondary"
                  onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                  disabled={stepIdx === 0}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Précédent
                </AdminButton>
                {stepIdx < steps.length - 1 ? (
                  <AdminButton onClick={handleNext} loading={isSaving}>
                    Suivant <ArrowRight className="h-3.5 w-3.5" />
                  </AdminButton>
                ) : (
                  <AdminButton onClick={handlePublish} loading={isSaving}>
                    <Sparkles className="h-3.5 w-3.5" /> Terminer &amp; publier
                  </AdminButton>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Live preview ──────────────────────────────────────────────── */}
        <aside className="w-[380px] border-l border-white/[0.06] bg-[#0B0F16] shrink-0 flex flex-col">
          <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-5 shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Aperçu en direct</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04]">
              <button
                onClick={() => setDevice('desktop')}
                className={`h-6 w-6 rounded-md grid place-items-center transition-all ${device === 'desktop' ? 'bg-accent text-black' : 'text-white/30 hover:text-white/60'}`}
              >
                <Monitor className="h-3 w-3" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`h-6 w-6 rounded-md grid place-items-center transition-all ${device === 'mobile' ? 'bg-accent text-black' : 'text-white/30 hover:text-white/60'}`}
              >
                <Smartphone className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
            <div className={device === 'mobile' ? 'w-[240px]' : 'w-full'}>
              {renderPreview ? renderPreview(data) : <DefaultPreview data={data} config={config} />}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DefaultPreview<T extends { id?: string; _id?: string }>({ data, config }: { data: Partial<T>; config: EntityConfig<T> }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111820] p-5 space-y-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">{config.labelSingular}</p>
      {config.fields.slice(0, 8).map((f) => {
        const v = (data as Record<string, unknown>)[f.key as string];
        if (v === undefined || v === null || v === '') return null;
        return (
          <div key={String(f.key)}>
            <p className="text-[9px] uppercase tracking-wide text-white/25">{f.label}</p>
            <p className="text-xs text-white/80 font-medium truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
          </div>
        );
      })}
    </div>
  );
}
