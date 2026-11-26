import React from 'react';
export interface OptionRowProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'role' | 'children'> {
    /** The current value: cyan tint and text, and the check. */
    selected?: boolean;
    /** Keyboard-highlighted (the listbox's active descendant): the hover tint stays on. */
    focused?: boolean;
    /** Greyed and not pickable: it sets `aria-disabled` and ignores `onClick` and `onMouseDown`. */
    disabled?: boolean;
    /** Greyed but pickable: a secondary row. Ignored while `selected`. */
    muted?: boolean;
    /** The row's label, as the caller wants it laid out (a `Select` option's text or text over a description; a name that truncates). */
    children: React.ReactNode;
    /** After the check: badges, a row action. Keep it to phrasing content. */
    trailing?: React.ReactNode;
}
export declare const OptionRow: React.ForwardRefExoticComponent<OptionRowProps & React.RefAttributes<HTMLLIElement>>;
