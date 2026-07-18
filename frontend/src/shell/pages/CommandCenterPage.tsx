import { DashboardLayout } from '../layouts/DashboardLayout';
import { WidgetFrame } from '../components/WidgetFrame';
import { getWidget } from '../registry/widget.registry';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

/** Command Center — "what needs my attention right now?" Phase 1: system widgets. */
export default function CommandCenterPage() {
  useShellPage({
    title: 'Command Center',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Command Center' }],
  });
  const widgets = ['system-status', 'activity-feed', 'quick-actions'] as const;
  return (
    <DashboardLayout toolbar={<h1 className="font-sans text-[15px] font-bold tracking-tight text-zinc-100">Command Center</h1>}>
      {widgets.map((id) => {
        const def = getWidget(id);
        if (!def) return null;
        const W = def.component;
        return (
          <WidgetFrame key={id} title={def.title} icon={def.icon} size={id === 'quick-actions' ? 'L' : 'M'}>
            <W />
          </WidgetFrame>
        );
      })}
    </DashboardLayout>
  );
}
