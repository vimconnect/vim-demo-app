import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * The two halves of one id contract. Callers pass an `idPrefix` and never
 * spell the format out, so a tab and its panel cannot drift apart.
 */
export declare const tabButtonId: (idPrefix: string, tabId: string) => string;
export declare const tabPanelId: (idPrefix: string, tabId: string) => string;
/**
 * Sticky underline-tab strip — vim-ai `Design System.html` → Tab Bar.
 * Renders a `role="tablist"` of `TabButton`s from a declarative `tabs` array
 * and wires matching `id` / `aria-controls` pairs via `tabButtonId` /
 * `tabPanelId`. `tab-nav` and its modifiers stay as unstyled hooks for product
 * CSS; the look is Tailwind on DS tokens.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const tabBarVariants: (props?: ({
    flush?: boolean | null | undefined;
    noGap?: boolean | null | undefined;
    compact?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TabBarFlush = NonNullable<VariantProps<typeof tabBarVariants>['flush']>;
export type TabBarNoGap = NonNullable<VariantProps<typeof tabBarVariants>['noGap']>;
export type TabBarCompact = NonNullable<VariantProps<typeof tabBarVariants>['compact']>;
export interface TabBarItem<T extends string> {
    id: T;
    label: string;
    count?: number;
    /**
     * Overrides the default, which shows a pill for any provided `count`
     * (including zero) and none when `count` is omitted. Pass `false` to keep
     * the count but hide it while it's zero.
     */
    showZero?: boolean;
    icon?: React.ComponentType<{
        className?: string;
        'aria-hidden'?: boolean | 'true';
    }>;
    /** Rendered after the count — e.g. a warning dot needing attention. */
    adornment?: React.ReactNode;
    /** Overrides the `${idPrefix}-tab-${id}` default. */
    testId?: string;
    /** Wraps the rendered button (e.g. a Tooltip that clones its child). */
    wrap?: (button: React.ReactElement) => React.ReactElement;
    /**
     * Extra attributes on the tab button — product hooks such as
     * `data-vim-tab`. Reserved TabButton props (`id`, `aria-controls`,
     * `data-testid`, …) stay owned by TabBar.
     */
    buttonProps?: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'role' | 'aria-selected' | 'aria-controls' | 'onClick' | 'id' | 'className' | 'color'> & Record<`data-${string}`, string | undefined>;
}
export interface TabBarProps<T extends string> {
    tabs: readonly TabBarItem<T>[];
    activeTab: T;
    onSelect: (id: T) => void;
    /** Names the tablist for assistive tech, e.g. "App sections". */
    ariaLabel: string;
    /**
     * Namespaces this strip's ids. Pass the same prefix to `TabPanel`.
     */
    idPrefix: string;
    /** Optional DOM id on the tablist (e.g. a product collection hook). */
    id?: string;
    /** Tighter padding — sticky sub-header (manifest editor). */
    compact?: boolean;
    /** Drop the strip's own border/background/sticky — parent already draws them. */
    flush?: boolean;
    /** No bottom margin — strip immediately followed by a FilterBar. */
    noGap?: boolean;
    className?: string;
}
export declare function TabBar<T extends string>({ tabs, activeTab, onSelect, ariaLabel, idPrefix, id, compact, flush, noGap, className, }: TabBarProps<T>): import("react/jsx-runtime").JSX.Element;
export interface TabPanelProps {
    /** Same prefix given to the TabBar this panel belongs to. */
    idPrefix: string;
    /**
     * The tab this panel belongs to. For a page that renders one panel at a
     * time, pass the ACTIVE tab's id. For a page that renders every panel, pass
     * each one's own id.
     */
    tabId: string;
    /** Hides the panel while keeping it mounted. */
    hidden?: boolean;
    children: React.ReactNode;
    className?: string;
}
/** TabBar's companion: a `role="tabpanel"` wired to its tab both ways. */
export declare const TabPanel: React.FC<TabPanelProps>;
export { tabBarVariants };
