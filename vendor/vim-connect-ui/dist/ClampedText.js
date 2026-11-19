import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useRef, useState } from 'react';
import { Tooltip } from './Tooltip.js';
import { linkTabIndex, useWarnOnHandlerWithoutHref, } from './clippedTextLink.js';
/**
 * Multi-line text that clamps to `lines` and reveals its full value through
 * the platform {@link Tooltip} on hover/focus — but ONLY when the text is
 * actually clipped, and using the design-system-themed tooltip (not the
 * browser's native `title` popup, which can't be restyled and shows
 * unconditionally). Mirrors {@link TruncatedText}'s single-line pattern,
 * measuring `scrollHeight > clientHeight` instead of `scrollWidth >
 * clientWidth` since clamping wraps across lines rather than clipping one.
 */
export const ClampedText = ({ text, lines = 3, className, style, href, onClick, secondaryLink, }) => {
    const [isClipped, setIsClipped] = useState(false);
    const observerRef = useRef(null);
    useWarnOnHandlerWithoutHref('ClampedText', { href, onClick });
    const setRef = useCallback((el) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!el)
            return;
        const measure = () => setIsClipped(el.scrollHeight > el.clientHeight + 1);
        measure();
        if (typeof ResizeObserver !== 'undefined') {
            observerRef.current = new ResizeObserver(measure);
            observerRef.current.observe(el);
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, lines]);
    const clampStyle = {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lines,
        overflow: 'hidden',
        ...style,
    };
    const el = href ? (_jsx("a", { className: className, style: clampStyle, href: href, onClick: onClick, ref: setRef, tabIndex: linkTabIndex({ secondaryLink, isClipped }), ...(isClipped ? { 'aria-label': text } : {}), children: text })) : (_jsx("div", { className: className, style: clampStyle, ref: setRef, ...(isClipped ? { tabIndex: 0, 'aria-label': text } : {}), children: text }));
    return isClipped ? (_jsx(Tooltip, { label: text, wrap: true, children: el })) : (el);
};
