import { useRef } from 'react';
import { isDevBuild } from './isDevBuild.js';
/**
 * `tabIndex` for the `<a>` branch. `undefined` leaves an anchor natively
 * focusable — the right answer for a primary link, and for any clipped text.
 */
export function linkTabIndex({ secondaryLink, isClipped, }) {
    return secondaryLink && !isClipped ? -1 : undefined;
}
/**
 * Dev-only: `onClick` is rendered on the `<a>` branch only, so passing it
 * without an `href` drops it silently — a control that looks wired and is not.
 * Warns once per mounted component.
 */
export function useWarnOnHandlerWithoutHref(component, { href, onClick }) {
    const warnedRef = useRef(false);
    if (isDevBuild() && onClick && !href && !warnedRef.current) {
        warnedRef.current = true;
        console.error(`${component}: \`onClick\` was passed without \`href\`, so it is dropped — ` +
            'the handler only exists on the <a> branch. Pass both, or attach the ' +
            'handler to a real control.');
    }
}
