'use client';

import { useEffect, useRef } from 'react';
import { getDeveloperDocsUrl } from '@/lib/sdk-config';

/** Must match `EMBED_SCROLL_MESSAGE` / `EMBED_READY_MESSAGE` in developer-docs `components/embed-scroll.tsx`. */
const DOCS_SCROLL_MESSAGE = 'vim-docs:scroll';
const DOCS_READY_MESSAGE = 'vim-docs:embed-ready';
const LINE_HEIGHT_PX = 16;

/**
 * The developer docs, embedded: the app's iframe can't open a new tab. Once the docs say they
 * listen, a vertical wheel elsewhere on the page is forwarded so the docs scroll wherever the
 * pointer is; zoom gestures and anything over a modal are left alone.
 */
export function DocsView() {
  const docsUrl = getDeveloperDocsUrl();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const docsOrigin = new URL(docsUrl).origin;
    const onWheel = (e: WheelEvent) => {
      const frame = frameRef.current?.contentWindow;
      if (!frame || e.ctrlKey || e.deltaY === 0) return;
      if (e.target instanceof Element && e.target.closest('.modal-overlay')) return;
      e.preventDefault();
      const deltaY = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * LINE_HEIGHT_PX : e.deltaY;
      frame.postMessage({ type: DOCS_SCROLL_MESSAGE, deltaY }, docsOrigin);
    };
    let forwarding = false;
    const onMessage = (e: MessageEvent) => {
      if (forwarding || e.origin !== docsOrigin || e.source !== frameRef.current?.contentWindow) return;
      if ((e.data as { type?: unknown } | null)?.type !== DOCS_READY_MESSAGE) return;
      forwarding = true;
      window.addEventListener('wheel', onWheel, { passive: false });
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('wheel', onWheel);
    };
  }, [docsUrl]);

  return (
    <iframe ref={frameRef} className="docs-frame" src={docsUrl} title="Vim Connect developer docs" />
  );
}
