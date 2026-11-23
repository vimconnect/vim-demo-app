'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './cn.js';
import { Tooltip } from './Tooltip.js';
import { FloatingLayerContext, useFloatingLayer } from './floatingLayers.js';
import { zFloatingPanel } from './floatingLayersShared.js';
import { FLOATING_SURFACE } from './AnchoredPanel.js';
import { AppShellNavContext } from './AppShell.js';
import { NAV_MOTION, SIDE_NAV_COLLAPSED_WIDTH, SIDE_NAV_WIDTH, TOP_BAR_HEIGHT } from './appShellShared.js';
const SideNavContext = createContext({ collapsed: false, Link: 'a', variant: 'rail' });
/** Whether the nav is on its icon rail, for content a product puts in it. */
export function useSideNavCollapsed() {
    return useContext(SideNavContext).collapsed;
}
/** The nav's top padding, and how far a stuck group tucks its label's top padding under the rail's edge. */
const NAV_PAD_TOP = 6;
const STICKY_TUCK = 7;
/** Space kept between a rail flyout and the viewport's edge. */
const FLYOUT_MARGIN = 8;
const DURATION = NAV_MOTION;
/**
 * Side nav (DS → App shell): the product's left rail. 248px on `--color-bg-primary` with a
 * `--color-border-light` edge, collapsing to a 72px icon rail. A 64px brand header (lined up with the
 * top bar, a soft cyan glow behind the lockup), the scrolling nav, then an optional accessory block and
 * a footer of small actions.
 *
 * Hooks: `data-ui="side-nav"` (+ `data-collapsed`), `side-nav-scroll`, `side-nav-footer`.
 */
