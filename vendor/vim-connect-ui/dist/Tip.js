'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnchoredPanel } from './AnchoredPanel.js';
import { Button } from './Button.js';
import { zFloatingPanel } from './floatingLayersShared.js';
import { TipMark } from './TipMark.js';
/** Room around the target inside the cut-out, so its ring is not blurred. */
const HOLE_PAD = 6;
/** The ring on the target while a spotlight Tip is open (the Tip sets `data-tip-active` on it). */
const TIP_CSS = `
[data-tip-active] { border-radius: var(--vc-tip-radius, 9999px); box-shadow: 0 0 0 2px var(--color-cyan-40), var(--shadow-focus); }
@media (prefers-reduced-motion: no-preference) {
  [data-tip-active] { animation: vc-tip-ring 1.8s ease-in-out infinite; }
}
@keyframes vc-tip-ring { 50% { box-shadow: 0 0 0 2px var(--color-cyan-40), 0 0 0 7px rgba(108, 205, 239, 0.12); } }
`;
/**
 * The anchor's viewport rect, kept current every frame while `active`: layout can move it without
 * resizing it (a side nav that finishes loading), which a ResizeObserver never reports.
 */
function useAnchorRect(anchorRef, active) {
    const [rect, setRect] = useState(null);
    useEffect(() => {
        if (!active)
            return;
        let frame = 0;
        const tick = () => {
            const el = anchorRef.current;
            if (el) {
                const r = el.getBoundingClientRect();
                setRect((prev) => prev && prev.left === r.left && prev.top === r.top && prev.width === r.width && prev.height === r.height ? prev : r);
            }
            frame = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(frame);
    }, [anchorRef, active]);
    return rect;
}
/**
 * A pointer to something that moved or is new (DS → Tip): a card under the target with an animated
 * `TipMark`, a title, a sentence and a pill accent button; with `spotlight` the rest of the page sits under a
 * white veil (page colour at ~48%, 1.5px blur) with a pill-shaped cut-out around the target, which keeps
 * a pulsing cyan ring and stays clickable. Escape, the button or a press on the veil dismisses. Controlled:
 * it shows while `open`, and the caller decides when it has been seen. One per screen, first visit only.
 */
export function Tip({ anchorRef, open, onDismiss, title, children, mark = _jsx(TipMark, {}), actionLabel = 'Got it', spotlight = true, width = 300, radius, }) {
    // The anchor is set after the first commit, so open the panel on the next one.
    const [anchored, setAnchored] = useState(false);
    useEffect(() => setAnchored(true), []);
    // Ring the target while the tip points at it.
    useEffect(() => {
        const el = anchorRef.current;
        if (!open || !spotlight || !el)
            return;
        el.setAttribute('data-tip-active', '');
        if (radius !== undefined)
            el.style.setProperty('--vc-tip-radius', `${radius}px`);
        return () => {
            el.removeAttribute('data-tip-active');
            el.style.removeProperty('--vc-tip-radius');
        };
    }, [open, spotlight, anchorRef, anchored, radius]);
    const rect = useAnchorRect(anchorRef, open && anchored);
    if (!open || !anchored)
        return null;
    return (_jsxs(_Fragment, { children: [spotlight && rect && _jsx(Veil, { hole: rect, radius: radius, onDismiss: onDismiss }), _jsx(AnchoredPanel
            // The measured rect (not the element) so the card is placed again whenever the anchor moves,
            // without remounting it (which would restart the mark and drop focus).
            , { 
                // The measured rect (not the element) so the card is placed again whenever the anchor moves,
                // without remounting it (which would restart the mark and drop focus).
                anchor: rect ?? undefined, anchorRef: rect ? undefined : anchorRef, align: "start", width: Math.min(width, window.innerWidth - 16), ariaLabel: title, closeOnOutsideClick: false, onDismiss: (reason) => {
                    if (reason === 'escape')
                        onDismiss();
                }, children: _jsxs("div", { className: "flex flex-col gap-[var(--space-md)]", "data-ui": "tip", children: [_jsxs("div", { className: "flex items-center gap-[var(--space-sm)]", children: [mark, _jsxs("div", { className: "flex min-w-0 flex-col gap-[var(--space-xs)]", children: [_jsx("h3", { className: "m-0 [font-size:var(--text-base)] [font-weight:var(--font-semibold)] [color:var(--color-text-primary)]", children: title }), _jsx("p", { className: "m-0 [font-size:var(--text-sm)] [color:var(--color-text-secondary)]", children: children })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "accent", size: "sm", shape: "pill", onClick: onDismiss, children: actionLabel }) })] }) }), _jsx("style", { href: "vc-tip-ring", precedence: "default", children: TIP_CSS })] }));
}
/**
 * The veil: page colour at ~48% with a 1.5px blur over the viewport, minus a pill cut-out around the
 * anchor. The cut-out is a clip-path hole, so the anchor stays sharp and still takes clicks.
 */
function Veil({ hole, radius, onDismiss }) {
    const x = hole.left - HOLE_PAD;
    const y = hole.top - HOLE_PAD;
    const w = hole.width + HOLE_PAD * 2;
    const h = hole.height + HOLE_PAD * 2;
    const r = Math.min(radius === undefined ? h / 2 : radius + HOLE_PAD, h / 2);
    // Full-viewport rectangle, then the pill-shaped hole; evenodd leaves the hole empty.
    const path = `M0 0H${window.innerWidth}V${window.innerHeight}H0Z ` +
        `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
        `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    return createPortal(_jsx("div", { "data-ui": "tip-veil", className: "fixed inset-0 [background:color-mix(in_srgb,var(--color-bg-primary)_48%,transparent)] [backdrop-filter:blur(1.5px)]", style: { clipPath: `path(evenodd, '${path}')`, zIndex: zFloatingPanel(-1) }, onMouseDown: onDismiss }), document.body);
}
