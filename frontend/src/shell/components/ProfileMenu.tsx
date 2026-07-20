import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, LogOut, Moon, Settings2, Sun, User } from 'lucide-react';
import { usePreferences } from '../stores/preferences.store';
import { SHELL_BASE } from '../navigation/domains';
import { usePermissions } from '../services/permissions';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage } = usePreferences();
  const { me, roleKeys, loading } = usePermissions();

  const initials = me?.user 
    ? `${me.user.firstName?.[0] || ''}${me.user.lastName?.[0] || ''}`.toUpperCase()
    : '??';

  const displayName = me?.user 
    ? `${me.user.firstName} ${me.user.lastName}` 
    : loading ? 'Chargement...' : 'Non connecté';

  const displayRole = roleKeys.length > 0 
    ? roleKeys.map(r => r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
    : me?.user?.role 
      ? me.user.role.charAt(0).toUpperCase() + me.user.role.slice(1)
      : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 rounded-full outline-none ring-emerald-600 focus-visible:ring-2">
        <Avatar className="size-8 border border-zinc-800">
          <AvatarFallback className="bg-zinc-900 text-[11px] font-semibold text-zinc-300">
            {loading ? '...' : initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-200">
        <DropdownMenuLabel className="text-[13px]">
          <div className="font-medium text-zinc-100">{displayName}</div>
          {displayRole && (
            <div className="text-[11px] font-normal text-zinc-500">{displayRole}</div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="gap-2 text-[13px] focus:bg-zinc-800" onSelect={() => navigate(`${SHELL_BASE}/settings/profile`)}>
          <User className="size-3.5 text-zinc-500" /> Profil
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[13px] focus:bg-zinc-800" onSelect={() => navigate(`${SHELL_BASE}/settings/preferences`)}>
          <Settings2 className="size-3.5 text-zinc-500" /> Préférences
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[13px] focus:bg-zinc-800" onSelect={(e) => { e.preventDefault(); toggleTheme(); }}>
          {theme === 'dark' ? <Sun className="size-3.5 text-zinc-500" /> : <Moon className="size-3.5 text-zinc-500" />}
          Thème : {theme === 'dark' ? 'sombre' : 'clair'}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[13px] focus:bg-zinc-800" onSelect={(e) => { e.preventDefault(); setLanguage(language === 'fr' ? 'en' : 'fr'); }}>
          <Languages className="size-3.5 text-zinc-500" /> Langue : {language.toUpperCase()}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="gap-2 text-[13px] text-red-400 focus:bg-zinc-800 focus:text-red-400" onSelect={() => navigate('/login')}>
          <LogOut className="size-3.5" /> Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
