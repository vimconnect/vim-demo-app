import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Spinner } from './Spinner.js';
import { TextLink } from './TextLink.js';
import { cn } from './cn.js';
const DOT_TONE = {
    accent: '[background:var(--color-cyan)]',
    success: '[background:var(--color-success)]',
    warning: '[background:var(--color-warning)]',
    error: '[background:var(--color-error)]',
    neutral: '[background:var(--color-text-muted)]',
};
/**
 * Timeline (DS → Timeline): what happened to one thing, in order — a request's status journal, a
 * bot's sign-ins. An ordered list on a `--color-border-medium` rail, one dot per event in its tone
 * (a spinner while it's still running), the title, a muted line, and the time on the right.
 * Give it the order you want read (newest first for activity, oldest first for a journal).
 *
 * Hooks: `data-ui="timeline"`, `timeline-item` (+ `data-tone`, `data-in-flight`).
 */
export function Timeline({ items, 'aria-label': ariaLabel, limit, className }) {
    const [all, setAll] = useState(false);
    const capped = limit != null && items.length > limit;
    const shown = capped && !all ? items.slice(0, limit) : items;
    return (_jsxs("div", { className: className, children: [_jsx("ol", { "data-ui": "timeline", "aria-label": ariaLabel, className: "m-0 list-none p-0 [font-family:var(--font-sans)]", children: shown.map((item, i) => {
                    const tone = item.tone ?? 'accent';
                    const last = i === shown.length - 1;
                    return (_jsxs("li", { "data-ui": "timeline-item", "data-tone": tone, "data-in-flight": item.inFlight || undefined, className: "relative flex gap-[var(--space-md)] pb-[var(--space-lg)] last:pb-0", children: [!last && (_jsx("span", { "aria-hidden": "true", className: "absolute left-[5px] top-[14px] bottom-0 w-[2px] [background:var(--color-border-medium)]" })), _jsx("span", { "aria-hidden": "true", className: "relative mt-[4px] flex size-[12px] shrink-0 items-center justify-center", children: item.inFlight ? (_jsx(Spinner, { size: "xs", color: "accent" })) : (_jsx("span", { className: cn('size-[10px] rounded-full [box-shadow:0_0_0_2px_var(--color-bg-card)]', DOT_TONE[tone]) })) }), _jsxs("div", { className: "flex min-w-0 flex-1 items-baseline justify-between gap-[var(--space-lg)]", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: cn('text-[length:var(--text-base)] [font-weight:var(--font-medium)] leading-[1.4]', tone === 'error' ? '[color:var(--color-error-text)]' : '[color:var(--color-text-primary)]'), children: item.title }), item.meta != null && (_jsx("div", { className: "mt-[2px] text-[length:var(--text-sm)] leading-[1.5] [color:var(--color-text-muted)] [overflow-wrap:anywhere]", children: item.meta }))] }), item.time != null && (_jsx("span", { className: "shrink-0 whitespace-nowrap text-[length:var(--text-sm)] [color:var(--color-text-muted)]", children: item.time }))] })] }, item.id));
                }) }), capped && (_jsx(TextLink, { className: "mt-[var(--space-md)] inline-block", onClick: () => setAll((v) => !v), "aria-expanded": all, children: all ? 'Show fewer' : `Show all ${items.length}` }))] }));
}
