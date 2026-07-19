import { Workflow } from 'lucide-react';
import { DocumentLayout } from '../layouts/DocumentLayout';
import { Link } from 'react-router-dom';
import { Presentation, Zap } from 'lucide-react';
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
        <>
        <Link to="presentation"
          className="mb-4 block rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5 transition-colors hover:border-emerald-800">
          <Presentation className="size-5 text-emerald-500" />
          <h3 className="mt-2 font-sans text-[15px] font-bold text-zinc-100">Studio de présentation</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
            Une source, plusieurs sorties — classement, calendrier, résultats et buteurs en
            document imprimable (A4/A3), carte sociale, story mobile, habillage TV · exports CSV / Excel / PDF.
          </p>
        </Link>
        <Link to="automation"
          className="mb-4 block rounded-xl border border-amber-900/50 bg-amber-950/10 p-5 transition-colors hover:border-amber-800">
          <Zap className="size-5 text-amber-500" />
          <h3 className="mt-2 font-sans text-[15px] font-bold text-zinc-100">Automation Studio</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
            Pipelines visuels — match terminé → affiche → PDF → site → notifications → Intelligence.
            Persistés dans la configuration de la compétition.
          </p>
        </Link>
        <EmptyState icon={Workflow} title="Aucun module d'opérations pour l'instant"
          hint="Ce domaine est un emplacement prêt : un module Opérations = un dossier + une ligne de registre." />
        </>
      )}
    </DocumentLayout>
  );
}
