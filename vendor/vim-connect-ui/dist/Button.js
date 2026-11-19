import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
/**
 * Design-system button — vim-ai `Design System.html` → Buttons. Shared
 * Tailwind + `cva` on the shared tokens (the `write-ui-component` recipe).
 * Paint lives on `--btn-*` custom properties so themes and call sites can
 * override one without fighting specificity.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only (no theme names such as `font-sans`) and no `!` important marker.
 */
const buttonVariants = cva([
    'inline-flex items-center justify-center whitespace-nowrap cursor-pointer',
    '[font-family:var(--font-sans)] [font-weight:var(--font-semibold)] gap-[var(--space-sm)] rounded-[var(--radius-md)]',
    'text-[length:var(--text-sm)] leading-none px-[16px] py-[8px]',
    '[background:var(--btn-bg)] [color:var(--btn-fg)]',
    '[border-color:var(--btn-border)] [border-width:var(--btn-border-width,1px)]',
    '[border-style:var(--btn-border-style,solid)]',
    '[box-shadow:var(--btn-shadow,none)]',
    // Rest transform must be set — hover-only translate snaps none→matrix and
    // reads as a size jump. Same for filter (accent).
    '[transform:translateY(0)] [filter:var(--btn-filter,none)]',
    '[transition:transform_var(--transition-base),box-shadow_var(--transition-base),background_var(--transition-base),border-color_var(--transition-base),color_var(--transition-base),opacity_var(--transition-base),filter_var(--transition-base)]',
    'hover:[background:var(--btn-bg-hover,var(--btn-bg))]',
    'hover:[color:var(--btn-fg-hover,var(--btn-fg))]',
    'hover:[border-color:var(--btn-border-hover,var(--btn-border))]',
    'hover:[box-shadow:var(--btn-shadow-hover,var(--btn-shadow,none))]',
    'hover:[filter:var(--btn-filter-hover,var(--btn-filter,none))]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'disabled:[box-shadow:none] disabled:[transform:translateY(0)] disabled:[filter:none]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:block [&_svg]:size-[16px]',
].join(' '), {
    variants: {
        // --btn-* live on the class so theme / call-site CSS can override them.
        variant: {
            primary: [
                '[--btn-bg:var(--gradient-cta)] [--btn-fg:var(--color-text-on-gradient)]',
                '[--btn-border:transparent] [--btn-shadow:0_2px_8px_var(--color-cyan-25)]',
                '[--btn-bg-hover:var(--gradient-cta)] [--btn-shadow-hover:var(--shadow-glow-hover)]',
                'hover:-translate-y-px active:translate-y-0',
            ].join(' '),
            secondary: [
                '[--btn-bg:transparent] [--btn-fg:var(--color-cyan-text)]',
                '[--btn-border:var(--color-cyan-40)]',
                '[--btn-bg-hover:var(--color-cyan-10)] [--btn-border-hover:var(--color-cyan)]',
            ].join(' '),
            accent: [
                '[--btn-bg:var(--gradient-accent-button)] [--btn-fg:var(--color-text-on-gradient)]',
                '[--btn-border:transparent] [--btn-border-width:0px]',
                // Two layers — must match --shadow-glow-hover or the bloom snaps.
                '[--btn-shadow:0_0_0_transparent,0_0_0_transparent]',
                '[--btn-bg-hover:var(--gradient-accent-button)] [--btn-shadow-hover:var(--shadow-glow-hover)]',
                '[--btn-filter-hover:saturate(1.15)_brightness(0.95)]',
                'hover:[transform:translateY(-1px)] active:[transform:translateY(0)]',
            ].join(' '),
            dashed: [
                '[--btn-bg:transparent] [--btn-fg:var(--color-text-secondary)]',
                '[--btn-border:var(--color-border-strong)] [--btn-border-style:dashed]',
                '[--btn-fg-hover:var(--color-cyan-text)] [--btn-border-hover:var(--color-cyan)]',
            ].join(' '),
            danger: [
                '[--btn-bg:color-mix(in_srgb,var(--color-error)_10%,transparent)]',
                '[--btn-fg:var(--color-error)]',
                '[--btn-border:color-mix(in_srgb,var(--color-error)_35%,transparent)]',
                '[--btn-bg-hover:color-mix(in_srgb,var(--color-error)_20%,transparent)]',
            ].join(' '),
            ghost: [
                '[--btn-bg:transparent] [--btn-fg:var(--color-cyan-text)] [--btn-border:transparent]',
                '[--btn-bg-hover:var(--color-cyan-10)] [--btn-fg-hover:var(--color-cyan-text)]',
                // Tints a trigger that has aria-expanded=true and either aria-haspopup or data-opens-menu.
                '[&:is([aria-haspopup],[data-opens-menu])[aria-expanded=true]]:[--btn-bg:var(--color-cyan-10)]',
            ].join(' '),
            // Destructive / cancel / warning icon actions (trash, withdraw, revoke): red at
            // rest, red tint behind on hover. Ben, 2026-11-10: these read red, not cyan.
            'ghost-danger': [
                '[--btn-bg:transparent] [--btn-fg:var(--color-error-text)] [--btn-border:transparent]',
                '[--btn-bg-hover:color-mix(in_srgb,var(--color-error)_12%,transparent)] [--btn-fg-hover:var(--color-error-text)]',
            ].join(' '),
        },
        size: {
            default: '',
            sm: [
                // `leading-none` again after the font size: tailwind-merge drops the base
                // one when a later font-size class arrives, which made sm 28.5px, not 23.
                'px-[10px] py-[5px] text-[length:var(--text-xs)] leading-none',
                'rounded-[var(--radius-base)] [&_svg]:size-[14px]',
            ].join(' '),
            lg: [
                'px-[22px] py-[12px] text-[length:var(--text-base)] leading-none',
                'rounded-[var(--radius-lg)] [&_svg]:size-[18px]',
            ].join(' '),
        },
        iconOnly: {
            true: '',
            false: '',
        },
    },
    compoundVariants: [
        { iconOnly: true, size: 'default', class: 'p-[8px]' },
        { iconOnly: true, size: 'sm', class: 'p-[5px]' },
        { iconOnly: true, size: 'lg', class: 'p-[12px]' },
    ],
    defaultVariants: { variant: 'primary', size: 'default', iconOnly: false },
});
export const Button = React.forwardRef(({ variant = 'primary', size = 'default', iconOnly = false, type = 'button', className, children, ...props }, ref) => {
    return (_jsx("button", { ref: ref, type: type, className: cn(buttonVariants({ variant, size, iconOnly }), className), "data-ui": "button", "data-variant": variant, "data-size": size, "data-icon-only": iconOnly ? '' : undefined, ...props, children: children }));
});
Button.displayName = 'Button';
export { buttonVariants };
