'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnchoredPanel } from './AnchoredPanel.js';
import { cn } from './cn.js';
import { assignRef } from './assignRef.js';
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** A wrapper's props onto the trigger's: handlers chain (outer first), classes and descriptions join, else the trigger's win. */
function mergeProps(outer, inner) {
    const out = { ...outer, ...inner };
    for (const key of Object.keys(outer)) {
        const a = outer[key];
        const b = inner[key];
        if ((key === 'className' || key === 'aria-describedby') && typeof a === 'string' && typeof b === 'string') {
            out[key] = key === 'className' ? cn(a, b) : `${a} ${b}`;
            continue;
        }
        if (/^on[A-Z]/.test(key) && typeof a === 'function' && typeof b === 'function') {
            out[key] = (...args) => {
                a(...args);
                b(...args);
            };
        }
    }
    return out;
}
/**
 * Popover (DS → Popover): a click-opened floating panel on the DS floating surface,
 * for settings, a short form or a few actions. Hover detail is a `HoverCard`; a
 * blocking task is a `Modal`.
 */
export function Popover({ children, content, label, width = 280, align = 'start', side = 'below', flush = false, open: openProp, defaultOpen = false, onOpenChange, panelClassName, panelRole = 'dialog', ref: outerRef, ...passThrough }) {
    const [openState, setOpenState] = useState(defaultOpen);
    const open = openProp ?? openState;
    const anchorRef = useRef(null);
    const panelId = useId();
    const setOpen = useCallback((next) => {
        if (openProp === undefined)
            setOpenState(next);
        onOpenChange?.(next);
    }, [openProp, onOpenChange]);
    const close = useCallback(() => setOpen(false), [setOpen]);
    // Focus into the panel on open: its first control, else the panel itself.
    useEffect(() => {
        if (!open)
            return;
        const frame = requestAnimationFrame(() => {
            const panel = document.getElementById(panelId);
            (panel?.querySelector(FOCUSABLE) ?? panel)?.focus();
        });
        return () => cancelAnimationFrame(frame);
    }, [open, panelId]);
    const onDismiss = useCallback((reason) => {
        close();
        if (reason === 'escape')
            anchorRef.current?.focus();
    }, [close]);
    const trigger = React.Children.only(children);
    const { ref: triggerRef, ...triggerProps } = trigger.props; // React 19: a ref is a prop.
    const merged = mergeProps(passThrough, triggerProps);
    const setAnchor = (el) => {
        anchorRef.current = el;
        assignRef(triggerRef, el);
        assignRef(outerRef, el);
    };
    return (_jsxs(_Fragment, { children: [React.cloneElement(trigger, {
                ...merged,
                ref: setAnchor,
                'aria-haspopup': panelRole,
                'aria-expanded': open,
                'aria-controls': open ? panelId : undefined,
                onClick: (e) => {
                    merged.onClick?.(e);
                    if (!e.defaultPrevented)
                        setOpen(!open);
                },
            }), open && (_jsx(AnchoredPanel, { id: panelId, anchorRef: anchorRef, onDismiss: onDismiss, width: width, ariaLabel: label, align: align, prefer: side, flush: flush, tabIndex: -1, role: panelRole, className: cn('focus:outline-none', panelClassName), onKeyDown: (e) => {
                    if (e.defaultPrevented)
                        return;
                    if (panelRole === 'menu') {
                        const items = Array.from(e.currentTarget.querySelectorAll('[role="menuitem"]'));
                        const i = items.indexOf(document.activeElement);
                        const go = (n) => {
                            e.preventDefault();
                            items[(n + items.length) % items.length]?.focus();
                        };
                        if (e.key === 'ArrowDown')
                            go(i + 1);
                        else if (e.key === 'ArrowUp')
                            go(i < 0 ? items.length - 1 : i - 1);
                        else if (e.key === 'Home')
                            go(0);
                        else if (e.key === 'End')
                            go(items.length - 1);
                        else if (e.key === 'Tab') {
                            // A menu isn't a Tab stop: close, and let Tab continue from the trigger.
                            anchorRef.current?.focus();
                            close();
                        }
                        return;
                    }
                    // Tab past either end goes back through the trigger, so focus continues from it, not the page's end.
                    if (e.key !== 'Tab')
                        return;
                    const panel = e.currentTarget;
                    const items = Array.from(panel.querySelectorAll(FOCUSABLE));
                    const atEnd = e.shiftKey
                        ? document.activeElement === panel || document.activeElement === items[0]
                        : document.activeElement === panel || document.activeElement === items[items.length - 1];
                    if (!atEnd)
                        return;
                    if (e.shiftKey)
                        e.preventDefault();
                    anchorRef.current?.focus();
                    close();
                }, onBlur: (e) => {
                    // Tabbing out of the panel closes it; clicks are AnchoredPanel's.
                    const next = e.relatedTarget;
                    if (next && !e.currentTarget.contains(next) && !anchorRef.current?.contains(next))
                        close();
                }, children: typeof content === 'function' ? content(close) : content }))] }));
}
