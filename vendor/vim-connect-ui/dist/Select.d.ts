import React from 'react';
export interface SelectOption {
    value: string;
    label: string;
    /** Shown greyed-out and unpickable, so the reason it can't be picked stays legible. */
    disabled?: boolean;
    /**
     * Rendered instead of `label` when present, for options that need more than text
     * (e.g. pills). `label` stays the plain-text truth: type-ahead matches on it and a
     * screen reader gets it, so the node must not be the only place the meaning exists.
     */
    labelNode?: React.ReactNode;
    /** A muted second line under the label (an email under a name). The search matches it too. */
    description?: string;
}
export interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Applied to the root container (layout spacing such as `mb-4`). */
    className?: string;
    /** Kept for compatibility: every trigger is the 32px field height now. */
    compact?: boolean;
    /** `sm`: the 24px pill the DS Table footer uses for its Rows picker. */
    size?: 'default' | 'sm';
    id?: string;
    /** Accessible name for a trigger with no visible `<label>` (e.g. one picker in a repeated row). */
    ariaLabel?: string;
    /** Help or error text read after the name (`Field` / `FormRow` set it). */
    'aria-describedby'?: string;
    /**
     * Ids of a visible label that names the trigger, for a picker whose label isn't a `<label for>`.
     * The shown value is appended, so the name stays "<label> <value>".
     */
    'aria-labelledby'?: string;
    /** Test hook, set on the trigger button. */
    'data-testid'?: string;
    /**
     * A search field at the top of the open list that filters it (DS → Select, searchable panel).
     * Default: on past `SEARCHABLE_FROM` options.
     */
    searchable?: boolean;
    /** The search field's placeholder and accessible name. Default "Type to filter…". */
    searchPlaceholder?: string;
    /**
     * Called with the search text as it changes, for a server-side search: narrow `options` to it
     * and set `loading` meanwhile. Turns the search field on.
     */
    onSearchChange?: (query: string) => void;
    /** The options are still coming: the panel shows a spinner row instead of "No match.". */
    loading?: boolean;
    /** Shown in the panel when there's nothing to pick. Default "No match.". */
    emptyMessage?: string;
    /**
     * An × beside the chevron that sets the value back to `''`, for a filter where empty means
     * "all". Shown only while a value is picked.
     */
    clearable?: boolean;
    /** The clear button's tooltip and accessible name. Default "Clear". */
    clearLabel?: string;
    /** Why a disabled select can't be used yet, as its tooltip ("Pick an account first."). */
    disabledReason?: string;
}
/** Past this many options a Select is searchable unless `searchable={false}` (DS: past ~8). */
export declare const SEARCHABLE_FROM = 9;
export declare function Select({ options, value, onChange, placeholder, required, disabled, className, id, ariaLabel, 'aria-describedby': describedBy, 'aria-labelledby': labelledBy, 'data-testid': testId, size, searchable: searchableProp, searchPlaceholder, onSearchChange, loading, emptyMessage, clearable, clearLabel, disabledReason, }: SelectProps): import("react/jsx-runtime").JSX.Element;
