import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ProfileNavSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  sections: ProfileNavSection[];
}

export function PlayerSubNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -65% 0px', threshold: 0 },
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 118;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActive(id);
  };

  return (
    <div className="border-b border-border/40 sticky top-[62px] bg-background/95 backdrop-blur-xl z-20">
      <div className="container">
        <div ref={railRef} className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
          {sections.map(s => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
