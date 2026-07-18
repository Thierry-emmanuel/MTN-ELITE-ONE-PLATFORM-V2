import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { TopCommandBar } from './components/TopCommandBar';
import { OSSidebar } from './components/OSSidebar';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { CommandPalette } from './components/CommandPalette';
import { InspectorDrawer } from './components/InspectorDrawer';
import { NotificationCenter } from './components/NotificationCenter';
import { HelpPanel, useHelpStore } from './components/HelpPanel';
import { ShortcutRegistry, useGlobalShortcutListener } from './navigation/shortcuts';
import { registerGlobalCommands } from './registry/command.registry';
import { DOMAINS } from './navigation/domains';
import { usePaletteStore } from './stores/palette.store';
import { useNavigationStore } from './stores/navigation.store';
import { useInspector } from './stores/inspector.store';
import { usePreferences } from './stores/preferences.store';
import { Keyboard, Moon, PanelLeft, PanelRight } from 'lucide-react';

let bootstrapped = false;

/**
 * AppShell — the one root layout of FootballOS.
 * Grid: Top Command Bar / (Sidebar · Breadcrumb+Content · Inspector).
 * Owns every global surface and every keyboard binding.
 */
export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const openPalette = usePaletteStore((s) => s.setOpen);
  const openPaletteWith = usePaletteStore((s) => s.openWith);
  const { toggleSidebar } = useNavigationStore();
  const toggleInspector = useInspector((s) => s.toggle);
  const toggleTheme = usePreferences((s) => s.toggleTheme);
  const openHelp = useHelpStore((s) => s.setOpen);

  useGlobalShortcutListener();

  // Screen-reader route announcement (a11y floor).
  useEffect(() => {
    const el = document.getElementById('fos-route-announcer');
    if (el) el.textContent = document.title;
  }, [location.pathname]);

  // Global shortcuts + palette commands — registered once, owned by the shell.
  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;

    ShortcutRegistry.registerMany([
      { keys: 'mod+k', description: 'Palette de commandes', allowInInput: true, handler: () => openPalette(true) },
      { keys: '/', description: 'Recherche globale', handler: () => openPalette(true) },
      { keys: 'mod+shift+n', description: 'Créer un objet', allowInInput: true, handler: () => openPaletteWith('+') },
      { keys: 'mod+.', description: 'Mode focus (masquer la barre latérale)', allowInInput: true, handler: () => useNavigationStore.getState().toggleFocusMode() },
      { keys: 'mod+\\', description: "Basculer l'inspecteur", allowInInput: true, handler: () => useInspector.getState().toggle() },
      { keys: '?', description: 'Aide et raccourcis', handler: () => openHelp(true) },
      { keys: '[', description: 'Page précédente', handler: () => navigate(-1) },
      { keys: ']', description: 'Page suivante', handler: () => navigate(1) },
      ...DOMAINS.map((d) => ({
        keys: `g ${d.goKey}`,
        description: `Aller à ${d.id === 'command' ? 'Command Center' : d.id.charAt(0).toUpperCase() + d.id.slice(1)}`,
        handler: () => navigate(d.route),
      })),
    ]);

    registerGlobalCommands([
      ...DOMAINS.map((d) => ({
        id: `nav.${d.id}`, label: `Aller à : ${d.id === 'command' ? 'Command Center' : d.id.charAt(0).toUpperCase() + d.id.slice(1)}`,
        icon: d.icon, section: 'Navigation', shortcut: `G ${d.goKey.toUpperCase()}`,
        keywords: [d.id, 'aller', 'go'],
        run: ({ navigate: go }: { navigate: (to: string) => void }) => go(d.route),
      })),
      { id: 'ui.sidebar', label: 'Réduire / déployer la barre latérale', icon: PanelLeft, keywords: ['sidebar'], run: () => toggleSidebar() },
      { id: 'ui.inspector', label: "Basculer l'inspecteur", icon: PanelRight, shortcut: '⌘\\', keywords: ['inspector'], run: () => toggleInspector() },
      { id: 'ui.theme', label: 'Basculer le thème', icon: Moon, keywords: ['theme', 'dark', 'light'], run: () => toggleTheme() },
      { id: 'ui.shortcuts', label: 'Raccourcis clavier', icon: Keyboard, shortcut: '?', keywords: ['help', 'aide'], run: () => openHelp(true) },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fos flex h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-200 antialiased">
        <a href="#fos-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-3 focus:py-1.5 focus:text-white">
          Aller au contenu
        </a>
        <span id="fos-route-announcer" aria-live="polite" className="sr-only" />

        <TopCommandBar />

        <div className="flex min-h-0 flex-1">
          <OSSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <BreadcrumbBar />
            <main id="fos-main" className="min-h-0 flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
          <InspectorDrawer />
        </div>

        <CommandPalette />
        <NotificationCenter />
        <HelpPanel />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
