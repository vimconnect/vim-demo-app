import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
/**
 * Status / category pill — the design system's Badges section (vim-ai
 * `Design System.html` → Badges). Shape is shared; each variant only sets its
 * own tint (`--badge-bg`) and label colour (`--badge-fg`). The border is always
 * the label's own colour at 24%, so it follows `--badge-fg` for free.
 *
 * Tailwind + `cva` on the shared tokens, the `write-ui-component` recipe
 * (`Button.tsx` in this package). Every product's Tailwind scans this package, so the
 * classes below are written to mean the same in Tailwind v3 and v4: arbitrary
 * values on DS tokens only (no theme names such as `font-sans`, which each app
 * can redefine) and no `!` important marker.
 *
 * Keep the label to one word when possible. Icons go in as children (sized
 * 10px, 9px at `sm`), e.g. the "Vim staff" Vim icon.
 */
const badgeVariants = cva([
    'inline-flex items-center whitespace-nowrap gap-[var(--space-xs)] px-[8px] py-[3px]',
    'rounded-[var(--radius-full)] [font-family:var(--font-sans)] [font-weight:var(--font-semibold)]',
    // leading after the font size: tailwind-merge drops a leading-* that precedes a text-size class.
    'text-[length:var(--text-xs)] leading-[1.4]',
    '[background:var(--badge-bg)] [color:var(--badge-fg)]',
    'border border-solid [border-color:color-mix(in_srgb,currentColor_24%,transparent)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:w-[10px] [&_svg]:h-[10px]',
].join(' '), {
    variants: {
        // --badge-* live on the class so theme / call-site CSS can override them.
        variant: {
            // *-text tokens are theme-aware; the inner var() is the fallback for products that don't define them.
            success: '[--badge-bg:color-mix(in_srgb,var(--color-success)_14%,transparent)] [--badge-fg:var(--color-success-text,var(--color-success-dark))]',
            warning: '[--badge-bg:color-mix(in_srgb,var(--color-warning)_14%,transparent)] [--badge-fg:var(--color-warning-text,var(--color-warning-text-strong))]',
            error: '[--badge-bg:color-mix(in_srgb,var(--color-error)_12%,transparent)] [--badge-fg:var(--color-error-text,var(--color-error-text-strong,var(--color-error)))]',
            info: '[--badge-bg:color-mix(in_srgb,var(--color-blue)_12%,transparent)] [--badge-fg:var(--color-cyan-text)]',
            // --color-purple-text: violet on light surfaces, lavender on dark (the DS
            // violet is about 2.25:1 on the dark page). A token, not a page selector,
            // because products switch themes differently.
            purple: '[--badge-bg:color-mix(in_srgb,var(--color-purple-dark)_12%,transparent)] [--badge-fg:var(--color-purple-text)]',
            neutral: '[--badge-bg:var(--glass-bg-base)] [--badge-fg:var(--color-text-secondary)]',
        },
        size: {
            default: '',
            sm: 'gap-[3px] px-[6px] py-0 text-[length:var(--text-2xs)] leading-[1.4] [&_svg]:w-[9px] [&_svg]:h-[9px]',
        },
        dot: {
            true: [
                "before:content-[''] before:inline-block before:shrink-0",
                'before:w-[6px] before:h-[6px] before:rounded-[var(--radius-full)] before:bg-current',
            ].join(' '),
            false: '',
        },
    },
    defaultVariants: { variant: 'neutral', size: 'default', dot: false },
});
export const Badge = React.forwardRef(({ variant = 'neutral', size = 'default', dot = false, className, ...props }, ref) => (_jsx("span", { ref: ref, "data-ui": "badge", "data-variant": variant, className: cn(badgeVariants({ variant, size, dot }), className), ...props })));
Badge.displayName = 'Badge';
export { badgeVariants };
