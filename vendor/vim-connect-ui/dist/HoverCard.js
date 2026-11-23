'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useId, useRef } from 'react';
import { AnchoredPanel } from './AnchoredPanel.js';
import { assignRef } from './assignRef.js';
import { useHoverPanel } from './useHoverPanel.js';
import { cn } from './cn.js';
const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** The next element in the page's Tab order after `el`, skipping anything inside floating panels. */
function nextTabbableAfter(el) {
    if (!el)
        return null;
    const all = Array.from(document.querySelectorAll(TABBABLE)).filter((node) => node === el || !node.closest('.anchored-panel, [hidden], [aria-hidden="true"], [inert]'));
    const index = all.indexOf(el);
    return index >= 0 ? all[index + 1] ?? null : null;
}
/**
 * A small floating card of detail you can act on (a title, a badge, a link)
 * about the thing under the pointer. Plain text, even a few lines, is a
 * `Tooltip` with `wrap`.
 *
 * Pointer: opens on hover, with a grace period to cross into the card; a click
 * or tap opens it too (touch has no hover).
 * Keyboard: Enter / Space on the trigger opens it and moves focus into the
 * card, so Tab reaches its links; focus leaving the card closes it, and Escape
 * closes it and returns focus to the trigger. Focus alone doesn't open it.
 *
 * `asChild` makes the child (a link, a button) the trigger instead of the
 * wrapper: it keeps its own click and keys, the card opens on its focus as
 * well as hover, and Tab from it enters an open card. `panelRole="tooltip"`
 * turns the card into the trigger's description (a definition).
 */
