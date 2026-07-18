import type { ReactNode } from 'react';

/** Widget grid — 12 cols, used by Workspace Engine & Command Center. */
export function DashboardLayout({ toolbar, children }: { toolbar?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
      {toolbar && <div className="mb-4 flex items-center justify-between gap-2">{toolbar}</div>}
      <div className="grid grid-cols-12 gap-3">{children}</div>
    </div>
  );
}
