import React from 'react';
import { type ClippedTextLinkProps } from './clippedTextLink.js';
export interface ClampedTextProps extends ClippedTextLinkProps {
    /** The full text to render. */
    text: string;
    /** Max visible lines before clamping — default matches the pending-request
     *  message treatment (2-3 lines) used across the approval surfaces. */
    lines?: number;
    className?: string;
    style?: React.CSSProperties;
}
/**
 * Multi-line text that clamps to `lines` and reveals its full value through
 * the platform {@link Tooltip} on hover/focus — but ONLY when the text is
 * actually clipped, and using the design-system-themed tooltip (not the
 * browser's native `title` popup, which can't be restyled and shows
 * unconditionally). Mirrors {@link TruncatedText}'s single-line pattern,
 * measuring `scrollHeight > clientHeight` instead of `scrollWidth >
 * clientWidth` since clamping wraps across lines rather than clipping one.
 */
export declare const ClampedText: React.FC<ClampedTextProps>;
