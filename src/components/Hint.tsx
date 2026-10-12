'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { hintPosition, type HintPosition } from '@/lib/panel-layout';

function useBubble(block: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<HintPosition | null>(null);
  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(hintPosition(rect, document.documentElement.clientWidth, window.innerHeight, block));
  };
  const bubble = (content: ReactNode) =>
    position &&
    createPortal(
      <span className="hint-bubble" role="tooltip" style={position}>
        {content}
      </span>,
      document.body,
    );
  return { ref, show, hide: () => setPosition(null), bubble };
}

/** Shows `text` in a themed hint on hover; the wrapper keeps working when the child is disabled. */
export function Hint({ text, block = false, children }: { text?: string | null; block?: boolean; children: ReactNode }) {
  const { ref, show, hide, bubble } = useBubble(block);
  if (!text) return <>{children}</>;
  return (
    <span ref={ref} className={`hint ${block ? 'hint-block' : ''}`} aria-label={text} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {bubble(text)}
    </span>
  );
}

/**
 * An ⓘ icon that shows `children` in a themed hint on hover or keyboard focus. The help text is
 * also always in the DOM, visually hidden, as the trigger's description for screen readers.
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const { ref, show, hide, bubble } = useBubble(false);
  const descriptionId = `info-tip-${useId().replace(/[^\w-]/g, '')}`;
  return (
    <>
      <span
        ref={ref}
      className="info-tip"
      role="button"
      aria-label={label}
      aria-describedby={descriptionId}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 7.2v3.8M8 4.9v.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {bubble(children)}
    </span>
    <span id={descriptionId} className="visually-hidden">
      {children}
    </span>
    </>
  );
}
