'use client';

import { useState, type ReactNode } from 'react';

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
 * One list of captured events.
 *
 * Open entries are exclusive: an EHR action fires several of these at once
 * (`order_open:order` with `order_open:patient`), and opening each one in place
 * pushed the next section off the screen.
 */
export function EventPreviewList({
  label,
  entries,
  emptyText,
  onClear,
  startCollapsed = false,
}: {
  label: string;
  entries: PreviewEntry[];
  emptyText: string;
  onClear: () => void;
  /** Only the first render; a list does not re-close itself when an event lands. */
  startCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const [showOlder, setShowOlder] = useState(false);
  // Until the reader picks one, the newest arrival is the open one; `key: null`
  // is "they closed it", which is not the same as "nobody has chosen".
  const [opened, setOpened] = useState<{ pinned: false } | { pinned: true; key: string | number | null }>({
    pinned: false,
  });

  const openKey = opened.pinned ? opened.key : entries[0]?.key;
  const toggle = (key: string | number) => setOpened({ pinned: true, key: openKey === key ? null : key });

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
            <span className="entity-card-chevron" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
              ▶
            </span>
            {entry.title}
          </span>
          <span className="event-preview-time">{entry.meta}</span>
        </summary>
        {open && entry.body}
      </details>
    );
  };

  return (
    <div className="preview-list">
      <div className="subsection-row">
        <button
          type="button"
          className="subsection-header preview-list-header"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="entity-card-chevron" style={{ transform: collapsed ? 'none' : 'rotate(90deg)' }}>
            ▶
          </span>
          {label} ({entries.length})
        </button>
        {entries.length > 0 && !collapsed && (
          <button onClick={onClear} className="btn btn-sm">
            Clear
          </button>
        )}
      </div>
      {!collapsed && (
        <>
          {entries.length === 0 ? (
            <p className="empty-state empty-state-inline">{emptyText}</p>
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
                <span className="entity-card-chevron" style={{ transform: showOlder ? 'rotate(90deg)' : 'none' }}>
                  ▶
                </span>
                {showOlder ? 'Hide older' : `${older.length} older`}
              </button>
              {showOlder && older.map(card)}
            </>
          )}
        </>
      )}
    </div>
  );
}
