import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle, Check } from 'lucide-react';
import { StatusDot } from './StatusDot.js';
import { TextLink } from './TextLink.js';
import { cn } from './cn.js';
const LINE = 'inline-flex items-center gap-[6px] [font-family:var(--font-sans)] text-[length:var(--text-sm)] [font-weight:var(--font-medium)] [&_svg]:size-[12px] [&_svg]:shrink-0';
// Theme-aware status text (--color-*-text: the -light shades on dark, the strong ones on light).
// A product without those tokens falls back to the strong, light-surface shade; error also falls
// back to raw --color-error for a product that predates --color-error-text-strong.
const TONE = {
    pending: '[color:var(--color-warning-text,var(--color-warning-text-strong))]',
    saving: '[color:var(--color-text-muted)]',
    saved: '[color:var(--color-success-text,var(--color-success-dark))]',
    error: '[color:var(--color-error-text,var(--color-error-text-strong,var(--color-error)))]',
};
/**
 * Save Status Indicator (DS → Save Status Indicator): the autosave status line beside
 * what it reports on (a form title, a modal header). Renders nothing for `idle`, so a
 * caller can mount it unconditionally. A polite live region, so a screen reader hears
 * "Saved" or "Failed" without moving focus.
 */
export function SaveStatusIndicator({ status, onRetry, className }) {
    if (status === 'idle')
        return null;
    return (_jsxs("span", { role: "status", "aria-live": "polite", "data-ui": "save-status", "data-status": status, className: cn(LINE, TONE[status], className), children: [status === 'saving' && (_jsxs(_Fragment, { children: [_jsx(StatusDot, { tone: "neutral", size: "sm", motion: "blink" }), "Saving\u2026"] })), status === 'saved' && (_jsxs(_Fragment, { children: [_jsx(Check, { "aria-hidden": "true" }), "Saved"] })), status === 'pending' && (_jsxs(_Fragment, { children: [_jsx(StatusDot, { tone: "warning", size: "sm" }), "Unsaved"] })), status === 'error' && (_jsxs(_Fragment, { children: [_jsx(AlertCircle, { "aria-hidden": "true" }), "Failed", onRetry && (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u2014" }), _jsx(TextLink, { variant: "danger", onClick: onRetry, children: "Retry" })] }))] }))] }));
}
