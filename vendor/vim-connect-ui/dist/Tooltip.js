'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { assignRef } from './assignRef.js';
import { TOOLTIP_BUBBLE_CLASS, TOOLTIP_WRAP_STYLE, VIEWPORT_MARGIN } from './tooltipShared.js';
const GAP = 6;
const POPOVER = `${TOOLTIP_BUBBLE_CLASS} whitespace-nowrap`;
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
