import { Workflow } from 'lucide-react';
import { DocumentLayout } from '../layouts/DocumentLayout';
import { EmptyState } from '../components/SystemStates';
import { getModulesByDomain } from '../registry/module.registry';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

export default function OperationsPage() {
  useShellPage({
    title: 'Opérations',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Opérations' }],
  });
  const modules = getModulesByDomain('operations');
  return (
    <DocumentLayout
      hero={
        <div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-zinc-100">Opérations</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            Les surfaces de processus — programmation, jour de match, arbitrage, médical,
            fenêtres de transferts, discipline — s'enregistrent ici comme modules.
          </p>
        </div>
      }
    >
      {modules.length === 0 && (
        <EmptyState icon={Workflow} title="Aucun module d'opérations pour l'instant"
          hint="Ce domaine est un emplacement prêt : un module Opérations = un dossier + une ligne de registre." />
      )}
    </DocumentLayout>
  );
}
