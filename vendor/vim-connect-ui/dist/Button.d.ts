import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Design-system button — vim-ai `Design System.html` → Buttons. Shared
 * Tailwind + `cva` on the shared tokens (the `write-ui-component` recipe).
 * Paint lives on `--btn-*` custom properties so themes and call sites can
 * override one without fighting specificity.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only (no theme names such as `font-sans`) and no `!` important marker.
 */
declare const buttonVariants: (props?: ({
    variant?: "accent" | "primary" | "secondary" | "dashed" | "danger" | "ghost" | "ghost-danger" | null | undefined;
    size?: "sm" | "lg" | "default" | null | undefined;
    iconOnly?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Square icon-only control — keeps the variant paint; always pass `aria-label`. */
    iconOnly?: boolean;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { buttonVariants };
