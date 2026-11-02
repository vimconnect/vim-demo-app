'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Hint } from '@/components/Hint';

/** One-line status under the tab bar; only when it is cut off does the full text show in a themed hint on hover. */
export function StatusBanner({ text }: { text: string }) {
  const [truncated, setTruncated] = useState(false);
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    const el = nodeRef.current;
    if (el) setTruncated(el.scrollWidth > el.clientWidth);
  }, []);

  // A callback ref: toggling the hint re-parents the text node, and the new node must be observed.
  const textRef = useCallback(
    (el: HTMLSpanElement | null) => {
      observerRef.current?.disconnect();
      nodeRef.current = el;
      if (!el) return;
      observerRef.current = new ResizeObserver(measure);
      observerRef.current.observe(el);
      measure();
    },
    [measure],
  );

  useEffect(measure, [text, measure]);
  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <p className="status-banner">
      <span className="status-dot" aria-hidden="true" />
      <Hint block text={truncated ? text : null}>
        <span ref={textRef} className="status-banner-text">
          {text}
        </span>
      </Hint>
    </p>
  );
}
