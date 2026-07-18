import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, CornerDownLeft, Plus, TerminalSquare } from 'lucide-react';
import { usePaletteStore } from '../stores/palette.store';
import { getAllCommands } from '../registry/command.registry';
import { getCreatableEntityTypes } from '../registry/entity.registry';
import { searchEntities } from '../services/search';
import { ShortcutRegistry, formatKeys } from '../navigation/shortcuts';
import { useRecents } from '../stores/recents.store';
import { SHELL_BASE } from '../navigation/domains';
import { useT } from '../i18n';
import type { OSEntity } from '../registry/types';

/**
 * The Command Palette — a router with verbs (⌘K).
 *   default  → Jump (fuzzy across modules + entities)
 *   ">"      → Commands
 *   "+"      → Create
 *   "?"      → Help / shortcuts
 * Opens with zero data fetch before paint; results stream in.
 */
export function CommandPalette() {
  const { open, setOpen, initialQuery } = usePaletteStore();
  const navigate = useNavigate();
  const t = useT();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OSEntity[]>([]);
  const recents = useRecents((s) => s.items);
  const pushRecent = useRecents((s) => s.push);

  useEffect(() => { if (open) setQuery(initialQuery); }, [open, initialQuery]);

  const mode: 'jump' | 'command' | 'create' | 'help' =
    query.startsWith('>') ? 'command' : query.startsWith('+') ? 'create' : query.startsWith('?') ? 'help' : 'jump';
  const q = mode === 'jump' ? query : query.slice(1).trim();

  useEffect(() => {
    if (mode !== 'jump' || !q.trim()) { setResults([]); return; }
    let alive = true;
    searchEntities(q).then((r) => { if (alive) setResults(r); });
    return () => { alive = false; };
  }, [q, mode]);

  const go = (entity: OSEntity) => {
    setOpen(false);
    if (!['domain', 'module'].includes(entity.type)) pushRecent(entity);
    navigate(entity.route);
  };

  const commands = useMemo(() => (open ? getAllCommands() : []), [open, query]);
  const creatables = getCreatableEntityTypes();
  const shortcuts = ShortcutRegistry.all();
  const norm = (s: string) => s.toLowerCase();
  const cmdMatch = (label: string, keywords?: string[]) =>
    !q || norm(label).includes(norm(q)) || (keywords ?? []).some((k) => norm(k).includes(norm(q)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 shadow-2xl">
        <DialogTitle className="sr-only">Palette de commandes</DialogTitle>
        <Command shouldFilter={false} className="bg-transparent text-zinc-200">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t('palette.placeholder')}
            className="h-12 border-b border-zinc-800 text-[14px] text-zinc-100 placeholder:text-zinc-600"
          />
          <CommandList className="max-h-[380px] py-1">
            <CommandEmpty className="py-8 text-center text-[13px] text-zinc-500">{t('palette.empty')}</CommandEmpty>

            {mode === 'jump' && !q && recents.length > 0 && (
              <CommandGroup heading={t('nav.recents')} className="text-zinc-500 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                {recents.slice(0, 5).map((e) => (
                  <CommandItem key={`${e.type}:${e.id}`} value={`${e.type}:${e.id}`} onSelect={() => go(e)}
                    className="gap-2 text-[13px] text-zinc-300 aria-selected:bg-zinc-900 aria-selected:text-zinc-100">
                    <ArrowRight className="size-3.5 text-zinc-600" />
                    <span className="flex-1 truncate">{e.title}</span>
                    {e.subtitle && <span className="text-[11px] text-zinc-600">{e.subtitle}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {mode === 'jump' && results.length > 0 && (
              <CommandGroup heading="Résultats" className="text-zinc-500 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                {results.map((e) => (
                  <CommandItem key={`${e.type}:${e.id}`} value={`r:${e.type}:${e.id}`} onSelect={() => go(e)}
                    className="gap-2 text-[13px] text-zinc-300 aria-selected:bg-zinc-900 aria-selected:text-zinc-100">
                    <ArrowRight className="size-3.5 text-zinc-600" />
                    <span className="flex-1 truncate">{e.title}</span>
                    <span className="text-[11px] uppercase text-zinc-600">{e.type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {(mode === 'command' || (mode === 'jump' && !!q)) && (
              <CommandGroup heading="Commandes" className="text-zinc-500 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                {commands.filter((c) => cmdMatch(c.label, c.keywords)).slice(0, mode === 'command' ? 30 : 4).map((c) => (
                  <CommandItem key={c.id} value={`c:${c.id}`}
                    onSelect={() => { setOpen(false); c.run({ navigate }); }}
                    className="gap-2 text-[13px] text-zinc-300 aria-selected:bg-zinc-900 aria-selected:text-zinc-100">
                    {c.icon ? <c.icon className="size-3.5 text-zinc-600" /> : <TerminalSquare className="size-3.5 text-zinc-600" />}
                    <span className="flex-1 truncate">{c.label}</span>
                    {c.shortcut && <span className="text-[11px] text-zinc-600">{c.shortcut}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {mode === 'create' && (
              <CommandGroup heading={t('bar.create')} className="text-zinc-500 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                {creatables.filter((e) => cmdMatch(e.labelSingular)).map((e) => (
                  <CommandItem key={e.type} value={`n:${e.type}`}
                    onSelect={() => { setOpen(false); navigate(e.createRoute ?? `${SHELL_BASE}/builders/${e.moduleSlug}/${e.type}/new`); }}
                    className="gap-2 text-[13px] text-zinc-300 aria-selected:bg-zinc-900 aria-selected:text-zinc-100">
                    <Plus className="size-3.5 text-zinc-600" />
                    {e.labelSingular}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {mode === 'help' && (
              <CommandGroup heading={t('help.shortcuts')} className="text-zinc-500 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                {shortcuts.filter((s) => cmdMatch(s.description)).map((s) => (
                  <CommandItem key={s.keys} value={`h:${s.keys}`} onSelect={() => {}}
                    className="gap-2 text-[13px] text-zinc-300 aria-selected:bg-zinc-900">
                    <CornerDownLeft className="size-3.5 text-zinc-600" />
                    <span className="flex-1">{s.description}</span>
                    <span className="text-[11px] text-zinc-500">{formatKeys(s.keys)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
