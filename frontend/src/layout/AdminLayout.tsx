import { Link } from 'react-router-dom';
import { Shield, Home, Layers, Image, Calendar, Award, FileText, Star } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab }: AdminLayoutProps) {
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'layout', label: 'Mise en page', icon: Layers },
    { id: 'hero', label: 'Bannières Hero', icon: Image },
    { id: 'matches', label: 'Matchs & Résultats', icon: Calendar },
    { id: 'awards', label: 'Awards & Ballon d\'or', icon: Award },
    { id: 'news', label: 'Actualités & News', icon: FileText },
    { id: 'halloffame', label: 'Légendes & Talents', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F13] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F141C] border-r border-white/5 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold uppercase tracking-wider text-white">Elite CMS</h1>
            <p className="text-[9px] uppercase tracking-widest text-accent font-bold">Administrateur</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-accent text-black shadow-[0_0_15px_rgba(252,209,22,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:border-white/25 text-xs text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10"
          >
            Quitter le CMS
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0F141C]/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Serveur en ligne</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white/90">Administrateur</p>
              <p className="text-[9px] text-accent font-semibold uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 grid place-items-center text-accent font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
