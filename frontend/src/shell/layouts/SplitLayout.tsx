import type { ReactNode } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useMediaQuery } from '../services/useMediaQuery';

/**
 * Master–detail. List pane resizable 320–400px; below lg the layout
 * becomes list → push-detail navigation (the page decides via `detailOpen`).
 */
export function SplitLayout({ list, detail, detailOpen = true }: {
  list: ReactNode; detail: ReactNode; detailOpen?: boolean;
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  if (!isDesktop) {
    return <div className="h-full overflow-auto">{detailOpen ? detail : list}</div>;
  }
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={28} minSize={20} maxSize={38} className="min-w-[280px]">
        <div className="h-full overflow-auto border-r border-zinc-800/70">{list}</div>
      </ResizablePanel>
      <ResizableHandle className="w-px bg-zinc-800/70" />
      <ResizablePanel defaultSize={72}>
        <div className="h-full overflow-auto">{detail}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
