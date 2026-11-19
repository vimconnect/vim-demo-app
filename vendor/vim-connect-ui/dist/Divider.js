import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
const dividerVariants = cva('shrink-0 border-0', {
    variants: {
        orientation: {
            // Not w-full: a caller's side margin must inset the rule, never push it past the container.
            horizontal: 'block self-stretch h-px',
            vertical: 'inline-block self-center w-px h-[var(--space-lg)]',
        },
        strength: {
            light: '[background:var(--color-border-light)]',
            medium: '[background:var(--color-border-medium)]',
        },
    },
    defaultVariants: { orientation: 'horizontal', strength: 'light' },
});
/**
 * Divider (DS → Divider): a 1px hairline between items. Spacing around it is the
 * caller's (a margin on `className`).
 */
export const Divider = React.forwardRef(function Divider({ orientation = 'horizontal', strength = 'light', decorative = true, className, ...rest }, ref) {
    const a11y = decorative
        ? { 'aria-hidden': true }
        : { role: 'separator', 'aria-orientation': orientation, 'aria-hidden': undefined };
    return (_jsx("div", { ref: ref, ...rest, "data-ui": "divider", "data-orientation": orientation, className: cn(dividerVariants({ orientation, strength }), className), ...a11y }));
});
