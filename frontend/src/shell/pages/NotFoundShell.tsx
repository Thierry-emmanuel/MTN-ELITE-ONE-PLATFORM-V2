import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '../components/SystemStates';
import { usePaletteStore } from '../stores/palette.store';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

export default function NotFoundShell() {
  useShellPage({
    title: 'Introuvable',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Introuvable' }],
  });
  const openPalette = usePaletteStore((s) => s.setOpen);
  return (
    <div className="p-6">
      <EmptyState icon={Compass} title="Cette surface n'existe pas"
        hint="Le module recherché n'est pas enregistré, ou l'adresse a changé."
        action={
          <Button size="sm" onClick={() => openPalette(true)} className="bg-emerald-600 text-white hover:bg-emerald-500">
            Ouvrir la palette (⌘K)
          </Button>
        } />
    </div>
  );
}
