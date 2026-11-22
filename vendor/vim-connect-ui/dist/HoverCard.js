'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef } from 'react';
import { AnchoredPanel } from './AnchoredPanel.js';
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
 */
export function HoverCard({ label, content, children, width = 268, disabled = false, className, panelClassName, onOpenChange, panelLabel, opaque }) {
    const anchorRef = useRef(null);
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
    const dismiss = useCallback(() => {
        const focusWasInside = bodyRef.current?.contains(document.activeElement) ?? false;
        openedByKey.current = false;
        close();
        if (focusWasInside)
            anchorRef.current?.focus();
    }, [close]);
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
            anchorRef.current?.focus();
        }
        else if (!event.shiftKey && atEnd) {
            event.preventDefault();
            openedByKey.current = false;
            close();
            nextTabbableAfter(anchorRef.current)?.focus();
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("span", { ref: anchorRef, "data-ui": "hover-card-trigger", tabIndex: 0, role: "button", "aria-label": label, "aria-haspopup": "dialog", "aria-expanded": open, onKeyDown: (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openedByKey.current = !card.open;
                        card.toggle();
                    }
                }, onMouseEnter: () => {
                    openedByKey.current = false;
                    card.show();
                }, onMouseLeave: card.scheduleClose, 
                // A click or tap opens it (touch has no hover). Open only, never toggle: a real
                // pointer hovers before it clicks, so a toggle would shut what the hover opened.
                // An outside click, Escape or leaving the card closes it.
                onClick: () => {
                    if (!card.open)
                        openedByKey.current = false;
                    card.show();
                }, onBlur: (event) => {
                    if (leavesCard(event.relatedTarget))
                        card.scheduleClose();
                }, className: cn('inline-flex rounded-[var(--radius-sm)] outline-none focus-visible:[box-shadow:var(--shadow-focus)]', className), children: children }), open && (_jsx(AnchoredPanel, { anchorRef: anchorRef, onDismiss: dismiss, width: width, ariaLabel: panelLabel ?? label, opaque: opaque, onMouseEnter: card.show, onMouseLeave: card.scheduleClose, className: cn('text-[length:var(--text-base)] leading-[1.5]', panelClassName), onBlur: (event) => {
                    if (leavesCard(event.relatedTarget)) {
                        openedByKey.current = false;
                        card.close();
                    }
                }, children: _jsx("div", { ref: bodyRef, tabIndex: -1, className: "outline-none", onKeyDown: onCardKeyDown, children: typeof content === 'function' ? content(dismiss) : content }) }))] }));
}
