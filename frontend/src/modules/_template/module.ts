/**
 * MODULE TEMPLATE — copy this folder to create a FootballOS module.
 * ------------------------------------------------------------------
 * A module = a folder + ONE registerModule() call + ONE import line
 * in shell/modulesBootstrap.ts. The shell gives it for free:
 *   sidebar entry · command palette · quick create · global search ·
 *   recents / favorites / drafts · widget slots · builder framework.
 *
 * Rules (from the Phase-1 spec):
 *   1. Import ONLY from '@/shell' (never from another module).
 *   2. Everything you expose is an OSEntity.
 *   3. Your builder provides a Canvas — the framework owns the rest.
 *   4. contractVersion is checked at registration; the six domains,
 *      OSEntity, the layouts and the builder regions never change.
 */
import { Box } from 'lucide-react';
import { registerModule } from '@/shell/registry/module.registry';

export function registerTemplateModule() {
  registerModule({
    slug: 'template',                    // unique, kebab-case
    label: 'Module modèle',              // sidebar + palette label
    icon: Box,
    domain: 'builders',                  // one of the six domains
    contractVersion: 1,
    entities: [
      // {
      //   type: 'thing',
      //   moduleSlug: 'template',
      //   icon: Box,
      //   labelSingular: 'Objet',
      //   labelPlural: 'Objets',
      //   creatable: true,               // appears in ＋ and "+..." palette
      // },
    ],
    // builders: [...]                   // BuilderDefinition per entity type
    // widgets: [...]                    // workspace widgets
    // commands: [...]                   // palette commands
    // searchProvider: async (q) => []   // feed global search
  });
}
