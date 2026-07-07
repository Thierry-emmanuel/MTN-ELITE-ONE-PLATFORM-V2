import { memo, useEffect, useState } from 'react';

export interface ClubSectionMeta {
  id: string;
  label: string;
}

interface ClubSectionNavProps {
  sections: ClubSectionMeta[];
  accentColor?: string;
}

/**
 * Museum directory rail — sticky wayfinding signage between galleries,
 * numbered like exhibition rooms. Square, understated, scrollspy-driven.
 */
export const ClubSectionNav = memo(({ sections, accentColor = '#FCD116' }: ClubSectionNavProps) => {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
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
  };

  return (
    <div className="sticky top-[62px] z-20 border-b border-white/10 bg-[#06090a]/95 backdrop-blur-xl">
      <div className="container">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-3.5">
          {sections.map((s, i) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`relative shrink-0 flex items-center gap-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider border transition-all duration-200 ${
                  isActive
                    ? 'text-[#06090a]'
                    : 'bg-white/[0.02] text-white/45 border-white/10 hover:border-white/25 hover:text-white'
                }`}
                style={isActive ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className={`font-mono text-[9px] ${isActive ? 'opacity-70' : 'opacity-40'}`}>{String(i + 1).padStart(2, '0')}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
ClubSectionNav.displayName = 'ClubSectionNav';
