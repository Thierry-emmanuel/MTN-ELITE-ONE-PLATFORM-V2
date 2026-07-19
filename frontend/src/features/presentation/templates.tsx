/**
 * Presentation templates — generic and dataset-driven. NO module-specific
 * templates: standings, fixtures, results, transfers, awards… all render
 * through these five, themed by Dataset.branding (competition/season
 * configuration). Adding a module = writing a dataset adapter, not a template.
 *
 *   table      — document/print view (poster A4/A3 via the print pipeline)
 *   social     — 1080×1080 matchday card (réseaux sociaux)
 *   story      — 1080×1920 (Instagram/Facebook Stories)
 *   broadcast  — 1920×1080 TV lower-third style
 */
import type { ComponentType } from 'react';
import type { Dataset } from './engine';

export interface TemplateDef {
  id: string;
  label: string;
  /** Fixed pixel canvas for social/story/broadcast; null = fluid document. */
  canvas: { w: number; h: number } | null;
  Component: ComponentType<{ ds: Dataset; maxRows?: number }>;
}

const accent = (ds: Dataset) => ds.branding.primaryColor || '#10b981';

function BrandBar({ ds, dark = false }: { ds: Dataset; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {ds.branding.logoUrl && <img src={ds.branding.logoUrl} alt="" className="h-10 w-10 rounded object-contain" />}
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? 'text-white/60' : 'text-stone-500'}`}>
          {ds.branding.competitionName ?? 'MTN Elite One'}{ds.branding.seasonName ? ` · ${ds.branding.seasonName}` : ''}
        </p>
        <h2 className={`font-sans text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-stone-900'}`}>
          {ds.title}{ds.branding.matchday ? ` — J${ds.branding.matchday}` : ''}
        </h2>
      </div>
    </div>
  );
}

/** 1 · Table / Poster — the document view; print pipeline turns it into A4/A3 PDF. */
function TableTemplate({ ds }: { ds: Dataset }) {
  return (
    <div className="bg-white p-8 text-stone-900" style={{ minWidth: 640 }}>
      <div className="mb-5 flex items-end justify-between border-b-4 pb-4" style={{ borderColor: accent(ds) }}>
        <BrandBar ds={ds} />
        {ds.subtitle && <p className="text-[12px] text-stone-500">{ds.subtitle}</p>}
      </div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b-2 border-stone-300 text-left">
            {ds.columns.map((c) => (
              <th key={c.key} className={`px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-500 text-${c.align ?? 'left'}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ds.rows.map((r, i) => {
            const mark = ds.emphasize?.(r, i);
            return (
              <tr key={i} className="border-b border-stone-200"
                style={mark === 'top' ? { background: `${accent(ds)}14` } : mark === 'bottom' ? { background: '#fee2e214' } : undefined}>
                {ds.columns.map((c) => (
                  <td key={c.key} className={`px-2 py-2 tabular-nums text-${c.align ?? 'left'}`}>{String(r[c.key] ?? '')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-5 text-[10px] uppercase tracking-widest text-stone-400">FootballOS · généré depuis les données officielles</p>
    </div>
  );
}

/** Shared dark canvas for social formats. */
function DarkCanvas({ ds, w, h, children }: { ds: Dataset; w: number; h: number; children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-zinc-950 text-white"
      style={{ width: w, height: h, backgroundImage: `radial-gradient(circle at 20% 0%, ${accent(ds)}33, transparent 55%)` }}>
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: accent(ds) }} />
      {children}
      <p className="absolute bottom-5 left-8 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/40">
        {ds.branding.competitionName ?? 'MTN Elite One'} · FootballOS
      </p>
    </div>
  );
}

function RowsList({ ds, maxRows = 10, big = false }: { ds: Dataset; maxRows?: number; big?: boolean }) {
  const cols = ds.columns.slice(0, big ? 4 : 5);
  return (
    <div className="flex-1 px-8">
      {ds.rows.slice(0, maxRows).map((r, i) => {
        const mark = ds.emphasize?.(r, i);
        return (
          <div key={i} className={`flex items-center gap-4 border-b border-white/10 ${big ? 'py-4 text-[26px]' : 'py-2.5 text-[18px]'}`}
            style={mark === 'top' ? { color: accent(ds) } : mark === 'bottom' ? { color: '#f87171' } : undefined}>
            {cols.map((c, ci) => (
              <span key={c.key}
                className={`${ci === 0 ? 'w-10 font-black tabular-nums opacity-60' : ci === 1 ? 'min-w-0 flex-1 truncate font-bold' : 'tabular-nums font-semibold opacity-90'}`}>
                {String(r[c.key] ?? '')}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SocialTemplate({ ds, maxRows = 10 }: { ds: Dataset; maxRows?: number }) {
  return (
    <DarkCanvas ds={ds} w={1080} h={1080}>
      <div className="px-8 pb-6 pt-10"><BrandBar ds={ds} dark /></div>
      <RowsList ds={ds} maxRows={maxRows} />
    </DarkCanvas>
  );
}

function StoryTemplate({ ds, maxRows = 12 }: { ds: Dataset; maxRows?: number }) {
  return (
    <DarkCanvas ds={ds} w={1080} h={1920}>
      <div className="px-8 pb-8 pt-24"><BrandBar ds={ds} dark /></div>
      <RowsList ds={ds} maxRows={maxRows} big />
    </DarkCanvas>
  );
}

function BroadcastTemplate({ ds, maxRows = 8 }: { ds: Dataset; maxRows?: number }) {
  return (
    <DarkCanvas ds={ds} w={1920} h={1080}>
      <div className="grid flex-1 grid-cols-[1fr_2fr]">
        <div className="flex flex-col justify-center border-r border-white/10 px-10">
          <BrandBar ds={ds} dark />
          {ds.subtitle && <p className="mt-4 text-[16px] text-white/60">{ds.subtitle}</p>}
        </div>
        <div className="flex flex-col justify-center py-10"><RowsList ds={ds} maxRows={maxRows} /></div>
      </div>
    </DarkCanvas>
  );
}

export const TEMPLATES: TemplateDef[] = [
  { id: 'table', label: 'Document / Affiche (impression)', canvas: null, Component: TableTemplate },
  { id: 'social', label: 'Carte réseaux sociaux (1080²)', canvas: { w: 1080, h: 1080 }, Component: SocialTemplate },
  { id: 'story', label: 'Story mobile (1080×1920)', canvas: { w: 1080, h: 1920 }, Component: StoryTemplate },
  { id: 'broadcast', label: 'Habillage TV (1920×1080)', canvas: { w: 1920, h: 1080 }, Component: BroadcastTemplate },
];
