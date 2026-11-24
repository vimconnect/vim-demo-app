import React from 'react';
/**
 * Typed-into text field — the design system's Inputs section (vim-ai
 * `Design System.html` → Inputs). 32px tall, `--radius-sm` corners (a dropdown
 * or search field is a full pill; a text field is not), filled with the
 * theme-aware `--color-bg-field` (a dark well in dark mode, white in light),
 * stroked with `--color-border-field`, 13px text to match Select triggers.
 * Focus ring: `--color-cyan-40` border plus `--shadow-focus`, the same ring a
 * Select trigger uses, so a mixed filter row reads as one family.
 *
 * Tailwind + `cva` on the shared tokens (the `write-ui-component` recipe),
 * written to mean the same in Tailwind v3 and v4. Wrap it in `Field` for the
 * label, help and error text.
 */
declare const fieldVariants: (props?: ({
    kind?: "input" | "textarea" | null | undefined;
    invalid?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Error state: red border and ring. Also sets `aria-invalid` (which on its own turns it red too). */
    invalid?: boolean;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Error state: red border and ring. Also sets `aria-invalid` (which on its own turns it red too). */
    invalid?: boolean;
    /**
     * No field chrome (fill, border, radius, padding, focus ring, minimum height, resize handle): the
     * text area sits inside a larger field that draws them, such as a chat composer whose pill holds
     * the text and a send button. The text takes the surrounding font size and colour; the
     * surrounding field shows focus (`:focus-within`). It draws no invalid state either: with `invalid`,
     * the surrounding field has to show the error.
     */
    bare?: boolean;
}
/** Multi-line text field: the same fill, border and focus as `Input`, with its own height. */
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export { fieldVariants };