export function SideNav({ brand, collapsed: collapsedProp, onCollapsedChange, linkComponent, 'aria-label': ariaLabel = 'Main navigation', accessory, footer, className, children, }) {
    const shellCollapsed = useContext(AppShellNavContext);
    const collapsed = collapsedProp ?? shellCollapsed ?? false;
    const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    const Toggle = collapsed ? ChevronRight : ChevronLeft;
    return (_jsx(SideNavContext.Provider, { value: { collapsed, Link: linkComponent ?? 'a', variant: 'rail' }, children: _jsxs("div", { "data-ui": "side-nav", "data-collapsed": collapsed || undefined, style: { width: collapsed ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH }, className: cn('group/sidenav relative flex h-full flex-col overflow-visible [transition-property:width]', '[background:var(--color-bg-primary)] border-0 border-r border-solid [border-color:var(--color-border-light)]', '[font-family:var(--font-sans)]', DURATION, className), children: [_jsxs("div", { style: { height: TOP_BAR_HEIGHT }, className: cn('relative flex shrink-0 items-center gap-[var(--space-sm)]', 'border-0 border-b border-solid [border-color:var(--color-border-light)]', "before:pointer-events-none before:absolute before:inset-0 before:content-['']", 'before:[background:radial-gradient(70%_90%_at_26%_50%,color-mix(in_srgb,var(--color-cyan)_20%,transparent),transparent_72%)]', collapsed ? 'justify-center px-[var(--space-md)]' : 'px-[var(--space-lg)]'), children: [_jsx("div", { className: cn('relative z-[1] flex items-center overflow-hidden [transition-property:width]', DURATION, collapsed && 'w-10'), children: brand }), onCollapsedChange && (_jsx(Tooltip, { label: toggleLabel, children: _jsx("button", { type: "button", "data-ui": "side-nav-toggle", "aria-label": toggleLabel, onClick: () => onCollapsedChange(!collapsed), className: cn('absolute right-[-11px] top-1/2 z-10 grid size-[22px] -translate-y-1/2 cursor-pointer place-items-center rounded-full p-0', 'border border-solid [border-color:var(--color-border-medium)] [background:var(--color-bg-card)]', '[color:var(--color-text-muted)] [box-shadow:var(--shadow-md)] opacity-0', 'transition-[opacity,color,border-color,box-shadow] [transition-duration:120ms]', 'group-hover/sidenav:opacity-100 focus-visible:opacity-100 focus-visible:outline-none', 'hover:[color:var(--color-blue)] hover:[border-color:var(--color-cyan)]', 'hover:[box-shadow:0_0_0_3px_var(--color-cyan-15),var(--shadow-md)] focus-visible:[box-shadow:var(--shadow-focus)]'), children: _jsx(Toggle, { "aria-hidden": "true", className: "size-[13px]" }) }) }))] }), _jsx("nav", { "aria-label": ariaLabel, "data-ui": "side-nav-scroll", style: { paddingTop: NAV_PAD_TOP }, className: cn('relative flex-1 overflow-y-auto px-[var(--space-md)] pb-[var(--space-md)]', collapsed ? 'overflow-x-visible' : 'overflow-x-clip', '[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:[background:var(--color-border-medium)]'), children: children }), accessory && _jsx("div", { className: "shrink-0", children: accessory }), footer && (_jsx("div", { "data-ui": "side-nav-footer", className: cn('relative shrink-0 border-0 border-t border-solid [border-color:var(--color-border-light)]', 'px-[var(--space-md)] pb-[var(--space-md)] pt-[var(--space-sm)]'), children: _jsx("div", { className: cn('flex items-stretch', collapsed ? 'flex-col gap-[2px]' : 'gap-[var(--space-xs)]'), children: footer }) }))] }) }));
}
/** One destination in a `SideNav`: icon, label, the active state. On the rail, the icon with a tooltip. */
export function SideNavItem({ icon: Icon, label, href, external, active: activeProp = false, onClick, action, badge, disabled = false, 'data-testid': testId, }) {
    const active = activeProp && !disabled;
    const { collapsed, Link, variant, onNavigate } = useContext(SideNavContext);
    const flyout = variant === 'flyout';
    const rail = collapsed && !flyout;
    const activate = () => {
        onClick?.();
        onNavigate?.();
    };
    const inner = cn('flex min-w-0 flex-1 items-center self-stretch bg-transparent border-0 p-0 text-left [color:inherit] no-underline', disabled ? 'cursor-not-allowed' : 'cursor-pointer', '[font:inherit] focus-visible:outline-none', rail ? 'justify-center' : 'gap-[var(--space-md)] px-[10px]', !rail && !flyout && action ? 'pr-[var(--space-xs)]' : undefined);
    const content = (_jsxs(_Fragment, { children: [_jsx(Icon, { "aria-hidden": "true", className: cn('size-[18px] shrink-0 transition-colors [transition-duration:120ms]', active
                    ? '[color:var(--color-cyan-text)]'
                    : disabled
                        ? '[color:var(--color-text-muted)]'
                        : '[color:var(--color-text-muted)] group-hover/item:[color:var(--color-cyan-text)]') }), !rail && _jsx("span", { className: "min-w-0 flex-1 overflow-hidden text-ellipsis", children: label }), !rail && badge && _jsx("span", { className: "ml-auto inline-flex shrink-0 items-center", children: badge }), !rail && external && _jsx(ArrowUpRight, { "aria-hidden": "true", className: cn('ml-auto shrink-0 opacity-65', flyout ? 'size-3' : 'size-3.5') })] }));
    const shared = {
        className: inner,
        'aria-current': active ? 'page' : undefined,
        'aria-label': rail ? label : undefined,
        onClick: activate,
    };
    let target;
    if (disabled) {
        target = (_jsx("span", { className: inner, "aria-disabled": "true", "aria-label": rail ? label : undefined, "data-ui": "side-nav-item-disabled", children: content }));
    }
    else if (href && external) {
        target = (_jsx("a", { ...shared, href: href, target: "_blank", rel: "noopener noreferrer", children: content }));
    }
    else if (href) {
        target = (_jsx(Link, { ...shared, href: href, children: content }));
    }
    else {
        target = (_jsx("button", { ...shared, type: "button", "data-ui": "side-nav-item-button", children: content }));
    }
    return (_jsxs("div", { "data-ui": "side-nav-item", "data-active": active || undefined, "data-disabled": disabled || undefined, "data-testid": testId, className: cn('group/item relative flex h-9 items-center whitespace-nowrap transition-colors [transition-duration:120ms]', 'focus-within:[box-shadow:var(--shadow-focus)]', flyout ? 'rounded-none text-[length:var(--text-base)]' : 'rounded-[var(--radius-md)] text-[length:var(--text-lg)]', active
            ? '[background:var(--color-cyan-08)] [color:var(--color-cyan-text)] [font-weight:var(--font-semibold)] hover:[background:var(--color-cyan-15)]'
            : disabled
                ? 'select-none opacity-40 [color:var(--color-text-secondary)] [font-weight:var(--font-medium)]'
                : '[color:var(--color-text-secondary)] [font-weight:var(--font-medium)] hover:[background:var(--color-cyan-08)] hover:[color:var(--color-text-primary)]', active && !rail && !flyout &&
            "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-[1px] before:[background:var(--color-cyan)] before:content-['']"), children: [rail ? _jsx(Tooltip, { label: label, children: target }) : target, !rail && !flyout && action && !disabled && (_jsx("span", { className: "mr-[6px] hidden shrink-0 items-center group-hover/item:inline-flex group-focus-within/item:inline-flex", children: action }))] }));
}
/**
 * A labelled, collapsible group of `SideNavItem`s: `--text-2xs` semibold uppercase label with 0.12em
 * tracking, a `--color-border-medium` hairline above it and a chevron. On the rail it is one icon whose
 * items open in a flyout to its right.
 *
 * Hooks: `data-ui="side-nav-group"` (+ `data-open`, `data-stuck`).
 */
