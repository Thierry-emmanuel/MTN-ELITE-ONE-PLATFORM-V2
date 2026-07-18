import type { ReactNode } from 'react';

/**
 * Analytics — sticky filter row, KPI strip, chart grid, table.
 * Every slot reserves its space before data arrives (CLS discipline).
 */
export function AnalyticsLayout({ filters, kpis, charts, table }: {
  filters?: ReactNode; kpis?: ReactNode; charts?: ReactNode; table?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
      {filters && (
        <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-zinc-950/90 px-1 py-2 backdrop-blur">
          {filters}
        </div>
      )}
      {kpis && <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{kpis}</div>}
      {charts && <div className="mb-4 grid grid-cols-12 gap-3">{charts}</div>}
      {table}
    </div>
  );
}
