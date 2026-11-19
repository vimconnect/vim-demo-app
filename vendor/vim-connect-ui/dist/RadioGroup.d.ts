import React from 'react';
export interface RadioGroupOption<T extends string> {
    value: T;
    label: React.ReactNode;
    /** One or two muted lines under the label. */
    description?: React.ReactNode;
    /** Beside the label, e.g. a Badge ("Recommended", "Coming soon"). */
    addon?: React.ReactNode;
    /** Before the text, after the radio: an `IconTile`, an `AppIcon`. */
    icon?: React.ReactNode;
    /** Under the option, inside its tile, while it's the one picked: the follow-up it needs (a picker,
     *  a toggle, a field). Not part of the label, so pressing in it doesn't re-pick. It renders inside the
     *  group's `role="radiogroup"`, so a nested group there is a radiogroup within a radiogroup. */
    content?: React.ReactNode;
    disabled?: boolean;
    /** `data-testid` on the option's radio. */
    testId?: string;
}
interface RadioGroupBaseProps<T extends string> {
    options: readonly RadioGroupOption<T>[];
    /** The picked option, or none yet. */
    value: T | undefined;
    onChange: (value: T) => void;
    /** Shared by the radios. Generated when omitted. */
    name?: string;
    /** `list` (default): stacked rows. `card`: a bordered tile per option, cyan once picked. */
    variant?: 'list' | 'card';
    /** `list` only: `horizontal` for two or three short answers (Yes / No). Default `vertical`. */
    orientation?: 'vertical' | 'horizontal';
    /** `card` only: the grid's columns. Default `repeat(auto-fit, minmax(240px, 1fr))`. */
    columns?: string;
    /** Helper text under the group. Hidden while an error shows. */
    help?: React.ReactNode;
    /** Error message, announced with the group. */
    error?: React.ReactNode;
    /** Marks the label with "(optional)". */
    optional?: boolean;
    /** For forms that mark required questions: a red asterisk on the label, and `aria-required`. */
    required?: boolean;
    /** Disables every option. */
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
/** A visible `label` (the DS form label), or an `aria-label` when the question is already on screen. */
export type RadioGroupProps<T extends string> = RadioGroupBaseProps<T> & ({
    label: React.ReactNode;
    'aria-label'?: never;
} | {
    label?: never;
    'aria-label': string;
});
/**
 * Radio Group (DS → Checkbox / Radio → Radio group): one choice from a short list, as native
 * radios under one name, so the arrow keys move and pick and the group is one Tab stop. `list`
 * rows or `card` tiles; each option has a label, an optional description, addon and icon, and
 * `content` that opens under it once it's picked.
 *
 * Hooks: `data-ui="radio-group"` (+ `data-variant`), `radio-option` (+ `data-checked`,
 * `data-disabled`) on each option, `radio-option-content` for what opens under the picked one.
 */
export declare function RadioGroup<T extends string>({ options, value, onChange, name, variant, orientation, columns, help, error, optional, required, disabled, className, style, ...labelling }: RadioGroupProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
