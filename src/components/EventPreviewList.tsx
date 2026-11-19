'use client';

import { useState, type ReactNode } from 'react';
import { Radio } from 'lucide-react';
import { AccordionItem, Button, EmptyStateAccent, EmptyTab } from '@vim-connect/ui';

export type PreviewEntry = {
  key: string | number;
  title: ReactNode;
  meta: string;
  /** Null where there is nothing to show, e.g. a context that just closed. */
  body: ReactNode | null;
};

/** Beyond this, the older entries move behind one row rather than growing the page. */
const NEWEST_SHOWN = 5;

/**
 * One list of captured events, as an item of the caller's `Accordion`.
 *
 * Open entries are exclusive: an EHR action fires several of these at once
 * (`order_open:order` with `order_open:patient`), and opening each one in place
 * pushed the next section off the screen.
 */
export function EventPreviewList({
  id,
  label,
  entries,
  emptyText,
  onClear,
  startCollapsed = false,
}: {
  /** Stable id within the parent `Accordion`. */
  id: string;
  label: string;
  entries: PreviewEntry[];
  emptyText: string;
  onClear: () => void;
  /** Only the first render; a list does not re-close itself when an event lands. */
  startCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const [showOlder, setShowOlder] = useState(false);
  // The newest event with a payload is the open one. A reader's pick (`key: null` is
  // "they closed it") holds only until a newer event lands.
  const [opened, setOpened] = useState<{ key: string | number | null; newest: string | number | undefined } | null>(
    null,
  );

  const newestKey = entries[0]?.key;
  const defaultKey = entries.find((entry) => entry.body !== null)?.key ?? newestKey;
  const openKey = opened && opened.newest === newestKey ? opened.key : defaultKey;
  const toggle = (key: string | number) => setOpened({ key: openKey === key ? null : key, newest: newestKey });

  const newest = entries.slice(0, NEWEST_SHOWN);
  const older = entries.slice(NEWEST_SHOWN);

  const card = (entry: PreviewEntry) => {
    const open = entry.key === openKey;
    return (
      <details key={entry.key} className="event-preview-card" open={open}>
        <summary
          className="event-preview-header"
          onClick={(e) => {
            e.preventDefault();
            toggle(entry.key);
          }}
        >
          <span className="event-preview-title">
            <span className={`disclosure-chevron${open ? ' open' : ''}`} aria-hidden="true" />
            {entry.title}
          </span>
          <span className="event-preview-time">{entry.meta}</span>
        </summary>
        {open && entry.body}
      </details>
    );
  };

  return (
    // `preview-list` has no styles: e2e helpers find a list by it.
    <AccordionItem
      id={id}
      className="preview-list"
      title={`${label} (${entries.length})`}
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
      actions={
        entries.length > 0 &&
        !collapsed && (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear
          </Button>
        )
      }
    >
      {!collapsed && (
        <>
          {entries.length === 0 ? (
            <EmptyTab
              bare
              icon={Radio}
              title={
                <>
                  No {label.toLowerCase()} <EmptyStateAccent>yet</EmptyStateAccent>
                </>
              }
              body={emptyText}
            />
          ) : (
            newest.map(card)
          )}
          {older.length > 0 && (
            <>
              <button
                type="button"
                className="subsection-header preview-older-toggle"
                aria-expanded={showOlder}
                onClick={() => setShowOlder(!showOlder)}
              >
                <span className={`disclosure-chevron${showOlder ? ' open' : ''}`} aria-hidden="true" />
                {showOlder ? 'Hide older' : `${older.length} older`}
              </button>
              {showOlder && older.map(card)}
            </>
          )}
        </>
      )}
    </AccordionItem>
  );
}
