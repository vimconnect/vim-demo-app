import React from 'react';
export interface CollapsibleChipListProps<T> {
    items: readonly T[];
    /** How many to show collapsed — roughly two wrapped rows at that surface's chip size. */
    limit: number;
    /** Renders the visible slice; caller owns chip markup and look. */
    children: (shown: readonly T[]) => React.ReactNode;
    className?: string;
}
/**
 * Wrapping chip row that shows the first `limit` and hides the rest behind
 * "+N more ▾" / "Show less ▴". Cap is on item count, not measured height.
 */
export declare function CollapsibleChipList<T>({ items, limit, children, className, }: CollapsibleChipListProps<T>): import("react/jsx-runtime").JSX.Element;
