import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
/**
 * Selectable category filter chip — vim-ai Filter Chip. Rest is muted on a
 * card fill; `active` flips to cyan tint + strong cyan text. Optional count
 * badge uses the same currentColor 24% hairline as Badge. Parent owns which
 * chip is selected and what click does.
 */
const filterChipVariants = cva([
    'inline-flex items-center whitespace-nowrap cursor-pointer',
    'gap-[var(--space-xs)] px-[var(--space-md)] py-[var(--space-xs)]',
    'rounded-[var(--radius-full)] [font-family:var(--font-sans)]',
    'text-[length:var(--text-xs)] [font-weight:var(--font-medium)] leading-none',
    '[background:var(--fc-bg)] [color:var(--fc-fg)]',
    'border border-solid [border-color:var(--fc-border)]',
    '[transition:background_var(--transition-fast),border-color_var(--transition-fast),color_var(--transition-fast)]',
    'hover:[background:var(--fc-bg-hover,var(--fc-bg))]',
    'hover:[color:var(--fc-fg-hover,var(--fc-fg))]',
    'hover:[border-color:var(--fc-border-hover,var(--fc-border))]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
].join(' '), {
    variants: {
        // --fc-* live on the class so theme / call-site CSS can override them.
        active: {
            false: [
                '[--fc-bg:var(--color-bg-card)] [--fc-fg:var(--color-text-muted)]',
                '[--fc-border:var(--color-border-medium)]',
                '[--fc-border-hover:var(--color-cyan-30)] [--fc-fg-hover:var(--color-text-secondary)]',
                '[--fc-count-bg:var(--color-bg-elevated)] [--fc-count-fg:var(--color-text-muted)]',
            ].join(' '),
            true: [
                '[--fc-bg:var(--color-cyan-15)] [--fc-fg:var(--color-cyan-text-strong)]',
                '[--fc-border:var(--color-cyan-50)]',
                '[--fc-count-bg:var(--color-cyan-20)] [--fc-count-fg:var(--color-cyan-text-strong)]',
            ].join(' '),
        },
    },
    defaultVariants: { active: false },
});
const filterChipCountClasses = [
    'inline-flex items-center justify-center min-w-[17px]',
    'px-[var(--space-xs)] py-0 leading-[1.5]',
    'rounded-[var(--radius-full)] [font-family:var(--font-sans)]',
    'text-[length:var(--text-xs)] [font-weight:var(--font-semibold)]',
    '[background:var(--fc-count-bg)] [color:var(--fc-count-fg)]',
    'border border-solid [border-color:color-mix(in_srgb,currentColor_24%,transparent)]',
].join(' ');
export const FilterChip = React.forwardRef(({ label, count, active = false, type = 'button', className, ...props }, ref) => (_jsxs("button", { ref: ref, type: type, "aria-pressed": active, className: cn(filterChipVariants({ active }), className), "data-ui": "filter-chip", "data-active": active ? '' : undefined, ...props, children: [label, count != null && Number.isFinite(count) ? (_jsx("span", { className: filterChipCountClasses, children: count })) : null] })));
FilterChip.displayName = 'FilterChip';
export { filterChipVariants, filterChipCountClasses };