export function SideNavGroup({ label, icon: Icon, active = false, open: openProp, defaultOpen = true, onOpenChange, sticky = false, 'data-testid': testId, children, }) {
    const ctx = useContext(SideNavContext);
    const { collapsed } = ctx;
    const contentId = useId();
    const [openState, setOpenState] = useState(defaultOpen);
    const open = openProp ?? openState;
    const setOpen = useCallback((next) => {
        if (openProp === undefined)
            setOpenState(next);
        onOpenChange?.(next);
    }, [openProp, onOpenChange]);
    // Opens on the way into the current page (navigating in, or mounting on one), not on every render,
    // so closing the group while on one of its pages sticks.
    const wasActive = useRef(false);
    useEffect(() => {
        if (active && !wasActive.current && !open)
            setOpen(true);
        wasActive.current = active;
    }, [active, open, setOpen]);
    const sentinelRef = useRef(null);
    const [stuck, setStuck] = useState(false);
    useEffect(() => {
        if (!sticky) {
            setStuck(false);
            return;
        }
        const sentinel = sentinelRef.current;
        if (!sentinel || typeof IntersectionObserver === 'undefined')
            return;
        const root = sentinel.closest('[data-ui="side-nav-scroll"]');
        const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
            root: root instanceof Element ? root : null,
            threshold: 0,
        });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [sticky, collapsed]);
    const [flyoutOpen, setFlyoutOpen] = useState(false);
    const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
    const groupRef = useRef(null);
    const flyoutRef = useRef(null);
    const flyoutLayer = useFloatingLayer(flyoutOpen, (node) => !!flyoutRef.current?.contains(node));
    /** Inside the flyout, or inside a layer opened from it (a portaled panel). */
    const withinFlyout = useCallback((target) => target instanceof Node && (!!flyoutRef.current?.contains(target) || flyoutLayer.insideLayerAbove(target)), [flyoutLayer]);
    const closeTimer = useRef(null);
    const showFlyout = useCallback(() => {
        if (closeTimer.current)
            clearTimeout(closeTimer.current);
        const rect = groupRef.current?.getBoundingClientRect();
        if (rect)
            setFlyoutPos({ top: rect.top, left: rect.right + 4 });
        setFlyoutOpen(true);
    }, []);
    const hideFlyout = useCallback(() => {
        if (closeTimer.current)
            clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setFlyoutOpen(false), 150);
    }, []);
    useEffect(() => () => {
        if (closeTimer.current)
            clearTimeout(closeTimer.current);
    }, []);
    useEffect(() => {
        if (!collapsed)
            setFlyoutOpen(false);
    }, [collapsed]);
    // Keep the flyout inside the viewport: shift it up when it would run off the bottom, cap its height.
    useLayoutEffect(() => {
        const panel = flyoutRef.current;
        if (!flyoutOpen || !panel)
            return;
        const room = window.innerHeight - FLYOUT_MARGIN;
        const top = Math.max(FLYOUT_MARGIN, Math.min(flyoutPos.top, room - panel.offsetHeight));
        if (top !== flyoutPos.top)
            setFlyoutPos((pos) => ({ ...pos, top }));
    }, [flyoutOpen, flyoutPos.top]);
    useEffect(() => {
        if (!flyoutOpen)
            return;
        const close = (e) => {
            if (e.type === 'scroll' && withinFlyout(e.target))
                return;
            setFlyoutOpen(false);
        };
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, true);
        return () => {
            window.removeEventListener('resize', close);
            window.removeEventListener('scroll', close, true);
        };
    }, [flyoutOpen, withinFlyout]);
    const stickyClass = sticky && cn('sticky z-[2] [background:var(--color-bg-primary)]', collapsed ? 'pb-[var(--space-sm)] pt-[var(--space-xs)]' : 'pt-[6px]');
    // Stuck flush with the rail: cancel the nav's top padding and tuck part of the label's.
    const stickyStyle = sticky ? { top: -(NAV_PAD_TOP + STICKY_TUCK) } : undefined;
    const stuckClass = stuck && 'border-0 border-b border-solid [border-color:var(--color-border-medium)] pb-[var(--space-sm)]';
    const sentinel = sticky ? (_jsx("div", { ref: sentinelRef, "aria-hidden": "true", className: "pointer-events-none -mb-px h-px w-full overflow-hidden" })) : null;
    if (collapsed) {
        return (_jsxs(_Fragment, { children: [sentinel, _jsxs("div", { ref: groupRef, "data-ui": "side-nav-group", "data-stuck": stuck || undefined, "data-testid": testId, className: cn('mt-[var(--space-xs)]', !sticky && 'relative', stickyClass, stuckClass), style: stickyStyle, onMouseEnter: showFlyout, onMouseLeave: hideFlyout, children: [_jsx("button", { type: "button", "data-ui": "side-nav-group-trigger", "aria-label": label, "aria-haspopup": "true", "aria-expanded": flyoutOpen, onClick: () => (flyoutOpen ? setFlyoutOpen(false) : showFlyout()), onKeyDown: (e) => {
                                if (e.key === 'Escape' && !e.defaultPrevented && flyoutLayer.isTop())
                                    setFlyoutOpen(false);
                            }, onBlur: (e) => {
                                if (!withinFlyout(e.relatedTarget))
                                    hideFlyout();
                            }, className: cn('group/item flex h-9 w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-0 p-0', 'transition-colors [transition-duration:120ms] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]', active
                                ? '[background:var(--color-cyan-08)] [color:var(--color-cyan-text)] hover:[background:var(--color-cyan-15)]'
                                : 'bg-transparent [color:var(--color-text-secondary)] hover:[background:var(--color-cyan-08)]'), children: _jsx(Icon, { "aria-hidden": "true", className: cn('size-[18px]', active ? '[color:var(--color-cyan-text)]' : '[color:var(--color-text-muted)] group-hover/item:[color:var(--color-cyan-text)]') }) }), flyoutOpen &&
                            createPortal(_jsxs("div", { ref: flyoutRef, role: "group", "aria-label": label, "data-ui": "side-nav-flyout", onMouseEnter: showFlyout, onMouseLeave: hideFlyout, onKeyDown: (e) => {
                                    if (e.key === 'Escape' && !e.defaultPrevented && flyoutLayer.isTop())
                                        setFlyoutOpen(false);
                                }, onBlur: (e) => {
                                    if (!withinFlyout(e.relatedTarget))
                                        hideFlyout();
                                }, style: {
                                    top: flyoutPos.top,
                                    left: flyoutPos.left,
                                    maxHeight: `calc(100vh - ${2 * FLYOUT_MARGIN}px)`,
                                    zIndex: zFloatingPanel(),
                                }, className: cn(FLOATING_SURFACE, 'fixed min-w-[200px] overflow-y-auto py-[var(--space-sm)]'), children: [_jsx("div", { className: cn('mb-[var(--space-xs)] px-[var(--space-md)] pb-[var(--space-sm)] pt-[var(--space-xs)]', 'text-[length:var(--text-xs)] [font-weight:var(--font-semibold)] uppercase tracking-[0.05em] [color:var(--color-text-muted)]', 'border-0 border-b border-solid [border-color:var(--color-border-light)]'), children: label }), _jsx(FloatingLayerContext.Provider, { value: flyoutLayer.layer, children: _jsx(SideNavContext.Provider, { value: { ...ctx, collapsed: false, variant: 'flyout', onNavigate: () => setFlyoutOpen(false) }, children: children }) })] }), document.body)] })] }));
    }
    return (_jsxs(_Fragment, { children: [sentinel, _jsxs("div", { "data-ui": "side-nav-group", "data-open": open || undefined, "data-stuck": stuck || undefined, "data-testid": testId, className: cn('mt-[5px]', stickyClass, stuckClass), style: stickyStyle, children: [_jsxs("button", { type: "button", "data-ui": "side-nav-group-label", onClick: () => setOpen(!open), "aria-expanded": open, "aria-controls": contentId, className: cn('flex w-full cursor-pointer select-none items-center justify-between bg-transparent text-left', 'pb-[10px] pl-[10px] pr-[6px] pt-[15px] border-0 border-t border-solid [border-color:var(--color-border-medium)]', 'text-[length:var(--text-2xs)] [font-weight:var(--font-semibold)] uppercase tracking-[0.12em] [font-family:var(--font-sans)]', 'transition-colors [transition-duration:120ms] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]', active ? '[color:var(--color-cyan-text)]' : '[color:var(--color-text-muted)] hover:[color:var(--color-text-secondary)]'), children: [_jsx("span", { children: label }), _jsx(ChevronDown, { "aria-hidden": "true", className: cn('size-3.5 shrink-0 transition-transform [transition-duration:200ms] motion-reduce:transition-none', !open && '-rotate-90') })] }), _jsx("div", { id: contentId, hidden: !open, className: "mt-[2px] flex flex-col gap-px", children: children })] })] }));
}
/** A small action in the `SideNav` footer (help, what's new): `--text-xs`, a 15px icon. Icon-only with a tooltip on the rail. */
export function SideNavFooterItem({ icon: Icon, label, href, onClick, indicator, className, iconClassName }) {
    const { collapsed, Link } = useContext(SideNavContext);
    const classes = cn('relative flex h-9 min-w-0 flex-1 cursor-pointer items-center rounded-[var(--radius-md)] border-0 bg-transparent text-left no-underline', 'text-[length:var(--text-xs)] [font-weight:var(--font-medium)] [font-family:var(--font-sans)] [color:var(--color-text-secondary)]', 'transition-colors [transition-duration:120ms] hover:[background:var(--color-cyan-08)] hover:[color:var(--color-text-primary)]', 'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]', collapsed ? 'justify-center px-0' : 'gap-[6px] px-[var(--space-sm)]', className);
    const content = (_jsxs(_Fragment, { children: [_jsx(Icon, { "aria-hidden": "true", className: cn('size-[15px] shrink-0', iconClassName) }), !collapsed && _jsx("span", { className: "overflow-hidden text-ellipsis whitespace-nowrap", children: label }), indicator && (_jsx("span", { className: cn('inline-flex', collapsed ? 'absolute left-1/2 top-1/2 translate-x-[3px] translate-y-[-12px]' : 'ml-auto'), children: indicator }))] }));
    const el = href ? (_jsx(Link, { href: href, className: classes, "aria-label": collapsed ? label : undefined, onClick: onClick, children: content })) : (_jsx("button", { type: "button", "data-ui": "side-nav-footer-item", className: classes, "aria-label": collapsed ? label : undefined, onClick: onClick, children: content }));
    return collapsed ? _jsx(Tooltip, { label: label, children: el }) : el;
}
