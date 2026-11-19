import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Fixed-position panel anchored to a trigger element — moved from the Console
 * (`components/ui/AnchoredPanel.tsx`, now a re-export) so every product's hover
 * cards and popovers position the same way.
 *
 * Domain-free: portal, measure, flip above/below on available space, cap its
 * height to that space and scroll, clamp horizontally into the viewport. Follows
 * its anchor on scroll, resize, and its own size changes (async content that grows
 * after open), and dismisses on outside click, Escape, or once the anchor is no
 * longer visible — off the viewport or scrolled out of a clipping container
 * (never on its own inner scroll). Wears the DS floating surface on tokens.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn.js';
import { FloatingLayerContext, useFloatingLayer, zFloatingPanel } from './floatingLayers.js';
/** The DS floating surface: glass float in light, a near-solid page colour in dark (one token mix). */
export const FLOATING_SURFACE = [
    'overflow-hidden rounded-[var(--radius-xl)]',
    '[background:color-mix(in_srgb,var(--color-bg-primary)_92%,transparent)] [backdrop-filter:var(--glass-blur-lg)]',
    // The Tooltip's border, so floating surfaces read as one family.
    'border border-solid [border-color:var(--color-border-medium)] [box-shadow:var(--glass-shadow-float)]',
    '[font-family:var(--font-sans)] [color:var(--color-text-primary)]',
].join(' ');
const SURFACE = `anchored-panel ${FLOATING_SURFACE}`;
const OPAQUE = '[background:var(--color-bg-card)]';
const CLIPS = /auto|scroll|hidden|clip/;
/**
 * Whether any of `el` is inside the viewport and every ancestor that clips its overflow.
 * Known limit: a sticky header inside the same scroll box isn't subtracted, so a trigger
 * scrolled under it counts as visible for up to the header's height.
 */
function anchorVisible(el) {
    const r = el.getBoundingClientRect();
    let top = 0;
    let left = 0;
    let bottom = window.innerHeight;
    let right = window.innerWidth;
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
        const { overflowX, overflowY } = getComputedStyle(p);
        if (!CLIPS.test(overflowX) && !CLIPS.test(overflowY))
            continue;
        const c = p.getBoundingClientRect();
        top = Math.max(top, c.top);
        left = Math.max(left, c.left);
        bottom = Math.min(bottom, c.bottom);
        right = Math.min(right, c.right);
    }
    return r.bottom > top && r.top < bottom && r.right > left && r.left < right;
}
const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 8;
/** Floor for the available-space cap: below this the panel is useless anyway,
 *  so let it overhang rather than collapse to a sliver on a tiny viewport. */
