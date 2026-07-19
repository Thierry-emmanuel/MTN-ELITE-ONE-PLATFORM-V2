/**
 * Football Business — tenant module #2. Seven studios, zero bespoke builder
 * code: every studio inherits the universal Builder Framework through the
 * same factory as the football entities. Configs are registered in the
 * shared ENTITY_REGISTRY so the module list pages and builders resolve them.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Banknote, Briefcase, Contact, FileText, Handshake, ShieldCheck, Store, Tv,
} from 'lucide-react';
import { registerModule } from '@/shell/registry/module.registry';
import { builderFromConfig } from '@/shell/builder-framework/configBuilder';
import { BUSINESS_CONFIGS } from '@/features/business/business.configs';

const ICONS: Record<string, LucideIcon> = {
  finance: Banknote,
  'sponsorship-deals': Handshake,
  'broadcast-deals': Tv,
  documents: FileText,
  licenses: ShieldCheck,
  contacts: Contact,
  commercial: Store,
};

const TITLES: Record<string, (d: Record<string, unknown>) => string> = {
  finance: (d) => String(d.label ?? ''),
  'sponsorship-deals': (d) => String(d.sponsorName ?? ''),
  'broadcast-deals': (d) => String(d.broadcaster ?? ''),
  documents: (d) => String(d.title ?? ''),
  licenses: (d) => String(d.subjectName ?? d.subjectId ?? ''),
  contacts: (d) => String(d.name ?? ''),
  commercial: (d) => String(d.name ?? ''),
};

registerModule({
  slug: 'business',
  label: 'Football Business',
  icon: Briefcase,
  domain: 'builders',
  contractVersion: 1,
  entities: Object.entries(BUSINESS_CONFIGS).map(([slug, config]) => ({
    type: slug,
    moduleSlug: 'business',
    icon: ICONS[slug] ?? Briefcase,
    labelSingular: config.labelSingular,
    labelPlural: config.labelPlural,
    creatable: true,
  })),
  builders: Object.entries(BUSINESS_CONFIGS).map(([slug, config]) =>
    builderFromConfig(config as never, ICONS[slug] ?? Briefcase, { titleOf: TITLES[slug] }),
  ),
});
