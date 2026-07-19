/**
 * Studio de présentation — One Action → Multiple Outputs.
 * Pick a REAL dataset (backend), a generic template, preview at scale, then
 * export: CSV / XLSX (SheetJS) / PDF-print (A4·A3, portrait·paysage — the
 * print dialog is the final preview). Branding flows from the Phase-5
 * competition & season configuration automatically.
 */
import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import {
  useCompetitionMeta, useSeasonMatches, useSeasonMeta, useStandings, useTopScorers,
} from '@/features/intelligence/intelligence.api';
import { SeasonPicker, useSeasonParam } from './intelligence/IntelShared';
import { exportDataset, type Dataset, type PageOrientation, type PageSize } from '@/features/presentation/engine';
import { TEMPLATES } from '@/features/presentation/templates';
import { fixturesDataset, resultsDataset, scorersDataset, standingsDataset } from '@/features/presentation/datasets';

const SOURCES = [
  { id: 'standings', label: 'Classement' },
  { id: 'fixtures', label: 'Calendrier' },
  { id: 'results', label: 'Résultats' },
  { id: 'scorers', label: 'Buteurs' },
] as const;

export default function PresentationStudioPage() {
  const { seasonId } = useSeasonParam();
  const { data: season } = useSeasonMeta(seasonId);
  const { data: competition } = useCompetitionMeta(season?.competitionId);
  const { data: standings = [] } = useStandings(seasonId);
  const { data: matches = [] } = useSeasonMatches(seasonId);
  const { data: scorers = [] } = useTopScorers(seasonId, 10);

  const [sourceId, setSourceId] = useState<(typeof SOURCES)[number]['id']>('standings');
  const [templateId, setTemplateId] = useState('table');
  const [size, setSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');

  useShellPage({
    title: 'Studio de présentation',
    breadcrumb: [
      { label: 'FootballOS', href: `${SHELL_BASE}/workspace` },
      { label: 'Opérations', href: `${SHELL_BASE}/operations` },
      { label: 'Présentation' },
    ],
  });

  const branding = useMemo(() => ({
    competitionName: competition?.name,
    seasonName: season?.name,
    logoUrl: (competition as { logoUrl?: string } | undefined)?.logoUrl,
    primaryColor: competition?.config?.branding?.primaryColor,
    matchday: [...matches].filter((m) => m.status === 'FINISHED').sort((a, b) => b.round - a.round)[0]?.round,
  }), [competition, season, matches]);

  const dataset: Dataset = useMemo(() => {
    switch (sourceId) {
      case 'fixtures': return fixturesDataset(matches, branding);
      case 'results': return resultsDataset(matches, branding);
      case 'scorers': return scorersDataset(scorers, branding);
      default: return standingsDataset(standings, branding);
    }
  }, [sourceId, standings, matches, scorers, branding]);

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const scale = template.canvas ? Math.min(560 / template.canvas.w, 560 / template.canvas.h) : 1;
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[12px] transition-colors ${active
      ? 'border-emerald-700 bg-emerald-950 text-emerald-400'
      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`;

  return (
    <div className="flex h-full min-h-0">
      {/* Controls */}
      <aside className="w-72 shrink-0 space-y-5 overflow-auto border-r border-zinc-800 p-4">
        <div><SeasonPicker /></div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Source (backend)</p>
          <div className="flex flex-wrap gap-1.5">
            {SOURCES.map((s) => (
              <button key={s.id} onClick={() => setSourceId(s.id)} className={chip(sourceId === s.id)}>{s.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Gabarit</p>
          <div className="space-y-1.5">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setTemplateId(t.id)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-[12px] ${templateId === t.id
                  ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {template.canvas === null && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Impression</p>
            <div className="flex flex-wrap gap-1.5">
              {(['A4', 'A3'] as PageSize[]).map((s) => <button key={s} onClick={() => setSize(s)} className={chip(size === s)}>{s}</button>)}
              {(['portrait', 'landscape'] as PageOrientation[]).map((o) => (
                <button key={o} onClick={() => setOrientation(o)} className={chip(orientation === o)}>{o === 'portrait' ? 'Portrait' : 'Paysage'}</button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2 border-t border-zinc-800 pt-4">
          <Button size="sm" onClick={() => exportDataset(dataset, 'pdf', { size, orientation })}
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
            <Printer className="size-4" /> Aperçu & PDF (imprimer)
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportDataset(dataset, 'xlsx')}
            className="w-full gap-2 border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900">
            <FileSpreadsheet className="size-4" /> Excel (.xlsx)
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportDataset(dataset, 'csv')}
            className="w-full gap-2 border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900">
            <FileText className="size-4" /> CSV
          </Button>
          <p className="text-[10px] leading-relaxed text-zinc-600">
            <Download className="mr-1 inline size-3" />
            {dataset.rows.length} lignes · une source, plusieurs sorties. Le gabarit
            document alimente l'impression ; les gabarits sociaux se capturent
            depuis l'aperçu plein format.
          </p>
        </div>
      </aside>

      {/* Preview */}
      <div className="min-w-0 flex-1 overflow-auto bg-zinc-900/40 p-6">
        <div className="mx-auto w-fit shadow-2xl">
          {template.canvas ? (
            <div style={{ width: template.canvas.w * scale, height: template.canvas.h * scale, overflow: 'hidden' }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <template.Component ds={dataset} />
              </div>
            </div>
          ) : (
            <div id="print-surface"><template.Component ds={dataset} /></div>
          )}
        </div>
      </div>
    </div>
  );
}
