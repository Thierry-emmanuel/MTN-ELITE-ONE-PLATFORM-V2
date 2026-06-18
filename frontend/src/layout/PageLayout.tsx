import { useState, useEffect } from 'react';
import { Navbar }         from '@/components/elite/Navbar';
import { Footer }         from '@/components/elite/Footer';
import { CommandPalette } from '@/components/elite/CommandPalette';

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared wrapper for every page that needs Navbar + Footer + Command Palette.
 * Avoids copy-pasting the boilerplate across ClubsPage, PlayersPage, etc.
 */
export default function PageLayout({ children }: PageLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
