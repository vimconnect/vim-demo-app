import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
/**
 * Top bar (DS → App shell): the bar above the content column. `--color-bg-primary` with a
 * `--color-border-light` hairline below, `--space-xl` side padding, children from the left (search,
 * a title) and `actions` at the right. It fills its slot's height (`AppShell` gives it 64px) and is a
 * size container named `topbar`, so what's in it can drop detail as the bar narrows.
 *
 * Hooks: `data-ui="top-bar"`, `top-bar-actions`.
 */
export function TopBar({ actions, className, children, ...rest }) {
    return (_jsxs("header", { ...rest, "data-ui": "top-bar", className: cn('flex h-full items-center gap-[var(--space-lg)] px-[var(--space-xl)] [container:topbar/inline-size]', '[background:var(--color-bg-primary)] border-0 border-b border-solid [border-color:var(--color-border-light)]', '[font-family:var(--font-sans)]', className), children: [children, actions && (_jsx("div", { "data-ui": "top-bar-actions", className: "ml-auto flex shrink-0 items-center gap-[var(--space-xs)]", children: actions }))] }));
}
