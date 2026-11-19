import React from 'react';
import { type ClippedTextLinkProps } from './clippedTextLink.js';
export interface TruncatedTextProps extends ClippedTextLinkProps {
    /** The full text to render. The caller's `className` MUST supply the
     *  truncating CSS (`overflow: hidden; text-overflow: ellipsis; white-space:
     *  nowrap`). The non-link root defaults to `display: block` (override via
     *  `style`); an `href` root does not — link callers must still set a
     *  block-level `display`, or clip measurement never sees overflow. */
    text: string;
    className?: string;
    style?: React.CSSProperties;
}
/**
 * Single-line text that ellipsizes within its container and reveals its full
 * value through the platform {@link Tooltip} on hover/focus — but ONLY when the
 * text is actually clipped. A value that fits gets no tooltip, no tab stop, and
 * no aria-label.
 *
 * Clip state (`scrollWidth > clientWidth`) is measured on mount and re-measured
 * on resize via a ResizeObserver. The observer is (re)bound through a callback
 * ref rather than a node-keyed effect so it keeps tracking the live node even
 * as the element is wrapped/unwrapped by `Tooltip` when the clip state flips —
 * a node-keyed effect would end up observing a stale, detached node.
 *
 * NOTE: this depends on `Tooltip` forwarding the trigger ref (it merges its own
 * ref with the child's via cloneElement). If that contract changes, measurement
 * would silently freeze rather than error — keep the two in sync.
 */
export declare const TruncatedText: React.FC<TruncatedTextProps>;
