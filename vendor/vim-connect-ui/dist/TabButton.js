import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { CountBadge } from './CountBadge.js';
import { cn } from './cn.js';
/**
 * One underline tab — vim-ai `Design System.html` → Tab Bar.
 * Optional leading icon, label, `CountBadge` (`accent` when active), and an
 * adornment after the count. `tab-item` / `active` stay as unstyled hooks for
 * product CSS (e.g. `.tab-nav--compact .tab-item`); the look is Tailwind on
 * DS tokens.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
const tabButtonVariants = cva([
    'tab-item inline-flex items-center gap-[6px] px-[18px] py-[10px]',
    '[font-family:var(--font-sans)] text-[length:var(--text-base)] [font-weight:var(--font-medium)]',
    'border-0 border-b-2 border-solid [border-bottom-color:transparent]',
    '[color:var(--tab-fg)] bg-transparent',
    'mb-[-1px] cursor-pointer whitespace-nowrap',
    '[transition:color_var(--transition-base),border-color_var(--transition-base),background_var(--transition-base)]',
    'hover:[color:var(--tab-fg-hover,var(--tab-fg))]',
    'hover:[background:var(--color-cyan-08)]',
    'hover:[border-bottom-color:var(--tab-underline-hover,var(--color-cyan-30))]',
    'hover:rounded-[var(--radius-md)_var(--radius-md)_0_0]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
    'focus-visible:rounded-[var(--radius-md)_var(--radius-md)_0_0]',
    '[&_svg]:size-[16px] [&_svg]:shrink-0',
    // Compact strip (parent `data-compact` / `.tab-nav--compact`): tighter padding, semibold secondary.
    'group-data-[compact]/tabbar:px-[12px] group-data-[compact]/tabbar:py-[9px]',
    'group-data-[compact]/tabbar:[font-weight:var(--font-semibold)]',
].join(' '), {
    variants: {
        active: {
            false: [
                '[--tab-fg:var(--color-text-muted)] group-data-[compact]/tabbar:[--tab-fg:var(--color-text-secondary)]',
                '[--tab-fg-hover:var(--color-text-primary)]',
                '[--tab-underline-hover:var(--color-cyan-30)]',
            ].join(' '),
            true: [
                'active',
                '[--tab-fg:var(--color-blue)] [--tab-fg-hover:var(--color-blue)]',
                '[--tab-underline-hover:var(--color-cyan)]',
                '[border-bottom-color:var(--color-cyan)] [font-weight:var(--font-bold)]',
            ].join(' '),
        },
    },
    defaultVariants: { active: false },
});
export const TabButton = React.forwardRef(function TabButton({ label, count, active, onClick, icon: Icon, showZero = true, adornment, 'data-testid': testId, id, 'aria-controls': ariaControls, className, ...rest }, ref) {
    return (_jsxs("button", { ...rest, ref: ref, type: "button", role: "tab", id: id, "aria-selected": active, "aria-controls": ariaControls, onClick: onClick, "data-ui": "tab-button", "data-active": active ? '' : undefined, className: cn(tabButtonVariants({ active }), className), "data-testid": testId ?? `tab-${label.toLowerCase().replace(/\s+/g, '-')}`, children: [Icon ? _jsx(Icon, { "aria-hidden": "true" }) : null, label, _jsx(CountBadge, { count: count, tone: active ? 'accent' : 'neutral', showZero: showZero }), adornment] }));
});
export { tabButtonVariants };
