import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, LayoutDashboard, Layers, Image, Calendar,
  Trophy, FileText, Star, BarChart2, ExternalLink,
  ChevronRight, MapPin, Shirt, Handshake, Zap,
  Eye, Flag, Archive, Users, Search, UserCog, Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPalette?: () => void;
}

// Information architecture reorganized around business domains, per the
// League Studio spec — editors browse by "what am I working on" (a
// competition, a person, a piece of legacy content...) rather than by
// database table. Every existing tab id is preserved 1:1, so this is a
// pure re-grouping — no page loses functionality.
const NAV_GROUPS = [
  {
    group: 'Compétition',
    items: [
      { id: 'seasons',    label: 'Saisons',                icon: Calendar },
      { id: 'matches',    label: 'Matchs & Résultats',      icon: Calendar },
      { id: 'stats',      label: 'Statistiques',            icon: BarChart2 },
    ],
  },
  {
    group: 'Personnes',
    items: [
      { id: 'clubs',      label: 'Clubs',                  icon: Shield },
      { id: 'players',    label: 'Joueurs',                icon: Star },
      { id: 'coaches',    label: 'Entraîneurs',             icon: Star },
      { id: 'stadiums',   label: 'Stades',                 icon: MapPin },
      { id: 'equipments', label: 'Équipements',             icon: Shirt },
      { id: 'sponsors',   label: 'Sponsors',                icon: Handshake },
    ],
  },
  {
    group: 'Héritage',
    items: [
      { id: 'awards',     label: "Awards & Ballon d'Or",    icon: Trophy },
      { id: 'halloffame', label: 'Hall of Fame',            icon: Users },
      { id: 'scouting',   label: 'Young Talent Watch',      icon: Eye },
      { id: 'lions',      label: 'Centre des Lions',        icon: Flag },
      { id: 'museum',     label: 'Musée & Archives',        icon: Archive },
    ],
  },
  {
    group: 'Médias',
    items: [
      { id: 'hero',       label: 'Bannières Hero',          icon: Image },
      { id: 'actions',    label: 'Actions marquantes',      icon: Zap },
    ],
  },
  {
    group: 'Éditorial',
    items: [
      { id: 'news',       label: 'Actualités & Presse',     icon: FileText },
    ],
  },
  {
    group: 'Administration',
    items: [
      { id: 'dashboard',  label: 'Tableau de bord',         icon: LayoutDashboard },
      { id: 'layout',     label: 'Mise en page',            icon: Layers },
      { id: 'users',      label: 'Utilisateurs',            icon: UserCog },
    ],
  },
];

export default function AdminLayout({ children, activeTab, setActiveTab, onOpenPalette }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0E14] text-white flex overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-[#0D1219] border-r border-white/[0.05] flex flex-col shrink-0 fixed h-full z-40">

        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.05]">
          <div className="h-8 w-8 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.15em] text-white leading-none">League Studio</p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-accent/80 font-bold mt-0.5">Cameroon League Platform</p>
          </div>
        </div>

        {/* Quick search / command palette trigger */}
        {onOpenPalette && (
          <div className="px-3 pt-3">
            <button
              onClick={onOpenPalette}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-white/35 hover:text-white/60 hover:border-white/15 transition-all text-[11px]"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">Rechercher, créer…</span>
              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 px-3 mb-2">{group.group}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all duration-150 ${
                        isActive
                          ? 'bg-accent text-black'
                          : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-xl bg-accent"
                          style={{ zIndex: -1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.05] space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/30 grid place-items-center text-accent font-bold text-[10px] shrink-0">AD</div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-white/80 truncate">Administrateur</p>
              <p className="text-[8px] text-accent/70 font-semibold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/8 hover:border-white/20 text-[10px] text-white/40 hover:text-white/70 transition-all bg-transparent hover:bg-white/[0.04]"
          >
            <ExternalLink className="h-3 w-3" /> Voir le Site
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 ml-64">

        {/* Top Header */}
        <header className="h-16 border-b border-white/[0.05] bg-[#0D1219]/90 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/25 font-medium">Studio</span>
            <span className="text-white/15">/</span>
            <span className="text-white/70 font-semibold capitalize">{activeTab}</span>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">Serveur actif</span>
            </div>
            <div className="h-4 w-px bg-white/8" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-white/60 leading-none">Administrateur</p>
              <p className="text-[8px] text-accent/80 font-bold uppercase tracking-widest mt-0.5">Super Admin</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
