import type { LucideIcon } from 'lucide-react';
import {
  Activity, AlertTriangle, Bell, Building2, Calendar, Clock,
  Cpu, HeartPulse, ListTodo, Workflow, Zap, Radio
} from 'lucide-react';
import { registerModule } from '@/shell/registry/module.registry';

const OPS_MODULES = [
  { slug: 'operations-suite', label: 'Centre d\'Opérations', icon: Radio },
  { slug: 'workflows-studio', label: 'Workflow Center', icon: Workflow },
  { slug: 'tasks-center', label: 'Tâches & Départements', icon: ListTodo },
  { slug: 'scheduling-hub', label: 'Planification & Calendrier', icon: Calendar },
  { slug: 'automation-studio', label: 'Studio Automatisation', icon: Zap },
  { slug: 'notifications-hub', label: 'Centre de Notifications', icon: Bell },
  { slug: 'background-jobs', label: 'Tâches de Fond & Workers', icon: Cpu },
  { slug: 'system-monitoring', label: 'Monitoring Système', icon: Activity },
  { slug: 'incidents-log', label: 'Journal des Incidents', icon: AlertTriangle },
  { slug: 'resource-allocation', label: 'Allocation des Ressources', icon: Building2 },
  { slug: 'timeline-stream', label: 'Timeline Opérationnelle', icon: Clock },
  { slug: 'operation-health', label: 'Conformité & Santé Ligues', icon: HeartPulse },
];

OPS_MODULES.forEach((mod) => {
  registerModule({
    slug: mod.slug,
    label: mod.label,
    icon: mod.icon,
    domain: 'operations',
    contractVersion: 1,
    entities: [],
    builders: [],
  });
});