export function HoverCard({ label, content, children, width = 268, disabled = false, className, panelClassName, onOpenChange, panelLabel, opaque, asChild = false, openOnFocus = asChild, panelRole = 'dialog', }) {
    const anchorRef = useRef(null);
    const panelId = useId();
    /** Set while the card hands focus back to the trigger, so that focus doesn't reopen it. */
    const refocusing = useRef(false);
    const bodyRef = useRef(null);
    const openedByKey = useRef(false);
    const card = useHoverPanel();
    const open = card.open && !disabled;
    useEffect(() => {
        if (open && openedByKey.current)
            bodyRef.current?.focus();
    }, [open]);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const reported = useRef(false);
    // A card that becomes disabled while open closes, rather than waiting hidden: when a
    // newer card takes over, this one must not come back (and pull focus) once that one
    // closes. Only on the change to disabled, so a card asked for while disabled can
    // still appear once it's enabled.
    const wasDisabled = useRef(disabled);
    useEffect(() => {
        if (disabled && !wasDisabled.current && card.open) {
            openedByKey.current = false;
            card.close();
        }
        wasDisabled.current = disabled;
    }, [disabled, card]);
    const wanted = card.open;
    useEffect(() => {
        if (wanted === reported.current)
            return;
        reported.current = wanted;
        onOpenChangeRef.current?.(wanted);
    }, [wanted]);
    const leavesCard = (next) => !(next instanceof Node) || !(bodyRef.current?.contains(next) || anchorRef.current?.contains(next));
    const { close } = card;
    const focusTrigger = useCallback(() => {
        refocusing.current = true;
        anchorRef.current?.focus();
        refocusing.current = false;
    }, []);
    const dismiss = useCallback(() => {
        const focusWasInside = bodyRef.current?.contains(document.activeElement) ?? false;
        openedByKey.current = false;
        close();
        if (focusWasInside)
            focusTrigger();
    }, [close, focusTrigger]);
    // The card is portalled to the end of the page, so the browser's own Tab order
    // would leave it for the page's end. Hand focus back to the trigger's place.
    const onCardKeyDown = (event) => {
        if (event.key !== 'Tab' || !bodyRef.current)
            return;
        const items = Array.from(bodyRef.current.querySelectorAll(TABBABLE));
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        const atStart = active === bodyRef.current || active === first;
        const atEnd = !last || active === last;
        if (event.shiftKey && atStart) {
            event.preventDefault();
            dismiss();
            focusTrigger();
        }
        else if (!event.shiftKey && atEnd) {
            event.preventDefault();
            openedByKey.current = false;
            close();
            nextTabbableAfter(anchorRef.current)?.focus();
        }
    };
    const onTriggerMouseEnter = () => {
        openedByKey.current = false;
        card.show();
    };
    const onTriggerFocus = () => {
        if (!openOnFocus || refocusing.current)
            return;
        openedByKey.current = false;
        card.show();
    };
    const onTriggerBlur = (event) => {
        if (leavesCard(event.relatedTarget))
            card.scheduleClose();
    };
    const describes = panelRole === 'tooltip';
    const popupAria = describes
        ? {}
        : { 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? panelId : undefined };
    let trigger;
    if (asChild && React.isValidElement(children)) {
        // React 19: a ref is a prop.
        const child = children;
        const own = child.props;
        const call = (handler, event) => handler?.(event);
        const describedBy = [own['aria-describedby'], describes && open ? panelId : undefined].filter(Boolean).join(' ') || undefined;
        trigger = React.cloneElement(child, {
            ...popupAria,
            ref: (el) => {
                anchorRef.current = el;
                assignRef(own.ref, el);
            },
            'data-hover-card-trigger': '',
            'aria-describedby': describedBy,
            onMouseEnter: (e) => {
                call(own.onMouseEnter, e);
                onTriggerMouseEnter();
            },
            onMouseLeave: (e) => {
                call(own.onMouseLeave, e);
                card.scheduleClose();
            },
            onFocus: (e) => {
                call(own.onFocus, e);
                onTriggerFocus();
            },
            onBlur: (e) => {
                call(own.onBlur, e);
                onTriggerBlur(e);
            },
            // Tab from the trigger goes into an open card that holds links or buttons.
            onKeyDown: (e) => {
                call(own.onKeyDown, e);
                if (e.defaultPrevented || e.key !== 'Tab' || e.shiftKey || !open || describes)
                    return;
                const first = bodyRef.current?.querySelector(TABBABLE);
                if (!first)
                    return;
                e.preventDefault();
                first.focus();
            },
        });
    }
    else {
        trigger = (_jsx("span", { ref: anchorRef, "data-ui": "hover-card-trigger", tabIndex: 0, role: "button", "aria-label": label, ...(describes ? { 'aria-describedby': open ? panelId : undefined } : { 'aria-haspopup': 'dialog', 'aria-expanded': open }), onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openedByKey.current = !card.open;
                    card.toggle();
                }
            }, onMouseEnter: onTriggerMouseEnter, onMouseLeave: card.scheduleClose, onFocus: onTriggerFocus, 
            // A click or tap opens it (touch has no hover). Open only, never toggle: a real
            // pointer hovers before it clicks, so a toggle would shut what the hover opened.
            // An outside click, Escape or leaving the card closes it.
            onClick: () => {
                if (!card.open)
                    openedByKey.current = false;
                card.show();
            }, onBlur: onTriggerBlur, className: cn('inline-flex rounded-[var(--radius-sm)] outline-none focus-visible:[box-shadow:var(--shadow-focus)]', className), children: children }));
    }
    return (_jsxs(_Fragment, { children: [trigger, open && (_jsx(AnchoredPanel, { id: panelId, role: panelRole, anchorRef: anchorRef, onDismiss: dismiss, width: width, ariaLabel: describes ? undefined : panelLabel ?? label, opaque: opaque, onMouseEnter: card.show, onMouseLeave: card.scheduleClose, className: cn('text-[length:var(--text-base)] leading-[1.5]', panelClassName), onBlur: (event) => {
                    if (leavesCard(event.relatedTarget)) {
                        openedByKey.current = false;
                        card.close();
                    }
                }, children: _jsx("div", { ref: bodyRef, tabIndex: -1, className: "outline-none", onKeyDown: onCardKeyDown, children: typeof content === 'function' ? content(dismiss) : content }) }))] }));
}
