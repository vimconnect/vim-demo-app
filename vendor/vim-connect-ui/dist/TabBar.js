import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { TabButton } from './TabButton.js';
import { cn } from './cn.js';
/**
 * The two halves of one id contract. Callers pass an `idPrefix` and never
 * spell the format out, so a tab and its panel cannot drift apart.
 */
export const tabButtonId = (idPrefix, tabId) => `${idPrefix}-tab-${tabId}`;
export const tabPanelId = (idPrefix, tabId) => `${idPrefix}-panel-${tabId}`;
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
const tabBarVariants = cva([
    'tab-nav group/tabbar flex',
    // overflow-x alone computes overflow-y to auto; the tab's 2px underline
    // plus mb-[-1px] then leaves a 1px vertical scroll gutter. pb-px keeps the
    // underline inside the clip box.
    'sticky top-0 z-[20] overflow-x-auto overflow-y-hidden pb-px',
    // border-0 first: without Tailwind's preflight (the extension side panel) the other sides default to a 3px currentColor border.
    'border-0 border-b border-solid [border-bottom-color:var(--color-border-light)]',
    'rounded-[var(--radius-md)_var(--radius-md)_0_0]',
    'mb-[24px] px-[var(--space-sm)]',
].join(' '), {
    variants: {
        // Fill lives on the flush arm so flush never carries an opaque bg class.
        flush: {
            false: 'bg-[var(--color-bg-primary)]',
            true: [
                'tab-nav--flush static mb-0 bg-transparent border-b-0 rounded-none px-0',
            ].join(' '),
        },
        noGap: {
            false: '',
            true: 'tab-nav--no-gap mb-0',
        },
        compact: {
            false: '',
            true: 'tab-nav--compact',
        },
    },
    defaultVariants: { flush: false, noGap: false, compact: false },
});
export function TabBar({ tabs, activeTab, onSelect, ariaLabel, idPrefix, id, compact = false, flush = false, noGap = false, className, }) {
    return (_jsx("div", { id: id, role: "tablist", "aria-label": ariaLabel, "data-ui": "tab-bar", "data-compact": compact ? '' : undefined, "data-flush": flush ? '' : undefined, "data-no-gap": noGap ? '' : undefined, className: cn(tabBarVariants({ compact, flush, noGap }), 'space-x-2', className), children: tabs.map(({ id: tabId, label, count, showZero, icon, adornment, wrap, testId, buttonProps }) => {
            const button = (_jsx(TabButton, { ...buttonProps, label: label, icon: icon, count: count ?? 0, showZero: showZero ?? count !== undefined, active: activeTab === tabId, onClick: () => onSelect(tabId), adornment: adornment, id: tabButtonId(idPrefix, tabId), "aria-controls": activeTab === tabId ? tabPanelId(idPrefix, tabId) : undefined, "data-testid": testId ?? tabButtonId(idPrefix, tabId) }));
            return (_jsx(React.Fragment, { children: wrap ? wrap(button) : button }, tabId));
        }) }));
}
/** TabBar's companion: a `role="tabpanel"` wired to its tab both ways. */
export const TabPanel = ({ idPrefix, tabId, hidden, children, className, }) => (_jsx("div", { role: "tabpanel", id: tabPanelId(idPrefix, tabId), "aria-labelledby": tabButtonId(idPrefix, tabId), hidden: hidden, "data-ui": "tab-panel", className: className, children: children }));
export { tabBarVariants };
