import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useRef, useState } from 'react';
import { Tooltip } from './Tooltip.js';
import { isDevBuild } from './isDevBuild.js';
import { linkTabIndex, useWarnOnHandlerWithoutHref, } from './clippedTextLink.js';
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
export const TruncatedText = ({ text, className, style, href, onClick, secondaryLink, }) => {
    const [isClipped, setIsClipped] = useState(false);
    const observerRef = useRef(null);
    useWarnOnHandlerWithoutHref('TruncatedText', { href, onClick });
    const setRef = useCallback((el) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!el)
            return;
        const measure = () => setIsClipped(el.scrollWidth > el.clientWidth);
        measure();
        // Only where there is real layout to judge: jsdom produces no client rects, so
        // this cannot fire in tests, and an unrendered element has nothing to diagnose.
        if (isDevBuild() && el.getClientRects().length > 0) {
            const { display } = window.getComputedStyle(el);
            // An inline box reports zero for both widths; an inline-level box that
            // shrink-wraps (inline-block, inline-flex) reports two equal widths. Either
            // way `scrollWidth > clientWidth` is never true, so the text overflows its
            // container while clip state reads "fits" — no tooltip, no aria-label, no error.
            if (display === 'inline' || display.startsWith('inline-')) {
                console.error(`TruncatedText: "${el.textContent}" computes to \`display: ${display}\`, ` +
                    'so it can never register as clipped and will never reveal its full ' +
                    "text. The caller's className must give it a block-level display " +
                    'alongside the truncating CSS.');
            }
        }
        if (typeof ResizeObserver !== 'undefined') {
            observerRef.current = new ResizeObserver(measure);
            observerRef.current.observe(el);
        }
    }, []);
    // When clipped, the element becomes a focusable Tooltip trigger (so keyboard
    // users get the same reveal as hover) and carries an aria-label so assistive
    // tech announces the full text rather than the visually-clipped string.
    // An anchor is focusable already, so its tabIndex is only ever there to REMOVE
    // it from the tab order — a secondaryLink that is not clipped. A clipped <span>
    // needs the opposite, tabIndex 0, to become focusable at all.
    const el = href ? (_jsx("a", { className: className, style: style, href: href, onClick: onClick, ref: setRef, tabIndex: linkTabIndex({ secondaryLink, isClipped }), ...(isClipped ? { 'aria-label': text } : {}), children: text })) : (_jsx("span", { className: className, style: { display: 'block', minWidth: 0, ...style }, ref: setRef, ...(isClipped ? { tabIndex: 0, 'aria-label': text } : {}), children: text }));
    return isClipped ? _jsx(Tooltip, { label: text, children: el }) : el;
};
