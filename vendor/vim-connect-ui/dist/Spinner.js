import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
const spinnerVariants = cva('inline-block shrink-0 rounded-full border-solid [border-top-color:transparent] motion-safe:animate-spin', {
    variants: {
        size: {
            xs: 'size-[14px] border-2',
            sm: 'size-[24px] border-2',
            md: 'size-[48px] border-2',
            lg: 'size-[64px] border-[3px]',
        },
        color: {
            accent: '[border-color:var(--color-cyan)]',
            current: '[border-color:currentColor]',
        },
    },
});
/**
 * Loading Spinner ring (DS → Skeleton / Loading Spinner): a spinning ring with
 * a transparent top. It stands still when the user asks for reduced motion.
 */
export const Spinner = React.forwardRef(function Spinner({ size = 'md', color, label, className, ...rest }, ref) {
    const tone = color ?? (size === 'xs' ? 'current' : 'accent');
    const a11y = label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true };
    return (_jsx("span", { ref: ref, ...rest, ...a11y, "data-ui": "spinner", "data-size": size, className: cn(spinnerVariants({ size, color: tone }), className) }));
});
/**
 * Loading Spinner (DS → Skeleton / Loading Spinner): the cyan ring, centred,
 * with an optional message. Prefer a skeleton when the page's shape is known.
 */
export function LoadingSpinner({ message, size = 'md', fullScreen = true, className }) {
    const body = (_jsxs("div", { role: "status", "aria-label": message ? undefined : 'Loading', "data-ui": "loading-spinner", className: cn('flex flex-col items-center gap-[var(--space-lg)] text-center', className), children: [_jsx(Spinner, { size: size }), message && (_jsx("p", { className: "m-0 text-[length:var(--text-base)] [color:var(--color-text-secondary)]", children: message }))] }));
    if (!fullScreen)
        return body;
    return _jsx("div", { className: "min-h-screen flex items-center justify-center", children: body });
}
