import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { assignRef } from './assignRef.js';
const GAP = 6;
// Fixed, on the tooltip layer: above modals (--z-modal) and popovers (--z-popover), so above
// every overlay, the account switcher's dropdown included.
/** The bubble's look, for a tooltip a product positions itself (the side panel's icon-button and
 *  `title` tooltips). Add `whitespace-nowrap` for one line, or the `wrap` style for several.
 *  Tailwind classes on DS tokens: the product's Tailwind must scan this file (an `@source` line for
 *  `packages/ui/src/Tooltip.tsx`), or the bubble renders unstyled. */
export const TOOLTIP_BUBBLE_CLASS = [
    'fixed z-[var(--z-tooltip,3000)] pointer-events-none',
    'px-[var(--space-lg)] py-[var(--space-md)] rounded-[var(--radius-md)]',
    '[background:var(--color-bg-primary)] [color:var(--color-text-primary)]',
    'border border-solid [border-color:var(--color-border-medium)] [box-shadow:var(--shadow-card-hover-tight)]',
    '[font-family:var(--font-sans)] text-[length:var(--text-sm)] leading-[1.4]',
].join(' ');
const POPOVER = `${TOOLTIP_BUBBLE_CLASS} whitespace-nowrap`;
const VIEWPORT_MARGIN = 4;
/** Several lines, up to 380px, never wider than the viewport (a narrow side panel). */
export const TOOLTIP_WRAP_STYLE = {
    whiteSpace: 'normal',
    // max-content before the cap, or the box shrink-fits to the space left of the viewport edge.
    width: 'max-content',
    maxWidth: `min(380px, calc(100vw - ${2 * VIEWPORT_MARGIN}px))`,
    lineHeight: 1.5,
};
/** `:focus-visible`, read on the element that holds focus: the trigger, or a control inside it
 *  when the trigger is a wrapper. A synthetic focus event on an element that doesn't hold focus
 *  (tests), or a browser without the selector, counts as keyboard focus. */
function isKeyboardFocus(el) {
    if (el.ownerDocument.activeElement !== el)
        return true;
    try {
        return el.matches(':focus-visible');
    }
    catch {
        return true;
    }
}
export const Tooltip = ({ label, children, wrap, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({
        top: 0,
        left: 0,
        placement: 'above',
    });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    /** Pointer over the trigger, or keyboard focus on it: a label change then reopens the tooltip. */
    const engagedRef = useRef(false);
    const prevLabelRef = useRef(label);
    const show = useCallback(() => {
        const el = triggerRef.current;
        if (!el || disabled)
            return;
        const rect = el.getBoundingClientRect();
        // Initial guess. useLayoutEffect below re-measures and clamps once mounted.
        const placeAbove = rect.top >= 32;
        setPos({
            top: placeAbove ? rect.top - GAP : rect.bottom + GAP,
            left: rect.left + rect.width / 2,
            placement: placeAbove ? 'above' : 'below',
        });
        setOpen(true);
    }, [disabled]);
    useEffect(() => {
        if (disabled)
            setOpen(false);
    }, [disabled]);
    const hide = useCallback(() => setOpen(false), []);
    // A click hides the tooltip (see onClick below). When the click then changes
    // the label ("Copy" → "Copied") while the pointer is still on the trigger,
    // show the new label: otherwise that confirmation is never seen.
    useEffect(() => {
        if (prevLabelRef.current === label)
            return;
        prevLabelRef.current = label;
        if (engagedRef.current)
            show();
    }, [label, show]);
    // After the popover renders, measure it and clamp inside the viewport. Flip
    // below the trigger if the chosen placement actually overflows the top.
    useLayoutEffect(() => {
        if (!open)
            return;
        const pop = popoverRef.current;
        const trigger = triggerRef.current;
        if (!pop || !trigger)
            return;
        const triggerRect = trigger.getBoundingClientRect();
        const popRect = pop.getBoundingClientRect();
        let placement = pos.placement;
        if (placement === 'above' && triggerRect.top - popRect.height - GAP < VIEWPORT_MARGIN) {
            placement = 'below';
        }
        const top = placement === 'above' ? triggerRect.top - GAP : triggerRect.bottom + GAP;
        const centerX = triggerRect.left + triggerRect.width / 2;
        const halfWidth = popRect.width / 2;
        const minLeft = VIEWPORT_MARGIN + halfWidth;
        const maxLeft = window.innerWidth - VIEWPORT_MARGIN - halfWidth;
        const left = Math.min(Math.max(centerX, minLeft), maxLeft);
        if (top !== pos.top || left !== pos.left || placement !== pos.placement) {
            setPos({ top, left, placement });
        }
    }, [open, pos.top, pos.left, pos.placement]);
    if (!isValidElement(children))
        return children;
    // Read ref from props, not element.ref (React 19).
    const childProps = children.props;
    const setTriggerRef = (el) => {
        triggerRef.current = el;
        assignRef(childProps.ref, el);
    };
    const cloned = cloneElement(children, {
        ref: setTriggerRef,
        /** Marks the trigger, so a product's own page-wide tooltip (the side panel's
         *  IconButtonTooltips) leaves it and what's inside it to this one. */
        'data-tooltip-trigger': '',
        onMouseEnter: (e) => {
            engagedRef.current = true;
            show();
            childProps.onMouseEnter?.(e);
        },
        onMouseLeave: (e) => {
            engagedRef.current = false;
            hide();
            childProps.onMouseLeave?.(e);
        },
        /** Keyboard focus only. Focus moved by code (a dialog focusing its Close on
         *  open) or by a click isn't `:focus-visible`, and popping a label then
         *  covers what just opened. */
        onFocus: (e) => {
            if (isKeyboardFocus(e.target)) {
                engagedRef.current = true;
                show();
            }
            childProps.onFocus?.(e);
        },
        onBlur: (e) => {
            engagedRef.current = false;
            hide();
            childProps.onBlur?.(e);
        },
        /** A trigger that opens an overlay never receives `mouseleave`, because the
         *  overlay covers it before the pointer moves — so the tooltip stays on
         *  screen over the thing that just opened. */
        onClick: (e) => {
            hide();
            childProps.onClick?.(e);
        },
    });
    return (_jsxs(_Fragment, { children: [cloned, open && !disabled &&
                createPortal(_jsx("div", { ref: popoverRef, role: "tooltip", className: (wrap ? TOOLTIP_BUBBLE_CLASS : POPOVER) +
                        (pos.placement === 'above' ? ' [transform:translate(-50%,-100%)]' : ' [transform:translate(-50%,0%)]'), "data-placement": pos.placement, "data-ui": "tooltip", style: wrap ? { top: pos.top, left: pos.left, ...TOOLTIP_WRAP_STYLE } : { top: pos.top, left: pos.left }, children: label }), document.body)] }));
};
export default Tooltip;
