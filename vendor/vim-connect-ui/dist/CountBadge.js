import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
const countBadgeVariants = cva([
    'inline-flex shrink-0 items-center justify-center rounded-full',
    '[font-family:var(--font-sans)] leading-none [font-variant-numeric:tabular-nums]',
].join(' '), {
    variants: {
        tone: {
            neutral: '[background:color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] [color:var(--color-text-muted)]',
            accent: '[background:var(--color-cyan-15)] [color:var(--color-cyan-text)]',
            alert: '[background:var(--color-accent-rare)] [color:var(--color-text-on-gradient)]',
        },
        size: {
            sm: 'h-[18px] min-w-[18px] px-[4px] text-[10px] [font-weight:var(--font-bold)]',
            md: 'h-[20px] min-w-[20px] px-[8px] text-[length:var(--text-xs)] [font-weight:var(--font-medium)]',
        },
        dot: {
            true: 'p-0 min-w-0',
            false: '',
        },
        anchored: {
            true: 'absolute top-0 right-0 [transform:translate(50%,-50%)] pointer-events-none',
            false: '',
        },
    },
    compoundVariants: [
        { dot: true, size: 'sm', class: 'size-[10px]' },
        { dot: true, size: 'md', class: 'size-[8px]' },
    ],
    defaultVariants: { tone: 'neutral', size: 'md', dot: false, anchored: false },
});
/** `count`, or `{max}+` above `max`. */
export function formatCount(count, max = 99) {
    return count > max ? `${max}+` : String(count);
}
/**
 * A small number, or a bare dot, on a tab, nav item or icon: how many are
 * waiting. `alert` is for something that wants attention now; use it sparingly.
 */
export const CountBadge = React.forwardRef(function CountBadge({ count, max = 99, dot = false, tone = 'neutral', size = 'md', anchored = false, showZero = true, label, className, ...rest }, ref) {
    if (!dot && (count == null || !Number.isFinite(count) || count < 0 || (count === 0 && !showZero)))
        return null;
    // A dot has no text, so it always needs a name; a number reads on its own unless `label` says more.
    const name = label ?? (dot ? 'New' : undefined);
    return (_jsx("span", { ref: ref, "data-ui": "count-badge", "data-tone": tone, role: name ? 'img' : undefined, "aria-label": name, className: cn(countBadgeVariants({ tone, size, dot, anchored }), className), ...rest, children: dot ? null : _jsx("span", { "aria-hidden": label ? true : undefined, children: formatCount(count, max) }) }));
});
export { countBadgeVariants };
