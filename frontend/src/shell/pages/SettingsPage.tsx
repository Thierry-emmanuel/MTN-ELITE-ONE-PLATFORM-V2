import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Keyboard, ListTree, ScrollText, Settings2, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InspectorLayout } from '../layouts/InspectorLayout';
import { usePreferences } from '../stores/preferences.store';
import { ShortcutRegistry, formatKeys } from '../navigation/shortcuts';
import { Kbd } from '../components/ShortcutHint';
import { useShellPage } from '../stores/page.store';
import { SHELL_BASE } from '../navigation/domains';
import { AuditSection, MenuSection, SecuritySection } from './SettingsIamSections';
import { usePermissions } from '../services/permissions';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 text-[13px] font-semibold text-zinc-200">{title}</h2>
      {children}
    </section>
  );
}

function Choice<T extends string>({ value, options, onSelect }: {
  value: T; options: { id: T; label: string }[]; onSelect: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
      {options.map((o) => (
        <button key={o.id} onClick={() => onSelect(o.id)} aria-pressed={value === o.id}
          className={cn('flex-1 rounded-md px-3 py-1.5 text-[12px]',
            value === o.id ? 'bg-zinc-800 font-medium text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const ProfileSection = () => {
  const { me, roleKeys, loading } = usePermissions();
  return (
    <SectionCard title="Profil">
      <div className="space-y-2 text-[13px] text-zinc-400">
        <p><span className="text-zinc-500">Nom :</span> {loading ? '…' : me ? `${me.user.firstName} ${me.user.lastName}` : 'Non connecté'}</p>
        <p><span className="text-zinc-500">Email :</span> {me?.user.email ?? '—'}</p>
        <p><span className="text-zinc-500">Rôles :</span> {roleKeys.join(', ') || '—'} <span className="text-zinc-600">(bundles de permissions configurés dans Identité & Accès)</span></p>
      </div>
    </SectionCard>
  );
};

const PreferencesSection = () => {
  const { theme, setTheme, language, setLanguage, density, setDensity } = usePreferences();
  return (
    <div className="space-y-3">
      <SectionCard title="Thème">
        <Choice value={theme} onSelect={setTheme}
          options={[{ id: 'dark', label: 'Sombre' }, { id: 'light', label: 'Clair (à venir)' }]} />
      </SectionCard>
      <SectionCard title="Langue">
        <Choice value={language} onSelect={setLanguage}
          options={[{ id: 'fr', label: 'Français' }, { id: 'en', label: 'English' }]} />
      </SectionCard>
      <SectionCard title="Densité">
        <Choice value={density} onSelect={setDensity}
          options={[{ id: 'comfortable', label: 'Confortable' }, { id: 'compact', label: 'Compacte' }]} />
      </SectionCard>
    </div>
  );
};

const ShortcutsSection = () => (
  <SectionCard title="Raccourcis clavier">
    <ul className="space-y-1.5">
      {ShortcutRegistry.all().map((s) => (
        <li key={`${s.scope}-${s.keys}`} className="flex items-center justify-between gap-3 py-0.5">
          <span className="text-[13px] text-zinc-300">{s.description}</span>
          <Kbd>{formatKeys(s.keys)}</Kbd>
        </li>
      ))}
    </ul>
  </SectionCard>
);

export default function SettingsPage() {
  useShellPage({
    title: 'Paramètres',
    breadcrumb: [{ label: 'FootballOS', href: `${SHELL_BASE}/workspace` }, { label: 'Paramètres' }],
  });
  const { can } = usePermissions();
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Préférences', icon: Settings2 },
    { id: 'security', label: 'Sécurité', icon: ShieldCheck },
    ...(can('audit.view') ? [{ id: 'audit', label: 'Audit', icon: ScrollText }] : []),
    ...(can('settings.configure') ? [{ id: 'menu', label: 'Menu', icon: ListTree }] : []),
    { id: 'shortcuts', label: 'Raccourcis', icon: Keyboard },
  ];
  return (
    <InspectorLayout
      rail={
        <nav aria-label="Sections des paramètres" className="space-y-0.5 lg:sticky lg:top-4">
          {tabs.map((tab) => (
            <NavLink key={tab.id} to={tab.id}
              className={({ isActive }) =>
                cn('flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]',
                  isActive ? 'bg-zinc-900 font-medium text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300')}>
              <tab.icon className="size-3.5" /> {tab.label}
            </NavLink>
          ))}
        </nav>
      }
      main={
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSection />} />
          <Route path="preferences" element={<PreferencesSection />} />
          <Route path="security" element={<SecuritySection />} />
          <Route path="audit" element={<AuditSection />} />
          <Route path="menu" element={<MenuSection />} />
          <Route path="shortcuts" element={<ShortcutsSection />} />
        </Routes>
      }
    />
  );
}
