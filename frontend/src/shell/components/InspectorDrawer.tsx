import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '../services/useMediaQuery';
import { useInspector } from '../stores/inspector.store';

function InspectorTabs() {
  const { tabs, activeTab, setActiveTab } = useInspector();
  if (tabs.length === 0) return null;
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
      <TabsList className="mx-3 mt-2 h-8 shrink-0 justify-start gap-1 bg-zinc-900 p-0.5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}
            className="h-7 rounded-md px-2.5 text-[12px] text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-3">{tab.content}</ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * Inspector Drawer — reflows the content ≥1280px (never overlays it);
 * below xl it becomes a right Sheet. Esc closes; selection is preserved.
 */
export function InspectorDrawer() {
  const { open, setOpen, tabs } = useInspector();
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  if (tabs.length === 0) return null;

  if (!isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[360px] border-zinc-800 bg-zinc-950 p-0 text-zinc-200">
          <SheetHeader className="border-b border-zinc-800 px-4 py-3">
            <SheetTitle className="text-[13px] font-semibold text-zinc-200">Inspecteur</SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100%-49px)] flex-col"><InspectorTabs /></div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          className="shrink-0 overflow-hidden border-l border-zinc-800 bg-zinc-950"
          aria-label="Inspecteur"
        >
          <div className="flex h-full flex-col" style={{ width: 360 }}>
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Inspecteur</span>
              <button onClick={() => setOpen(false)} aria-label="Fermer l'inspecteur"
                className="grid size-6 place-items-center rounded text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
                <X className="size-3.5" />
              </button>
            </div>
            <InspectorTabs />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