const MIN_PANEL_HEIGHT = 160;
export const AnchoredPanel = ({ anchorRef, onDismiss, width, children, ariaLabel, onMouseEnter, onMouseLeave, opaque, className, align = 'center', prefer = 'below', flush, id, tabIndex, onBlur, onKeyDown, role = 'dialog', }) => {
    const panelRef = useRef(null);
    const layer = useFloatingLayer(true, (node) => !!panelRef.current?.contains(node));
    const [pos, setPos] = useState(null);
    const place = useCallback(() => {
        const anchor = anchorRef.current;
        const panel = panelRef.current;
        if (!anchor || !panel)
            return;
        const anchorRect = anchor.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        // Keep the preferred side unless the panel overflows it and the other side has more room.
        const spaceBelow = window.innerHeight - anchorRect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
        const spaceAbove = anchorRect.top - PANEL_GAP - VIEWPORT_MARGIN;
        const other = prefer === 'above' ? 'below' : 'above';
        const room = { above: spaceAbove, below: spaceBelow };
        const placement = panelRect.height > room[prefer] && room[other] > room[prefer] ? other : prefer;
        // Cap to the space actually available on the chosen side, NOT a fixed 60vh:
        // a row low on the page left the last app clipped against the viewport edge
        // with no bottom padding, because 60vh ignores where the anchor sits.
        const maxHeight = Math.max(MIN_PANEL_HEIGHT, placement === 'below' ? spaceBelow : spaceAbove);
        // Pin the edge next to the anchor. `above` uses `bottom` so async content that
        // grows after open expands upward instead of through the trigger and off-screen.
        const top = placement === 'below' ? anchorRect.bottom + PANEL_GAP : 'auto';
        const bottom = placement === 'above' ? window.innerHeight - anchorRect.top + PANEL_GAP : 'auto';
        const wanted = align === 'start'
            ? anchorRect.left
            : align === 'end'
                ? anchorRect.right - width
                : anchorRect.left + anchorRect.width / 2 - width / 2;
        const left = Math.min(Math.max(wanted, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN - width));
        setPos((prev) => prev &&
            prev.top === top &&
            prev.bottom === bottom &&
            prev.left === left &&
            prev.placement === placement &&
            prev.maxHeight === maxHeight
            ? prev
            : { top, bottom, left, placement, maxHeight });
    }, [anchorRef, width, align, prefer]);
    useLayoutEffect(place, [place]);
    // Content that arrives after open (a fetch that fills the panel) changes the
    // measured height; without a re-place, an `above` panel keeps the short-open
    // top and grows down through the anchor and off the viewport.
    useEffect(() => {
        const panel = panelRef.current;
        if (!panel || typeof ResizeObserver === 'undefined')
            return;
        const ro = new ResizeObserver(() => place());
        ro.observe(panel);
        return () => ro.disconnect();
    }, [place]);
    useEffect(() => {
        // Capture phase: runs before a nested list (a Select in this panel) closes and leaves the layer stack.
        const onPointerDown = (event) => {
            const target = event.target;
            if (panelRef.current?.contains(target) || anchorRef.current?.contains(target))
                return;
            if (layer.insideLayerAbove(target))
                return;
            onDismiss('outside');
        };
        // Capture phase + preventDefault: closes only this panel, not a surrounding Modal.
        // Only the top layer answers, so an open Select inside closes just its list.
        const onKeyDown = (event) => {
            if (event.key !== 'Escape' || !layer.isTop())
                return;
            event.preventDefault();
            onDismiss('escape');
        };
        // Capture phase also sees inner scrolls; ignore those from the panel and its nested lists.
        const follow = (reason) => {
            const anchor = anchorRef.current;
            if (!anchor || !anchor.isConnected || !anchorVisible(anchor)) {
                onDismiss(reason);
                return;
            }
            place();
        };
        const onScroll = (event) => {
            // `instanceof Node`, not a truthiness check: a scroll dispatched on
            // `window` has a non-Node target, and Node.contains() THROWS on one.
            const target = event.target;
            if (target instanceof Node && (panelRef.current?.contains(target) || layer.insideLayerAbove(target)))
                return;
            follow('scroll');
        };
        const onResize = () => follow('resize');
        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        return () => {
            document.removeEventListener('mousedown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [anchorRef, onDismiss, layer, place]);
    return createPortal(_jsx("div", { ref: panelRef, id: id, tabIndex: tabIndex, 
        // Focus moving into a layer above (a Modal opened from this panel) isn't leaving it.
        onBlur: (e) => {
            const next = e.relatedTarget;
            if (next instanceof Node && layer.insideLayerAbove(next))
                return;
            onBlur?.(e);
        }, onKeyDown: onKeyDown, role: role, "aria-label": ariaLabel, className: cn(SURFACE, opaque && OPAQUE, className), onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, style: {
            position: 'fixed',
            // Rendered off-screen for the first measuring pass so it never flashes
            // at the wrong spot.
            top: pos?.top ?? -9999,
            bottom: pos?.bottom ?? 'auto',
            left: pos?.left ?? -9999,
            width,
            zIndex: zFloatingPanel(),
            padding: flush ? 0 : '10px 12px',
            // Measured against the anchor's own position — see the layout effect.
            maxHeight: pos?.maxHeight ?? '60vh',
            overflowY: 'auto',
        }, children: _jsx(FloatingLayerContext.Provider, { value: layer.layer, children: children }) }), document.body);
};
