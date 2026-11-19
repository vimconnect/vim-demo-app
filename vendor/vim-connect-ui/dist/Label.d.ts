import React from 'react';
/**
 * A form field's label — the design system's Inputs section ("Label above"):
 * an uppercase eyebrow, 11px semibold at 0.06em, `--color-text-secondary`.
 * `Field` renders it for you. Use `Label` on its own where a form keeps its
 * own layout (e.g. the label and the control sit in separate grid cells).
 *
 * Tailwind on the shared tokens (the `write-ui-component` recipe), v3/v4-safe.
 */
export declare const LABEL_CLASSES = "block mb-[6px] [font-family:var(--font-sans)] text-[length:var(--text-xs)] [font-weight:var(--font-semibold)] [color:var(--color-text-secondary)] uppercase tracking-[0.06em]";
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /** Marks the label with "(optional)" — mark the exceptions, not the required fields. */
    optional?: boolean;
    /**
     * Adds a red asterisk, for forms that mark required fields instead of optional ones.
     * Visual only (`aria-hidden`): set `required` / `aria-required` on the control itself.
     */
    required?: boolean;
}
export declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
