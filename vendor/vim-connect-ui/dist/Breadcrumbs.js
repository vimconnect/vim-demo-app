import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
const NAV = 'flex items-center gap-[6px] mb-[var(--space-lg)] [font-family:var(--font-sans)] text-[length:var(--text-sm)]';
const LINK = [
    'inline-flex items-center gap-[var(--space-xs)] cursor-pointer',
    'bg-transparent border-0 p-0 [font:inherit]',
    '[color:var(--color-text-muted)] hover:[color:var(--color-text-secondary)]',
    'underline underline-offset-2',
    '[transition:color_var(--transition-base)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)] rounded-[var(--radius-sm)]',
].join(' ');
const SEP = '[color:var(--color-text-subtle)]';
const CURRENT = 'inline-flex items-center gap-[var(--space-xs)] [color:var(--color-text-secondary)] [font-weight:var(--font-medium)]';
const ICON = 'size-[14px] shrink-0';
const defaultRenderLink = ({ to, className, children }) => (_jsx("a", { href: to, className: className, children: children }));
export function Breadcrumbs({ items, renderLink = defaultRenderLink, className }) {
    return (_jsx("nav", { "aria-label": "Breadcrumb", className: cn(NAV, className), children: items.map((item, index) => {
            const Icon = item.icon;
            const content = (_jsxs(_Fragment, { children: [Icon && _jsx(Icon, { className: ICON, "aria-hidden": "true" }), item.label] }));
            const isLast = index === items.length - 1;
            return (_jsxs(React.Fragment, { children: [index > 0 && (_jsx("span", { className: SEP, "aria-hidden": "true", children: "/" })), item.to ? (renderLink({ to: item.to, className: cn(LINK, item.className), children: content })) : item.onClick ? (_jsx("button", { "data-ui": "breadcrumbs-button", type: "button", onClick: item.onClick, className: cn(LINK, item.className), children: content })) : (_jsx("span", { className: cn(CURRENT, item.className), "aria-current": isLast ? 'page' : undefined, children: content }))] }, index));
        }) }));
}
