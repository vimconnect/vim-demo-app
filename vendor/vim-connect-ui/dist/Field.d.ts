import React from 'react';
/**
 * A form field's frame: label above, the control, then help or error text
 * below (vim-ai DS → Inputs: "Label above, helper/error below").
 *
 * Wires the accessibility for you. The label's `htmlFor` points at the control,
 * and the control gets `id`, `aria-describedby` (the count, help and/or error) and, when
 * there's an error, `aria-invalid` plus `invalid`. Pass one control element as
 * the child: `Input`, `Textarea`, `Select`, a native control, or any component
 * marked with `markLabellable`; an unmarked child keeps a text label.
 */
export interface FieldProps {
    label: React.ReactNode;
    children: React.ReactElement;
    /** Helper text under the field. Hidden while an error shows. */
    help?: React.ReactNode;
    /** Error message. Turns the control red and is announced with it. */
    error?: React.ReactNode;
    /** Marks the label with "(optional)" — mark the exceptions, not the required fields. */
    optional?: boolean;
    /** The control's id. Generated when omitted. */
    id?: string;
    /**
     * The value's limit. Shows a character count ("n/max") under the control once the value nears
     * it, read from the control's `value` prop, so the control must be controlled with a string
     * `value` (with `defaultValue`, a ref or a form library's `register` no count shows; render a
     * `CharacterCount` yourself there). It doesn't stop typing: past the limit the count turns red,
     * and the form's own validation decides what to do.
     */
    maxLength?: number;
    /** Show the count from this many characters. Default: 80% of `maxLength`. */
    countFrom?: number;
    className?: string;
}
export declare function Field({ label, children, help, error, optional, id, maxLength, countFrom, className }: FieldProps): import("react/jsx-runtime").JSX.Element;
