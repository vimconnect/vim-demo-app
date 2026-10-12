'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { findTextMatches } from '@/lib/text-search';
import { SearchIcon } from '@/components/icons';

const ALL = 'demo-search';
const CURRENT = 'demo-search-current';

type HighlightRegistry = Map<string, unknown>;
type HighlightCtor = new (...ranges: Range[]) => unknown;

function highlights(): { registry: HighlightRegistry; Highlight: HighlightCtor } | null {
  const registry = (globalThis.CSS as unknown as { highlights?: HighlightRegistry } | undefined)?.highlights;
  const Highlight = (globalThis as unknown as { Highlight?: HighlightCtor }).Highlight;
  return registry && Highlight ? { registry, Highlight } : null;
}

function paint(matches: Range[], current: number) {
  const api = highlights();
  if (!api) return;
  api.registry.set(ALL, new api.Highlight(...matches));
  api.registry.set(CURRENT, new api.Highlight(...(matches[current] ? [matches[current]] : [])));
}

function clearPaint() {
  const api = highlights();
  api?.registry.delete(ALL);
  api?.registry.delete(CURRENT);
}

/**
 * Find-in-app for the side panel, where Chrome's own find bar searches the EHR tab instead.
 * Cmd/Ctrl+F inside the app opens it; it searches the text of `rootSelector`, skipping collapsed sections.
 */
export function InPageSearch({ rootSelector, open, onOpenChange }: {
  rootSelector: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Range[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onOpenChange(true);
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    clearPaint();
    setQuery('');
    setMatches([]);
    setCurrent(0);
  }, [open]);

  useEffect(() => clearPaint, []);

  const show = useCallback((found: Range[], index: number) => {
    setMatches(found);
    setCurrent(index);
    paint(found, index);
    found[index]?.startContainer.parentElement?.scrollIntoView({ block: 'center' });
  }, []);

  const search = (text: string) => {
    setQuery(text);
    const root = document.querySelector(rootSelector);
    show(root ? findTextMatches(root, text) : [], 0);
  };

  const step = (delta: number) => {
    const root = document.querySelector(rootSelector);
    // Re-run: sections may have been opened or closed since the last search.
    const found = root ? findTextMatches(root, query) : [];
    if (found.length === 0) return show(found, 0);
    show(found, (current + delta + found.length) % found.length);
  };

  if (!open) return null;

  return (
    <div className="in-page-search" role="search" data-search-ignore>
      <SearchIcon />
      <input
        ref={inputRef}
        className="in-page-search-input"
        type="search"
        value={query}
        placeholder="Find in app"
        aria-label="Find in app"
        onChange={(e) => search(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') step(e.shiftKey ? -1 : 1);
          if (e.key === 'Escape') onOpenChange(false);
        }}
      />
      <span className="in-page-search-count" aria-live="polite">
        {query.trim() ? (matches.length ? `${current + 1}/${matches.length}` : '0/0') : ''}
      </span>
      <button type="button" className="in-page-search-btn" aria-label="Previous match" onClick={() => step(-1)} disabled={!matches.length}>
        ↑
      </button>
      <button type="button" className="in-page-search-btn" aria-label="Next match" onClick={() => step(1)} disabled={!matches.length}>
        ↓
      </button>
      <button type="button" className="in-page-search-btn" aria-label="Close search" onClick={() => onOpenChange(false)}>
        ✕
      </button>
    </div>
  );
}
