import React from 'react';
/**
 * Design-system breadcrumb — vim-ai `Design System.html` → Breadcrumb.
 * Muted underlined links, a plain "/" separator, and a non-clickable current
 * segment a shade darker (medium weight) so it still reads as "you are here".
 * Placement rule (DS): the very first element of a detail page's content
 * column, above the header, tabs and any notice.
 *
 * Router-agnostic: a segment with `to` renders through `renderLink` (default
 * a plain `<a href>`), so each product passes its own router link.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
export interface BreadcrumbItem {
    /** Visible segment text (or any node). */
    label: React.ReactNode;
    /** Navigates here. Wins over `onClick` when both are set. */
    to?: string;
    /** A non-navigating "back" step (e.g. clearing local state); renders a `<button type="button">`. */
    onClick?: () => void;
    /** Leading icon, e.g. a chevron — usually only the first segment carries one. */
    icon?: React.ComponentType<{
        className?: string;
    }>;
    /** Extra classes for this segment only. */
    className?: string;
}
export interface BreadcrumbLinkRenderProps {
    to: string;
    className: string;
    children: React.ReactNode;
}
export interface BreadcrumbsProps {
    /** Ordered trail, root first. An item with neither `to` nor `onClick` is the plain current segment. */
    items: BreadcrumbItem[];
    /** Renders a `to` segment. Default: `<a href={to}>`. */
    renderLink?: (props: BreadcrumbLinkRenderProps) => React.ReactNode;
    /** Classes for the `<nav>` (e.g. `mb-0` when the trail shares a row with another control). */
    className?: string;
}
export declare function Breadcrumbs({ items, renderLink, className }: BreadcrumbsProps): import("react/jsx-runtime").JSX.Element;
