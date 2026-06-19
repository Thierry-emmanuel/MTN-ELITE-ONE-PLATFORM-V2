import { useSearch } from '@/context/SearchContext';
import { Navbar }   from '@/components/elite/Navbar';
import { Footer }   from '@/components/elite/Footer';
import { CommandPalette } from '@/components/elite/CommandPalette';

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * Universal page shell — Navbar + Footer + Command Palette.
 * Reads search state from SearchContext (no duplicated useEffect).
 * Every page wraps its content in this component.
 */
export default function PageLayout({ children }: PageLayoutProps) {
  const { open, closeSearch, openSearch } = useSearch();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CommandPalette open={open} onClose={closeSearch} />
      <Navbar onSearchOpen={openSearch} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}