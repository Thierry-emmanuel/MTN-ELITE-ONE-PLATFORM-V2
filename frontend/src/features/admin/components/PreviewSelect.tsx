/**
 * PreviewSelect — searchable entity picker with image/badge preview.
 * Extracted from MatchCommandCenter (deleted in Phase 3: the Match Builder
 * in /os supersedes it); AwardsStudio and future admin surfaces import it
 * from here.
 */
import { useEffect, useRef, useState } from 'react';

export interface PreviewOption {
  id: string;
  name: string;
  subtitle?: string;
  imgUrl?: string;
  badge?: string;
}

export function PreviewSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: PreviewOption[];
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    (opt.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (opt.subtitle && opt.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Select button triggering popover */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left hover:border-white/20 transition-all"
      >
        {selectedOption ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedOption.imgUrl ? (
              <img
                src={selectedOption.imgUrl}
                alt={selectedOption.name}
                className="w-6 h-6 rounded-lg object-cover bg-white/5 flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold flex-shrink-0">
                {selectedOption.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{selectedOption.name}</p>
              {selectedOption.subtitle && (
                <p className="text-[10px] text-white/35 truncate leading-tight">{selectedOption.subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-white/30">{placeholder}</span>
        )}
        <span className="text-white/30 text-xs">▼</span>
      </button>

      {/* Dropdown list popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 p-2 bg-[#0c1219] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent"
          />
          <div className="space-y-1">
            {filtered.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-white/[0.04] transition-all ${
                  value === opt.id ? 'bg-white/[0.06]' : ''
                }`}
              >
                {opt.imgUrl ? (
                  <img
                    src={opt.imgUrl}
                    alt={opt.name}
                    className="w-8 h-8 rounded-lg object-cover bg-white/5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white/60 font-bold flex-shrink-0">
                    {(opt.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white truncate">{opt.name}</p>
                    {opt.badge && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-accent/80 bg-accent/15 px-1.5 py-0.5 rounded">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.subtitle && (
                    <p className="text-[10px] text-white/40 truncate leading-tight mt-0.5">{opt.subtitle}</p>
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-white/20 text-[10px] py-4">Aucun résultat trouvé</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
