import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
/**
 * Key-value list (DS → Key-value): the facts about one record in a detail panel or card, as a
 * `<dl>`. Each `KeyValue` row is a muted `--text-sm` label and a `--text-sm` value at the row's
 * right edge that wraps instead of overflowing, with a `--color-border-light` hairline between
 * rows. The list sits flush with its container: no padding above the first row or below the last.
 *
 * Hooks: `data-ui="key-value-list"`, `key-value` on each row.
 */
export function KeyValueList({ className, children, ...rest }) {
    return (_jsx("dl", { ...rest, "data-ui": "key-value-list", className: cn('m-0 flex flex-col [font-family:var(--font-sans)]', className), children: children }));
}
/** One row of a `KeyValueList`: a muted label and its value. */
export function KeyValue({ label, children, className, 'data-testid': testId }) {
    return (_jsxs("div", { "data-ui": "key-value", className: cn('flex items-baseline gap-[var(--space-lg)] py-[var(--space-sm)] first:pt-0 last:pb-0', 'text-[length:var(--text-sm)] leading-[1.5]', 'border-0 border-b border-solid [border-color:var(--color-border-light)] last:border-b-0', className), children: [_jsx("dt", { className: "m-0 max-w-[45%] shrink-0 [color:var(--color-text-muted)]", children: label }), _jsx("dd", { "data-testid": testId, className: "m-0 ml-auto min-w-0 text-right [color:var(--color-text-primary)] [overflow-wrap:anywhere]", children: children })] }));
}
