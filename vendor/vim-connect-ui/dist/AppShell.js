'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext } from 'react';
import { cn } from './cn.js';
import { NAV_MOTION, SIDE_NAV_COLLAPSED_WIDTH, SIDE_NAV_WIDTH, TOP_BAR_HEIGHT } from './appShellShared.js';
/** The shell's `navCollapsed`, so a `SideNav` inside it follows without being told twice. */
export const AppShellNavContext = createContext(undefined);
/**
 * App shell (DS → App shell): the product frame. A fixed side nav on the left, an optional fixed top bar
 * across the rest, and `<main>` as the page's own scrollport below it, so a table or sticky bar sizes
 * against the viewport. Publishes `--app-shell-nav-width` and `--app-shell-top-bar-height` for anything
 * that has to line up with the frame.
 *
 * Hooks: `data-ui="app-shell"` (+ `data-nav-collapsed`), `app-shell-main`.
 */
export function AppShell({ sideNav, navCollapsed = false, topBar, backdrop, banner, mainId, className, children }) {
    const vars = {
        '--app-shell-nav-width': sideNav ? `${navCollapsed ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH}px` : '0px',
        '--app-shell-top-bar-height': topBar ? `${TOP_BAR_HEIGHT}px` : '0px',
    };
    const follow = NAV_MOTION;
    return (_jsx(AppShellNavContext.Provider, { value: sideNav ? navCollapsed : undefined, children: _jsxs("div", { "data-ui": "app-shell", "data-nav-collapsed": navCollapsed || undefined, style: vars, className: cn('min-h-screen', className), children: [sideNav && _jsx("div", { className: "fixed inset-y-0 left-0 z-40", children: sideNav }), topBar && (_jsx("div", { className: cn('fixed right-0 top-0 z-[35] h-[var(--app-shell-top-bar-height)] [left:var(--app-shell-nav-width)] [transition-property:left]', follow), children: topBar })), backdrop && (_jsx("div", { "aria-hidden": "true", "data-ui": "app-shell-backdrop", className: cn('pointer-events-none fixed inset-y-0 right-0 z-0 [left:var(--app-shell-nav-width)] [transition-property:left]', follow), children: backdrop })), _jsxs("div", { className: cn('relative z-[1] flex h-dvh flex-col overflow-hidden', 'pl-[var(--app-shell-nav-width)] pt-[var(--app-shell-top-bar-height)] [transition-property:padding-left]', follow), children: [banner, _jsx("main", { role: "main", id: mainId, "data-ui": "app-shell-main", className: "min-h-0 min-w-0 flex-1 overflow-y-auto", children: children })] })] }) }));
}
