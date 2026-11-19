import React from 'react';
/** Side nav width, expanded and collapsed to its icon rail, and the top bar's height (DS → App shell). */
export declare const SIDE_NAV_WIDTH = 248;
export declare const SIDE_NAV_COLLAPSED_WIDTH = 72;
export declare const TOP_BAR_HEIGHT = 64;
/** How the side nav's width moves, and everything that follows it (top bar, backdrop, content). */
export declare const NAV_MOTION = "motion-safe:[transition-duration:240ms] motion-safe:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";
/** The shell's `navCollapsed`, so a `SideNav` inside it follows without being told twice. */
export declare const AppShellNavContext: React.Context<boolean | undefined>;
export interface AppShellProps {
    /** The `SideNav`. Omit for a page with only a top bar; the content then starts at the left edge. */
    sideNav?: React.ReactNode;
    /** Whether the side nav is collapsed to its icon rail; the top bar and content follow its width. */
    navCollapsed?: boolean;
    /** The `TopBar`, fixed above the content column. Omit for a product with no top bar. */
    topBar?: React.ReactNode;
    /** A decorative layer behind the content, sized to the content column (it follows the nav as it collapses). */
    backdrop?: React.ReactNode;
    /** A `Banner` across the content column, under the top bar and above the page; it doesn't scroll with the page. */
    banner?: React.ReactNode;
    /** `id` on `<main>`, the page's scrollport. */
    mainId?: string;
    className?: string;
    children: React.ReactNode;
}
/**
 * App shell (DS → App shell): the product frame. A fixed side nav on the left, an optional fixed top bar
 * across the rest, and `<main>` as the page's own scrollport below it, so a table or sticky bar sizes
 * against the viewport. Publishes `--app-shell-nav-width` and `--app-shell-top-bar-height` for anything
 * that has to line up with the frame.
 *
 * Hooks: `data-ui="app-shell"` (+ `data-nav-collapsed`), `app-shell-main`.
 */
export declare function AppShell({ sideNav, navCollapsed, topBar, backdrop, banner, mainId, className, children }: AppShellProps): import("react/jsx-runtime").JSX.Element;
