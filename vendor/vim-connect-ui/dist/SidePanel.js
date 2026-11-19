import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button.js';
import { CloseGlyph } from './CloseGlyph.js';
import { Tooltip } from './Tooltip.js';
import { cn } from './cn.js';
import { Scrim } from './Scrim.js';
import { FloatingLayerContext, useFloatingLayer } from './floatingLayers.js';
const SidePanelContext = createContext(null);
const DEFAULT_WIDTH = 'min(460px, 100vw)';
// Just under --z-modal: above page dropdowns and sticky bars, below a Modal opened from the panel.
const Z_BACKDROP = 'z-[calc(var(--z-modal)-2)]';
const Z_PANEL = 'z-[calc(var(--z-modal)-1)]';
// The DS Side Panel surface: card ground and a left hairline, in both themes. No shadow: the
// card glow spread above the panel's top edge, over the top bar.
const PANEL = [
    `fixed right-0 ${Z_PANEL} flex flex-col transition-transform duration-200 motion-reduce:transition-none`,
    '[background:var(--color-bg-card)] border-0 border-l border-solid [border-color:var(--color-border-medium)]',
].join(' ');
/**
 * Side Panel (DS → Side Panel): a right-edge slide-in drawer on the DS card surface.
 * It owns the portal, position, width, surface, slide, backdrop and Escape; the
 * header, body and footer are the caller's `children`, normally `SidePanelHeader`,
 * `SidePanelBody` and `SidePanelFooter`.
 *
 * Portals to `document.body` so a page's stacking context can't trap it. It joins
 * the floating-layer stack, so Escape closes the top-most surface first (a Select
 * open inside the panel closes before the panel does).
 *
 * The exit slide only runs while the caller keeps rendering `<SidePanel isOpen={false} />`;
 * mounting it only while open still slides in.
 */
export function SidePanel({ isOpen, onClose, children, width = DEFAULT_WIDTH, showBackdrop = true, closeOnEscape = true, topOffset = 0, role = 'dialog', ariaLabel, panelClassName, panelStyle, }) {
    // First paint must be closed so an already-open mount still slides in.
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (isOpen) {
            const raf = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(raf);
        }
        setVisible(false);
        return undefined;
    }, [isOpen]);
    const titleId = useId();
    const [titleCount, setTitleCount] = useState(0);
    const panelRef = useRef(null);
    const layer = useFloatingLayer(isOpen, (node) => !!panelRef.current?.contains(node));
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const context = useMemo(() => ({
        titleId,
        registerTitle: () => {
            setTitleCount((n) => n + 1);
            return () => setTitleCount((n) => n - 1);
        },
        onClose: () => onCloseRef.current(),
    }), [titleId]);
    useEffect(() => {
        if (!isOpen || !closeOnEscape)
            return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && layer.isTop())
                onCloseRef.current();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, closeOnEscape, layer]);
    return createPortal(_jsxs(FloatingLayerContext.Provider, { value: layer.layer, children: [showBackdrop && isOpen && (_jsx(Scrim, { "data-ui": "side-panel-backdrop", className: Z_BACKDROP, style: { top: topOffset }, onDismiss: onClose })), _jsx("div", { ref: panelRef, "data-ui": "side-panel", "data-state": isOpen ? 'open' : 'closed', role: role, "aria-modal": showBackdrop || undefined, "aria-label": ariaLabel, "aria-labelledby": ariaLabel || titleCount === 0 ? undefined : titleId, className: cn(PANEL, visible ? 'translate-x-0' : 'translate-x-full', panelClassName), style: { width, top: topOffset, height: `calc(100% - ${topOffset}px)`, ...panelStyle }, children: _jsx(SidePanelContext.Provider, { value: context, children: children }) })] }), document.body);
}
// Same divider as the Modal header and footer: halfway between the light and medium borders.
const DIVIDER = '[border-color:color-mix(in_srgb,var(--color-border-light)_50%,var(--color-border-medium))]';
const HEADER = [
    'flex shrink-0 items-center gap-[var(--space-md)] px-[var(--space-2xl)] py-[var(--space-lg)]',
    'border-0 border-b border-solid',
    DIVIDER,
].join(' ');
const TITLE = [
    'flex items-center gap-[var(--space-sm)] m-0 min-w-0',
    '[font-family:var(--font-title)] text-[length:var(--text-xl)] [font-weight:var(--font-bold)] leading-[1.3]',
    '[color:var(--color-text-primary)]',
].join(' ');
const SUBTITLE = 'm-0 mt-[2px] text-[length:var(--text-sm)] leading-[1.5] [color:var(--color-text-muted)]';
const BODY = 'flex-[1_1_auto] min-h-0 overflow-y-auto px-[var(--space-2xl)] py-[var(--space-xl)]';
const FOOTER = [
    'flex shrink-0 flex-wrap items-center justify-end gap-[var(--space-sm)] px-[var(--space-2xl)] py-[var(--space-lg)]',
    '[&>*]:max-w-full',
    '[background:var(--color-bg-primary)] border-0 border-t border-solid',
    DIVIDER,
].join(' ');
/**
 * The Side Panel header: title (+ subtitle and an addon beside it), optional actions, and the
 * ghost close button with its tooltip. The title names the panel unless the panel has `ariaLabel`.
 */
export function SidePanelHeader({ title, subtitle, titleAddon, actions, onClose, closeLabel = 'Close', className, }) {
    const panel = useContext(SidePanelContext);
    const registerTitle = panel?.registerTitle;
    useLayoutEffect(() => registerTitle?.(), [registerTitle]);
    const close = onClose ?? panel?.onClose;
    return (_jsxs("div", { "data-ui": "side-panel-header", className: cn(HEADER, className), children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("h2", { id: panel?.titleId, className: TITLE, children: [_jsx("span", { className: "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", children: title }), titleAddon] }), subtitle && _jsx("p", { className: SUBTITLE, children: subtitle })] }), actions && _jsx("div", { className: "flex shrink-0 items-center gap-[var(--space-xs)]", children: actions }), close && (_jsx(Tooltip, { label: closeLabel, children: _jsx(Button, { variant: "ghost", iconOnly: true, "aria-label": closeLabel, onClick: close, className: "shrink-0", children: _jsx(CloseGlyph, {}) }) }))] }));
}
/** The Side Panel's scrolling body, between the header and an optional footer. */
export function SidePanelBody({ className, ...rest }) {
    return _jsx("div", { ...rest, "data-ui": "side-panel-body", className: cn(BODY, className) });
}
/** The Side Panel footer, pinned under the body: actions right-aligned, main action last. */
export function SidePanelFooter({ className, ...rest }) {
    return _jsx("div", { ...rest, "data-ui": "side-panel-footer", className: cn(FOOTER, className) });
}
