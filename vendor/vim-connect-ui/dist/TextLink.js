import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
/**
 * Design-system text link (vim-ai Text Link). With `href` renders an `<a>`;
 * without one, a `<button type="button">`. Negative margin offsets the
 * hover-pill padding so the label does not shift in flow. Export
 * `textLinkVariants` for a product router link that needs the same paint.
 *
 * `prose` (DS 1.0.122): a link inside running text — a paragraph, a list
 * item, rendered markdown. It stays `inline` so a long link wraps with the
 * line, takes the surrounding size and line-height, and is underlined (a
 * 1px line at 45% of the link colour, full colour on hover) instead of
 * showing the hover pill. Keyboard focus draws the focus ring.
 */
const textLinkVariants = cva([
    'cursor-pointer border-0 bg-transparent [font-family:var(--font-sans)]',
    '[color:var(--tl-fg)]',
    '[transition:background_0.12s,color_0.12s,text-decoration-color_0.12s]',
    'hover:[color:var(--tl-fg-hover)]',
    'focus-visible:outline-none focus-visible:[color:var(--tl-fg-hover)]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-[12px]',
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
        prose: {
            false: [
                'inline-flex items-center self-start gap-[var(--space-xs)] leading-[20px] no-underline',
                'text-[length:var(--text-link)] [font-weight:var(--font-semibold)]',
                'rounded-[var(--text-link-radius)]',
                'px-[var(--text-link-padding-x)] py-[var(--text-link-padding-y)]',
                'mx-[calc(-1*var(--text-link-padding-x))] my-[calc(-1*var(--text-link-padding-y))]',
                'hover:[background:var(--tl-bg-hover)] focus-visible:[background:var(--tl-bg-hover)]',
                '[&_svg]:block',
            ].join(' '),
            true: [
                'inline p-0 m-0 text-left [font-size:inherit] [line-height:inherit] [font-weight:var(--font-medium)]',
                'underline [text-decoration-thickness:1px] [text-underline-offset:0.2em]',
                '[text-decoration-color:color-mix(in_srgb,var(--tl-fg)_45%,transparent)]',
                'hover:[text-decoration-color:currentColor]',
                'focus-visible:rounded-[var(--radius-sm)] focus-visible:[box-shadow:var(--shadow-focus)]',
                '[&_svg]:inline [&_svg]:align-[-0.1em] [&_svg]:ml-[0.15em]',
            ].join(' '),
        },
    },
    defaultVariants: { variant: 'default', prose: false },
});
export const TextLink = React.forwardRef(({ variant = 'default', prose = false, className, children, ...props }, ref) => {
    const classes = cn(textLinkVariants({ variant, prose }), className);
    if ('href' in props && props.href != null) {
        const { href, ...anchorProps } = props;
        return (_jsx("a", { "data-ui": "text-link", ref: ref, href: href, className: classes, ...anchorProps, children: children }));
    }
    const { type = 'button', ...buttonProps } = props;
    return (_jsx("button", { "data-ui": "text-link", ref: ref, type: type, className: classes, ...buttonProps, children: children }));
});
TextLink.displayName = 'TextLink';
export { textLinkVariants };
