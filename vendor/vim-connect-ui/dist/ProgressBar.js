import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
const FILL = {
    accent: '[background:var(--color-cyan)]',
    success: '[background:var(--color-success)]',
    warning: '[background:var(--color-warning)]',
    error: '[background:var(--color-error)]',
    neutral: '[background:var(--color-text-muted)]',
};
/**
 * Progress Bar: a thin track filled from the left to show how far along
 * something is, or, as a meter, how much of a limit is used. It fills its
 * container's width; constrain it with `className`.
 */
export const ProgressBar = React.forwardRef(function ProgressBar({ value, max = 100, tone = 'accent', size = 'sm', meter = false, valueText, className, ...rest }, ref) {
    const safeMax = max > 0 ? max : 100;
    const clamped = Math.min(safeMax, Math.max(0, Number.isFinite(value) ? value : 0));
    const pct = (clamped / safeMax) * 100;
    return (_jsx("div", { ref: ref, ...rest, role: meter ? 'meter' : 'progressbar', "aria-valuemin": 0, "aria-valuemax": safeMax, "aria-valuenow": clamped, "aria-valuetext": valueText, "data-ui": "progress-bar", "data-tone": tone, className: cn('relative w-full overflow-hidden rounded-full [background:var(--color-border-medium)]', size === 'md' ? 'h-[8px]' : 'h-[4px]', className), children: _jsx("div", { className: cn('h-full rounded-full motion-safe:[transition:width_400ms_ease]', FILL[tone]), style: { width: `${pct}%` } }) }));
});
