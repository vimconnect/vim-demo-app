import React from 'react';
/**
 * Search input (DS → Search Input). Escape clears the text, and is let through
 * when the field is already empty so a surrounding panel can close. Without a
 * visible label or `aria-labelledby`, its accessible name is the placeholder.
 */
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'size' | 'width'> {
    value: string;
    onChange: (value: string) => void;
    /** A shortcut that focuses this field elsewhere ("⌘K"): shown as a Kbd at the end. */
    shortcut?: string;
    /** `aria-keyshortcuts` for the shortcut ("Meta+K"). */
    keyshortcuts?: string;
    /** Width: number of px or any CSS length. Default 210px; widen it rather than cut the placeholder. */
    width?: number | string;
    /** Called after the clear button or Escape empties the field. */
    onClear?: () => void;
    /** The clear button's name and tooltip. Default "Clear search". */
    clearLabel?: string;
    /** Error state: red border and ring on the pill. `Field` sets it with `error`. */
    invalid?: boolean;
    /** Classes for the pill (the outer label). */
    className?: string;
}
export declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
