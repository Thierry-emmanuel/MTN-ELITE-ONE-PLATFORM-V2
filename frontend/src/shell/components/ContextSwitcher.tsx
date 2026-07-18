import { ChevronsUpDown, Trophy, CalendarRange } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOSContext, useActiveLeague, useActiveSeason } from '../stores/context.store';

function Switcher({ icon: Icon, value, options, onSelect }: {
  icon: typeof Trophy;
  value: string;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden h-8 items-center gap-1.5 rounded-lg border border-transparent px-2 text-[13px] text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900 lg:flex">
        <Icon className="size-3.5 text-zinc-500" />
        <span className="max-w-[140px] truncate">{value}</span>
        <ChevronsUpDown className="size-3 text-zinc-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="border-zinc-800 bg-zinc-900 text-zinc-200">
        {options.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => onSelect(o.id)} className="text-[13px] focus:bg-zinc-800 focus:text-zinc-100">
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * League / Season global scope (Vercel pattern). Every module reads the
 * active scope from useOSContext — going multi-league is a data change.
 */
export function ContextSwitcher() {
  const { leagues, seasons, setLeague, setSeason } = useOSContext();
  const league = useActiveLeague();
  const season = useActiveSeason();
  return (
    <div className="flex items-center">
      <Switcher icon={Trophy} value={league.label} options={leagues} onSelect={setLeague} />
      <span className="hidden text-zinc-700 lg:block">/</span>
      <Switcher icon={CalendarRange} value={season.label} options={seasons} onSelect={setSeason} />
    </div>
  );
}
