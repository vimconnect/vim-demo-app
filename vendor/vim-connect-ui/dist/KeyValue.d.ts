import React from 'react';
export type KeyValueListProps = React.HTMLAttributes<HTMLDListElement>;
/**
 * Key-value list (DS → Key-value): the facts about one record in a detail panel or card, as a
 * `<dl>`. Each `KeyValue` row is a muted `--text-sm` label and a `--text-sm` value at the row's
 * right edge that wraps instead of overflowing, with a `--color-border-light` hairline between
 * rows. The list sits flush with its container: no padding above the first row or below the last.
 *
 * Hooks: `data-ui="key-value-list"`, `key-value` on each row.
 */
export declare function KeyValueList({ className, children, ...rest }: KeyValueListProps): import("react/jsx-runtime").JSX.Element;
export interface KeyValueProps {
    label: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** `data-testid` on the value. */
    'data-testid'?: string;
}
/** One row of a `KeyValueList`: a muted label and its value. */
export declare function KeyValue({ label, children, className, 'data-testid': testId }: KeyValueProps): import("react/jsx-runtime").JSX.Element;
