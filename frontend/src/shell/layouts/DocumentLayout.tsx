import type { ReactNode } from 'react';

/** Long-form reading / index pages. Max-w 840px, editorial calm. */
export function DocumentLayout({ hero, children }: { hero?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[840px] px-4 py-6 md:px-6">
      {hero && <div className="mb-6">{hero}</div>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
