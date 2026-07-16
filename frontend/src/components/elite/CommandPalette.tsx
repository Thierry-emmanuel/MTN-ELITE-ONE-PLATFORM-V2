import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Trophy, Users, Calendar, Newspaper, Star } from "lucide-react";
import { useClubs, usePlayers, useFixtures } from "@/hooks/useFootball";
import { useArticles } from "@/hooks/useNews";
import type { Match, PlayerStat } from "@/types/football.types";

// ─── Search item types ────────────────────────────────────────────────────────
type SearchItem = {
  id: string;
  type: "player" | "club" | "match" | "news";
  label: string;
  sublabel?: string;
  href: string;
  accent?: string;
};

/**
 * Live search index, drawn from real backend data already cached by React Query
 * elsewhere in the app (clubs, players, fixtures), plus a debounced server-side
 * search against the /articles endpoint for stories.
 */
function useSearchIndex(query: string) {
  const { data: clubs } = useClubs();
  const { data: players } = usePlayers();
  const { data: matchdays } = useFixtures();

  // Debounce the query before it hits the network-backed article search
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: articles, isFetching: articlesLoading } = useArticles(
    { search: debounced.trim(), limit: 6 },
    { enabled: debounced.trim().length > 0 },
  );

  const baseIndex = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    (clubs ?? []).forEach((c) =>
      items.push({ id: `club-${c.id}`, type: "club", label: c.name, sublabel: c.city, href: `/clubs/${c.id}`, accent: c.color }),
    );

    (players ?? []).forEach((p: PlayerStat) =>
      items.push({ id: `player-${p.playerId}`, type: "player", label: p.playerName, sublabel: p.clubName, href: `/players/${p.playerId}` }),
    );

    const allMatches: Match[] = (matchdays ?? []).flatMap((d) => d.matches);
    allMatches.forEach((m) =>
      items.push({
        id: `match-${m.id}`,
        type: "match",
        label: `${m.homeClub.name} vs ${m.awayClub.name}`,
        sublabel: `Journée ${m.round}`,
        href: `/matches/${m.id}`,
      }),
    );

    return items;
  }, [clubs, players, matchdays]);

  const results = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const local = baseIndex.filter(
      (item) => item.label.toLowerCase().includes(q) || (item.sublabel ?? "").toLowerCase().includes(q),
    );

    const stories: SearchItem[] = (!q ? [] : articles ?? []).map((a) => ({
      id: `news-${a.id}`,
      type: "news",
      label: a.title,
      sublabel: a.category,
      href: `/news/${a.slug}`,
    }));

    return [...local, ...stories].slice(0, 8);
  }, [baseIndex, articles, query]);

  return { results, isSearching: query.trim() ? articlesLoading : false };
}

const TYPE_META = {
  player: { icon: <Star className="h-3.5 w-3.5" />,    label: "Joueur",  color: "text-[#FCD116]" },
  club:   { icon: <Trophy className="h-3.5 w-3.5" />,  label: "Club",    color: "text-[#008751]" },
  match:  { icon: <Calendar className="h-3.5 w-3.5" />,label: "Match",   color: "text-[#CE1126]" },
  news:   { icon: <Newspaper className="h-3.5 w-3.5" />,label: "News",   color: "text-white/50" },
};

// ─── Quick links shown when no query ──────────────────────────────────────────
const QUICK_LINKS = [
  { label: "Classement", href: "/standings", icon: <Trophy className="h-4 w-4" /> },
  { label: "Résultats",  href: "/results",   icon: <Calendar className="h-4 w-4" /> },
  { label: "Joueurs",    href: "/players",   icon: <Users className="h-4 w-4" /> },
  { label: "Actualités", href: "/news",      icon: <Newspaper className="h-4 w-4" /> },
];

// ─── Result item ──────────────────────────────────────────────────────────────
const ResultItem = ({
  item, active, onClick,
}: { item: SearchItem; active: boolean; onClick: () => void }) => {
  const meta = TYPE_META[item.type];
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all ${
        active ? "bg-white/8 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-white/5 ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.label}</div>
        {item.sublabel && (
          <div className="text-[11px] text-white/35 truncate">{item.sublabel}</div>
        )}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/25 shrink-0">{meta.label}</div>
      <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition-all ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`} />
    </button>
  );
};

// ─── Main CommandPalette ───────────────────────────────────────────────────────
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { results, isSearching } = useSearchIndex(query);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset active on results change
  useEffect(() => { setActiveIdx(0); }, [results.length]);

  // Global ⌘K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? onClose() : null; // let parent handle open
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Arrow key navigation
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    const total = results.length || QUICK_LINKS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => (i - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) {
        navigate(results[activeIdx].href);
        onClose();
      } else if (QUICK_LINKS[activeIdx]) {
        navigate(QUICK_LINKS[activeIdx].href);
        onClose();
      }
    }
  }, [results, activeIdx, onClose, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[80] w-full max-w-lg mx-4"
            style={{ width: "min(560px, calc(100vw - 32px))" }}
          >
            <div className="bg-[hsl(168,50%,7%)] border border-white/12 rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">

              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                <Search className="h-4.5 w-4.5 text-white/35 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Rechercher joueur, club, match, news…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-white/25 hover:text-white transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-white/6 text-[9px] font-mono text-white/25 border border-white/8">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-white/25 font-semibold">
                      {results.length} résultat{results.length > 1 ? "s" : ""}
                    </div>
                    {results.map((item, i) => (
                      <ResultItem
                        key={item.id}
                        item={item}
                        active={i === activeIdx}
                        onClick={() => { navigate(item.href); onClose(); }}
                      />
                    ))}
                  </>
                ) : query && isSearching ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Search className="h-8 w-8 text-white/15 animate-pulse" />
                    <p className="text-sm text-white/30">Recherche en cours…</p>
                  </div>
                ) : query ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Search className="h-8 w-8 text-white/15" />
                    <p className="text-sm text-white/30">Aucun résultat pour <span className="text-white/60">"{query}"</span></p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-white/25 font-semibold">
                      Accès rapide
                    </div>
                    {QUICK_LINKS.map((link, i) => (
                      <button
                        key={link.label}
                        onClick={() => { navigate(link.href); onClose(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all ${
                          i === activeIdx ? "bg-white/8 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-lg grid place-items-center bg-white/5 text-accent">
                          {link.icon}
                        </div>
                        <span className="text-sm font-medium">{link.label}</span>
                        <ArrowRight className={`h-3.5 w-3.5 ml-auto transition-all ${i === activeIdx ? "opacity-100" : "opacity-0"}`} />
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/6 px-4 py-2.5 flex items-center gap-4 text-[10px] text-white/20">
                <span className="flex items-center gap-1"><kbd className="bg-white/8 rounded px-1 border border-white/10">↑↓</kbd> Naviguer</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/8 rounded px-1 border border-white/10">↵</kbd> Ouvrir</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/8 rounded px-1 border border-white/10">ESC</kbd> Fermer</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};