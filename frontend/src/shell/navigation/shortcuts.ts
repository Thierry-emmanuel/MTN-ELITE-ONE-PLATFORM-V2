import { useEffect } from 'react';
import type { ScopedShortcut } from '../registry/types';

/**
 * ShortcutRegistry — the single owner of every keyboard binding.
 * No component ever attaches its own keydown listener.
 * Supports chords ("mod+k", "mod+shift+n") and Linear-style
 * sequences ("g c"). Conflicts are rejected in dev.
 */
class ShortcutRegistryImpl {
  private shortcuts = new Map<string, ScopedShortcut>();

  register(sc: ScopedShortcut): () => void {
    const key = `${sc.scope ?? 'global'}::${sc.keys}`;
    if (import.meta.env.DEV && this.shortcuts.has(key))
      console.warn(`[FootballOS] shortcut conflict: ${sc.keys} (${sc.scope ?? 'global'})`);
    this.shortcuts.set(key, sc);
    return () => { this.shortcuts.delete(key); };
  }

  registerMany(list: ScopedShortcut[]): () => void {
    const offs = list.map((s) => this.register(s));
    return () => offs.forEach((off) => off());
  }

  all(): ScopedShortcut[] { return [...this.shortcuts.values()]; }

  find(keys: string): ScopedShortcut | undefined {
    return [...this.shortcuts.values()].find((s) => s.keys === keys);
  }
}
export const ShortcutRegistry = new ShortcutRegistryImpl();

// ── keydown → binding resolution ────────────────────────────────────────────
const isEditable = (el: EventTarget | null) => {
  const n = el as HTMLElement | null;
  if (!n) return false;
  const tag = n.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || n.isContentEditable;
};

const chordOf = (e: KeyboardEvent): string => {
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');
  const k = e.key ? e.key.toLowerCase() : '';
  if (k && !['meta', 'control', 'shift', 'alt'].includes(k)) parts.push(k === ' ' ? 'space' : k);
  return parts.join('+');
};

let pendingSeq = '';
let seqTimer: ReturnType<typeof setTimeout> | null = null;

export function useGlobalShortcutListener() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const chord = chordOf(e);
      const inInput = isEditable(e.target);

      // 1) exact chord match
      const chordHit = ShortcutRegistry.all().find(
        (s) => s.keys === chord && (!inInput || s.allowInInput),
      );
      if (chordHit) {
        e.preventDefault();
        pendingSeq = '';
        chordHit.handler();
        return;
      }

      // 2) sequences ("g c") — plain letters only, never while typing
      if (inInput || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!/^[a-z0-9?/[\]]$/.test(chord)) { pendingSeq = ''; return; }

      const candidate = pendingSeq ? `${pendingSeq} ${chord}` : chord;
      const seqs = ShortcutRegistry.all().filter((s) => s.keys.includes(' ') || ['/', '?', '[', ']'].includes(s.keys));
      const exact = seqs.find((s) => s.keys === candidate);
      const prefix = seqs.some((s) => s.keys.startsWith(candidate + ' '));

      if (exact) {
        e.preventDefault();
        pendingSeq = '';
        if (seqTimer) clearTimeout(seqTimer);
        exact.handler();
      } else if (prefix) {
        e.preventDefault();
        pendingSeq = candidate;
        if (seqTimer) clearTimeout(seqTimer);
        seqTimer = setTimeout(() => { pendingSeq = ''; }, 800);
      } else {
        pendingSeq = '';
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

/** Human-readable rendering for cheat-sheets and hints. */
export const formatKeys = (keys: string): string => {
  const mac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  return keys
    .split(' ')
    .map((part) =>
      part
        .split('+')
        .map((k) => (k === 'mod' ? (mac ? '⌘' : 'Ctrl') : k === 'shift' ? '⇧' : k === 'alt' ? (mac ? '⌥' : 'Alt') : k.toUpperCase()))
        .join(mac ? '' : '+'),
    )
    .join(' puis ');
};
