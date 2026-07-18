import { create } from 'zustand';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShortcutRegistry, formatKeys } from '../navigation/shortcuts';
import { Kbd } from './ShortcutHint';
import { useT } from '../i18n';

interface HelpState { open: boolean; setOpen: (v: boolean) => void }
export const useHelpStore = create<HelpState>((set) => ({ open: false, setOpen: (open) => set({ open }) }));

/** Help Center — hosts the shortcut cheat-sheet ("?" opens it too). */
export function HelpPanel() {
  const t = useT();
  const { open, setOpen } = useHelpStore();
  const shortcuts = ShortcutRegistry.all();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full border-zinc-800 bg-zinc-950 p-0 text-zinc-200 sm:w-[400px]">
        <SheetHeader className="border-b border-zinc-800 px-4 py-3">
          <SheetTitle className="text-[13px] font-semibold text-zinc-100">{t('help.title')}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-49px)] px-4 py-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t('help.shortcuts')}</h3>
          <ul className="space-y-1.5">
            {shortcuts.map((s) => (
              <li key={`${s.scope}-${s.keys}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-900/60">
                <span className="text-[13px] text-zinc-300">{s.description}</span>
                <Kbd>{formatKeys(s.keys)}</Kbd>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-[12px] leading-relaxed text-zinc-500">
            Astuce : tout FootballOS est pilotable au clavier. Ouvrez la palette avec <Kbd>⌘K</Kbd>,
            tapez «&nbsp;&gt;&nbsp;» pour les commandes, «&nbsp;+&nbsp;» pour créer, «&nbsp;?&nbsp;» pour l’aide.
          </p>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
