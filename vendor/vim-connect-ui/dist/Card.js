import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
import { SectionIconBadge } from './SectionIconBadge.js';
/**
 * Design-system card — vim-ai `Design System.html` → Cards.
 *
 * Three flavours: `default` (solid card surface + hairline border), `gradient`
 * (highlights) and `extractor` (cyan left rule, inline data callouts).
 * Hover: `lift` (DS default: cyan border, card glow, 2px lift) for a card that
 * is one clickable thing; `shadow` (glow only) for a static container the
 * pointer moves over; `none` for plain containers.
 *
 * `CardHeader` is the one header recipe (DS plugin 1.0.16 / 1.0.21): an
 * optional 28px icon badge + `h3` title 8px apart, an optional 11px muted
 * hint, and actions on the right — always inside the card, never floating
 * above it.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
const cardVariants = cva([
    'block border border-solid [border-color:var(--color-border-light)]',
    '[font-family:var(--font-sans)] [color:var(--color-text-primary)]',
    '[transition:transform_var(--transition-base),box-shadow_var(--transition-base),border-color_var(--transition-base)]',
].join(' '), {
    variants: {
        variant: {
            default: '[background:var(--color-bg-primary)] rounded-[var(--radius-xl)] p-[var(--space-2xl)]',
            gradient: '[background:var(--gradient-card)] rounded-[var(--radius-xl)] p-[var(--space-2xl)]',
            extractor: [
                '[background:var(--color-bg-primary)] rounded-[var(--radius-lg)] p-[var(--space-lg)]',
                'border-l-[3px] [border-left-color:var(--color-cyan)]',
            ].join(' '),
        },
        hover: {
            lift: '[transform:translateY(0)] hover:[border-color:var(--color-cyan-30)] hover:[box-shadow:var(--shadow-card-hover)] hover:[transform:translateY(-2px)]',
            shadow: 'hover:[box-shadow:var(--shadow-card-hover)]',
            none: '',
        },
        /** `compact`: small tiles (a choice card in a narrow panel). Last, so its padding and radius win. */
        size: {
            default: '',
            compact: 'p-[var(--space-md)] rounded-[var(--radius-lg)]',
        },
    },
    defaultVariants: { variant: 'default', hover: 'none', size: 'default' },
});
/**
 * The card's look and hooks for an element `Card` can't render (a link, a form, a `pre`, a
 * menu): spread it on that element. `data-card` is what tests and page CSS select a card by,
 * so never write the attribute or `cardVariants()` by hand.
 */
export function cardProps({ variant, hover, size, className, } = {}) {
    return {
        'data-variant': variant ?? 'default',
        'data-size': size ?? 'default',
        'data-card': '',
        className: cn(cardVariants({ variant, hover, size }), className),
    };
}
export const Card = React.forwardRef(function Card({ variant, hover, size, as: Tag = 'div', className, ...rest }, ref) {
    return React.createElement(Tag, { ref, ...cardProps({ variant, hover, size, className }), ...rest });
});
export const CARD_TITLE_CLASSES = 'm-0 [font-family:var(--font-sans)] text-[length:var(--text-xl)] [font-weight:var(--font-semibold)] leading-[1.3] [color:var(--color-text-primary)]';
export function CardHeader({ title, icon, hint, actions, className, ...rest }) {
    return (_jsxs("div", { className: cn('flex items-center gap-[var(--space-md)] mb-[var(--space-lg)]', className), ...rest, children: [_jsxs("div", { "data-ui": "card-header-main", className: "flex flex-1 min-w-0 items-center gap-[8px]", children: [icon && _jsx(SectionIconBadge, { size: "card", icon: icon }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: CARD_TITLE_CLASSES, children: title }), hint && _jsx("p", { className: "m-0 mt-[2px] text-[length:var(--text-xs)] [color:var(--color-text-muted)]", children: hint })] })] }), actions && (_jsx("div", { "data-ui": "card-header-actions", className: "flex shrink-0 items-center gap-[var(--space-sm)]", children: actions }))] }));
}
export { cardVariants };
