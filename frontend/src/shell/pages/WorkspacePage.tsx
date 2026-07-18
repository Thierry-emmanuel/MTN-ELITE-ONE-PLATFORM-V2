import { WorkspaceEngine } from '../workspace-engine/WorkspaceEngine';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';

export default function WorkspacePage() {
  useShellPage({
    title: 'Workspace',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Workspace' }],
  });
  return <WorkspaceEngine />;
}
