import { create } from 'zustand';
import { useEffect, type ReactNode } from 'react';
import type { BreadcrumbNode, PaletteCommand } from '../registry/types';
import { setPageCommands, clearPageCommands } from '../registry/command.registry';

interface PageMeta {
  title: string;
  breadcrumb: BreadcrumbNode[];
  actions?: ReactNode;
}

interface PageState extends PageMeta {
  set: (m: PageMeta) => void;
}

export const usePageStore = create<PageState>((set) => ({
  title: '',
  breadcrumb: [],
  actions: undefined,
  set: (m) => set(m),
}));

/**
 * Every surface declares its identity to the shell — this feeds the
 * breadcrumb bar, the document title, and the palette's "on this page"
 * section. Pages never render their own breadcrumbs.
 */
export function useShellPage(meta: PageMeta, commands: PaletteCommand[] = []) {
  const set = usePageStore((s) => s.set);
  useEffect(() => {
    set(meta);
    document.title = `${meta.title} · FootballOS`;
    setPageCommands(commands);
    return () => clearPageCommands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, JSON.stringify(meta.breadcrumb.map((b) => b.label))]);
}
