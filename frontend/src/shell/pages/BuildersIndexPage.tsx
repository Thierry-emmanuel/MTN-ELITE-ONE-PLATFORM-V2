import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { DocumentLayout } from '../layouts/DocumentLayout';
import { EmptyState } from '../components/SystemStates';
import { getModulesByDomain } from '../registry/module.registry';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

/** Builders index — registry-driven. The shell renders whatever modules registered. */
export default function BuildersIndexPage() {
  useShellPage({
    title: 'Builders',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Builders' }],
  });
  const modules = getModulesByDomain('builders');

  return (
    <DocumentLayout
      hero={
        <div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-zinc-100">Builders</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            Chaque surface de production hérite du Builder Framework : en-tête, plan, canevas,
            inspecteur, relations, aperçu, historique et publication. Les Builders métier
            (Joueur, Match, Club) arrivent en Phase 2 — le cadre est déjà prêt.
          </p>
        </div>
      }
    >
      {modules.length === 0 ? (
        <EmptyState icon={Hammer} title="Aucun module Builder enregistré"
          hint="Un module s'enregistre en une ligne dans module.registry — il apparaîtra ici." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <Link key={m.slug} to={`${SHELL_BASE}/builders/${m.slug}`}
              className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 group-hover:text-emerald-500">
                <m.icon className="size-4" />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-zinc-200 group-hover:text-white">{m.label}</span>
                <span className="mt-0.5 block text-[12px] text-zinc-500">
                  {m.entities?.length ?? 0} type{(m.entities?.length ?? 0) > 1 ? 's' : ''} d'objet
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </DocumentLayout>
  );
}
