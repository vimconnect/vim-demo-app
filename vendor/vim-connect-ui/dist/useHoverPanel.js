/**
 * Open/close state for a panel that opens on hover.
 *
 * Three surfaces render one of these — the per-app-icon hover card, the users
 * table's "+N" app list, the dashboard's Applications card — and two of them sit
 * in the same strip of badges, so they have to feel like one control: the same
 * grace period crossing the gap into the panel, the same immediate close on a
 * click, the same timer cleared on unmount. Sharing only the grace constant left
 * that gesture hand-copied at each call site, and the copies had already drifted
 * in their cleanup.
 *
 * Timer state only — the hook owns whether ITS panel is open, and nothing else.
 * A surface with a second, click-opened panel beside this one (see UserAppsCell)
 * keeps that one in its own state and closes it explicitly, so a hover can never
 * reach in and shut a panel someone deliberately clicked open.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** Long enough to cross the gap from a trigger to its panel without it vanishing. */
export const HOVER_CLOSE_GRACE_MS = 140;
/**
 * One trigger, one panel — implemented over {@link useKeyedHoverPanel} with a
 * fixed key, so the timer, the grace period and the unmount cleanup exist in
 * exactly one place. This file's whole point is that hand-copied copies of this
 * gesture drift; a second implementation here would have been the first example.
 */
const SINGLETON_KEY = 'panel';
export const useHoverPanel = (graceMs = HOVER_CLOSE_GRACE_MS) => {
    const { openKey, show: showKey, toggle: toggleKey, scheduleClose, close } = useKeyedHoverPanel(graceMs);
    // Destructured, and depended on individually, rather than closing over the
    // returned object: `useKeyedHoverPanel` builds a fresh object every render, so
    // `[keyed]` changed every render and these memoized nothing — while looking
    // like they did. The underlying callbacks ARE stable, so depending on them
    // directly gives `show` and `toggle` the stable identity callers had before
    // this hook was reimplemented (several pass them straight to `onMouseEnter`).
    const show = useCallback(() => showKey(SINGLETON_KEY), [showKey]);
    const toggle = useCallback(() => toggleKey(SINGLETON_KEY), [toggleKey]);
    // Memoized for the same reason: `AnchoredPanel` keys a listener effect on its
    // props, so a fresh state object each render re-subscribed global listeners on
    // every render of every consumer.
    return useMemo(() => ({ open: openKey !== null, show, scheduleClose, close, toggle }), [openKey, show, scheduleClose, close, toggle]);
};
export const useKeyedHoverPanel = (graceMs = HOVER_CLOSE_GRACE_MS) => {
    const [openKey, setOpenKey] = useState(null);
    const closeTimer = useRef(null);
    const cancelClose = useCallback(() => {
        if (closeTimer.current !== null) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);
    const show = useCallback((key) => {
        cancelClose();
        setOpenKey(key);
    }, [cancelClose]);
    const close = useCallback(() => {
        cancelClose();
        setOpenKey(null);
    }, [cancelClose]);
    const toggle = useCallback((key) => {
        cancelClose();
        setOpenKey((prev) => (prev === key ? null : key));
    }, [cancelClose]);
    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimer.current = window.setTimeout(() => setOpenKey(null), graceMs);
    }, [cancelClose, graceMs]);
    useEffect(() => cancelClose, [cancelClose]);
    // Memoized: consumers pass these into effects and to AnchoredPanel, which keys
    // a listener effect on them. A fresh object per render made every one of those
    // re-run on every render.
    return useMemo(() => ({ openKey, show, scheduleClose, close, toggle }), [openKey, show, scheduleClose, close, toggle]);
};
