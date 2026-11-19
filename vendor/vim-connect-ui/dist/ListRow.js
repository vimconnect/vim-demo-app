import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { Card } from './Card.js';
import { cn } from './cn.js';
/**
 * Design-system list row — vim-ai `Design System.html` → List Row.
 *
 * The one recipe for "a list of records, each with an icon, a name, some
 * metadata, and an action" (invitations, roles, pending requests): one static
 * card (`List`) holding hairline-separated rows, never one bordered, gapped
 * card per record.
 *
 * Row grid: 40px icon column · body · actions. Icon tile 36px / 10px radius
 * in a cyan, purple or amber tint. Body: name (base, medium) + an inline
 * badge, then one muted metadata line that truncates.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
const iconVariants = cva([
    'flex shrink-0 items-center justify-center size-[36px] rounded-[10px]',
    'border border-solid [&_svg]:size-[18px]',
].join(' '), {
    variants: {
        tone: {
            cyan: '[background:var(--color-cyan-10)] [color:var(--color-cyan-text)] [border-color:var(--color-cyan-30)]',
            purple: '[background:var(--color-purple-12)] [color:var(--color-purple-text)] [border-color:var(--color-purple-30)]',
            amber: '[background:var(--color-warning-08)] [color:var(--color-warning-text-strong)] [border-color:var(--color-warning-30)]',
        },
    },
    defaultVariants: { tone: 'cyan' },
});
/**
 * A clickable row works from the keyboard (DS plugin 1.0.35): it takes focus,
 * opens on Enter and Space (only when the row itself has focus, so a button
 * inside it keeps its own keys), and shows the hover tint plus the focus ring.
 */
const CLICKABLE = [
    'cursor-pointer focus-visible:outline-none',
    'focus-visible:[background:var(--color-cyan-15)] focus-visible:[box-shadow:inset_var(--shadow-focus)]',
].join(' ');
const ROW = [
    'grid grid-cols-[40px_1fr_auto] items-center gap-[var(--space-md)]',
    'px-[var(--space-lg)] py-[var(--space-md)] m-0 list-none',
    'border-0 border-b border-solid [border-color:var(--color-border-light)] last:border-b-0',
    '[font-family:var(--font-sans)] [transition:background_120ms] hover:[background:var(--color-cyan-15)]',
].join(' ');
const ROW1 = 'flex min-w-0 items-center gap-[8px] text-[length:var(--text-base)] [font-weight:var(--font-medium)] [color:var(--color-text-primary)]';
const ROW2 = 'mt-[2px] overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--text-xs)] [color:var(--color-text-muted)]';
export const ListRow = React.forwardRef(function ListRow({ icon, tone, avatar, title, badge, meta, actions, body, as: Tag = 'div', className, onClick, onKeyDown, tabIndex, ...rest }, ref) {
    // The body can hold its own controls (an expanded sub-list), so a click inside it isn't a click on the row.
    const handleClick = onClick
        ? (e) => {
            const target = e.target;
            const body = target?.closest?.('[data-list-row-body]');
            if (body && e.currentTarget.contains(body))
                return;
            onClick(e);
        }
        : undefined;
    const handleKeyDown = onClick
        ? (e) => {
            onKeyDown?.(e);
            if (e.defaultPrevented || e.currentTarget !== e.target)
                return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
            }
        }
        : onKeyDown;
    return React.createElement(Tag, {
        ref,
        className: cn(ROW, onClick && CLICKABLE, className),
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        tabIndex: tabIndex ?? (onClick ? 0 : undefined),
        ...rest,
    }, _jsxs(_Fragment, { children: [_jsx("div", { className: "flex items-center", children: avatar ?? (icon ? _jsx("span", { className: iconVariants({ tone }), "aria-hidden": "true", children: icon }) : null) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: ROW1, children: [_jsx("span", { className: "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", children: title }), badge] }), meta && _jsx("div", { className: ROW2, children: meta })] }), _jsx("div", { className: "flex shrink-0 items-center gap-[8px]", children: actions }), body != null && body !== false && _jsx("div", { "data-list-row-body": "", className: "col-start-2 col-end-4 min-w-0", children: body })] }));
});
/**
 * The card that holds list rows: static, shadow-only hover (not one clickable
 * thing, but not inert), no padding — the rows carry it. For list semantics
 * use `as="ul"` here and `as="li"` on each row.
 */
export const List = React.forwardRef(function List({ hover = 'shadow', as = 'div', className, ...rest }, ref) {
    // overflow-hidden: a row's hover fill follows the card's rounded corners.
    return (_jsx(Card, { ref: ref, as: as, hover: hover, className: cn('flex flex-col p-0 overflow-hidden', as === 'ul' && 'm-0 list-none', className), ...rest }));
});
export { iconVariants as listRowIconVariants };
