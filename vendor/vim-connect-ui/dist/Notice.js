import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { Button } from './Button.js';
import { Tooltip } from './Tooltip.js';
import { CloseGlyph } from './CloseGlyph.js';
import { cn } from './cn.js';
/**
 * Inline notice / banner — the design system's Notice section (vim-ai
 * `Design System.html` → Notice): a page- or card-level message that needs
 * more presence than a line of text but isn't a modal.
 *
 * One shape, five tones: `info` (blue, the common case), `purple`
 * (network / identity content, e.g. invitations), `warning` (orange),
 * `success` (done, saved) and `error` (a hard blocker). An optional `title` adds a
 * bold first line, for a docs-style callout. A flat 30% fill of the family's own token, no
 * border, one shade deeper on hover with a matching glow.
 *
 * The text is always `--color-text-primary`: a same-hue colour on its own tinted
 * fill fails 4.5:1 in at least one theme (DS callout). Only the icon carries
 * the hue, through a theme-aware token, because at icon size the bar is 3:1.
 *
 * Tailwind + `cva` on the shared tokens (the `write-ui-component` recipe),
 * written to mean the same in Tailwind v3 and v4.
 */
const noticeVariants = cva([
    'flex items-start gap-[10px] px-[14px] py-[10px] rounded-[var(--radius-md)]',
    '[font-family:var(--font-sans)] text-[length:var(--text-lg)] leading-[1.5]',
    '[color:var(--color-text-primary)] [background:var(--notice-bg)]',
    '[transition:background_var(--transition-fast),box-shadow_var(--transition-fast)]',
    'hover:[background:var(--notice-bg-hover)] hover:[box-shadow:0_8px_24px_var(--notice-glow)]',
    '[&_strong]:[font-weight:var(--font-bold)]',
].join(' '), {
    variants: {
        // --notice-* live on the class so theme / call-site CSS can override them.
        variant: {
            info: '[--notice-bg:var(--color-cyan-30)] [--notice-bg-hover:color-mix(in_srgb,var(--color-cyan)_40%,transparent)] [--notice-glow:var(--color-cyan-30)] [--notice-icon:var(--color-cyan-text)]',
            purple: '[--notice-bg:var(--color-purple-30)] [--notice-bg-hover:color-mix(in_srgb,var(--color-purple)_40%,transparent)] [--notice-glow:var(--color-purple-30)] [--notice-icon:var(--color-purple-text)]',
            warning: '[--notice-bg:var(--color-warning-30)] [--notice-bg-hover:color-mix(in_srgb,var(--color-warning)_40%,transparent)] [--notice-glow:var(--color-warning-30)] [--notice-icon:var(--color-warning-text)]',
            success: '[--notice-bg:var(--color-success-30)] [--notice-bg-hover:color-mix(in_srgb,var(--color-success)_40%,transparent)] [--notice-glow:var(--color-success-30)] [--notice-icon:var(--color-success-text)]',
            error: '[--notice-bg:var(--color-error-30)] [--notice-bg-hover:color-mix(in_srgb,var(--color-error)_40%,transparent)] [--notice-glow:var(--color-error-30)] [--notice-icon:var(--color-error-text)]',
        },
    },
    defaultVariants: { variant: 'info' },
});
// The DS Notice demo's own glyphs: info circle, warning triangle, error circle.
// Built in so every product gets the same marks without importing an icon set.
const ICON_PATHS = {
    info: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.6" }), _jsx("path", { d: "M12 8h.01M11 12h1v4h1", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })] })),
    purple: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.6" }), _jsx("path", { d: "M12 8h.01M11 12h1v4h1", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })] })),
    warning: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round" }), _jsx("path", { d: "M12 9v4M12 17h.01", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })] })),
    error: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.6" }), _jsx("path", { d: "M12 8v5M12 16h.01", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })] })),
    success: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.6" }), _jsx("path", { d: "m8 12.5 2.8 2.8L16 9.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" })] })),
};
export const Notice = React.forwardRef(({ variant = 'info', icon, title, action, onDismiss, dismissLabel = 'Dismiss', className, children, ...props }, ref) => {
    const mark = icon === null ? null : (_jsx("span", { "aria-hidden": "true", className: "mt-[2px] shrink-0 inline-flex [color:var(--notice-icon)] [&_svg]:w-[16px] [&_svg]:h-[16px]", children: icon ?? (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", width: "16", height: "16", children: ICON_PATHS[variant] })) }));
    return (_jsxs("div", { ref: ref, "data-variant": variant, className: cn(noticeVariants({ variant }), className), ...props, children: [mark, _jsxs("div", { className: "flex min-w-0 flex-1 flex-wrap items-center gap-x-[var(--space-lg)] gap-y-[var(--space-md)]", children: [_jsxs("div", { className: "min-w-0 flex-[1_1_220px]", children: [title != null && _jsx("div", { className: "[font-weight:var(--font-bold)]", children: title }), children] }), action && _jsx("div", { className: "flex shrink-0 items-center gap-[var(--space-sm)]", children: action })] }), onDismiss && (_jsx(Tooltip, { label: dismissLabel, children: _jsx(Button, { variant: "ghost", size: "sm", iconOnly: true, "aria-label": dismissLabel, onClick: onDismiss, className: "-my-[3px] -mr-[6px] shrink-0 self-start [color:var(--color-text-secondary)]", children: _jsx(CloseGlyph, {}) }) }))] }));
});
Notice.displayName = 'Notice';
export { noticeVariants };
