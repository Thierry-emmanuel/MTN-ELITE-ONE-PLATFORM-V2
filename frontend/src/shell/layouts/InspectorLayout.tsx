import type { ReactNode } from 'react';
import { useMediaQuery } from '../services/useMediaQuery';

/**
 * Content + permanent right rail (vs the global drawer, which is transient).
 * Rail 320px; becomes stacked above main below lg.
 */
export function InspectorLayout({ main, rail }: { main: ReactNode; rail: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row">
      <div className="min-w-0 flex-1">{main}</div>
      <aside className={isDesktop ? 'w-[320px] shrink-0' : 'w-full'}>{rail}</aside>
    </div>
  );
}
