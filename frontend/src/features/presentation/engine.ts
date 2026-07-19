/**
 * Presentation & Export Engine — the universal core.
 * ONE dataset contract → MANY outputs (One Action → Multiple Outputs).
 *
 *   Dataset  = titre + branding (compétition/saison, Phase 5 config) +
 *              colonnes + lignes. Produced by thin adapters in datasets.ts;
 *              the backend stays the only source of truth — adapters map,
 *              never recompute.
 *   Exports  = toCsv / toXlsx (SheetJS) / print pipeline (PDF via the
 *              browser's print-to-PDF with @page size & orientation —
 *              dependency-free, pixel-faithful to the preview).
 *
 * The legacy inline exportCsv() copies in PlayerStatsTable and
 * ClubStatsComponents are consolidated onto csvDownload() below.
 */
import * as XLSX from 'xlsx';

export interface DatasetBranding {
  competitionName?: string;
  seasonName?: string;
  logoUrl?: string;
  primaryColor?: string;   // competitions.config.branding.primaryColor
  secondaryColor?: string;
  matchday?: number | string;
}

export interface DatasetColumn { key: string; label: string; align?: 'left' | 'center' | 'right'; width?: string }

export interface Dataset {
  id: string;                       // filename stem
  title: string;
  subtitle?: string;
  branding: DatasetBranding;
  columns: DatasetColumn[];
  rows: Record<string, unknown>[];
  /** Optional emphasis rows (e.g. leaders / relegation) for templates. */
  emphasize?: (row: Record<string, unknown>, index: number) => 'top' | 'bottom' | undefined;
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type PageSize = 'A4' | 'A3';
export type PageOrientation = 'portrait' | 'landscape';

// ── low-level download ──────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Shared CSV writer — also the consolidation target for legacy inline exports. */
export function csvDownload(filename: string, header: string[], rows: (string | number)[][]) {
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  downloadBlob(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

// ── dataset exports ─────────────────────────────────────────────────────────
export function toCsv(ds: Dataset) {
  csvDownload(
    `${ds.id}.csv`,
    ds.columns.map((c) => c.label),
    ds.rows.map((r) => ds.columns.map((c) => (r[c.key] ?? '') as string | number)),
  );
}

export function toXlsx(ds: Dataset) {
  const aoa = [
    [ds.title],
    [ds.subtitle ?? [ds.branding.competitionName, ds.branding.seasonName].filter(Boolean).join(' — ')],
    [],
    ds.columns.map((c) => c.label),
    ...ds.rows.map((r) => ds.columns.map((c) => r[c.key] ?? '')),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = ds.columns.map((c) => ({ wch: Math.max(10, c.label.length + 4) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ds.title.slice(0, 31));
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  downloadBlob(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${ds.id}.xlsx`);
}

/**
 * Print pipeline (PDF): sets @page size/orientation, marks #print-surface as
 * the only visible region (rules in index.css), then window.print(). The
 * browser dialog IS the preview-confirm + "save as PDF" step — A4/A3,
 * portrait/landscape honored natively.
 */
export function printSurface(size: PageSize, orientation: PageOrientation) {
  const style = document.createElement('style');
  style.id = 'fos-page-style';
  style.textContent = `@page { size: ${size} ${orientation}; margin: 10mm; }`;
  document.getElementById('fos-page-style')?.remove();
  document.head.appendChild(style);
  window.print();
}

export function exportDataset(ds: Dataset, format: ExportFormat, page?: { size: PageSize; orientation: PageOrientation }) {
  if (format === 'csv') return toCsv(ds);
  if (format === 'xlsx') return toXlsx(ds);
  return printSurface(page?.size ?? 'A4', page?.orientation ?? 'portrait');
}
