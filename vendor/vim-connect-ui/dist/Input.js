import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
import { markLabellable } from './labellable.js';
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
const fieldVariants = cva([
    'block w-full m-0 [box-sizing:border-box] outline-none shadow-none',
    'px-[var(--space-md)] rounded-[var(--radius-sm)]',
    '[background:var(--color-bg-field)] border border-solid [border-color:var(--color-border-field)]',
    '[color:var(--color-text-primary)] [font-family:var(--font-sans)] text-[length:var(--text-base)]',
    '[transition:box-shadow_var(--transition-base),border-color_var(--transition-base)]',
    'placeholder:[color:var(--color-text-muted)] placeholder:opacity-100',
    'focus:[border-color:var(--color-cyan-40)] focus:[box-shadow:var(--shadow-focus)]',
    'disabled:opacity-[0.55] disabled:cursor-not-allowed',
    // Read-only (DS 1.0.68): no fill, dashed stroke, secondary text, so it never reads as a field to type in.
    '[&[readonly]:not(:disabled)]:[background:transparent] [&[readonly]:not(:disabled)]:border-dashed',
    '[&[readonly]:not(:disabled)]:[color:var(--color-text-secondary)] [&[readonly]:not(:disabled)]:cursor-default',
].join(' '), {
    variants: {
        kind: {
            input: 'h-[32px]',
            textarea: 'h-auto min-h-[64px] py-[var(--space-sm)] leading-[1.5] resize-y',
        },
        invalid: {
            true: [
                '[border-color:var(--color-error)] focus:[border-color:var(--color-error)]',
                'focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-error)_25%,transparent)]',
            ].join(' '),
            false: '',
        },
    },
    defaultVariants: { kind: 'input', invalid: false },
});
/** A field marked invalid for assistive tech (`aria-invalid`) also looks invalid. */
function isInvalid(invalid, ariaInvalid) {
    return invalid || ariaInvalid === true || ariaInvalid === 'true';
}
export const Input = React.forwardRef(({ invalid = false, className, type = 'text', 'aria-invalid': ariaInvalid, ...props }, ref) => (_jsx("input", { ref: ref, type: type, "aria-invalid": invalid || ariaInvalid || undefined, className: cn(fieldVariants({ kind: 'input', invalid: isInvalid(invalid, ariaInvalid) }), className), "data-ui": "input", ...props })));
Input.displayName = 'Input';
// Keep: lets Field / FormRow tie their label to this control (it forwards id and aria-describedby).
markLabellable(Input);
const bareTextarea = [
    'block w-full m-0 p-0 [box-sizing:border-box] border-0 outline-none shadow-none resize-none',
    '[background:transparent] [color:inherit] [font-family:var(--font-sans)] [font-size:inherit] [line-height:inherit]',
    'placeholder:[color:var(--color-text-muted)] placeholder:opacity-100',
    'disabled:opacity-[0.55] disabled:cursor-not-allowed',
].join(' ');
/** Multi-line text field: the same fill, border and focus as `Input`, with its own height. */
export const Textarea = React.forwardRef(({ invalid = false, bare = false, className, rows = 3, 'aria-invalid': ariaInvalid, ...props }, ref) => (_jsx("textarea", { ref: ref, rows: rows, "aria-invalid": invalid || ariaInvalid || undefined, className: cn(bare ? bareTextarea : fieldVariants({ kind: 'textarea', invalid: isInvalid(invalid, ariaInvalid) }), className), "data-ui": "textarea", "data-bare": bare || undefined, ...props })));
Textarea.displayName = 'Textarea';
// Keep: lets Field / FormRow tie their label to this control (it forwards id and aria-describedby).
markLabellable(Textarea);
export { fieldVariants };
