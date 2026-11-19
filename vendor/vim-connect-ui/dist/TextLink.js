import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
/**
 * Design-system text link (vim-ai Text Link). With `href` renders an `<a>`;
 * without one, a `<button type="button">`. Negative margin offsets the
 * hover-pill padding so the label does not shift in flow. Export
 * `textLinkVariants` for a product router link that needs the same paint.
 */
const textLinkVariants = cva([
    'inline-flex items-center self-start gap-[var(--space-xs)] cursor-pointer leading-[20px]',
    'border-0 bg-transparent no-underline [font-family:var(--font-sans)]',
    'text-[length:var(--text-link)] [font-weight:var(--font-semibold)]',
    '[color:var(--tl-fg)]',
    'rounded-[var(--text-link-radius)]',
    'px-[var(--text-link-padding-x)] py-[var(--text-link-padding-y)]',
    'mx-[calc(-1*var(--text-link-padding-x))] my-[calc(-1*var(--text-link-padding-y))]',
    '[transition:background_0.12s,color_0.12s]',
    'hover:[color:var(--tl-fg-hover)] hover:[background:var(--tl-bg-hover)]',
    'focus-visible:outline-none focus-visible:[color:var(--tl-fg-hover)] focus-visible:[background:var(--tl-bg-hover)]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:block [&_svg]:size-[12px]',
].join(' '), {
    variants: {
        // --tl-* live on the class so theme / call-site CSS can override them.
        variant: {
            default: [
                '[--tl-fg:var(--color-cyan-text)]',
                '[--tl-fg-hover:color-mix(in_srgb,var(--color-cyan-text)_80%,black)]',
                '[--tl-bg-hover:var(--text-link-hover-bg)]',
            ].join(' '),
            danger: [
                '[--tl-fg:var(--color-error-text)]',
                '[--tl-fg-hover:color-mix(in_srgb,var(--color-error-text)_80%,black)]',
                '[--tl-bg-hover:var(--color-error-08)]',
            ].join(' '),
        },
    },
    defaultVariants: { variant: 'default' },
});
export const TextLink = React.forwardRef(({ variant = 'default', className, children, ...props }, ref) => {
    const classes = cn(textLinkVariants({ variant }), className);
    if ('href' in props && props.href != null) {
        const { href, ...anchorProps } = props;
        return (_jsx("a", { "data-ui": "text-link", ref: ref, href: href, className: classes, ...anchorProps, children: children }));
    }
    const { type = 'button', ...buttonProps } = props;
    return (_jsx("button", { "data-ui": "text-link", ref: ref, type: type, className: classes, ...buttonProps, children: children }));
});
TextLink.displayName = 'TextLink';
export { textLinkVariants };
