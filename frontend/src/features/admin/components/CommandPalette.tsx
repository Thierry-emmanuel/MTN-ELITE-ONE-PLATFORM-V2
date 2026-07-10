import {
  LayoutDashboard, Layers, Image, Calendar, Trophy, FileText, Star,
  BarChart2, MapPin, Shirt, Handshake, Zap, Eye, Flag, Archive, Users,
  Shield, UserCog, Sparkles,
} from 'lucide-react';
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator,
} from '@/components/ui/command';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  onCreatePlayer: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Tableau de bord',        group: 'Administration', icon: LayoutDashboard },
  { id: 'layout',     label: 'Mise en page du site',    group: 'Administration', icon: Layers },
  { id: 'users',      label: 'Utilisateurs',            group: 'Administration', icon: UserCog },
  { id: 'seasons',    label: 'Saisons',                 group: 'Compétition',    icon: Calendar },
  { id: 'matches',    label: 'Matchs & Résultats',      group: 'Compétition',    icon: Calendar },
  { id: 'stats',      label: 'Statistiques',            group: 'Compétition',    icon: BarChart2 },
  { id: 'clubs',      label: 'Clubs',                   group: 'Personnes',      icon: Shield },
  { id: 'players',    label: 'Joueurs',                 group: 'Personnes',      icon: Star },
  { id: 'coaches',    label: 'Entraîneurs',             group: 'Personnes',      icon: Star },
  { id: 'stadiums',   label: 'Stades',                  group: 'Personnes',      icon: MapPin },
  { id: 'equipments', label: 'Équipements',             group: 'Personnes',      icon: Shirt },
  { id: 'sponsors',   label: 'Sponsors',                group: 'Personnes',      icon: Handshake },
  { id: 'awards',     label: "Awards & Ballon d'Or",    group: 'Héritage',       icon: Trophy },
  { id: 'halloffame', label: 'Hall of Fame',            group: 'Héritage',       icon: Users },
  { id: 'lions',      label: 'Centre des Lions',        group: 'Héritage',       icon: Flag },
  { id: 'museum',     label: 'Musée & Archives',        group: 'Héritage',       icon: Archive },
  { id: 'scouting',   label: 'Young Talent Watch',      group: 'Héritage',       icon: Eye },
  { id: 'hero',       label: 'Bannières Hero',          group: 'Médias',         icon: Image },
  { id: 'actions',    label: 'Actions marquantes',      group: 'Médias',         icon: Zap },
  { id: 'news',       label: 'Actualités & Presse',     group: 'Éditorial',      icon: FileText },
];

const GROUP_ORDER = ['Compétition', 'Personnes', 'Héritage', 'Médias', 'Éditorial', 'Administration'];

export function CommandPalette({ open, onOpenChange, onNavigate, onCreatePlayer }: Props) {
  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Rechercher une page, créer du contenu…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>

        <CommandGroup heading="Actions rapides">
          <CommandItem onSelect={() => run(onCreatePlayer)}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Nouveau joueur — Builder guidé</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {GROUP_ORDER.map((group) => (
          <CommandGroup key={group} heading={group}>
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.id} onSelect={() => run(() => onNavigate(item.id))}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
