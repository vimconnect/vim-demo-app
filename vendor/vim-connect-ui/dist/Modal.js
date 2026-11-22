'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button.js';
import { Tooltip } from './Tooltip.js';
import { CloseGlyph } from './CloseGlyph.js';
import { Scrim } from './Scrim.js';
import { cn } from './cn.js';
import { FloatingLayerContext, useFloatingLayer } from './floatingLayers.js';
const ICON_TONE = {
    info: '[background:var(--color-cyan-15)] [color:var(--color-blue)]',
    warning: '[background:color-mix(in_srgb,var(--color-warning)_15%,transparent)] [color:var(--color-warning-text-strong)]',
    danger: '[background:color-mix(in_srgb,var(--color-error)_15%,transparent)] [color:var(--color-error-text)]',
    success: '[background:color-mix(in_srgb,var(--color-success)_15%,transparent)] [color:var(--color-success-dark)]',
    purple: '[background:var(--color-purple-12)] [color:var(--color-purple-text)]',
};
// On the shared Scrim: the layer and the centring of the sheet on it.
const OVERLAY = 'z-[var(--z-modal)] flex items-center justify-center p-[var(--space-lg)]';
const SHEET = [
    'relative flex flex-col w-full outline-none',
    '[font-family:var(--font-sans)] [color:var(--color-text-primary)]',
    'rounded-[var(--radius-xl)] [background:var(--color-bg-primary)]',
    'border border-solid [border-color:var(--color-border-light)] [box-shadow:0_20px_60px_rgba(0,0,0,0.18)]',
].join(' ');
/** Header / footer divider: halfway between the light and medium border tokens, so it shows on the dark sheet. */
const DIVIDER = '[border-color:color-mix(in_srgb,var(--color-border-light)_50%,var(--color-border-medium))]';
const HEADER = [
    'flex shrink-0 items-center gap-[var(--space-md)] px-[24px] pt-[20px] pb-[16px]',
    'border-0 border-b border-solid',
    DIVIDER,
].join(' ');
const ICON_TILE = [
    'flex shrink-0 items-center justify-center size-[40px] rounded-[var(--radius-md)]',
    'border border-solid [border-color:color-mix(in_srgb,currentColor_30%,transparent)]',
    '[&_svg]:size-[20px]',
].join(' ');
const TITLE = [
    'flex items-center gap-[var(--space-sm)] m-0 mb-[2px] min-w-0',
    '[font-family:var(--font-title)] text-[length:var(--text-xl)] [font-weight:var(--font-bold)] leading-[1.3]',
].join(' ');
const SUBTITLE = 'm-0 text-[length:var(--text-sm)] leading-[1.5] [color:var(--color-text-muted)]';
const BODY = 'flex-[1_1_auto] min-h-0 p-[24px]';
const FOOTER = [
    'flex shrink-0 flex-wrap items-center justify-end gap-[10px] px-[24px] py-[var(--space-lg)]',
    '[&>*]:max-w-full',
    '[background:var(--color-bg-primary)] rounded-b-[var(--radius-xl)]',
    'border-0 border-t border-solid',
    DIVIDER,
].join(' ');
export function Modal({ onClose, title, subtitle, icon, titleAddon, footer, children, maxWidth = 560, scroll = false, closeOnBackdrop = false, ariaLabel, className, bodyClassName, iconTone = 'info', busy = false, initialFocusRef, headerAside, testId, }) {
    const titleId = useId();
    const sheetRef = useRef(null);
    const overlayRef = useRef(null);
    // In the floating-layer stack, so a Popover under it leaves Escape and clicks in it to the modal.
    const layer = useFloatingLayer(true, (node) => !!overlayRef.current?.contains(node));
    const busyRef = useRef(busy);
    busyRef.current = busy;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const requestClose = () => {
        if (!busyRef.current)
            onCloseRef.current();
    };
    // Escape closes the top modal only, unless an inner control (an open Select, a
    // picker) already handled it. Listens on `document` and stops the event once
    // handled, so a window-level Escape listener underneath (a drawer, a page
    // shortcut) doesn't also fire. Other open modals hear it too (same target) but
    // ignore it: only the top of the stack acts.
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing)
                return;
            if (!layer.isTop())
                return;
            e.preventDefault();
            e.stopPropagation();
            requestClose();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Move focus into the dialog, and give it back to whatever opened it on close.
    useEffect(() => {
        const previous = document.activeElement;
        const sheet = sheetRef.current;
        const target = initialFocusRef?.current;
        if (target)
            target.focus({ preventScroll: true });
        else if (sheet && !sheet.contains(document.activeElement))
            sheet.focus({ preventScroll: true });
        return () => {
            if (previous && document.contains(previous))
                previous.focus({ preventScroll: true });
        };
    }, []);
    return createPortal(_jsx(Scrim, { ref: overlayRef, className: OVERLAY, "data-modal-overlay": "", onDismiss: closeOnBackdrop ? requestClose : undefined, children: _jsx(FloatingLayerContext.Provider, { value: layer.layer, children: _jsxs("div", { ref: sheetRef, role: "dialog", "aria-modal": "true", "aria-label": ariaLabel, "aria-labelledby": ariaLabel ? undefined : titleId, tabIndex: -1, "data-testid": testId, "data-ui": "modal", className: cn(SHEET, scroll && 'max-h-full overflow-hidden', className), style: { maxWidth }, children: [_jsxs("div", { className: HEADER, children: [icon && (_jsx("div", { className: cn(ICON_TILE, ICON_TONE[iconTone]), "aria-hidden": "true", children: icon })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("h2", { id: titleId, className: TITLE, children: [_jsx("span", { className: "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", children: title }), titleAddon] }), subtitle && _jsx("p", { className: SUBTITLE, children: subtitle })] }), headerAside && _jsx("div", { className: "flex shrink-0 items-center gap-[var(--space-sm)]", children: headerAside }), _jsx(Tooltip, { label: "Close", children: _jsx(Button, { variant: "ghost", iconOnly: true, "aria-label": "Close", onClick: requestClose, disabled: busy, className: "shrink-0", children: _jsx(CloseGlyph, {}) }) })] }), _jsx("div", { className: cn(BODY, scroll ? 'overflow-y-auto' : 'overflow-visible', bodyClassName), children: children }), footer && _jsx("div", { className: FOOTER, children: footer })] }) }) }), document.body);
}
