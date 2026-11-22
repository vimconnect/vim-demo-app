'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CountBadge } from './CountBadge.js';
import { cn } from './cn.js';
const AccordionContext = createContext(null);
/**
 * A stack of collapsible sections separated by hairlines. Each `AccordionItem`
 * is a full-width header button (title, optional count and hint, chevron on the
 * right) over its content. `single` keeps at most one open. An item given `open` is
 * controlled from outside (see `AccordionItemProps.open`).
 */
export function Accordion({ children, single = false, defaultOpen = [], className }) {
    const [open, setOpen] = useState(single ? defaultOpen.slice(0, 1) : defaultOpen);
    const toggle = useCallback((id) => setOpen((current) => current.includes(id) ? current.filter((x) => x !== id) : single ? [id] : [...current, id]), [single]);
    const value = useMemo(() => ({ isOpen: (id) => open.includes(id), toggle }), [open, toggle]);
    return (_jsx(AccordionContext.Provider, { value: value, children: _jsx("div", { "data-ui": "accordion", className: cn('flex flex-col', className), children: children }) }));
}
const Chevron = ({ open }) => (_jsx(ChevronDown, { size: 16, "aria-hidden": "true", className: cn('shrink-0 [grid-column:-2] [color:var(--color-text-muted)] motion-safe:[transition:transform_var(--transition-base)]', open && 'rotate-180') }));
export function AccordionItem({ id, title, count, hint, aside, actions, open: openProp, onOpenChange, children, className, 'data-testid': testId, }) {
    const ctx = useContext(AccordionContext);
    if (!ctx)
        throw new Error('AccordionItem must be inside <Accordion>');
    const controlled = openProp !== undefined;
    const open = controlled ? openProp : ctx.isOpen(id);
    const uid = useId();
    const headerId = `${uid}-header`;
    const panelId = `${uid}-panel`;
    // Any falsy value (what a `cond && <X/>` or `count && <X/>` leaves) means no actions: the plain layout.
    const hasActions = Boolean(actions);
    const onHeaderClick = () => {
        if (!controlled)
            ctx.toggle(id);
        onOpenChange?.(!open);
    };
    // Rules separate items, so the last draws none: a trailing rule with nothing under it reads as
    // a missing row at the bottom of a card.
    return (_jsxs("div", { "data-ui": "accordion-item", "data-testid": testId, "data-open": open ? '' : undefined, className: cn('border-0 border-b border-solid [border-color:var(--color-border-light)] first:border-t last:border-b-0', className), children: [_jsxs("div", { className: cn(hasActions &&
                    'grid [grid-template-columns:minmax(8rem,1fr)_auto_auto] items-center gap-x-[var(--space-sm)]'), children: [_jsx("h3", { className: cn('m-0', hasActions && 'grid [grid-template-columns:subgrid] [grid-area:1/1/2/-1]'), children: _jsxs("button", { "data-ui": "accordion-header", type: "button", id: headerId, "aria-expanded": open, "aria-controls": panelId, onClick: onHeaderClick, className: cn('flex w-full items-center gap-[var(--space-sm)] py-[12px] px-[4px] text-left cursor-pointer', hasActions && 'grid [grid-template-columns:subgrid] [grid-column:1/-1]', 'border-0 [background:transparent] rounded-[var(--radius-sm)] outline-none', '[font-family:var(--font-sans)] [color:var(--color-text-primary)]', 'hover:[background:var(--color-cyan-05)] focus-visible:[box-shadow:var(--shadow-focus)]'), children: [_jsxs("span", { className: "min-w-0 flex-1 [grid-column:1]", children: [_jsxs("span", { className: "flex flex-wrap items-center gap-x-[var(--space-sm)] gap-y-[4px]", children: [_jsx("span", { className: "min-w-0 [overflow-wrap:break-word] text-[length:var(--text-lg)] [font-weight:var(--font-semibold)]", children: title }), count != null && _jsx(CountBadge, { count: count, tone: open ? 'accent' : 'neutral' }), aside && _jsx("span", { className: "flex items-center gap-[var(--space-sm)]", children: aside })] }), hint && (_jsx("span", { className: "mt-[2px] block text-[length:var(--text-sm)] [color:var(--color-text-muted)]", children: hint }))] }), _jsx(Chevron, { open: open })] }) }), hasActions && (_jsx("div", { "data-ui": "accordion-actions", className: "relative z-[1] flex flex-wrap items-center justify-end gap-[var(--space-sm)] py-[4px] [grid-area:1/2]", children: actions }))] }), _jsx("div", { className: cn('grid motion-safe:[transition:grid-template-rows_var(--transition-base)]', open ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]'), children: _jsx("div", { id: panelId, role: "region", "aria-labelledby": headerId, 
                    // Closed: out of the tab order and the accessibility tree, but still laid out so the height can animate shut.
                    inert: !open, "aria-hidden": !open || undefined, className: "min-h-0 overflow-hidden", children: _jsx("div", { className: "px-[4px] pb-[var(--space-lg)] text-[length:var(--text-base)] leading-[1.5] [color:var(--color-text-secondary)]", children: children }) }) })] }));
}
