import type { ReactNode } from 'react';

type NoticeTone = 'blue' | 'purple' | 'orange' | 'error';

const ICONS: Record<NoticeTone, ReactNode> = {
  blue: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  purple: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  orange: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5M12 16h.01" />
    </>
  ),
};

/**
 * DS Notice: an inline message that needs more presence than a line of text. Blue is neutral
 * information (the common case), purple identity, orange a warning, error a failure.
 */
export function Notice({ tone = 'blue', children }: { tone?: NoticeTone; children: ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <svg className="notice-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[tone]}
      </svg>
      <div className="notice-body">{children}</div>
    </div>
  );
}

/** The quiet counterpart for good news: a dot and a line, no fill. */
export function StatusLine({ tone = 'live', children }: { tone?: 'live' | 'waiting' | 'off'; children: ReactNode }) {
  return (
    <span className={`status-line is-${tone}`}>
      <span className="status-line-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
