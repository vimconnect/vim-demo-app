'use client';

import type { ReactElement, ReactNode } from 'react';
import { HoverCard, Tooltip } from '@vim-connect/ui';

/**
 * Shows `text` in the shared DS Tooltip on hover and focus. The child sits in a span, so the hint
 * still shows when the child is a disabled button (which fires no pointer events).
 */
export function Hint({ text, block = false, children }: { text?: string | null; block?: boolean; children: ReactNode }) {
  if (!text) return <>{children}</>;
  return (
    <Tooltip label={text} wrap>
      <span className={`hint ${block ? 'hint-block' : ''}`}>{children}</span>
    </Tooltip>
  );
}

/** The label of an icon-only button, in the shared DS Tooltip; the button keeps its own aria-label. */
export function IconTip({ label, children }: { label: string; children: ReactElement }) {
  return <Tooltip label={label}>{children}</Tooltip>;
}

/** An ⓘ icon that opens `children` (help text, may hold `<code>`) in the shared DS HoverCard. */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  // Section and card headers are clickable: opening the card mustn't also toggle them.
  return (
    <span className="info-tip-wrap" onClick={(e) => e.stopPropagation()}>
      <HoverCard label={label} content={<p className="info-tip-text">{children}</p>} className="info-tip" width={260}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 7.2v3.8M8 4.9v.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </HoverCard>
    </span>
  );
}
