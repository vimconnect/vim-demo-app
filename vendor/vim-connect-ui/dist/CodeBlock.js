import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { CopyButton } from './CopyButton.js';
import { cn } from './cn.js';
const HEADER_LABEL = 'min-w-0 flex-1 truncate uppercase tracking-[0.05em] text-[length:var(--text-xs)] [font-weight:var(--font-semibold)] [color:var(--color-text-muted)]';
/**
 * Code Block (DS → Code Block): a payload, script or JSON shown as text, on the
 * elevated surface with a light hairline. Plus Jakarta like the rest of the
 * product (no monospace face). One look in both themes: never a dark terminal
 * box on a light page. A `label` adds a header row (with the copy control, if
 * any); without one, the copy control sits in the body's top-right corner.
 * Spacing around the block is the caller's (a margin on `className`).
 */
export const CodeBlock = React.forwardRef(function CodeBlock({ code, label, copyLabel, onCopy, maxHeight, wrap = false, className, style, 'data-testid': testId, ...rest }, ref) {
    const copy = copyLabel !== undefined && _jsx(CopyButton, { value: code, label: copyLabel, onCopy: onCopy });
    const floatingCopy = copy && label === undefined;
    const pre = (_jsx("pre", { tabIndex: maxHeight ? 0 : undefined, "aria-label": maxHeight ? label ?? copyLabel ?? 'Code' : undefined, style: maxHeight ? { maxHeight } : undefined, className: cn('m-0 min-w-0 flex-1 overflow-auto p-[var(--space-lg)] [font-family:var(--font-sans)] text-[length:var(--text-xs)] leading-[1.55] [color:var(--color-text-secondary)]', wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'), children: _jsx("code", { className: "[font-family:inherit]", children: code }) }));
    return (_jsxs("div", { ref: ref, ...rest, "data-ui": "code-block", "data-testid": testId, style: style, className: cn('min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-solid [border-color:var(--color-border-light)] [background:var(--color-bg-elevated)]', className), children: [label !== undefined && (_jsxs("div", { className: "flex min-h-[36px] items-center gap-[var(--space-sm)] border-0 border-b border-solid [border-color:var(--color-border-light)] py-[var(--space-xs)] pl-[var(--space-lg)] pr-[var(--space-sm)]", children: [_jsx("span", { className: HEADER_LABEL, children: label }), copy] })), floatingCopy ? (_jsxs("div", { className: "flex items-start", children: [pre, _jsx("div", { className: "shrink-0 pr-[var(--space-sm)] pt-[var(--space-sm)]", children: copy })] })) : (pre)] }));
});
