import React from 'react';
/** What a product's router link gets. Forward the ref: a collapsed rail's item sits in a `Tooltip`. */
export type SideNavLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    ref?: React.Ref<HTMLAnchorElement>;
};
export type SideNavLinkComponent = React.ComponentType<SideNavLinkProps>;
/** Whether the nav is on its icon rail, for content a product puts in it. */
export declare function useSideNavCollapsed(): boolean;
export interface SideNavScopeProps {
    /** On its icon rail. Default false. */
    collapsed?: boolean;
    /** The product's router link. Default: a plain `<a>`. */
    linkComponent?: SideNavLinkComponent;
    children: React.ReactNode;
}
/**
 * Hosts `SideNavItem` / `SideNavGroup` outside a full `SideNav` chrome — a themed
 * shell that still needs shared group collapse and rail flyout behaviour.
 * Sticky groups are not supported here: their stuck observer needs
 * `data-ui="side-nav-scroll"` from `SideNav`.
 */
export declare function SideNavScope({ collapsed, linkComponent, children }: SideNavScopeProps): import("react/jsx-runtime").JSX.Element;
export interface SideNavProps {
    /** The product lockup. On the rail it is clipped to its first 40px, so the icon comes first. */
    brand: React.ReactNode;
    /** On its icon rail. Default: the enclosing `AppShell`'s `navCollapsed`. */
    collapsed?: boolean;
    /** Shows the collapse toggle on the rail's edge (on hover or keyboard focus). */
    onCollapsedChange?: (collapsed: boolean) => void;
    /** The product's router link. Default: a plain `<a>`. */
    linkComponent?: SideNavLinkComponent;
    /** The `<nav>`'s accessible name. Default "Main navigation". */
    'aria-label'?: string;
    /** A block between the nav and the footer (an account switcher). */
    accessory?: React.ReactNode;
    /** `SideNavFooterItem`s, side by side; stacked on the rail. */
    footer?: React.ReactNode;
    className?: string;
    /** `SideNavItem`s and `SideNavGroup`s. */
    children: React.ReactNode;
}
/**
 * Side nav (DS → App shell): the product's left rail. 248px on `--color-bg-primary` with a
 * `--color-border-light` edge, collapsing to a 72px icon rail. A 64px brand header (lined up with the
 * top bar, a soft cyan glow behind the lockup), the scrolling nav, then an optional accessory block and
 * a footer of small actions.
 *
 * Hooks: `data-ui="side-nav"` (+ `data-collapsed`), `side-nav-scroll`, `side-nav-footer`.
 */
export declare function SideNav({ brand, collapsed: collapsedProp, onCollapsedChange, linkComponent, 'aria-label': ariaLabel, accessory, footer, className, children, }: SideNavProps): import("react/jsx-runtime").JSX.Element;
export interface SideNavItemProps {
    /** A 18px icon component (lucide). */
    icon: React.ComponentType<{
        className?: string;
        'aria-hidden'?: boolean | 'true';
    }>;
    label: string;
    /** A route (through the nav's `linkComponent`), or a URL when `external`. */
    href?: string;
    /** Opens `href` in a new tab, with an arrow after the label. */
    external?: boolean;
    /** The current page: cyan tint, cyan text and a 2px cyan bar (no bar on the rail); `aria-current="page"`. */
    active?: boolean;
    /** Runs on activation, alongside the navigation (or alone, as a button, when there's no `href`). */
    onClick?: () => void;
    /** A control at the row's end, shown on hover or keyboard focus (a pin toggle). Not on the rail or in its flyout. */
    action?: React.ReactNode;
    /** A small always-visible tag after the label (a `Badge`, e.g. "soon"). Not on the rail. */
    badge?: React.ReactNode;
    /**
     * A destination that isn't available yet: the DS disabled treatment (40% opacity, not-allowed
     * cursor, no hover) on a row that is neither a link nor a button and takes no focus
     * (`aria-disabled="true"`). Pair it with a `badge` that says why ("soon").
     */
    disabled?: boolean;
    'data-testid'?: string;
}
/** One destination in a `SideNav`: icon, label, the active state. On the rail, the icon with a tooltip. */
export declare function SideNavItem({ icon: Icon, label, href, external, active: activeProp, onClick, action, badge, disabled, 'data-testid': testId, }: SideNavItemProps): import("react/jsx-runtime").JSX.Element;
export interface SideNavGroupProps {
    label: string;
    /** Stands for the group on the rail, where its items open in a flyout. */
    icon: SideNavItemProps['icon'];
    /** Holds the current page: the label (or the rail icon) turns cyan, and the group opens when this turns on. */
    active?: boolean;
    /** Controlled open state; pair with `onOpenChange`. */
    open?: boolean;
    /** Default true. */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Stays at the top of the nav while the rest scrolls under it, with a hairline once it's stuck. */
    sticky?: boolean;
    'data-testid'?: string;
    /** `SideNavItem`s. */
    children: React.ReactNode;
}
/**
 * A labelled, collapsible group of `SideNavItem`s: `--text-2xs` semibold uppercase label with 0.12em
 * tracking, a `--color-border-medium` hairline above it and a chevron. On the rail it is one icon whose
 * items open in a flyout to its right.
 *
 * Hooks: `data-ui="side-nav-group"` (+ `data-open`, `data-stuck`).
 */
export declare function SideNavGroup({ label, icon: Icon, active, open: openProp, defaultOpen, onOpenChange, sticky, 'data-testid': testId, children, }: SideNavGroupProps): import("react/jsx-runtime").JSX.Element;
export interface SideNavFooterItemProps {
    icon: SideNavItemProps['icon'];
    label: string;
    /** A route (through the nav's `linkComponent`); without it the item is a button. */
    href?: string;
    onClick?: () => void;
    /** A small mark after the label (an unseen-changes dot); on the rail it rides the icon's corner. */
    indicator?: React.ReactNode;
    className?: string;
    /** Classes on the icon (its colour, a hover animation). They land on the component's own
     *  `<svg>`, unwrapped, so a product may animate its parts (`.my-class path`). */
    iconClassName?: string;
}
/** A small action in the `SideNav` footer (help, what's new): `--text-xs`, a 15px icon. Icon-only with a tooltip on the rail. */
export declare function SideNavFooterItem({ icon: Icon, label, href, onClick, indicator, className, iconClassName }: SideNavFooterItemProps): import("react/jsx-runtime").JSX.Element;
