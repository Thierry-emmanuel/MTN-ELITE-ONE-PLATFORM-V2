import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { PageSkeleton } from './components/SystemStates';
import { registerWidgets } from './registry/widget.registry';
import { SHELL_WIDGETS } from './workspace-engine/widgets';
import './modulesBootstrap';

registerWidgets(SHELL_WIDGETS);

const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));
const BuildersIndexPage = lazy(() => import('./pages/BuildersIndexPage'));
const BuilderModulePage = lazy(() => import('./pages/BuilderModulePage'));
const BuilderShellPage = lazy(() => import('./pages/BuilderShellPage'));
const OperationsPage = lazy(() => import('./pages/OperationsPage'));
const IntelligencePage = lazy(() => import('./pages/IntelligencePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundShell = lazy(() => import('./pages/NotFoundShell'));

/**
 * FootballOS shell — mounted at /os/* alongside the public site.
 * Route conventions: depth ≤ 4, lazy chunks per surface, URL as the
 * source of truth for selection.
 */
export default function ShellApp() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="workspace" replace />} />
        <Route path="workspace" element={<S><WorkspacePage /></S>} />
        <Route path="command" element={<S><CommandCenterPage /></S>} />
        <Route path="builders" element={<S><BuildersIndexPage /></S>} />
        <Route path="builders/:module" element={<S><BuilderModulePage /></S>} />
        <Route path="builders/:module/:type/:id" element={<S><BuilderShellPage /></S>} />
        <Route path="operations" element={<S><OperationsPage /></S>} />
        <Route path="intelligence" element={<S><IntelligencePage /></S>} />
        <Route path="settings/*" element={<S><SettingsPage /></S>} />
        <Route path="*" element={<S><NotFoundShell /></S>} />
      </Route>
    </Routes>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-4"><PageSkeleton /></div>}>{children}</Suspense>;
}
